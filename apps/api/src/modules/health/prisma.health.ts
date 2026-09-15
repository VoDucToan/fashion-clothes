import { Injectable, Logger } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

import { PrismaService } from '../../infra/prisma/prisma.service.js';

/** Readiness probe for Postgres: cheapest possible round-trip to the database. */
@Injectable()
export class PrismaHealthIndicator {
  private readonly logger = new Logger(PrismaHealthIndicator.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);
    const startedAt = Date.now();

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return indicator.up({ responseTime: Date.now() - startedAt });
    } catch (error) {
      // The real reason (bad credentials, wrong host, SSL) goes to the logs
      // only: /health/ready is often reachable from outside and must not
      // describe the database to whoever asks.
      this.logger.error('Database readiness check failed', error);
      return indicator.down({ message: 'Database unreachable' });
    }
  }
}
