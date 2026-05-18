import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { localStrategy } from './strategies/local.strategy';
import { jwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { IsOwnerOrAdminGuard } from './guards/is-owner-or-admin.guard';

@Module({
  imports: [PassportModule, UsersModule, JwtModule.register({
    secret: 'abc123',
    signOptions: { expiresIn: '1h' },
  })],
  controllers: [AuthController],
  providers: [AuthService, localStrategy, jwtStrategy, IsOwnerOrAdminGuard],
  exports: [IsOwnerOrAdminGuard],
})
export class AuthModule {}
