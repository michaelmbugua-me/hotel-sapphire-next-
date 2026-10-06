import 'server-only';
import { z } from 'zod';

/** Server-only environment (secrets). Importing this from a Client Component fails the build. */
export const serverEnvSchema = z
  .object({
    RESEND_API_KEY: z.string().min(1),
    CONTACT_TO_EMAIL: z.email(),
    CONTACT_FROM_EMAIL: z.string().min(1),
    TURNSTILE_SECRET_KEY: z.string().min(1),
    UPSTASH_REDIS_REST_URL: z.url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  })
  .refine((env) => Boolean(env.UPSTASH_REDIS_REST_URL) === Boolean(env.UPSTASH_REDIS_REST_TOKEN), {
    message: 'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set together',
    path: ['UPSTASH_REDIS_REST_TOKEN'],
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  // Treat empty strings (e.g. `KEY=` in a .env file) as unset.
  const cleaned = Object.fromEntries(Object.entries(source).filter(([, value]) => value !== ''));
  const result = serverEnvSchema.safeParse(cleaned);
  if (!result.success) {
    throw new Error(`Invalid server environment variables:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

let cached: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  cached ??= parseServerEnv(process.env);
  return cached;
}
