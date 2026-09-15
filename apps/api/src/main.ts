import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module.js';
import { setupSwagger } from './bootstrap/swagger.setup.js';
import type { AppConfig } from './config/configuration.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService<AppConfig, true>);

  // Security headers (CSP, HSTS, no-sniff...) before anything else runs.
  app.use(helmet());

  // Refresh tokens live in an httpOnly cookie, so cookies must be parsed.
  app.use(cookieParser());

  // credentials:true is required for the browser to send that cookie;
  // it also forbids a wildcard origin, hence the explicit allow-list.
  app.enableCors({
    origin: config.get('http.corsOrigins', { infer: true }),
    credentials: true,
  });

  // Routes become /api/v1/... — the version prefix exists from day one so a
  // breaking change later does not require moving every URL.
  app.setGlobalPrefix(config.get('http.globalPrefix', { infer: true }));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: config.get('http.defaultVersion', { infer: true }),
  });

  // Lets onModuleDestroy run (Prisma closes its pool) on SIGTERM from Docker.
  app.enableShutdownHooks();

  if (config.get('swagger.enabled', { infer: true })) {
    setupSwagger(app, config.get('swagger.path', { infer: true }));
  }

  const port = config.get('http.port', { infer: true });
  await app.listen(port);

  Logger.log(`API ready on http://localhost:${port}/api/v1`, 'Bootstrap');
}

await bootstrap();
