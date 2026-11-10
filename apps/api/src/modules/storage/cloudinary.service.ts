import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private isConfigured = false;

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      this.isConfigured = true;
      this.logger.log(`Cloudinary configured for cloud: ${cloudName}`);
    } else {
      this.logger.warn('Cloudinary credentials missing in environment.');
    }
  }

  async uploadBuffer(buffer: Buffer, folder = 'naatukoottam'): Promise<UploadApiResponse> {
    if (!this.isConfigured) {
      throw new Error('Cloudinary is not configured');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload returned empty result'));
          resolve(result);
        },
      );
      uploadStream.end(buffer);
    });
  }

  async healthCheck(): Promise<{ status: string; cloudName?: string; reachable: boolean; error?: string }> {
    if (!this.isConfigured) {
      return { status: 'DISABLED', reachable: false, error: 'Not configured' };
    }

    try {
      const pingResult = await cloudinary.api.ping();
      return {
        status: pingResult.status === 'ok' ? 'UP' : 'DOWN',
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        reachable: pingResult.status === 'ok',
      };
    } catch (err: any) {
      return {
        status: 'ERROR',
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        reachable: false,
        error: err.message,
      };
    }
  }
}

