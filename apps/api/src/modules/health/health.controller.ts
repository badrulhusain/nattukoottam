import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';
import { NeonRealtimeService } from '../neon-realtime/neon-realtime.service';
import { NeonStorageService } from '../storage/neon-storage.service';
import { CloudinaryService } from '../storage/cloudinary.service';
import { ClerkAuthService } from '../clerk-auth/clerk-auth.service';

@ApiTags('Health & Services')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: NeonRealtimeService,
    private readonly neonStorage: NeonStorageService,
    private readonly cloudinary: CloudinaryService,
    private readonly clerk: ClerkAuthService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'System health check and end-to-end verification of all wired services' })
  @ApiResponse({ status: 200, description: 'Services health status' })
  async checkHealth() {
    const startTime = Date.now();

    // 1. Neon Database Check
    let dbStatus: any = { status: 'UNKNOWN' };
    try {
      const dbStart = Date.now();
      const result: any = await this.prisma.$queryRaw`SELECT current_database(), current_user, version(), NOW() as now;`;
      const userCount = await this.prisma.user.count();
      const issueCount = await this.prisma.issue.count();
      const projectCount = await this.prisma.infrastructureProject.count();
      const latencyMs = Date.now() - dbStart;

      dbStatus = {
        status: 'UP',
        provider: 'Neon PostgreSQL (aws-us-east-2)',
        branch: process.env.NEON_BRANCH || 'production',
        database: result[0]?.current_database,
        user: result[0]?.current_user,
        latencyMs,
        stats: {
          users: userCount,
          issues: issueCount,
          projects: projectCount,
        },
      };
    } catch (err: any) {
      dbStatus = {
        status: 'DOWN',
        error: err.message,
      };
    }

    // 2. Neon Realtime Check
    const realtimeStatus = await this.realtime.healthCheck();

    // 3. Neon S3 Storage Check
    const storageStatus = await this.neonStorage.healthCheck();

    // 4. Cloudinary Check
    const cloudinaryStatus = await this.cloudinary.healthCheck();

    // 5. Clerk Auth Check
    const clerkStatus = await this.clerk.healthCheck();

    const allHealthy =
      dbStatus.status === 'UP' &&
      storageStatus.status === 'UP' &&
      cloudinaryStatus.status === 'UP' &&
      clerkStatus.status === 'UP';

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      services: {
        neonPostgres: dbStatus,
        neonRealtime: realtimeStatus,
        neonS3Storage: storageStatus,
        cloudinary: cloudinaryStatus,
        clerkAuth: clerkStatus,
      },
    };
  }
}

