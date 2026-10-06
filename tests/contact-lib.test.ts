import { describe, expect, it, vi } from 'vitest';
import {
  CONTACT_RATE_LIMIT,
  createMemoryRateLimiter,
  createUpstashRateLimiter,
  getContactRateLimiter,
} from '@/lib/contact/rate-limit';
import { buildContactEmail, escapeHtml, sendContactEmail } from '@/lib/contact/send-email';
import { TURNSTILE_VERIFY_URL, verifyTurnstile } from '@/lib/contact/turnstile';
import {
  CONTACT_LIMITS,
  contactFieldsSchema,
  contactPayloadSchema,
  fieldErrorsFrom,
} from '@/lib/schemas/contact';

const VALID = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  subject: 'Booking question',
  message: 'Do you have availability?',
};

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), { status: 200, ...init });

describe('contact schema', () => {
  it('accepts a valid message and trims whitespace', () => {
    const parsed = contactFieldsSchema.parse({ ...VALID, name: '  Jane  ' });
    expect(parsed.name).toBe('Jane');
  });

  it('requires every field, with a message per field', () => {
    const result = contactFieldsSchema.safeParse({ name: '', email: '', subject: '', message: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Object.keys(fieldErrorsFrom(result.error)).sort()).toEqual([
        'email',
        'message',
        'name',
        'subject',
      ]);
    }
  });

  it('rejects an invalid email and over-long values', () => {
    expect(contactFieldsSchema.safeParse({ ...VALID, email: 'not-an-email' }).success).toBe(false);
    expect(
      contactFieldsSchema.safeParse({ ...VALID, message: 'x'.repeat(CONTACT_LIMITS.message + 1) })
        .success,
    ).toBe(false);
  });

  it('rejects line breaks in single-line fields (email header injection)', () => {
    expect(
      contactFieldsSchema.safeParse({ ...VALID, subject: 'Hi\r\nBcc: victim@example.com' }).success,
    ).toBe(false);
    expect(contactFieldsSchema.safeParse({ ...VALID, name: 'A\nB' }).success).toBe(false);
  });

  it('keeps line breaks in the message body', () => {
    expect(contactFieldsSchema.parse({ ...VALID, message: 'a\nb' }).message).toBe('a\nb');
  });

  it('payload needs a Turnstile token and defaults the honeypot to empty', () => {
    expect(contactPayloadSchema.safeParse(VALID).success).toBe(false);
    const ok = contactPayloadSchema.parse({ ...VALID, turnstileToken: 'tok' });
    expect(ok.website).toBe('');
  });

  it('does not let non-string input through', () => {
    expect(
      contactPayloadSchema.safeParse({ ...VALID, name: 42, turnstileToken: 't' }).success,
    ).toBe(false);
  });
});

describe('memory rate limiter', () => {
  const config = { limit: 2, windowMs: 1000 };

  it('allows up to the limit then blocks with a retry time', async () => {
    const time = 0;
    const limiter = createMemoryRateLimiter(config, () => time);
    expect((await limiter.check('a')).allowed).toBe(true);
    expect((await limiter.check('a')).allowed).toBe(true);
    const blocked = await limiter.check('a');
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(1);
  });

  it('tracks keys independently and recovers after the window', async () => {
    let time = 0;
    const limiter = createMemoryRateLimiter(config, () => time);
    await limiter.check('a');
    await limiter.check('a');
    expect((await limiter.check('b')).allowed).toBe(true);
    time = 1001;
    expect((await limiter.check('a')).allowed).toBe(true);
  });

  it('uses the in-memory limiter when Upstash is not configured, and Upstash when it is', () => {
    expect(getContactRateLimiter({})).toBe(getContactRateLimiter({}));
    const remote = getContactRateLimiter({
      UPSTASH_REDIS_REST_URL: 'https://x.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 't',
    });
    expect(remote).not.toBe(getContactRateLimiter({}));
    expect(CONTACT_RATE_LIMIT.limit).toBe(5);
  });
});

