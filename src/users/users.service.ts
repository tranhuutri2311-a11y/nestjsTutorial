import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { CreateUserDto, UpdateUserDto } from './dto';
import * as crypto from 'crypto';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });
    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.find();
    return users.map(({ password, ...rest }) => rest);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.refreshTokenRepository.delete({ userId: id });
    await this.userRepository.remove(user);
  }

  async createRefreshToken(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.findOne(userId);
    const payload = { sub: user.id, username: user.username };

    const accessToken = this.jwtService.sign(payload);

    await this.refreshTokenRepository.delete({ userId: user.id });

    const refreshToken = crypto.randomBytes(64).toString('hex');
    const tokenDoc = this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });
    await this.refreshTokenRepository.save(tokenDoc);

    return { accessToken, refreshToken };
  }

  async validateRefreshToken(token: string): Promise<User | null> {
    const tokenDoc = await this.refreshTokenRepository.findOne({
      where: {
        token,
        isRevoked: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!tokenDoc) return null;

    return this.userRepository.findOne({ where: { id: tokenDoc.userId } });
  }

  async refreshTokens(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    const tokenDoc = await this.refreshTokenRepository.findOne({
      where: {
        token: refreshToken,
        isRevoked: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!tokenDoc) return null;

    await this.refreshTokenRepository.delete(tokenDoc.id);

    const payload = { sub: tokenDoc.userId };
    const newAccessToken = this.jwtService.sign(payload);

    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const newTokenDoc = this.refreshTokenRepository.create({
      userId: tokenDoc.userId,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });
    await this.refreshTokenRepository.save(newTokenDoc);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async revokeRefreshToken(token: string): Promise<boolean> {
    const result = await this.refreshTokenRepository.update(
      { token, isRevoked: false },
      { isRevoked: true },
    );
    return (result.affected ?? 0) > 0;
  }

  async revokeAllUserTokens(userId: string): Promise<number> {
    const result = await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
    return result.affected ?? 0;
  }
}
