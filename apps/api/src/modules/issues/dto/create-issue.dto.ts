import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { IssueCategory, UrgencyLevel, IssueStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateIssueDto {
  @ApiProperty({ example: 'Severe water pipeline burst on Civil Station Road' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Drinking water has been flooding the roadway for 24 hours, affecting traffic and causing low pressure in nearby homes.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: IssueCategory, example: IssueCategory.WATER_SUPPLY })
  @IsEnum(IssueCategory)
  category: IssueCategory;

  @ApiPropertyOptional({ enum: UrgencyLevel, example: UrgencyLevel.HIGH })
  @IsOptional()
  @IsEnum(UrgencyLevel)
  urgency?: UrgencyLevel;

  @ApiProperty({ example: 'Ernakulam' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ example: 'Kakkanad' })
  @IsString()
  @IsNotEmpty()
  locality: string;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  wardNumber?: number;

  @ApiPropertyOptional({ example: 'Opposite Civil Station Gate 2, Seaport-Airport Road' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 10.0159 })
  @IsNumber()
  @Type(() => Number)
  latitude: number;

  @ApiProperty({ example: 76.3419 })
  @IsNumber()
  @Type(() => Number)
  longitude: number;

  @ApiPropertyOptional({ type: [String], example: ['https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=800'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceUrls?: string[];
}

export class UpdateIssueStatusDto {
  @ApiProperty({ enum: IssueStatus, example: IssueStatus.VERIFIED })
  @IsEnum(IssueStatus)
  status: IssueStatus;

  @ApiPropertyOptional({ example: 'Site inspected by Assistant Engineer. Work order issued.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'dept_kwa_01' })
  @IsOptional()
  @IsString()
  assignedDeptId?: string;

  @ApiPropertyOptional({ example: 'official_kwa_01' })
  @IsOptional()
  @IsString()
  assignedOfficialId?: string;
}

export class QueryIssuesDto {
  @ApiPropertyOptional({ example: 'Kakkanad' })
  @IsOptional()
  @IsString()
  locality?: string;

  @ApiPropertyOptional({ example: 'Ernakulam' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ enum: IssueCategory })
  @IsOptional()
  @IsEnum(IssueCategory)
  category?: IssueCategory;

  @ApiPropertyOptional({ enum: IssueStatus })
  @IsOptional()
  @IsEnum(IssueStatus)
  status?: IssueStatus;

  @ApiPropertyOptional({ enum: UrgencyLevel })
  @IsOptional()
  @IsEnum(UrgencyLevel)
  urgency?: UrgencyLevel;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  get skip(): number {
    return ((this.page || 1) - 1) * (this.limit || 20);
  }
}

