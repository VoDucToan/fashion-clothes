import { z } from 'zod';

/**
 * Every environment variable the API is allowed to read is declared here.
 * Nothing else in the codebase touches `process.env` directly — that keeps
 * "which env vars does this service need?" answerable by reading one file,
 * and makes the app crash at boot (not at 3am on a request) when one is missing.
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  // postgresql://user:password@host:5432/db?schema=public
  DATABASE_URL: z.string().startsWith('postgres'),

  // Comma-separated list of browser origins allowed to call the API with cookies.
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),

  SWAGGER_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(raw);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(`Invalid environment variables:\n${details}`);
  }

  return parsed.data;
}
