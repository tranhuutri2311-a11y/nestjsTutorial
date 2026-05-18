import { Injectable } from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {

    constructor(
        private jwtService: JwtService,
        private usersService: UsersService,
    ) {}

    async validateUser({ username, password }: AuthPayloadDto) {
        const user = await this.usersService.findByUsername(username);
        if (!user) return null;
        if (password !== user.password) return null;
        return { id: user.id, username: user.username };
    }
}
