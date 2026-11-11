import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CloudinaryService } from './cloudinary.service';
import { NeonStorageService } from './neon-storage.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Media & Storage')
@Controller('storage')
export class StorageController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly neonStorageService: NeonStorageService,
  ) {}

  @Public()
  @Post('upload')
  @ApiOperation({ summary: 'Upload an image or video evidence file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    }),
  )
  async uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file provided for upload');
    }

    // Try Cloudinary first
    try {
      const result = await this.cloudinaryService.uploadBuffer(file.buffer, 'naatukoottam/evidence');
      return {
        url: result.secure_url || result.url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
      };
    } catch {
      // Fallback to Neon S3 storage
      const ext = file.originalname?.split('.').pop() || 'jpg';
      const key = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const url = await this.neonStorageService.uploadFile(key, file.buffer, file.mimetype || 'image/jpeg');
      return {
        url,
        key,
        bytes: file.size,
      };
    }
  }
}

