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
import { EscalationService } from './escalation.service';
import { CreateIssueDto, UpdateIssueStatusDto, QueryIssuesDto } from './dto/create-issue.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Civic Issues & Grievances')
@Controller('issues')
export class IssuesController {
  constructor(
    private readonly issuesService: IssuesService,
    private readonly escalationService: EscalationService,
  ) {}

  @Public()
  @Post('escalate-scan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger accountability auto-escalation scan for unattended complaints' })
  async triggerEscalationScan() {
    return this.escalationService.scanAndEscalateIssues();
  }

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
  @Get('nearby/duplicates')
  @ApiOperation({ summary: 'Detect nearby unresolved issues within specified radius in meters to prevent duplicate complaints' })
  async checkDuplicates(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
    @Query('category') category?: string,
  ) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) return [];
    return this.issuesService.checkNearbyDuplicates(
      latitude,
      longitude,
      radius ? parseInt(radius, 10) : 200,
      category,
    );
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

  @Public()
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update issue status (Official/Admin workflow)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateIssueStatusDto,
    @CurrentUser('id') actorId?: string
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

