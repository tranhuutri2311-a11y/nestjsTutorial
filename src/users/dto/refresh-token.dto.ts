import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'f1b3c5d7e9...',
    description: 'Refresh token returned by login or refresh endpoint.',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
