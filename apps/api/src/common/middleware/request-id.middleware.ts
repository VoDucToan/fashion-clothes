import { randomUUID } from 'node:crypto';

import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Gives every request a stable id, reused if the caller (Nginx, the Next.js BFF)
 * already sent one. Logs and error responses carry it, so a user reporting
 * "order failed at 10:12" can be traced to the exact request across services.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.headers[REQUEST_ID_HEADER];
    const requestId =
      typeof incoming === 'string' && incoming.length > 0
        ? incoming
        : randomUUID();

    req.headers[REQUEST_ID_HEADER] = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);
    next();
  }
}

export function getRequestId(req: Request): string {
  const value = req.headers[REQUEST_ID_HEADER];
  return typeof value === 'string' ? value : 'unknown';
}
