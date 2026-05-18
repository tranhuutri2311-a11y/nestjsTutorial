import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LocalGuard } from './guards/local.guard';
import { RefreshTokenDto } from '../users/dto';
import type { Request } from 'express';
import { jwtGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService,
        private usersService: UsersService,
    ) {}

    @Post('login')
    @UseGuards(LocalGuard)
    async login(@Req() req: Request) {
        const user = req.user as { id: string; username: string };
        return this.usersService.createRefreshToken(user.id);
    }

    @Post('refresh')
    async refresh(@Body() body: RefreshTokenDto) {
        const tokens = await this.usersService.refreshTokens(body.refreshToken);
        if (!tokens) {
            return { message: 'Invalid or expired refresh token' };
        }
        return tokens;
    }

    @Post('logout')
    @UseGuards(jwtGuard)
    async logout(@Body() body: RefreshTokenDto) {
        await this.usersService.revokeRefreshToken(body.refreshToken);
        return { message: 'Logged out successfully' };
    }
}
