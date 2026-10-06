/**
 * Per-IP rate limiting for the contact endpoint.
 *
 * Two stores behind one interface: a fixed-window counter in Upstash Redis (REST, shared between
 * serverless instances) when configured, otherwise an in-memory counter. The in-memory store only
 * limits within a single instance, so it is a best-effort fallback, not a guarantee.
 */

export type RateLimitResult = {
  readonly allowed: boolean;
  /** Seconds until the caller may try again (0 when allowed). */
  readonly retryAfterSeconds: number;
};

export type RateLimiter = {
  check(key: string): Promise<RateLimitResult>;
};

export type RateLimitConfig = {
  readonly limit: number;
  readonly windowMs: number;
};

/** 5 messages per IP per 10 minutes: generous for a person, tight for a bot. */
export const CONTACT_RATE_LIMIT: RateLimitConfig = { limit: 5, windowMs: 10 * 60 * 1000 };

const MAX_TRACKED_KEYS = 10_000;

export function createMemoryRateLimiter(
  { limit, windowMs }: RateLimitConfig,
  now: () => number = Date.now,
): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    async check(key) {
      const current = now();
      const windowStart = current - windowMs;
      const recent = (hits.get(key) ?? []).filter((time) => time > windowStart);

      if (recent.length >= limit) {
        hits.set(key, recent);
        const oldest = recent[0] ?? current;
        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - current) / 1000)),
        };
      }

      recent.push(current);
      hits.set(key, recent);

      // Bound memory: drop the oldest tracked key once the map grows past the cap.
      if (hits.size > MAX_TRACKED_KEYS) {
        const first = hits.keys().next().value;
        if (first !== undefined) hits.delete(first);
      }
      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}

type UpstashOptions = {
  readonly url: string;
  readonly token: string;
  readonly config: RateLimitConfig;
  readonly fetchImpl?: typeof fetch;
  readonly now?: () => number;
};

/** Fixed window: INCR a per-window key, set its expiry on the first hit. */
export function createUpstashRateLimiter({
  url,
  token,
  config,
  fetchImpl = fetch,
  now = Date.now,
}: UpstashOptions): RateLimiter {
  const windowSeconds = Math.ceil(config.windowMs / 1000);

  return {
    async check(key) {
      const current = now();
      const windowIndex = Math.floor(current / config.windowMs);
      const redisKey = `contact:${key}:${windowIndex}`;

      const response = await fetchImpl(`${url.replace(/\/$/, '')}/pipeline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([
          ['INCR', redisKey],
          ['EXPIRE', redisKey, String(windowSeconds), 'NX'],
        ]),
      });
      if (!response.ok) throw new Error(`Rate limit store responded ${response.status}`);

      const results = (await response.json()) as Array<{ result?: unknown; error?: string }>;
      const count = Number(results[0]?.result);
      if (!Number.isFinite(count)) throw new Error('Rate limit store returned an invalid count');

      if (count > config.limit) {
        const windowEnd = (windowIndex + 1) * config.windowMs;
        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil((windowEnd - current) / 1000)),
        };
      }
      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}

let memoryLimiter: RateLimiter | undefined;

/** The limiter for the current environment. The in-memory instance is shared across requests. */
export function getContactRateLimiter(env: {
  UPSTASH_REDIS_REST_URL?: string | undefined;
  UPSTASH_REDIS_REST_TOKEN?: string | undefined;
}): RateLimiter {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    return createUpstashRateLimiter({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
      config: CONTACT_RATE_LIMIT,
    });
  }
  memoryLimiter ??= createMemoryRateLimiter(CONTACT_RATE_LIMIT);
  return memoryLimiter;
}
