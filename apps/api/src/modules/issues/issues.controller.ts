import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IssuesService } from './issues.service';
import { CreateIssueDto, UpdateIssueStatusDto, QueryIssuesDto } from './dto/create-issue.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Civic Issues & Grievances')
@Controller('issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-jwt')
  @ApiOperation({ summary: 'Report a new civic infrastructure issue (Road, Water, Electricity, etc.)' })
  @ApiResponse({ status: 201, description: 'Civic issue recorded successfully' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateIssueDto) {
    return this.issuesService.create(userId, dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List and filter civic issues by locality, district, category, or status' })
  async findAll(@Query() query: QueryIssuesDto) {
    return this.issuesService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get full civic issue report with evidence photos and status timeline' })
  async findOne(@Param('id') id: string) {
    return this.issuesService.findOne(id);
  }

  @Post(':id/support')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-jwt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle "I Face This Too" citizen support on an issue' })
  async toggleSupport(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.issuesService.toggleSupport(id, userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-jwt')
  @ApiOperation({ summary: 'Update issue status (Official/Admin workflow)' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
    @Body() dto: UpdateIssueStatusDto
  ) {
    return this.issuesService.updateStatus(id, actorId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-jwt')
  @ApiOperation({ summary: 'Delete a civic issue (reporter or admin only)' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string
  ) {
    return this.issuesService.remove(id, userId, role);
  }
}

