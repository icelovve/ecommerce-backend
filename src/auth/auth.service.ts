/* eslint-disable */

import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import * as nodemailer from 'nodemailer';

const otpStore = new Map<string, string>();

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    private async sendOtpEmail(to: string, otp: string) {
        if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
            throw new Error('MAIL_USER or MAIL_PASS environment variable is missing');
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"My App" <${process.env.MAIL_USER}>`,
            to,
            subject: 'Your OTP Code',
            text: `Your OTP is ${otp}`,
            html: `<p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
        });
    }

    async login(email: string, password: string) {
        const user = await this.userRepo.findOne({ where: { email } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { id: user.id, email: user.email };

        try {
            const token = await this.jwtService.signAsync(payload);
            return {
                access_token: token,
                role: user.role,
            };
        } catch (error) {
            console.error('error auth :', error);
            throw new InternalServerErrorException('Error signing token');
        }
    }

    async sendOtp(email: string): Promise<{ message: string }> {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(email, otp);
        setTimeout(() => otpStore.delete(email), 5 * 60 * 1000);

        await this.sendOtpEmail(email, otp);

        return { message: 'OTP sent to email' };
    }

    async register(createUserDto: CreateUserDto & { otp: string }): Promise<User> {
        const storedOtp = otpStore.get(createUserDto.email);
        if (!storedOtp || storedOtp !== createUserDto.otp) {
            throw new UnauthorizedException('Invalid or expired OTP');
        }

        const existingUser = await this.userRepo.findOne({
            where: { email: createUserDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

        const user = this.userRepo.create({
            ...createUserDto,
            password: hashedPassword,
        });

        await this.userRepo.save(user);
        otpStore.delete(createUserDto.email);

        return user;
    }
}
