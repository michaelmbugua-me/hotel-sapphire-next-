import { describe, expect, it } from 'vitest';
import { parsePublicEnv } from '@/lib/env';
import { parseServerEnv } from '@/lib/env.server';

const validPublic = {
  NEXT_PUBLIC_SITE_URL: 'https://example.com',
  NEXT_PUBLIC_BOOKING_HOTEL_ID: '26609',
  NEXT_PUBLIC_BOOKING_STYLE_ID: '20249',
  NEXT_PUBLIC_BOOKING_DC_ID: '1161',
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'site-key',
};

const validServer = {
  RESEND_API_KEY: 're_123',
  CONTACT_TO_EMAIL: 'inbox@example.com',
  CONTACT_FROM_EMAIL: 'Hotel Sapphire <no-reply@example.com>',
  TURNSTILE_SECRET_KEY: 'secret',
};

describe('parsePublicEnv', () => {
  it('accepts a complete, valid environment', () => {
    expect(parsePublicEnv(validPublic).NEXT_PUBLIC_BOOKING_HOTEL_ID).toBe('26609');
  });

  it('rejects a non-numeric booking id and an invalid URL, naming both fields', () => {
    expect(() =>
      parsePublicEnv({
        ...validPublic,
        NEXT_PUBLIC_BOOKING_HOTEL_ID: 'abc',
        NEXT_PUBLIC_SITE_URL: 'not-a-url',
      }),
    ).toThrowError(
      /NEXT_PUBLIC_BOOKING_HOTEL_ID[\s\S]*NEXT_PUBLIC_SITE_URL|NEXT_PUBLIC_SITE_URL[\s\S]*NEXT_PUBLIC_BOOKING_HOTEL_ID/,
    );
  });

  it('rejects missing variables', () => {
    expect(() => parsePublicEnv({})).toThrowError(/Invalid public environment variables/);
  });
});

describe('parseServerEnv', () => {
  it('accepts a valid environment with optional Upstash vars omitted', () => {
    const env = parseServerEnv(validServer);
    expect(env.UPSTASH_REDIS_REST_URL).toBeUndefined();
  });

  it('treats empty strings as unset', () => {
    const env = parseServerEnv({
      ...validServer,
      UPSTASH_REDIS_REST_URL: '',
      UPSTASH_REDIS_REST_TOKEN: '',
    });
    expect(env.UPSTASH_REDIS_REST_TOKEN).toBeUndefined();
  });

  it('requires the Upstash URL and token to be set together', () => {
    expect(() =>
      parseServerEnv({ ...validServer, UPSTASH_REDIS_REST_URL: 'https://redis.example.com' }),
    ).toThrowError(/must be set together/);
  });

  it('rejects an invalid destination email', () => {
    expect(() => parseServerEnv({ ...validServer, CONTACT_TO_EMAIL: 'nope' })).toThrowError(
      /CONTACT_TO_EMAIL/,
    );
  });
});
