import { Global, Module } from '@nestjs/common';
import { NeonRealtimeService } from './neon-realtime.service';

@Global()
@Module({
  providers: [NeonRealtimeService],
  exports: [NeonRealtimeService],
})
export class NeonRealtimeModule {}

