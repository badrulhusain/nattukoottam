import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateIssueDto, UpdateIssueStatusDto, QueryIssuesDto } from './dto/create-issue.dto';
import { buildPaginatedResult } from '../../common/pagination/pagination.dto';

@Injectable()
export class IssuesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateIssueDto) {
    const issue = await this.prisma.issue.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        urgency: dto.urgency || 'MEDIUM',
        district: dto.district,
        locality: dto.locality,
        wardNumber: dto.wardNumber,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        reporterId: userId,
        status: 'REPORTED',
        evidences: dto.evidenceUrls && dto.evidenceUrls.length > 0
          ? {
              create: dto.evidenceUrls.map((url) => ({
                uploadedById: userId,
                fileUrl: url,
                mediaType: url.endsWith('.mp4') ? 'VIDEO' : 'IMAGE',
              })),
            }
          : undefined,
        history: {
          create: {
            actorId: userId,
            toStatus: 'REPORTED',
            notes: 'Issue reported by citizen via Naatukoottam',
          },
        },
      },
      include: {
        reporter: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            locality: true,
            district: true,
          },
        },
        evidences: true,
        _count: {
          select: {
            supports: true,
          },
        },
      },
    });

    return issue;
  }

  async findAll(query: QueryIssuesDto, currentUserId?: string) {
    const where: any = {};

    if (query.locality) {
      where.locality = { equals: query.locality, mode: 'insensitive' };
    }
    if (query.district) {
      where.district = { equals: query.district, mode: 'insensitive' };
    }
    if (query.category) {
      where.category = query.category;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.urgency) {
      where.urgency = query.urgency;
    }

    const [total, issues] = await Promise.all([
      this.prisma.issue.count({ where }),
      this.prisma.issue.findMany({
        where,
        skip: query.skip,
        take: query.limit ?? 20,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              locality: true,
              district: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          evidences: true,
          supports: currentUserId
            ? {
                where: { userId: currentUserId },
                select: { id: true },
              }
            : false,
          _count: {
            select: {
              supports: true,
            },
          },
        },
      }),
    ]);

    const formatted = issues.map((issue: any) => ({
      ...issue,
      isSupported: Boolean(issue.supports && issue.supports.length > 0),
      supportsCount: issue._count.supports,
    }));

    return formatted;
  }

  async findOne(id: string, currentUserId?: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            locality: true,
            district: true,
          },
        },
        department: true,
        assignedOfficial: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
        evidences: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
        history: {
          orderBy: { createdAt: 'desc' },
          include: {
            actor: {
              select: {
                id: true,
                fullName: true,
                role: true,
              },
            },
          },
        },
        supports: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
        _count: {
          select: {
            supports: true,
          },
        },
      },
    });

    if (!issue) {
      throw new NotFoundException({ code: 'ISSUE_NOT_FOUND', message: 'Civic issue not found' });
    }

    return {
      ...issue,
      isSupported: Boolean(issue.supports && (issue.supports as any).length > 0),
      supportsCount: issue._count.supports,
    };
  }

  async toggleSupport(issueId: string, userId: string) {
    const issue = await this.prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) {
      throw new NotFoundException({ code: 'ISSUE_NOT_FOUND', message: 'Civic issue not found' });
    }

    const existingSupport = await this.prisma.issueSupport.findUnique({
      where: {
        issueId_userId: {
          issueId,
          userId,
        },
      },
    });

    if (existingSupport) {
      await this.prisma.issueSupport.delete({
        where: { id: existingSupport.id },
      });
      const count = await this.prisma.issueSupport.count({ where: { issueId } });
      return { supported: false, supportsCount: count };
    } else {
      await this.prisma.issueSupport.create({
        data: {
          issueId,
          userId,
        },
      });
      const count = await this.prisma.issueSupport.count({ where: { issueId } });
      return { supported: true, supportsCount: count };
    }
  }

  async updateStatus(issueId: string, actorUserId: string | undefined, dto: UpdateIssueStatusDto) {
    const issue = await this.prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) {
      throw new NotFoundException({ code: 'ISSUE_NOT_FOUND', message: 'Civic issue not found' });
    }

    const prevStatus = issue.status;

    let finalActorId = actorUserId;
    if (!finalActorId) {
      const fallbackUser = await this.prisma.user.findFirst();
      finalActorId = fallbackUser?.id || issue.reporterId;
    }

    const updated = await this.prisma.issue.update({
      where: { id: issueId },
      data: {
        status: dto.status,
        assignedDeptId: dto.assignedDeptId || issue.assignedDeptId,
        assignedOfficialId: dto.assignedOfficialId || issue.assignedOfficialId,
        resolutionNotes: dto.notes || issue.resolutionNotes,
        resolvedAt: dto.status === 'RESOLVED' ? new Date() : issue.resolvedAt,
        history: {
          create: {
            actorId: finalActorId,
            fromStatus: prevStatus,
            toStatus: dto.status,
            notes: dto.notes,
          },
        },
      },
      include: {
        department: true,
        history: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return updated;
  }

  async remove(id: string, userId: string, role: string) {
    const issue = await this.prisma.issue.findUnique({ where: { id } });
    if (!issue) {
      throw new NotFoundException({ code: 'ISSUE_NOT_FOUND', message: 'Civic issue not found' });
    }

    if (issue.reporterId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException({
        code: 'NOT_AUTHORIZED',
        message: 'You can only delete your own issues',
      });
    }

    await this.prisma.$transaction([
      this.prisma.issueEvidence.deleteMany({ where: { issueId: id } }),
      this.prisma.issueSupport.deleteMany({ where: { issueId: id } }),
      this.prisma.issueFollow.deleteMany({ where: { issueId: id } }),
      this.prisma.issueHistory.deleteMany({ where: { issueId: id } }),
      this.prisma.issue.delete({ where: { id } }),
    ]);

    return { success: true };
  }
}

