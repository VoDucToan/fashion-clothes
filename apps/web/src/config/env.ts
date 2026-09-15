import { z } from "zod";

/**
 * Validated at module load so a missing variable fails the build / boot,
 * not a request three weeks later in production.
 *
 * Server-only values must NOT be read from client components — keep them
 * behind route handlers and server components.
 */
const serverSchema = z.object({
  API_URL: z.url(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
});

/**
 * `process.env` is not a plain object in Next — properties are inlined at
 * build time, so every key has to be written out literally.
 */
const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

export const env = {
  ...clientEnv,
  get server() {
    if (typeof window !== "undefined") {
      throw new Error("env.server was read in the browser");
    }
    return serverSchema.parse({
      API_URL: process.env.API_URL,
      NODE_ENV: process.env.NODE_ENV,
    });
  },
};
