import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, RefreshTokenDto } from './dto';
import { Permissions } from '../auth/decorators';
import { Permission } from '../auth/enums';
import { JwtAuthGuard, PermissionsGuard } from '../auth/guards';
import { AuthenticatedUser } from '../auth/interfaces';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Permissions(Permission.MANAGE_USERS)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.usersService.findOne(id, req.user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.usersService.update(id, updateUserDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req: { user: AuthenticatedUser }) {
    return this.usersService.remove(id, req.user);
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
  @UseGuards(JwtAuthGuard)
  async logout(@Body() body: RefreshTokenDto) {
    await this.usersService.revokeRefreshToken(body.refreshToken);
    return { message: 'Logged out successfully' };
  }
}
