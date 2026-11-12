import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class EscalationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EscalationService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  onModuleInit() {
    // Initial scan shortly after startup, followed by recurring 30-minute intervals
    setTimeout(() => {
      this.scanAndEscalateIssues().catch((err) => {
        this.logger.error('Initial escalation scan failed:', err);
      });
    }, 8000);

    this.timer = setInterval(() => {
      this.scanAndEscalateIssues().catch((err) => {
        this.logger.error('Periodic escalation scan failed:', err);
      });
    }, 30 * 60 * 1000);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  async scanAndEscalateIssues() {
    this.logger.log('Running civic accountability escalation audit...');

    // Escalation criteria:
    // Stale complaints in REPORTED or UNDER_REVIEW without resolution notes
    // that have been unattended for >= 3 days, OR critical urgency >= 24h, OR >= 2 supports >= 24h
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const staleIssues = await this.prisma.issue.findMany({
      where: {
        status: { in: ['REPORTED', 'UNDER_REVIEW'] },
        resolutionNotes: null,
        OR: [
          { createdAt: { lte: threeDaysAgo } },
          { urgency: 'CRITICAL', createdAt: { lte: oneDayAgo } },
          {
            supports: { some: {} },
            createdAt: { lte: oneDayAgo },
          },
        ],
      },
      include: {
        reporter: {
          select: { id: true, fullName: true, locality: true },
        },
        supports: {
          select: { userId: true },
        },
        _count: {
          select: { supports: true },
        },
      },
    });

    if (staleIssues.length === 0) {
      this.logger.log('Escalation audit complete: 0 issues required escalation.');
      return { escalatedCount: 0, issues: [] };
    }

    this.logger.warn(`Found ${staleIssues.length} issues requiring auto-escalation.`);

    const escalatedResults: any[] = [];

    // Find official or fallback actor for system escalation history record
    const officialUser =
      (await this.prisma.user.findFirst({
        where: { role: { in: ['ADMIN', 'DEPARTMENT_OFFICIAL'] } },
      })) || (await this.prisma.user.findFirst());

    for (const issue of staleIssues) {
      const actorId = officialUser?.id || issue.reporterId;
      const escalationNote = `⚠️ ഓട്ടോ-എസ്കലേഷൻ: ${issue._count.supports} പൗരന്മാരുടെ പിന്തുണയുള്ള ഈ പ്രശ്നത്തിൽ നടപടി വൈകുന്നതിനാൽ ജില്ലാ ഭരണകൂടം & LSGD സെക്രട്ടറി തലത്തിലേക്ക് ഓട്ടോ-എസ്കലേഷൻ ചെയ്തു.`;

      // 1. Update status to WAITING_FOR_COORDINATION & append audit history
      await this.prisma.issue.update({
        where: { id: issue.id },
        data: {
          status: 'WAITING_FOR_COORDINATION',
          history: {
            create: {
              actorId,
              fromStatus: issue.status,
              toStatus: 'WAITING_FOR_COORDINATION',
              notes: escalationNote,
            },
          },
        },
      });

      // 2. Notify Reporter
      await this.notificationsService.createNotification(
        issue.reporterId,
        'ISSUE_ESCALATED',
        '⚠️ പരാതി ഓട്ടോ-എസ്കലേഷൻ ചെയ്തു / Auto-Escalated',
        `നിങ്ങൾ റിപ്പോർട്ട് ചെയ്ത "${issue.title.slice(0, 50)}" എന്ന പ്രശ്നത്തിൽ നടപടി വൈകുന്നതിനാൽ ജില്ലാ തലത്തിലേക്ക് ഓട്ടോ-എസ്കലേഷൻ ചെയ്തിട്ടുണ്ട്.`,
        { issueId: issue.id, supportsCount: issue._count.supports },
      );

      // 3. Notify Supporting Citizens
      for (const sup of issue.supports) {
        if (sup.userId !== issue.reporterId) {
          await this.notificationsService.createNotification(
            sup.userId,
            'ISSUE_ESCALATED',
            'നിങ്ങൾ പിന്തുണച്ച പരാതി ഓട്ടോ-എസ്കലേഷൻ ചെയ്തു',
            `നിങ്ങൾ പിന്തുണച്ച "${issue.title.slice(0, 50)}" എന്ന പരാതി അധികാരികളുടെ അടിയന്തര ശ്രദ്ധയ്ക്കായി ഉയർന്ന തലത്തിലേക്ക് എസ്കലേഷൻ ചെയ്യപ്പെട്ടു.`,
            { issueId: issue.id },
          );
        }
      }

      escalatedResults.push({
        id: issue.id,
        title: issue.title,
        previousStatus: issue.status,
        newStatus: 'WAITING_FOR_COORDINATION',
        supportsCount: issue._count.supports,
        notifiedUsersCount: 1 + issue.supports.length,
      });
    }

    return {
      escalatedCount: escalatedResults.length,
      issues: escalatedResults,
    };
  }
}

