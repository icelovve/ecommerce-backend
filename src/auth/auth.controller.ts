import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
// import { User } from 'src/user/entities/user.entity';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body('email') email: string, @Body('password') password: string) {
        return this.authService.login(email, password);
    }

    @Post('register')
    register(@Body() dto: CreateUserDto & { otp: string }) {
        return this.authService.register(dto);
    }

    @Post('send-otp')
    sendOtp(@Body() body: { email: string }) {
        return this.authService.sendOtp(body.email);
    }
}