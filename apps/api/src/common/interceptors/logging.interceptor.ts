import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

import { getRequestId } from '../middleware/request-id.middleware.js';

/**
 * Access log with a duration, so slow endpoints are visible before users report
 * them. Pair it with Postgres' `log_min_duration_statement` (already set in
 * docker-compose) when hunting down an N+1.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const requestId = getRequestId(request);
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(
            `[${requestId}] ${request.method} ${request.originalUrl} ${response.statusCode} ${Date.now() - startedAt}ms`,
          );
        },
        // Failures are logged by AllExceptionsFilter — don't log them twice.
      }),
    );
  }
}
