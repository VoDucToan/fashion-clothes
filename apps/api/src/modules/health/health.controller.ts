import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { PrismaHealthIndicator } from './prisma.health.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
  ) {}

  /**
   * Liveness: "is the process alive?" — must not touch the database.
   * If this checked Postgres, a database blip would make the orchestrator
   * restart a perfectly healthy API instead of waiting for the database.
   */
  @Get('live')
  @ApiOperation({ summary: 'Liveness probe — process is up' })
  live(): { status: string; uptime: number } {
    return { status: 'ok', uptime: Math.round(process.uptime()) };
  }

  /** Readiness: "can it serve traffic?" — dependencies included. */
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe — dependencies reachable' })
  @HealthCheck()
  ready() {
    return this.health.check([() => this.prismaHealth.isHealthy('database')]);
  }
}
