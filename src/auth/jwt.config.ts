import type { JwtModuleOptions } from '@nestjs/jwt';

export const JWT_SECRET = 'abc123';

export const jwtModuleOptions: JwtModuleOptions = {
  secret: JWT_SECRET,
  signOptions: { expiresIn: '1h' },
};
