import { Injectable, Logger } from '@nestjs/common';
import { createClerkClient, verifyToken, ClerkClient } from '@clerk/backend';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ClerkAuthService {
  private readonly logger = new Logger(ClerkAuthService.name);
  private clerkClient: ClerkClient;
  private isConfigured = false;
  private secretKey?: string;

  constructor(private readonly prisma: PrismaService) {
    this.secretKey = process.env.CLERK_SECRET_KEY;
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    if (this.secretKey) {
      this.clerkClient = createClerkClient({
        secretKey: this.secretKey,
        publishableKey,
      });
      this.isConfigured = true;
      this.logger.log('Clerk Auth initialized successfully.');
    } else {
      this.logger.warn('CLERK_SECRET_KEY is missing in environment.');
    }
  }

  async verifyToken(token: string) {
    if (!this.isConfigured || !this.secretKey) {
      throw new Error('Clerk is not configured');
    }
    return verifyToken(token, { secretKey: this.secretKey });
  }

  async getUser(userId: string) {
    if (!this.isConfigured) {
      throw new Error('Clerk is not configured');
    }
    return this.clerkClient.users.getUser(userId);
  }

  async healthCheck(): Promise<{
    status: string;
    publishableKeyConfigured: boolean;
    secretKeyConfigured: boolean;
    reachable: boolean;
    userCount?: number;
    error?: string;
  }> {
    if (!this.isConfigured) {
      return {
        status: 'DISABLED',
        publishableKeyConfigured: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        secretKeyConfigured: false,
        reachable: false,
        error: 'Secret key not provided',
      };
    }

    try {
      const response = await this.clerkClient.users.getUserList({ limit: 1 });
      return {
        status: 'UP',
        publishableKeyConfigured: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        secretKeyConfigured: true,
        reachable: true,
        userCount: response.totalCount,
      };
    } catch (err: any) {
      return {
        status: 'ERROR',
        publishableKeyConfigured: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        secretKeyConfigured: true,
        reachable: false,
        error: err.message,
      };
    }
  }
}
