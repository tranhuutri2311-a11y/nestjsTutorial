import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
  IsUrl,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @IsString()
  @MinLength(10)
  content: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  excerpt?: string;

  @IsOptional()
  @IsUrl()
  thumbnail?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
