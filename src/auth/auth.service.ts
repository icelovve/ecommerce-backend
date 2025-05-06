import { Injectable, NotFoundException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    async login(email: string, password: string) {
        const user = await this.userRepo.findOne({ where: { email } });

        if (!user) {
            throw new NotFoundException('User not found');
        }
        // eslint-disable-next-line
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

    async register(createUserDto: CreateUserDto): Promise<User> {
        try {
            // eslint-disable-next-line
            const salt = await bcrypt.genSalt(10);
            // eslint-disable-next-line
            const hashedPassword: string = await bcrypt.hash(createUserDto.password, salt);

            const user = this.userRepo.create({
                ...createUserDto,
                password: hashedPassword
            });

            await this.userRepo.save(user);
            return user;
        } catch (error) {
            throw new Error('Error register user: ' + error);
        }
    }
}