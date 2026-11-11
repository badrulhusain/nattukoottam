import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DiscussionRoomType } from '@prisma/client';

export class CreateDiscussionRoomDto {
  @ApiProperty({
    example: 'Kakkanad Ward Road & Drain Action Council',
    description: 'Name of the community discussion channel or private group',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Coordination group for resolving waterlogged junctions and drainage works',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    enum: DiscussionRoomType,
    example: DiscussionRoomType.CHANNEL,
    description: 'CHANNEL = Public (anyone can join) | GROUP = Private (members add members) | DIRECT = 1-on-1 chat',
  })
  @IsEnum(DiscussionRoomType)
  @IsNotEmpty()
  type: DiscussionRoomType;

  @ApiPropertyOptional({ example: 'Kakkanad' })
  @IsString()
  @IsOptional()
  locality?: string;

  @ApiPropertyOptional({ example: 'Ernakulam' })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiPropertyOptional({ example: 'Roads & Infrastructure' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Target user ID if initiating a DIRECT 1-on-1 discussion' })
  @IsString()
  @IsOptional()
  recipientUserId?: string;
}

export class SendMessageDto {
  @ApiProperty({
    example: 'We are organizing an on-site inspection tomorrow at 10 AM.',
    description: 'Message body (supports Malayalam and English)',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/.../evidence.jpg',
  })
  @IsString()
  @IsOptional()
  mediaUrl?: string;
}

export class AddMemberDto {
  @ApiPropertyOptional({ description: 'User ID of the member to add' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ example: '9847012345', description: 'Phone number of the member to add' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'MEMBER', default: 'MEMBER' })
  @IsString()
  @IsOptional()
  role?: 'ADMIN' | 'MEMBER';
}

export class QueryDiscussionsDto {
  @ApiPropertyOptional({ enum: DiscussionRoomType })
  @IsEnum(DiscussionRoomType)
  @IsOptional()
  type?: DiscussionRoomType;

  @ApiPropertyOptional({ example: 'Kakkanad' })
  @IsString()
  @IsOptional()
  locality?: string;

  @ApiPropertyOptional({ example: 'Road' })
  @IsString()
  @IsOptional()
  search?: string;
}

