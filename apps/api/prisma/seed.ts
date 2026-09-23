import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client.js';
import { seedCatalog } from './seed/catalog.js';
import { seedReference } from './seed/reference.js';

/**
 * Deterministic development data. Keep it idempotent (upsert, not create) so
 * running it twice never fails and never duplicates rows.
 */
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main(): Promise<void> {
  // Order is a foreign-key order: every step depends on the one before it.
  await seedReference(prisma);

  if (process.env.NODE_ENV === 'production') {
    console.log('Fixtures skipped: reference data only in production.');
    return;
  }

  await seedCatalog(prisma);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
