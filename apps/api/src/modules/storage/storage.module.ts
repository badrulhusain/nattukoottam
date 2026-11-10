import { Global, Module } from '@nestjs/common';
import { NeonStorageService } from './neon-storage.service';
import { CloudinaryService } from './cloudinary.service';

@Global()
@Module({
  providers: [NeonStorageService, CloudinaryService],
  exports: [NeonStorageService, CloudinaryService],
})
export class StorageModule {}

