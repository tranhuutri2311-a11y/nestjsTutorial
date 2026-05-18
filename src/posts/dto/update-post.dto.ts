import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreatePostDto } from './create-post.dto';
import { PostStatus } from '../entities/post.entity';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
}
