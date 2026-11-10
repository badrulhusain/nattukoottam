import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { IssueCategory, ProjectStatus, ConflictStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @ApiProperty({ example: 'Thrikkakara - Kakkanad Link Road Tarring & Resurfacing' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Complete asphalt resurfacing and shoulder leveling of 2.4 km stretch from Civil Station to Infopark Gate 1.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'dept_pwd_01' })
  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({ enum: IssueCategory, example: IssueCategory.ROAD_TRANSPORT })
  @IsEnum(IssueCategory)
  category: IssueCategory;

  @ApiPropertyOptional({ enum: ProjectStatus, example: ProjectStatus.PLANNED })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiProperty({ example: 'Ernakulam' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ example: 'Kakkanad' })
  @IsString()
  @IsNotEmpty()
  locality: string;

  @ApiPropertyOptional({ example: 'Seaport-Airport Road Junction' })
  @IsOptional()
  @IsString()
  roadName?: string;

  @ApiProperty({ example: 10.0159 })
  @IsNumber()
  @Type(() => Number)
  latitude: number;

  @ApiProperty({ example: 76.3419 })
  @IsNumber()
  @Type(() => Number)
  longitude: number;

  @ApiPropertyOptional({ example: 250.0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  radiusMeters?: number;

  @ApiPropertyOptional({ example: 4500000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  estimatedCost?: number;

  @ApiProperty({ example: '2026-11-20T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-12-10T00:00:00.000Z' })
  @IsDateString()
  expectedEndDate: string;

  @ApiPropertyOptional({ example: 'Kerala State Construction Corporation' })
  @IsOptional()
  @IsString()
  contractorName?: string;
}

export class ResolveConflictDto {
  @ApiProperty({ enum: ConflictStatus, example: ConflictStatus.RESOLVED })
  @IsEnum(ConflictStatus)
  status: ConflictStatus;

  @ApiPropertyOptional({
    example: 'KWA agreed to expedite trenching by Nov 18. PWD tarring rescheduled to commence Dec 01.',
  })
  @IsOptional()
  @IsString()
  jointPlan?: string;

  @ApiPropertyOptional({ example: 'Approved during Joint District Development Coordination meeting.' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class QueryProjectsDto {
  @ApiPropertyOptional({ example: 'Kakkanad' })
  @IsOptional()
  @IsString()
  locality?: string;

  @ApiPropertyOptional({ example: 'Ernakulam' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

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

