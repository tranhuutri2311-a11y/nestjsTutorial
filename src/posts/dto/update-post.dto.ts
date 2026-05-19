import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreatePostDto } from './create-post.dto';
import { PostStatus } from '../entities/post.entity';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiPropertyOptional({
    enum: PostStatus,
    example: PostStatus.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
}
