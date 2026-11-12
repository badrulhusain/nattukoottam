import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DiscussionsService } from './discussions.service';
import {
  CreateDiscussionRoomDto,
  SendMessageDto,
  AddMemberDto,
  QueryDiscussionsDto,
} from './dto/create-discussion.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Community Discussions (Channels & Groups)')
@Controller('discussions')
export class DiscussionsController {
  constructor(private readonly discussionsService: DiscussionsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary:
      'List discussion spaces. Returns public channels, plus private groups and direct chats for the authenticated user.',
  })
  async findAll(
    @CurrentUser('id') userId?: string,
    @Query() query?: QueryDiscussionsDto
  ) {
    return this.discussionsService.findAll(userId, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-jwt')
  @ApiOperation({
    summary: 'Create a new discussion space (Public Channel, Private Group, or Direct 1-on-1)',
  })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateDiscussionRoomDto
  ) {
    return this.discussionsService.create(userId, dto);
  }

  @Post('direct/:targetUserId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-jwt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get or create a 1-on-1 direct message conversation with another citizen',
  })
  async getOrCreateDirect(
    @CurrentUser('id') userId: string,
    @Param('targetUserId') targetUserId: string
  ) {
    return this.discussionsService.getOrCreateDirectRoom(userId, targetUserId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get details of a discussion channel or group' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId?: string
  ) {
    return this.discussionsService.findOne(id, userId);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-jwt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Join a public channel. (Private groups cannot be joined directly; requires addition by an existing member)',
  })
  async joinChannel(
    @Param('id') id: string,
    @CurrentUser('id') userId: string
  ) {
    return this.discussionsService.joinChannel(id, userId);
  }

  @Post(':id/members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-jwt')
  @ApiOperation({
    summary: 'Add a citizen to a private group or channel (inviter must already be a member)',
  })
  async addMember(
    @Param('id') id: string,
    @CurrentUser('id') actorUserId: string,
    @Body() dto: AddMemberDto
  ) {
    return this.discussionsService.addMember(id, actorUserId, dto);
  }

  @Delete(':id/members/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-jwt')
  @ApiOperation({ summary: 'Leave room or remove a member (admin permission required for removal)' })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @CurrentUser('id') actorUserId: string
  ) {
    return this.discussionsService.removeMember(id, actorUserId, targetUserId);
  }

  @Public()
  @Get(':id/messages')
  @ApiOperation({
    summary: 'Get conversation messages for a channel (public) or private group (members only)',
  })
  async getMessages(
    @Param('id') id: string,
    @CurrentUser('id') userId?: string
  ) {
    return this.discussionsService.getMessages(id, userId);
  }

  @Post(':id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-jwt')
  @ApiOperation({ summary: 'Send a message in a discussion channel or group' })
  async sendMessage(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SendMessageDto
  ) {
    return this.discussionsService.sendMessage(id, userId, dto);
  }
}

