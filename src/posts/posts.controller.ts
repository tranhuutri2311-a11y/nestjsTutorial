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
import { PostsService } from './posts.service';
import { Body, Request } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { jwtGuard } from 'src/auth/guards/jwt.guard';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  IsPostOwnerGuard,
  IsPostOwnerOrAdminGuard,
} from './guards/is-post-owner.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(jwtGuard)
  create(@Body() createPostDto: CreatePostDto, @Request() req: any) {
    return this.postsService.create(createPostDto, req.user.sub);
  }

  @Get('getall/:id')
  @UseGuards(jwtGuard)
  findAll(@Param('id') id: string) {
    return this.postsService.findAll(id);
  }

  @Get(':id')
  @UseGuards(jwtGuard)
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(jwtGuard, IsPostOwnerGuard)
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }
  @Delete(':id')
  @UseGuards(jwtGuard, IsPostOwnerOrAdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.postsService.deletePost(id);
  }
}
