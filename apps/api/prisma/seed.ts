import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client.js';

/**
 * Deterministic development data. Keep it idempotent (upsert, not create) so
 * running it twice never fails and never duplicates rows.
 */
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main(): Promise<void> {
  // TODO: seed categories, products, variants and an admin account once the
  // models exist in prisma/schema.prisma.
  console.log('Nothing to seed yet — add models to prisma/schema.prisma first.');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
