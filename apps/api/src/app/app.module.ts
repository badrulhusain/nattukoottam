import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { NeonRealtimeModule } from '../modules/neon-realtime/neon-realtime.module';
import { StorageModule } from '../modules/storage/storage.module';
import { ClerkAuthModule } from '../modules/clerk-auth/clerk-auth.module';
import { HealthModule } from '../modules/health/health.module';
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
