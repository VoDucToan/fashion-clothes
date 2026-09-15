import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware.js';
import { AppConfigModule } from './config/config.module.js';
import { PrismaModule } from './infra/prisma/prisma.module.js';
import { HealthModule } from './modules/health/health.module.js';

/**
 * The root module is a wiring diagram, nothing else: no controllers, no
 * business logic. Reading its imports should tell a newcomer what the service
 * is made of. Feature modules are added to `imports` as they are built.
 */
@Module({
  imports: [
    // Infrastructure
    AppConfigModule,
    PrismaModule,

    // Features
    HealthModule,
  ],
  providers: [
    // Registered as providers (not `app.useGlobalX`) so they can inject
    // dependencies — a filter that needs ConfigService or a logger works here.
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('{*splat}');
  }
}
