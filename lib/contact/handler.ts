import type { RateLimiter } from '@/lib/contact/rate-limit';
import type { SendResult } from '@/lib/contact/send-email';
import type { TurnstileResult } from '@/lib/contact/turnstile';
import { contactPayloadSchema, type ContactFields } from '@/lib/schemas/contact';
import type { ContactResponse } from '@/types/contact';

/** Request bodies larger than this are rejected before parsing (the message cap is 5,000 chars). */
export const MAX_BODY_BYTES = 16 * 1024;

export const MESSAGES = {
  sent: 'Thank you! Your message has been sent.',
  invalid: 'Please check the form and try again.',
  tooLarge: 'That message is too large.',
  badRequest: 'The request could not be read.',
  verification: 'We could not verify you are human. Please try again.',
  rateLimited: 'Too many messages. Please wait a few minutes and try again.',
  failure: 'Unable to send your message right now. Please try again later or contact us directly.',
} as const;

export type ContactDeps = {
  readonly rateLimiter: RateLimiter;
  readonly verifyTurnstile: (token: string, ip: string | undefined) => Promise<TurnstileResult>;
  readonly sendEmail: (fields: ContactFields) => Promise<SendResult>;
  readonly log?: (message: string, detail?: unknown) => void;
};

export type ContactResult = {
  readonly status: 200 | 400 | 413 | 429 | 500;
  readonly body: ContactResponse;
  readonly retryAfterSeconds?: number;
};

const respond = (
  status: ContactResult['status'],
  success: boolean,
  message: string,
  retryAfterSeconds?: number,
): ContactResult => ({
  status,
  body: { success, message },
  ...(retryAfterSeconds === undefined ? {} : { retryAfterSeconds }),
});

/** The caller's IP from the proxy header (first hop), or `undefined` when there is none. */
export function clientIp(headers: Headers): string | undefined {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || headers.get('x-real-ip')?.trim() || undefined;
}

/**
 * The contact pipeline, in order: rate limit → read body → validate → honeypot → Turnstile → send.
 * Cheap checks come first. Errors are generic to the client; detail goes to the server log.
 */
export async function handleContact(request: Request, deps: ContactDeps): Promise<ContactResult> {
  const log = deps.log ?? (() => undefined);
  const ip = clientIp(request.headers);

  try {
    // Visitors with no detectable IP share one bucket, so they can't bypass the limit.
    const limit = await deps.rateLimiter.check(ip ?? 'unknown');
    if (!limit.allowed) {
      return respond(429, false, MESSAGES.rateLimited, limit.retryAfterSeconds);
    }
  } catch (error) {
    // Fail open on a limiter outage: Turnstile and the honeypot still stand in front of the mailbox.
    log('rate limiter unavailable', error);
  }

  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return respond(413, false, MESSAGES.tooLarge);
  }
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return respond(413, false, MESSAGES.tooLarge);
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return respond(400, false, MESSAGES.badRequest);
  }

  const parsed = contactPayloadSchema.safeParse(json);
  if (!parsed.success) return respond(400, false, MESSAGES.invalid);
  const { website, turnstileToken, ...fields } = parsed.data;

  // A filled honeypot is a bot. Answer "sent" so it learns nothing, and send nothing.
  if (website.trim() !== '') {
    log('honeypot tripped', { ip });
    return respond(200, true, MESSAGES.sent);
  }

  const human = await deps.verifyTurnstile(turnstileToken, ip);
  if (!human.ok) {
    log('turnstile failed', human);
    // A Cloudflare outage is our problem, not the visitor's mistake.
    return human.reason === 'unavailable'
      ? respond(500, false, MESSAGES.failure)
      : respond(400, false, MESSAGES.verification);
  }

  const sent = await deps.sendEmail(fields);
  if (!sent.ok) {
    log('email send failed', sent);
    return respond(500, false, MESSAGES.failure);
  }
  return respond(200, true, MESSAGES.sent);
}
