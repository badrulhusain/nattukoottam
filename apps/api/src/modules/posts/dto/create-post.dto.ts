import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IssueCategory } from '@prisma/client';
import { PaginationParamsDto } from '../../../common/pagination/pagination.dto';

export class CreatePostDto {
  @ApiProperty({
    example: 'Potholes in front of Fresco Hotel on Infopark Expressway. Vehicles are struggling to pass through.',
    description: 'Text content in Malayalam or English (UTF-8 supported)',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ enum: IssueCategory, example: IssueCategory.ROAD_TRANSPORT })
  @IsEnum(IssueCategory)
  @IsOptional()
  category?: IssueCategory;

  @ApiProperty({ example: 'Kakkanad' })
  @IsString()
  @IsNotEmpty()
  locality: string;

  @ApiProperty({ example: 'Ernakulam' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800'],
  })
  @IsArray()
  @IsOptional()
  mediaUrls?: string[];

  @ApiPropertyOptional({ example: 10.0159 })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: 76.3419 })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ example: 'ml', default: 'ml' })
  @IsString()
  @IsOptional()
  language?: string = 'ml';

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/.../voice.webm' })
  @IsString()
  @IsOptional()
  voiceAudioUrl?: string;
}

export class QueryPostsDto extends PaginationParamsDto {
  @ApiPropertyOptional({ example: 'Kakkanad' })
  @IsString()
  @IsOptional()
  locality?: string;

  @ApiPropertyOptional({ enum: IssueCategory })
  @IsEnum(IssueCategory)
  @IsOptional()
  category?: IssueCategory;

  @ApiPropertyOptional({ enum: ['forYou', 'nearby', 'following', 'trending'] })
  @IsString()
  @IsOptional()
  feed?: 'forYou' | 'nearby' | 'following' | 'trending' = 'forYou';

  @ApiPropertyOptional({ example: 'user-uuid-1234', description: 'Filter posts by specific author' })
  @IsString()
  @IsOptional()
  authorId?: string;
}

