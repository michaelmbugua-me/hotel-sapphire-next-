import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ENV = {
  RESEND_API_KEY: 're_test',
  CONTACT_TO_EMAIL: 'inbox@example.com',
  CONTACT_FROM_EMAIL: 'Hotel <no-reply@example.com>',
  TURNSTILE_SECRET_KEY: 'secret',
};

const BODY = {
  name: 'Jane',
  email: 'jane@example.com',
  subject: 'Hi',
  message: 'Hello there',
  website: '',
  turnstileToken: 'tok',
};

function post(body: unknown) {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'x-forwarded-for': '203.0.113.9' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/contact (end to end with mocked network)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    for (const [key, value] of Object.entries(ENV)) vi.stubEnv(key, value);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('verifies with Cloudflare, mails through Resend and returns { success, message }', async () => {
    const calls: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        calls.push(url);
        return url.includes('turnstile')
          ? new Response(JSON.stringify({ success: true }))
          : new Response(JSON.stringify({ id: 'abc' }));
      }),
    );
    const { POST } = await import('@/app/api/contact/route');
    const response = await POST(post(BODY));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ success: true, message: expect.any(String) });
    expect(calls).toEqual([
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      'https://api.resend.com/emails',
    ]);
  });

  it('returns a generic 500 (and logs) when server env is missing, leaking no variable names', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    const { POST } = await import('@/app/api/contact/route');
    const response = await POST(post(BODY));
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).not.toContain('RESEND');
    expect(console.error).toHaveBeenCalled();
  });

  it('rate-limits the sixth message from one IP with a Retry-After header', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.includes('turnstile')
          ? new Response(JSON.stringify({ success: true }))
          : new Response(JSON.stringify({ id: 'abc' })),
      ),
    );
    const { POST } = await import('@/app/api/contact/route');
    for (let i = 0; i < 5; i += 1) expect((await POST(post(BODY))).status).toBe(200);
    const blocked = await POST(post(BODY));
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(0);
  });
});
