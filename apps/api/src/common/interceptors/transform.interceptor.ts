import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((result) => {
        // If response already matches standard wrapper or is a buffer/stream
        if (result && typeof result === 'object' && 'data' in result && 'success' in result) {
          return result;
        }

        if (result && typeof result === 'object' && 'data' in result && 'meta' in result) {
          return {
            success: true,
            statusCode,
            data: result.data,
            meta: result.meta,
          };
        }

        return {
          success: true,
          statusCode,
          data: result,
        };
      }),
    );
  }
}
