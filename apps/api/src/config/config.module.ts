import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { configuration } from './configuration.js';

/**
 * Wraps @nestjs/config so the rest of the app never repeats its options.
 * `isGlobal: true` makes ConfigService injectable everywhere — configuration is
 * infrastructure every module needs, and re-importing it in 20 feature modules
 * would be noise. Business modules are *not* global: those stay explicit so the
 * dependency graph remains readable.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      // .env is a local-development convenience; in production the process
      // receives real environment variables from Docker / the host.
      envFilePath: ['.env'],
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
