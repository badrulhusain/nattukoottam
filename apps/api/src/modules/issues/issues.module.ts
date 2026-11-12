import { Module } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { EscalationService } from './escalation.service';
import { IssuesController } from './issues.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [IssuesController],
  providers: [IssuesService, EscalationService],
  exports: [IssuesService, EscalationService],
})
export class IssuesModule {}

