import { z } from 'zod';

/**
 * Public environment: safe to import from Server and Client Components.
 * Secrets live in `lib/env.server.ts`.
 */
export const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_BOOKING_HOTEL_ID: z.string().regex(/^\d+$/, 'must be numeric'),
  NEXT_PUBLIC_BOOKING_STYLE_ID: z.string().regex(/^\d+$/, 'must be numeric'),
  NEXT_PUBLIC_BOOKING_DC_ID: z.string().regex(/^\d+$/, 'must be numeric'),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export function parsePublicEnv(source: Record<string, string | undefined>): PublicEnv {
  const result = publicEnvSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`Invalid public environment variables:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

let cached: PublicEnv | undefined;

/** Parsed lazily so `next build` of pages that don't need env values never fails on missing vars. */
export function getPublicEnv(): PublicEnv {
  // Each NEXT_PUBLIC_* var must be referenced literally so Next can inline it into client bundles.
  cached ??= parsePublicEnv({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_BOOKING_HOTEL_ID: process.env.NEXT_PUBLIC_BOOKING_HOTEL_ID,
    NEXT_PUBLIC_BOOKING_STYLE_ID: process.env.NEXT_PUBLIC_BOOKING_STYLE_ID,
    NEXT_PUBLIC_BOOKING_DC_ID: process.env.NEXT_PUBLIC_BOOKING_DC_ID,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  });
  return cached;
}
