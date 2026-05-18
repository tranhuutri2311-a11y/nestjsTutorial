import { ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Permission, UserRole } from '../auth/enums';
import { AuthenticatedUser } from '../auth/interfaces';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
  };
  let refreshTokenRepository: {
    delete: jest.Mock;
  };

  const user: AuthenticatedUser = {
    sub: 'user-1',
    username: 'user',
    role: UserRole.USER,
    permissions: [],
  };

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
    };
    refreshTokenRepository = {
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: refreshTokenRepository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('allows users to read their own profile', async () => {
    userRepository.findOne.mockResolvedValue({ id: user.sub });

    await expect(service.findOne(user.sub, user)).resolves.toMatchObject({
      id: user.sub,
    });
  });

  it('rejects users reading another profile', async () => {
    userRepository.findOne.mockResolvedValue({ id: 'user-2' });

    await expect(service.findOne('user-2', user)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('allows manage-users permission to read any profile', async () => {
    const manager = {
      ...user,
      permissions: [Permission.MANAGE_USERS],
    };
    userRepository.findOne.mockResolvedValue({ id: 'user-2' });

    await expect(service.findOne('user-2', manager)).resolves.toMatchObject({
      id: 'user-2',
    });
  });

  it('rejects non-admin authorization claim updates', async () => {
    userRepository.findOne.mockResolvedValue({ id: user.sub });

    await expect(
      service.update(user.sub, { role: UserRole.ADMIN }, user),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('always creates new users with the user role and default permissions', async () => {
    const createDto = {
      username: 'new-user',
      password: 'password123',
      email: 'new-user@example.com',
      role: UserRole.ADMIN,
      permissions: [Permission.MANAGE_USERS],
    };
    userRepository.findOne.mockResolvedValue(null);
    let createdUserInput: unknown;
    userRepository.create.mockImplementation((value: unknown) => {
      createdUserInput = value;
      return value as User;
    });
    userRepository.save.mockImplementation((value: unknown) =>
      Promise.resolve(value as User),
    );

    await service.create(createDto);

    expect(createdUserInput).toMatchObject({
      username: createDto.username,
      email: createDto.email,
      role: UserRole.USER,
      permissions: [
        Permission.CREATE_POST,
        Permission.READ_POST,
        Permission.UPDATE_POST,
        Permission.DELETE_POST,
      ],
    });
  });

  it('allows admins to update another user role', async () => {
    const admin: AuthenticatedUser = {
      sub: 'admin-1',
      username: 'admin',
      role: UserRole.ADMIN,
      permissions: Object.values(Permission),
    };
    const targetUser = { id: 'user-2', role: UserRole.USER };
    userRepository.findOne.mockResolvedValue(targetUser);
    userRepository.save.mockImplementation((value) => Promise.resolve(value));

    await expect(
      service.update('user-2', { role: UserRole.ADMIN }, admin),
    ).resolves.toMatchObject({
      role: UserRole.ADMIN,
      permissions: Object.values(Permission),
    });
  });
});
