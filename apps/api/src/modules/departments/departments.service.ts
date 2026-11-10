import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            issues: true,
            projects: true,
            officials: true,
          },
        },
      },
    });
  }

  async findByCode(code: string) {
    const dept = await this.prisma.department.findUnique({
      where: { code },
      include: {
        officials: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
        issues: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        projects: {
          take: 5,
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (!dept) {
      throw new NotFoundException({ code: 'DEPT_NOT_FOUND', message: 'Department not found' });
    }

    return dept;
  }
}

