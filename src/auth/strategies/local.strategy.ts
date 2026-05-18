import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class localStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'username', passwordField: 'password' });
  }

  async validate(username: string, password: string) {
    const user = await this.authService.validateUser({ username, password });
    if (!user) throw new HttpException('Invalid username or password', 401);
    return user;
  }
}
