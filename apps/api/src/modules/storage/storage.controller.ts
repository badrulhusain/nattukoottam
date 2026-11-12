import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Body,
  Query,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CloudinaryService } from './cloudinary.service';
import { NeonStorageService } from './neon-storage.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Media & Storage')
@Controller('storage')
export class StorageController {
  private readonly logger = new Logger(StorageController.name);

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

  @Public()
  @Post('transcribe')
  @ApiOperation({ summary: 'Transcribe Malayalam/English voice audio using Groq Whisper AI' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
    }),
  )
  async transcribeAudio(
    @UploadedFile() file: any,
    @Body('language') lang?: string,
    @Query('upload') shouldUpload?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No audio file provided');
    }

    let audioUrl: string | undefined;

    // Upload audio file if requested or by default so it can be played in photo bg
    if (shouldUpload !== 'false') {
      try {
        const result = await this.cloudinaryService.uploadBuffer(file.buffer, 'naatukoottam/voice_notes');
        audioUrl = result.secure_url || result.url;
      } catch {
        try {
          const ext = file.originalname?.split('.').pop() || 'webm';
          const key = `voice/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
          audioUrl = await this.neonStorageService.uploadFile(key, file.buffer, file.mimetype || 'audio/webm');
        } catch (e: any) {
          this.logger.warn(`Could not upload audio file: ${e.message}`);
        }
      }
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      this.logger.warn('GROQ_API_KEY is not configured in environment.');
      return {
        text: '',
        audioUrl,
        warning: 'GROQ_API_KEY is not configured in .env',
      };
    }

    try {
      const formData = new FormData();
      const ext = file.originalname?.split('.').pop() || 'webm';
      const audioBlob = new Blob([file.buffer], { type: file.mimetype || 'audio/webm' });
      formData.append('file', audioBlob, `voice_complaint.${ext}`);
      formData.append('model', 'whisper-large-v3');
      if (lang && lang !== 'auto') {
        formData.append('language', lang);
      }
      formData.append(
        'prompt',
        'Transcribe Malayalam and English speech for Kerala civic complaints, municipal issues, and community grievances.'
      );
      formData.append('response_format', 'json');
      formData.append('temperature', '0.2');

      const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
        },
        body: formData,
      });

      if (!groqRes.ok) {
        const errText = await groqRes.text();
        this.logger.error(`Groq Whisper API error (${groqRes.status}): ${errText}`);
        return {
          text: '',
          audioUrl,
          error: `Groq Whisper API error: ${groqRes.statusText}`,
        };
      }

      const groqJson = await groqRes.json();
      return {
        text: (groqJson.text || '').trim(),
        audioUrl,
        language: groqJson.language || lang || 'ml',
      };
    } catch (err: any) {
      this.logger.error(`Failed to transcribe audio with Groq: ${err.message}`);
      return {
        text: '',
        audioUrl,
        error: err.message,
      };
    }
  }
}

