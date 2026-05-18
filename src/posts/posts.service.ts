import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Post, PostStatus } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { UpdatePostDto } from './dto/update-post.dto';
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    Object.assign(post, updatePostDto);
    return this.postRepository.save(post);
  }
  async deletePost(id: string): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    await this.postRepository.delete(id);
  }
}
