import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'Uditsmith Thakuria' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: 'citizen@naatukoottam.org' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'KochiPass@2026', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Ernakulam' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ example: 'Kakkanad' })
  @IsString()
  @IsNotEmpty()
  locality: string;

  @ApiPropertyOptional({ enum: Role, default: Role.CITIZEN })
  @IsEnum(Role)
  @IsOptional()
  role?: Role = Role.CITIZEN;

  @ApiPropertyOptional({ example: 'ml', default: 'ml' })
  @IsString()
  @IsOptional()
  preferredLang?: string = 'ml';
}

