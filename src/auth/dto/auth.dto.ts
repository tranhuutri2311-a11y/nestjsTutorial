import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class AuthPayloadDto {
  @ApiProperty({
    example: 'john_doe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'strongPassword123',
    minLength: 6,
    maxLength: 100,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}
