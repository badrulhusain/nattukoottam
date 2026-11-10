import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import WebSocket from 'ws';

@Injectable()
export class NeonRealtimeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NeonRealtimeService.name);
  private ws: WebSocket | null = null;
  private isConnected = false;

  onModuleInit() {
    this.connect();
  }

  onModuleDestroy() {
    if (this.ws) {
      this.ws.close();
      this.logger.log('Closed Neon Realtime WebSocket connection.');
    }
  }

  private connect() {
    const realtimeUrl = process.env.NEON_REALTIME_URL;
    const realtimeSecret = process.env.NEON_REALTIME_SECRET;

    if (!realtimeUrl) {
      this.logger.warn('NEON_REALTIME_URL is not set. Neon Realtime will be disabled.');
      return;
    }

    try {
      const url = new URL(realtimeUrl);
      if (realtimeSecret) {
        url.searchParams.set('secret', realtimeSecret);
      }

      this.ws = new WebSocket(url.toString());

      this.ws.on('open', () => {
        this.isConnected = true;
        this.logger.log(`Connected to Neon Realtime at ${realtimeUrl}`);
      });

      this.ws.on('message', (data: WebSocket.RawData) => {
        this.logger.debug(`Realtime message received: ${data.toString()}`);
      });

      this.ws.on('close', () => {
        this.isConnected = false;
        this.logger.warn('Neon Realtime connection closed.');
      });

      this.ws.on('error', (err: Error) => {
        this.isConnected = false;
        this.logger.warn(`Neon Realtime WebSocket: ${err.message}`);
      });
    } catch (err: any) {
      this.logger.error(`Failed to initialize Neon Realtime: ${err.message}`);
    }
  }

  async healthCheck(): Promise<{ status: string; url: string; connected: boolean }> {
    const url = process.env.NEON_REALTIME_URL || '';
    return {
      status: this.isConnected ? 'UP' : 'CONFIGURED',
      url,
      connected: this.isConnected,
    };
  }

  broadcast(channel: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ channel, payload }));
    }
  }
}

