import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Connected to Neon PostgreSQL Database successfully.');
        return;
      } catch (error: any) {
        this.logger.warn(`Database connection attempt ${attempt}/${maxRetries} failed: ${error.message}`);
        if (attempt === maxRetries) {
          this.logger.error('Could not connect to Neon PostgreSQL Database on startup. Endpoints requiring DB may fail until connection is re-established.');
        } else {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from Neon PostgreSQL Database.');
  }
}

