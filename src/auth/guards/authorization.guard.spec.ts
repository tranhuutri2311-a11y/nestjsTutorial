import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission, UserRole } from '../enums';
import { PermissionsGuard } from './permissions.guard';
import { RolesGuard } from './roles.guard';

const createContext = (user: unknown): ExecutionContext =>
  ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ user }),
    }),
  }) as unknown as ExecutionContext;

describe('Authorization guards', () => {
  it('allows users with the required role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([UserRole.ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(
      guard.canActivate(createContext({ role: UserRole.ADMIN })),
    ).toBeTruthy();
  });

  it('rejects users missing the required permission', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([Permission.DELETE_POST]),
    } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);

    expect(() =>
      guard.canActivate(
        createContext({
          permissions: [Permission.READ_POST],
        }),
      ),
    ).toThrow(ForbiddenException);
  });
});
