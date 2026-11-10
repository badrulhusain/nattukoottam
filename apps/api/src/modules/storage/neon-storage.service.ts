import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  S3Client,
  ListBucketsCommand,
  PutObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class NeonStorageService implements OnModuleInit {
  private readonly logger = new Logger(NeonStorageService.name);
  private s3Client: S3Client;
  private readonly endpoint: string;
  private readonly bucketName: string;

  constructor() {
    this.endpoint = process.env.AWS_ENDPOINT_URL_S3 || '';
    this.bucketName = process.env.S3_BUCKET_NAME || 'nattukootam-media';

    this.s3Client = new S3Client({
      endpoint: this.endpoint,
      region: process.env.AWS_REGION || 'us-east-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
      forcePathStyle: true, // Needed for custom S3 endpoints
    });
  }

  async onModuleInit() {
    if (this.endpoint && process.env.AWS_ACCESS_KEY_ID) {
      try {
        await this.ensureBucketExists();
        this.logger.log(`Neon S3 Storage initialized (Endpoint: ${this.endpoint}, Bucket: ${this.bucketName})`);
      } catch (err: any) {
        this.logger.warn(`Neon S3 Storage bucket initialization: ${err.message}`);
      }
    }
  }

  async ensureBucketExists() {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
    } catch {
      try {
        await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
        this.logger.log(`Created default S3 bucket: ${this.bucketName}`);
      } catch (createErr: any) {
        this.logger.debug(`Bucket check/create note: ${createErr.message}`);
      }
    }
  }

  async uploadFile(key: string, body: Buffer, contentType: string): Promise<string> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return `${this.endpoint}/${this.bucketName}/${key}`;
  }

  async healthCheck(): Promise<{ status: string; endpoint: string; reachable: boolean; bucketCount?: number; error?: string }> {
    if (!this.endpoint) {
      return { status: 'DISABLED', endpoint: '', reachable: false, error: 'Endpoint not configured' };
    }

    try {
      const response = await this.s3Client.send(new ListBucketsCommand({}));
      return {
        status: 'UP',
        endpoint: this.endpoint,
        reachable: true,
        bucketCount: response.Buckets?.length || 0,
      };
    } catch (err: any) {
      return {
        status: 'ERROR',
        endpoint: this.endpoint,
        reachable: false,
        error: err.message,
      };
    }
  }
}

