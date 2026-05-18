import { Permission, UserRole } from '../enums';

export interface JwtPayload {
  sub: string;
  username: string;
  role: UserRole;
  permissions: Permission[];
}

export type AuthenticatedUser = JwtPayload;
