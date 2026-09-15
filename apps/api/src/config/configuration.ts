import { validateEnv } from './env.schema.js';

/**
 * Maps the flat env vars onto a nested, feature-shaped config object.
 * Consumers ask for `config.get('http.port')`, not `process.env.PORT`, so the
 * transport (env var, secret manager, config file) can change without touching
 * the call sites.
 */
export function configuration() {
  const env = validateEnv(process.env);

  return {
    nodeEnv: env.NODE_ENV,
    isProduction: env.NODE_ENV === 'production',
    http: {
      port: env.PORT,
      corsOrigins: env.CORS_ORIGINS,
      globalPrefix: '/api',
      defaultVersion: '1',
    },
    database: {
      url: env.DATABASE_URL,
    },
    swagger: {
      enabled: env.SWAGGER_ENABLED,
      path: 'docs',
    },
  };
}

export type AppConfig = ReturnType<typeof configuration>;
