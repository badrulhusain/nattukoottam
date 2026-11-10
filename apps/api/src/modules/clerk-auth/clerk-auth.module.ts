import { Global, Module } from '@nestjs/common';
import { ClerkAuthService } from './clerk-auth.service';

@Global()
@Module({
  providers: [ClerkAuthService],
  exports: [ClerkAuthService],
})
export class ClerkAuthModule {}

