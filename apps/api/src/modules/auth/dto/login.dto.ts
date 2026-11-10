import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: '+919876543210', description: 'Phone number or Email' })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ example: 'KochiPass@2026' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'JWT Refresh Token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

