import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { getRequestId } from '../middleware/request-id.middleware.js';

interface ErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  details?: unknown;
  path: string;
  requestId: string;
  timestamp: string;
}

/**
 * One error shape for the whole API. Without this, clients see three different
 * formats: Nest's HttpException JSON, a raw stack trace for unexpected errors,
 * and whatever a library throws. The frontend then writes three parsers.
 *
 * Rule: unexpected errors are logged with their stack but answered with a
 * generic message — internal details (SQL, file paths) never reach the client.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const requestId = getRequestId(request);

    // originalUrl, not url: inside a mounted router (Nest's not-found handler)
    // `url` has already had the /api prefix stripped off.
    const body = this.toErrorBody(exception, request.originalUrl, requestId);

    if (body.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${requestId}] ${request.method} ${request.originalUrl} -> ${body.statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `[${requestId}] ${request.method} ${request.originalUrl} -> ${body.statusCode}: ${JSON.stringify(body.message)}`,
      );
    }

    response.status(body.statusCode).json(body);
  }

  private toErrorBody(
    exception: unknown,
    path: string,
    requestId: string,
  ): ErrorBody {
    const timestamp = new Date().toISOString();

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        return {
          statusCode,
          error: exception.name,
          message: payload,
          path,
          requestId,
          timestamp,
        };
      }

      const { message, error, details } = payload as {
        message?: string | string[];
        error?: unknown;
        details?: unknown;
      };

      return {
        statusCode,
        // Some libraries (Terminus) put an object in `error`; the envelope
        // keeps that slot a short, stable string and moves the rest to details.
        error: typeof error === 'string' ? error : exception.name,
        message: message ?? exception.message,
        details: details ?? (typeof error === 'object' ? error : undefined),
        path,
        requestId,
        timestamp,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Something went wrong. Please try again later.',
      path,
      requestId,
      timestamp,
    };
  }
}
