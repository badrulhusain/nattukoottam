import { Module } from '@nestjs/common';
import { DiscussionsController } from './discussions.controller';
import { DiscussionsService } from './discussions.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DiscussionsController],
  providers: [DiscussionsService],
  exports: [DiscussionsService],
})
export class DiscussionsModule {}

