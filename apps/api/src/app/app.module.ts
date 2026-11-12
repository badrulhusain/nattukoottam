import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { NeonRealtimeModule } from '../modules/neon-realtime/neon-realtime.module';
import { StorageModule } from '../modules/storage/storage.module';
import { ClerkAuthModule } from '../modules/clerk-auth/clerk-auth.module';
import { HealthModule } from '../modules/health/health.module';
import { AuthModule } from '../modules/auth/auth.module';
import { PostsModule } from '../modules/posts/posts.module';
import { IssuesModule } from '../modules/issues/issues.module';
import { ProjectsModule } from '../modules/projects/projects.module';
import { DepartmentsModule } from '../modules/departments/departments.module';
import { DiscussionsModule } from '../modules/discussions/discussions.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { AiModule } from '../modules/ai/ai.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    NeonRealtimeModule,
    StorageModule,
    ClerkAuthModule,
    HealthModule,
    AuthModule,
    PostsModule,
    IssuesModule,
    ProjectsModule,
    DepartmentsModule,
    DiscussionsModule,
    NotificationsModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
