import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, ResolveConflictDto, QueryProjectsDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Infrastructure Projects & Coordination')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-jwt')
  @ApiOperation({ summary: 'Register an infrastructure project (triggers auto-conflict detection)' })
  @ApiResponse({ status: 201, description: 'Project registered & analyzed for overlap' })
  async create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List infrastructure projects with pagination and filters' })
  async findAll(@Query() query: QueryProjectsDto) {
    return this.projectsService.findAll(query);
  }

  @Public()
  @Get('conflicts')
  @ApiOperation({ summary: 'List detected infrastructure overlap conflicts (e.g., Road Resurfacing vs KWA Digging)' })
  async findAllConflicts(@Query('locality') locality?: string) {
    return this.projectsService.findAllConflicts(locality);
  }

  @Public()
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update infrastructure project status (PLANNED, IN_PROGRESS, COMPLETED)' })
  async updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.projectsService.updateStatus(id, status);
  }

  @Public()
  @Patch('conflicts/:id/resolve')
  @ApiOperation({ summary: 'Update or acknowledge a project conflict joint coordination plan' })
  async resolveConflict(@Param('id') id: string, @Body() dto: ResolveConflictDto) {
    return this.projectsService.resolveConflict(id, dto);
  }
}

