import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, RefreshTokenDto } from './dto';
import { jwtGuard } from '../auth/guards/jwt.guard';
import { IsOwnerOrAdminGuard } from '../auth/guards/is-owner-or-admin.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  // @UseGuards(jwtGuard)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(jwtGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(jwtGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(jwtGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(jwtGuard, IsOwnerOrAdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('refresh')
  refresh(@Body() body: RefreshTokenDto) {
    const tokens = this.usersService.refreshTokens(body.refreshToken);
    if (!tokens) {
      return { message: 'Invalid or expired refresh token' };
    }
    return tokens;
  }

  @Post('logout')
  @UseGuards(jwtGuard)
  logout(@Body() body: RefreshTokenDto) {
    this.usersService.revokeRefreshToken(body.refreshToken);
    return { message: 'Logged out successfully' };
  }
}