describe('upstash rate limiter', () => {
  const make = (count: number | 'bad', ok = true) => {
    const fetchImpl = vi.fn(async () =>
      ok ? json([{ result: count }, { result: 1 }]) : new Response('no', { status: 500 }),
    );
    const limiter = createUpstashRateLimiter({
      url: 'https://x.upstash.io/',
      token: 'secret',
      config: { limit: 3, windowMs: 60_000 },
      fetchImpl: fetchImpl as unknown as typeof fetch,
      now: () => 30_000,
    });
    return { fetchImpl, limiter };
  };

  it('allows while the counter is at or under the limit', async () => {
    const { limiter, fetchImpl } = make(3);
    expect((await limiter.check('1.2.3.4')).allowed).toBe(true);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://x.upstash.io/pipeline');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer secret');
  });

  it('blocks over the limit and reports the time left in the window', async () => {
    const { limiter } = make(4);
    const result = await limiter.check('1.2.3.4');
    expect(result).toEqual({ allowed: false, retryAfterSeconds: 30 });
  });

  it('throws on a store failure or garbage so the caller can decide', async () => {
    await expect(make(1, false).limiter.check('x')).rejects.toThrow(/500/);
    await expect(make('bad').limiter.check('x')).rejects.toThrow(/invalid count/);
  });
});

describe('verifyTurnstile', () => {
  it('passes when Cloudflare says success, sending secret, token and ip', async () => {
    const fetchImpl = vi.fn(async () => json({ success: true }));
    const result = await verifyTurnstile({
      token: 'tok',
      secret: 'sec',
      ip: '9.9.9.9',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(result).toEqual({ ok: true });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(TURNSTILE_VERIFY_URL);
    const body = init.body as URLSearchParams;
    expect(body.get('secret')).toBe('sec');
    expect(body.get('response')).toBe('tok');
    expect(body.get('remoteip')).toBe('9.9.9.9');
  });

  it('is rejected, with codes, when Cloudflare says no', async () => {
    const result = await verifyTurnstile({
      token: 't',
      secret: 's',
      fetchImpl: (async () =>
        json({ success: false, 'error-codes': ['invalid-input-response'] })) as typeof fetch,
    });
    expect(result).toEqual({ ok: false, reason: 'rejected', codes: ['invalid-input-response'] });
  });

  it('fails closed on network errors, HTTP errors and malformed replies', async () => {
    const network = await verifyTurnstile({
      token: 't',
      secret: 's',
      fetchImpl: (async () => {
        throw new Error('down');
      }) as typeof fetch,
    });
    expect(network).toMatchObject({ ok: false, reason: 'unavailable' });

    const http = await verifyTurnstile({
      token: 't',
      secret: 's',
      fetchImpl: (async () => new Response('x', { status: 503 })) as typeof fetch,
    });
    expect(http).toMatchObject({ ok: false, reason: 'unavailable' });

    const garbage = await verifyTurnstile({
      token: 't',
      secret: 's',
      fetchImpl: (async () => json({ nope: 1 })) as typeof fetch,
    });
    expect(garbage).toMatchObject({ ok: false, reason: 'unavailable' });
  });
});

describe('contact email', () => {
  it('escapes HTML in every visitor-supplied value', () => {
    expect(escapeHtml(`<script>"a" & 'b'</script>`)).toBe(
      '&lt;script&gt;&quot;a&quot; &amp; &#39;b&#39;&lt;/script&gt;',
    );
    const email = buildContactEmail({
      name: '<b>x</b>',
      email: 'a@b.co',
      subject: '<i>s</i>',
      message: '<img src=x onerror=alert(1)>',
    });
    expect(email.html).not.toContain('<b>x</b>');
    expect(email.html).not.toContain('<img');
    expect(email.html).toContain('&lt;img');
    expect(email.subject).toBe('[Website] <i>s</i>');
  });

  it('posts to Resend with the key, sender, recipient and reply-to', async () => {
    const fetchImpl = vi.fn(async () => json({ id: '1' }));
    const result = await sendContactEmail({
      apiKey: 're_key',
      from: 'Hotel <no-reply@x.co>',
      to: 'inbox@x.co',
      fields: VALID,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(result).toEqual({ ok: true });
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer re_key');
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({
      from: 'Hotel <no-reply@x.co>',
      to: ['inbox@x.co'],
      reply_to: 'jane@example.com',
    });
  });

  it('reports Resend errors and network failures without throwing', async () => {
    const rejected = await sendContactEmail({
      apiKey: 'k',
      from: 'f',
      to: 't@x.co',
      fields: VALID,
      fetchImpl: (async () =>
        json({ message: 'domain not verified' }, { status: 403 })) as typeof fetch,
    });
    expect(rejected).toEqual({ ok: false, status: 403, detail: 'domain not verified' });

    const down = await sendContactEmail({
      apiKey: 'k',
      from: 'f',
      to: 't@x.co',
      fields: VALID,
      fetchImpl: (async () => {
        throw new Error('ECONNRESET');
      }) as typeof fetch,
    });
    expect(down).toEqual({ ok: false, status: null, detail: 'ECONNRESET' });
  });
});
