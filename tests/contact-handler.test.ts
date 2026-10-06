import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MAX_BODY_BYTES,
  MESSAGES,
  clientIp,
  handleContact,
  type ContactDeps,
} from '@/lib/contact/handler';

const VALID = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  subject: 'Hello',
  message: 'Is there a room free?',
  website: '',
  turnstileToken: 'tok',
};

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '1.2.3.4, 10.0.0.1',
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

let deps: ContactDeps;
let sendEmail: ReturnType<typeof vi.fn>;
let verify: ReturnType<typeof vi.fn>;
let check: ReturnType<typeof vi.fn>;

beforeEach(() => {
  sendEmail = vi.fn(async () => ({ ok: true }));
  verify = vi.fn(async () => ({ ok: true }));
  check = vi.fn(async () => ({ allowed: true, retryAfterSeconds: 0 }));
  deps = {
    rateLimiter: { check } as unknown as ContactDeps['rateLimiter'],
    verifyTurnstile: verify as unknown as ContactDeps['verifyTurnstile'],
    sendEmail: sendEmail as unknown as ContactDeps['sendEmail'],
    log: vi.fn(),
  };
});

describe('handleContact', () => {
  it('sends a valid message: 200 with the { success, message } shape', async () => {
    const result = await handleContact(request(VALID), deps);
    expect(result).toEqual({ status: 200, body: { success: true, message: MESSAGES.sent } });
    expect(check).toHaveBeenCalledWith('1.2.3.4');
    expect(verify).toHaveBeenCalledWith('tok', '1.2.3.4');
    expect(sendEmail).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'Hello',
      message: 'Is there a room free?',
    });
  });

  it('429s with Retry-After when rate limited, before reading anything else', async () => {
    check.mockResolvedValue({ allowed: false, retryAfterSeconds: 42 });
    const result = await handleContact(request(VALID), deps);
    expect(result).toMatchObject({ status: 429, retryAfterSeconds: 42, body: { success: false } });
    expect(verify).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('keeps going if the limiter itself is down (fail open), and logs it', async () => {
    check.mockRejectedValue(new Error('redis down'));
    const result = await handleContact(request(VALID), deps);
    expect(result.status).toBe(200);
    expect(deps.log).toHaveBeenCalledWith('rate limiter unavailable', expect.any(Error));
  });

  it('400s on invalid fields without calling Turnstile or the mailer', async () => {
    const result = await handleContact(request({ ...VALID, email: 'nope' }), deps);
    expect(result).toEqual({ status: 400, body: { success: false, message: MESSAGES.invalid } });
    expect(verify).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('400s on malformed JSON and on a non-object body', async () => {
    expect((await handleContact(request('{not json'), deps)).status).toBe(400);
    expect((await handleContact(request('"just a string"'), deps)).status).toBe(400);
    expect((await handleContact(request('null'), deps)).status).toBe(400);
  });

  it('413s oversized bodies, by declared length and by actual size', async () => {
    const declared = await handleContact(
      request(VALID, { 'content-length': String(MAX_BODY_BYTES + 1) }),
      deps,
    );
    expect(declared.status).toBe(413);
    const actual = await handleContact(request('x'.repeat(MAX_BODY_BYTES + 1)), deps);
    expect(actual.status).toBe(413);
  });

  it('answers a tripped honeypot with a fake success and sends nothing', async () => {
    const result = await handleContact(request({ ...VALID, website: 'http://spam.example' }), deps);
    expect(result).toEqual({ status: 200, body: { success: true, message: MESSAGES.sent } });
    expect(verify).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('400s when Turnstile rejects the token, and never sends', async () => {
    verify.mockResolvedValue({ ok: false, reason: 'rejected', codes: ['invalid-input-response'] });
    const result = await handleContact(request(VALID), deps);
    expect(result).toEqual({
      status: 400,
      body: { success: false, message: MESSAGES.verification },
    });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('500s (fails closed) when Turnstile itself is unavailable', async () => {
    verify.mockResolvedValue({ ok: false, reason: 'unavailable', codes: ['network'] });
    const result = await handleContact(request(VALID), deps);
    expect(result.status).toBe(500);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('500s with a generic message when the email provider fails, logging the detail server-side', async () => {
    sendEmail.mockResolvedValue({ ok: false, status: 403, detail: 'domain not verified' });
    const result = await handleContact(request(VALID), deps);
    expect(result).toEqual({ status: 500, body: { success: false, message: MESSAGES.failure } });
    expect(JSON.stringify(result)).not.toContain('domain not verified');
    expect(deps.log).toHaveBeenCalledWith(
      'email send failed',
      expect.objectContaining({ status: 403 }),
    );
  });

  it('puts visitors with no IP in one shared bucket', async () => {
    const bare = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify(VALID),
    });
    await handleContact(bare, deps);
    expect(check).toHaveBeenCalledWith('unknown');
    expect(verify).toHaveBeenCalledWith('tok', undefined);
  });
});

describe('clientIp', () => {
  it('takes the first hop of x-forwarded-for, else x-real-ip, else undefined', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': ' 8.8.8.8 , 1.1.1.1' }))).toBe('8.8.8.8');
    expect(clientIp(new Headers({ 'x-real-ip': '7.7.7.7' }))).toBe('7.7.7.7');
    expect(clientIp(new Headers())).toBeUndefined();
  });
});
