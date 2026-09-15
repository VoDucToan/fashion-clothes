import { Module } from '@nestjs/common';

import { PrismaService } from './prisma.service.js';

/**
 * Deliberately NOT @Global: a feature module that needs the database says so by
 * importing this module. The import list of a module then tells you exactly
 * what it depends on — which is the whole point of Nest's module system.
 */
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
