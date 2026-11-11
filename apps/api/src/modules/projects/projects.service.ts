import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProjectDto, ResolveConflictDto, QueryProjectsDto } from './dto/create-project.dto';
import { buildPaginatedResult } from '../../common/pagination/pagination.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates Haversine distance in meters
   */
  private calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  /**
   * Detects spatial and temporal overlaps and creates conflicts
   */
  async detectConflictsForProject(projectId: string) {
    const target = await this.prisma.infrastructureProject.findUnique({
      where: { id: projectId },
      include: { department: true },
    });
    if (!target) return;

    // Find other projects in the same district/locality
    const others = await this.prisma.infrastructureProject.findMany({
      where: {
        id: { not: projectId },
        district: target.district,
        status: { in: ['PLANNED', 'APPROVED', 'IN_PROGRESS'] },
      },
      include: { department: true },
    });

    const targetStart = new Date(target.startDate).getTime();
    const targetEnd = new Date(target.expectedEndDate).getTime();

    for (const other of others) {
      const distance = this.calculateDistanceMeters(
        target.latitude,
        target.longitude,
        other.latitude,
        other.longitude
      );

      const combinedRadius = (target.radiusMeters || 200) + (other.radiusMeters || 200);

      // Check spatial proximity
      if (distance <= combinedRadius) {
        const otherStart = new Date(other.startDate).getTime();
        const otherEnd = new Date(other.expectedEndDate).getTime();

        // Calculate overlap or proximity in time (within 60 days)
        const overlapStart = Math.max(targetStart, otherStart);
        const overlapEnd = Math.min(targetEnd, otherEnd);
        const overlapDays = Math.round((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24));

        const timeDiffDays = Math.abs(
          Math.round((targetStart - otherEnd) / (1000 * 60 * 60 * 24))
        );

        const isColliding = overlapDays >= 0 || timeDiffDays <= 45;

        if (isColliding) {
          // Check if conflict already exists
          const existing = await this.prisma.projectConflict.findFirst({
            where: {
              OR: [
                { projectAId: target.id, projectBId: other.id },
                { projectAId: other.id, projectBId: target.id },
              ],
            },
          });

          if (!existing) {
            const isRoadDiggingConflict =
              (target.category === 'ROAD_TRANSPORT' && other.category === 'WATER_SUPPLY') ||
              (target.category === 'WATER_SUPPLY' && other.category === 'ROAD_TRANSPORT') ||
              (target.category === 'ROAD_TRANSPORT' && other.category === 'ELECTRICITY') ||
              (target.category === 'ELECTRICITY' && other.category === 'ROAD_TRANSPORT');

            const recommendedAction = isRoadDiggingConflict
              ? `Coordinate schedules: Complete underground utility excavation (${
                  target.category === 'WATER_SUPPLY' ? target.department.name : other.department.name
                }) BEFORE asphalt road resurfacing (${
                  target.category === 'ROAD_TRANSPORT' ? target.department.name : other.department.name
                }) begins to avoid post-tarring road destruction.`
              : `Both agencies operate within ${distance}m during overlapping timeframes. Align site execution window to minimize traffic and infrastructure disruption.`;

            await this.prisma.projectConflict.create({
              data: {
                projectAId: target.id,
                projectBId: other.id,
                distanceMeters: distance,
                dateOverlapDays: Math.max(1, overlapDays > 0 ? overlapDays : 30 - timeDiffDays),
                status: 'POTENTIAL',
                notes: `Automated detection: ${target.name} and ${other.name} coincide within ${distance} meters.`,
                jointPlan: recommendedAction,
              },
            });
          }
        }
      }
    }
  }

  async create(dto: CreateProjectDto) {
    const project = await this.prisma.infrastructureProject.create({
      data: {
        name: dto.name,
        description: dto.description,
        departmentId: dto.departmentId,
        category: dto.category,
        status: dto.status || 'PLANNED',
        district: dto.district,
        locality: dto.locality,
        roadName: dto.roadName,
        latitude: dto.latitude,
        longitude: dto.longitude,
        radiusMeters: dto.radiusMeters || 200.0,
        estimatedCost: dto.estimatedCost,
        startDate: new Date(dto.startDate),
        expectedEndDate: new Date(dto.expectedEndDate),
        contractorName: dto.contractorName,
      },
      include: {
        department: true,
      },
    });

    // Run conflict detection engine
    await this.detectConflictsForProject(project.id);

    return project;
  }

  async findAll(query: QueryProjectsDto) {
    const where: any = {};
    if (query.locality) {
      where.locality = { equals: query.locality, mode: 'insensitive' };
    }
    if (query.district) {
      where.district = { equals: query.district, mode: 'insensitive' };
    }
    if (query.status) {
      where.status = query.status;
    }

    const [total, projects] = await Promise.all([
      this.prisma.infrastructureProject.count({ where }),
      this.prisma.infrastructureProject.findMany({
        where,
        skip: query.skip,
        take: query.limit ?? 20,
        orderBy: { startDate: 'asc' },
        include: {
          department: true,
          conflictsA: {
            include: {
              projectB: {
                include: { department: true },
              },
            },
          },
          conflictsB: {
            include: {
              projectA: {
                include: { department: true },
              },
            },
          },
        },
      }),
    ]);

    return projects;
  }

  async findAllConflicts(locality?: string) {
    const where: any = {};
    if (locality) {
      where.OR = [
        { projectA: { locality: { equals: locality, mode: 'insensitive' } } },
        { projectB: { locality: { equals: locality, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.projectConflict.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        projectA: {
          include: { department: true },
        },
        projectB: {
          include: { department: true },
        },
      },
    });
  }

  async resolveConflict(conflictId: string, dto: ResolveConflictDto) {
    const conflict = await this.prisma.projectConflict.findUnique({
      where: { id: conflictId },
    });
    if (!conflict) {
      throw new NotFoundException({ code: 'CONFLICT_NOT_FOUND', message: 'Conflict not found' });
    }

    return this.prisma.projectConflict.update({
      where: { id: conflictId },
      data: {
        status: dto.status,
        jointPlan: dto.jointPlan || conflict.jointPlan,
        notes: dto.notes || conflict.notes,
      },
      include: {
        projectA: { include: { department: true } },
        projectB: { include: { department: true } },
      },
    });
  }
}

