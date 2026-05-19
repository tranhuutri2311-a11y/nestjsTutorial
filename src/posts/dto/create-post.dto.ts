import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
  IsUrl,
} from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    example: 'How to build a NestJS blog CMS',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'This post explains how to build a blog CMS using NestJS.',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  content: string;

  @ApiPropertyOptional({
    example: 'A short NestJS blog CMS tutorial.',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  excerpt?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/images/post-thumbnail.jpg',
  })
  @IsOptional()
  @IsUrl()
  thumbnail?: string;

  @ApiPropertyOptional({
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
