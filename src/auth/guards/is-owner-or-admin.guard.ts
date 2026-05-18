import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class IsOwnerOrAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log(user.role);
    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }

    const targetUserId = request.params.id;

    if (user.role === 'admin') {
      return true;
    }

    if (user.sub === targetUserId || user.id === targetUserId) {
      return true;
    }

    throw new ForbiddenException('U are not authorized');
  }
}
