import { Global, Module } from '@nestjs/common';
import { NeonStorageService } from './neon-storage.service';
import { CloudinaryService } from './cloudinary.service';
import { StorageController } from './storage.controller';

@Global()
@Module({
  controllers: [StorageController],
  providers: [NeonStorageService, CloudinaryService],
  exports: [NeonStorageService, CloudinaryService],
})
export class StorageModule {}
