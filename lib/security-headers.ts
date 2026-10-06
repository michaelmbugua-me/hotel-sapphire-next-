/**
 * Response headers applied to every route (see next.config.ts).
 *
 * No Content-Security-Policy yet: Next's inline bootstrap scripts need per-request nonces to pass a
 * strict policy, which would force every page to render dynamically and undo the static (SSG)
 * delivery this port exists to measure. Revisit if the performance comparison allows it.
 */
export const SECURITY_HEADERS: ReadonlyArray<{ key: string; value: string }> = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];
