import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';

import type { AppConfig } from '../../config/configuration.js';
import { PrismaClient } from '../../generated/prisma/client.js';

/**
 * The single database connection for the process.
 *
 * Prisma 7 talks to Postgres through a driver adapter (node-postgres here),
 * so the pool is configured explicitly instead of hidden inside a Rust engine.
 * Extending PrismaClient — rather than wrapping it — means services get the
 * full typed query API (`prisma.product.findMany`) with no delegation layer.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService<AppConfig, true>) {
    super({
      adapter: new PrismaPg({
        connectionString: config.get('database.url', { infer: true }),
        // Keep below Postgres' max_connections (100 in docker-compose.yml),
        // and remember every API instance opens its own pool.
        max: 10,
      }),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Connected to PostgreSQL');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
