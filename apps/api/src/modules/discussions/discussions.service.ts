import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateDiscussionRoomDto,
  SendMessageDto,
  AddMemberDto,
  QueryDiscussionsDto,
} from './dto/create-discussion.dto';
import { DiscussionRoomType } from '@prisma/client';

@Injectable()
export class DiscussionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId?: string, query?: QueryDiscussionsDto) {
    const where: any = {};

    // Locality filter
    if (query?.locality) {
      where.locality = { equals: query.locality, mode: 'insensitive' };
    }

    // Keyword search
    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { locality: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Channel vs Group privacy logic:
    // Channels are public to all.
    // Groups are only visible if public or if user is already a member.
    if (query?.type) {
      where.type = query.type;
    } else {
      // Default: show channels, plus groups user belongs to
      if (userId) {
        where.OR = [
          { type: DiscussionRoomType.CHANNEL },
          {
            type: DiscussionRoomType.GROUP,
            members: { some: { userId } },
          },
          {
            type: DiscussionRoomType.DIRECT,
            members: { some: { userId } },
          },
        ];
      } else {
        where.type = DiscussionRoomType.CHANNEL;
      }
    }

    const rooms = await this.prisma.discussionRoom.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        _count: {
          select: { members: true, messages: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: { id: true, fullName: true, avatarUrl: true },
            },
          },
        },
        members: userId
          ? {
              where: { userId },
              select: { id: true, role: true, joinedAt: true },
            }
          : false,
      },
    });

    return rooms.map((room) => ({
      id: room.id,
      name: room.name,
      description: room.description,
      type: room.type,
      locality: room.locality,
      district: room.district,
      category: room.category,
      avatarUrl: room.avatarUrl,
      createdBy: room.createdBy,
      membersCount: room._count.members,
      messagesCount: room._count.messages,
      latestMessage: room.messages[0] || null,
      isMember: userId ? (room.members && (room.members as any).length > 0) : false,
      canJoinDirectly: room.type === DiscussionRoomType.CHANNEL,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    }));
  }

  async create(userId: string, dto: CreateDiscussionRoomDto) {
    const room = await this.prisma.discussionRoom.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        locality: dto.locality,
        district: dto.district,
        category: dto.category,
        createdById: userId,
        members: {
          create: {
            userId,
            role: 'ADMIN',
          },
        },
      },
      include: {
        createdBy: { select: { id: true, fullName: true, avatarUrl: true } },
        _count: { select: { members: true } },
      },
    });

    // If initiating 1-on-1 direct conversation, add the target user
    if (dto.type === DiscussionRoomType.DIRECT && dto.recipientUserId) {
      await this.prisma.discussionMember.create({
        data: {
          roomId: room.id,
          userId: dto.recipientUserId,
          role: 'MEMBER',
          addedById: userId,
        },
      });
    }

    return room;
  }

  async findOne(roomId: string, userId?: string) {
    const room = await this.prisma.discussionRoom.findUnique({
      where: { id: roomId },
      include: {
        createdBy: { select: { id: true, fullName: true, avatarUrl: true } },
        members: {
          include: {
            user: {
              select: { id: true, fullName: true, avatarUrl: true, locality: true, role: true },
            },
          },
        },
        _count: { select: { messages: true, members: true } },
      },
    });

    if (!room) {
      throw new NotFoundException({ code: 'ROOM_NOT_FOUND', message: 'Discussion room not found' });
    }

    const membership = userId ? room.members.find((m) => m.userId === userId) : null;
    const isMember = Boolean(membership);

    return {
      ...room,
      isMember,
      membership,
      canJoinDirectly: room.type === DiscussionRoomType.CHANNEL,
      requiresInvite: room.type === DiscussionRoomType.GROUP,
    };
  }

  /**
   * Channel Join: Anyone can join freely
   * Groups: Cannot join directly; will be rejected
   */
  async joinChannel(roomId: string, userId: string) {
    const room = await this.prisma.discussionRoom.findUnique({ where: { id: roomId } });
    if (!room) {
      throw new NotFoundException({ code: 'ROOM_NOT_FOUND', message: 'Discussion room not found' });
    }

    if (room.type === DiscussionRoomType.GROUP) {
      throw new ForbiddenException({
        code: 'GROUP_INVITE_ONLY',
        message: 'This is a private group. You can only join if added by an existing member.',
      });
    }

    const existing = await this.prisma.discussionMember.findUnique({
      where: {
        roomId_userId: { roomId, userId },
      },
    });

    if (existing) {
      return { success: true, message: 'Already a member', member: existing };
    }

    const member = await this.prisma.discussionMember.create({
      data: {
        roomId,
        userId,
        role: 'MEMBER',
      },
    });

    return { success: true, message: 'Joined channel successfully', member };
  }

  /**
   * Group Member Add: Existing member adds another person
   */
  async addMember(roomId: string, actorUserId: string, dto: AddMemberDto) {
    const room = await this.prisma.discussionRoom.findUnique({ where: { id: roomId } });
    if (!room) {
      throw new NotFoundException({ code: 'ROOM_NOT_FOUND', message: 'Discussion room not found' });
    }

    // Verify actor is already a member of this room
    const actorMember = await this.prisma.discussionMember.findUnique({
      where: {
        roomId_userId: { roomId, userId: actorUserId },
      },
    });

    if (!actorMember) {
      throw new ForbiddenException({
        code: 'NOT_A_MEMBER',
        message: 'Only existing group members can add new members',
      });
    }

    // Resolve target user
    let targetUserId = dto.userId;
    if (!targetUserId && dto.phone) {
      const user = await this.prisma.user.findUnique({
        where: { phone: dto.phone.trim() },
      });
      if (!user) {
        throw new NotFoundException({
          code: 'USER_NOT_FOUND',
          message: `No citizen found with phone number ${dto.phone}`,
        });
      }
      targetUserId = user.id;
    }

    if (!targetUserId) {
      throw new BadRequestException({
        code: 'MISSING_USER_ID',
        message: 'Please provide either userId or phone number to add',
      });
    }

    // Check if already in room
    const existing = await this.prisma.discussionMember.findUnique({
      where: {
        roomId_userId: { roomId, userId: targetUserId },
      },
    });

    if (existing) {
      return { success: true, message: 'User is already a member of this group', member: existing };
    }

    const newMember = await this.prisma.discussionMember.create({
      data: {
        roomId,
        userId: targetUserId,
        role: dto.role || 'MEMBER',
        addedById: actorUserId,
      },
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true, locality: true } },
      },
    });

    return { success: true, message: 'Member added successfully', member: newMember };
  }

  async removeMember(roomId: string, actorUserId: string, targetUserId: string) {
    const membership = await this.prisma.discussionMember.findUnique({
      where: {
        roomId_userId: { roomId, userId: targetUserId },
      },
    });

    if (!membership) {
      throw new NotFoundException({ code: 'MEMBER_NOT_FOUND', message: 'Member not in room' });
    }

    // If leaving own membership, allowed
    if (actorUserId !== targetUserId) {
      // Must be an admin of the room
      const actorMember = await this.prisma.discussionMember.findUnique({
        where: {
          roomId_userId: { roomId, userId: actorUserId },
        },
      });

      if (!actorMember || actorMember.role !== 'ADMIN') {
        throw new ForbiddenException({
          code: 'NOT_AUTHORIZED',
          message: 'Only group admins can remove other members',
        });
      }
    }

    await this.prisma.discussionMember.delete({
      where: {
        roomId_userId: { roomId, userId: targetUserId },
      },
    });

    return { success: true, message: 'Member removed successfully' };
  }

  async getMessages(roomId: string, userId?: string) {
    const room = await this.prisma.discussionRoom.findUnique({ where: { id: roomId } });
    if (!room) {
      throw new NotFoundException({ code: 'ROOM_NOT_FOUND', message: 'Discussion room not found' });
    }

    // Privacy check for private groups:
    if (room.type === DiscussionRoomType.GROUP) {
      if (!userId) {
        throw new ForbiddenException({
          code: 'PRIVATE_GROUP',
          message: 'This is a private group. Please sign in to view messages.',
        });
      }

      const isMember = await this.prisma.discussionMember.findUnique({
        where: {
          roomId_userId: { roomId, userId },
        },
      });

      if (!isMember) {
        throw new ForbiddenException({
          code: 'NOT_A_MEMBER',
          message: 'This is a private group. Only members can view discussion messages.',
        });
      }
    }

    return this.prisma.discussionMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      take: 100,
      include: {
        sender: {
          select: { id: true, fullName: true, avatarUrl: true, locality: true, role: true },
        },
      },
    });
  }

  async sendMessage(roomId: string, userId: string, dto: SendMessageDto) {
    const room = await this.prisma.discussionRoom.findUnique({ where: { id: roomId } });
    if (!room) {
      throw new NotFoundException({ code: 'ROOM_NOT_FOUND', message: 'Discussion room not found' });
    }

    // Check membership
    let membership = await this.prisma.discussionMember.findUnique({
      where: {
        roomId_userId: { roomId, userId },
      },
    });

    // If channel and not yet member, automatically join upon sending first message
    if (!membership && room.type === DiscussionRoomType.CHANNEL) {
      membership = await this.prisma.discussionMember.create({
        data: {
          roomId,
          userId,
          role: 'MEMBER',
        },
      });
    } else if (!membership && room.type === DiscussionRoomType.GROUP) {
      throw new ForbiddenException({
        code: 'NOT_A_MEMBER',
        message: 'You must be a member of this private group to post messages.',
      });
    }

    const message = await this.prisma.discussionMessage.create({
      data: {
        roomId,
        senderId: userId,
        content: dto.content,
        mediaUrl: dto.mediaUrl,
      },
      include: {
        sender: {
          select: { id: true, fullName: true, avatarUrl: true, locality: true, role: true },
        },
      },
    });

    // Update room updatedAt timestamp
    await this.prisma.discussionRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
    });

    return message;
  }
}

