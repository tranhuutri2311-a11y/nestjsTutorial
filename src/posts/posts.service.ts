import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Post, PostStatus } from './entities/post.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import { UserRole } from '../auth/enums';
import { AuthenticatedUser } from '../auth/interfaces';
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, authorId: string) {
    const post = this.postRepository.create({
      ...createPostDto,
      authorId,
      status: PostStatus.PUBLISHED,
    });
    return this.postRepository.save(post);
  }

  async findOne(id: string) {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async findAll(authorId: string) {
    return this.postRepository.find({ where: { authorId } });
  }
  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    user: AuthenticatedUser,
  ): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    this.assertCanManagePost(user, post);

    Object.assign(post, updatePostDto);
    return this.postRepository.save(post);
  }
  async deletePost(id: string, user: AuthenticatedUser): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    this.assertCanManagePost(user, post);
    await this.postRepository.delete(id);
  }

  private assertCanManagePost(user: AuthenticatedUser, post: Post): void {
    if (user.role === UserRole.ADMIN || post.authorId === user.sub) {
      return;
    }
    throw new ForbiddenException('You can only manage your own posts');
  }
}
