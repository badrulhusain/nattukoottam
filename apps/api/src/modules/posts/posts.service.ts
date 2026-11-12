import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePostDto, QueryPostsDto } from './dto/create-post.dto';
import { buildPaginatedResult } from '../../common/pagination/pagination.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        authorId: userId,
        content: dto.content,
        category: dto.category,
        locality: dto.locality,
        district: dto.district,
        latitude: dto.latitude,
        longitude: dto.longitude,
        language: dto.language || 'ml',
        voiceAudioUrl: dto.voiceAudioUrl,
        isAnonymous: dto.isAnonymous ?? false,
        media: dto.mediaUrls && dto.mediaUrls.length > 0
          ? {
              create: dto.mediaUrls.map((url) => ({
                mediaUrl: url,
                mediaType: url.endsWith('.mp4') ? 'VIDEO' : 'IMAGE',
              })),
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            locality: true,
            district: true,
            role: true,
          },
        },
        media: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  }

  async findAll(query: QueryPostsDto, currentUserId?: string) {
    const where: any = {};

    if (query.locality) {
      where.locality = query.locality;
    }
    if (query.category) {
      where.category = query.category;
    }
    if (query.authorId) {
      where.authorId = query.authorId;
    }

    const [total, posts] = await Promise.all([
      this.prisma.post.count({ where }),
      this.prisma.post.findMany({
        where,
        skip: query.skip,
        take: query.limit ?? 20,
        orderBy: query.feed === 'trending' ? { viewCount: 'desc' } : { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              locality: true,
              district: true,
              role: true,
            },
          },
          media: true,
          likes: currentUserId
            ? {
                where: { userId: currentUserId },
                select: { id: true },
              }
            : false,
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
    ]);

    const formatted = posts.map((post: any) => ({
      ...post,
      author: post.isAnonymous
        ? {
            id: 'anonymous',
            fullName: `വാർഡ് നിവാസി (${post.locality})`,
            username: 'ward_resident',
            avatarUrl: '',
            locality: post.locality,
            district: post.district,
            role: 'CITIZEN',
          }
        : post.author,
      isLiked: Boolean(post.likes && post.likes.length > 0),
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
    }));

    return formatted;
  }

  async findOne(id: string, currentUserId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            locality: true,
            district: true,
          },
        },
        media: true,
        comments: {
          take: 50,
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        likes: currentUserId ? { where: { userId: currentUserId }, select: { id: true } } : false,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException({ code: 'POST_NOT_FOUND', message: 'Post not found' });
    }

    // Increment view count
    await this.prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return {
      ...post,
      isLiked: Boolean(post.likes && (post.likes as any).length > 0),
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
    };
  }

  async toggleLike(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException({ code: 'POST_NOT_FOUND', message: 'Post not found' });
    }

    const existingLike = await this.prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      await this.prisma.postLike.delete({
        where: { id: existingLike.id },
      });
      return { liked: false };
    } else {
      await this.prisma.postLike.create({
        data: {
          postId,
          userId,
        },
      });
      return { liked: true };
    }
  }

  async remove(id: string, userId: string, userRole: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException({ code: 'POST_NOT_FOUND', message: 'Post not found' });
    }

    if (post.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException({
        code: 'NOT_AUTHORIZED',
        message: 'You can only delete your own posts',
      });
    }

    await this.prisma.post.delete({ where: { id } });
    return { success: true };
  }
}

