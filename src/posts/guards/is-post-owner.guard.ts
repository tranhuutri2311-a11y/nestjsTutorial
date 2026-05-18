import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';

@Injectable()
export class IsPostOwnerGuard implements CanActivate {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }

    const post = await this.postRepository.findOne({
      where: { id: request.params.id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const userId = user.sub ?? user.id;
    if (post.authorId === userId) {
      return true;
    }

    throw new ForbiddenException('You are not authorized to modify this post');
  }
}

@Injectable()
export class IsPostOwnerOrAdminGuard implements CanActivate {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }

    if (user.role === 'admin') {
      return true;
    }

    const post = await this.postRepository.findOne({
      where: { id: request.params.id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const userId = user.sub ?? user.id;
    if (post.authorId === userId) {
      return true;
    }

    throw new ForbiddenException('You are not authorized to delete this post');
  }
}
