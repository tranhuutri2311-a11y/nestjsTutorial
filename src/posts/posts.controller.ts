import {
  Controller,
  Post,
  UseGuards,
  Get,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { Body, Request } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { Permissions } from '../auth/decorators';
import { Permission } from '../auth/enums';
import { JwtAuthGuard, PermissionsGuard } from '../auth/guards';
import { AuthenticatedUser } from '../auth/interfaces';
import { UpdatePostDto } from './dto/update-post.dto';

@ApiTags('posts')
@ApiBearerAuth()
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @Permissions(Permission.CREATE_POST)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  create(
    @Body() createPostDto: CreatePostDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.postsService.create(createPostDto, req.user.sub);
  }

  @Get('getall/:id')
  @Permissions(Permission.READ_POST)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  findAll(@Param('id') id: string) {
    return this.postsService.findAll(id);
  }

  @Get(':id')
  @Permissions(Permission.READ_POST)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @Permissions(Permission.UPDATE_POST)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.postsService.update(id, updatePostDto, req.user);
  }
  @Delete(':id')
  @Permissions(Permission.DELETE_POST)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req: { user: AuthenticatedUser }) {
    return this.postsService.deletePost(id, req.user);
  }
}
