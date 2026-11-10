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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto, QueryPostsDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Posts & Feed')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-jwt')
  @ApiOperation({ summary: 'Create a new community post or report' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreatePostDto) {
    return this.postsService.create(userId, dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Fetch paginated posts by locality, category, and feed type' })
  async findAll(@Query() query: QueryPostsDto) {
    return this.postsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get detailed post and comments' })
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-jwt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle like on a post (appreciation action)' })
  async toggleLike(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.postsService.toggleLike(id, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-jwt')
  @ApiOperation({ summary: 'Delete a post (author or admin only)' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string
  ) {
    return this.postsService.remove(id, userId, role);
  }
}

