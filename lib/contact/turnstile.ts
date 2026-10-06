import { z } from 'zod';

export const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const verifyResponseSchema = z.object({
  success: z.boolean(),
  'error-codes': z.array(z.string()).optional(),
});

export type TurnstileResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: 'rejected' | 'unavailable'; readonly codes: string[] };

type VerifyOptions = {
  readonly token: string;
  readonly secret: string;
  /** The visitor's IP; Cloudflare uses it as an extra signal. Omit when unknown. */
  readonly ip?: string | undefined;
  readonly fetchImpl?: typeof fetch;
  readonly timeoutMs?: number;
};

/**
 * Verifies a Turnstile token server-side. Fails closed: a network error, timeout or malformed reply
 * is `unavailable`, never a pass.
 */
export async function verifyTurnstile({
  token,
  secret,
  ip,
  fetchImpl = fetch,
  timeoutMs = 5000,
}: VerifyOptions): Promise<TurnstileResult> {
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);

  try {
    const response = await fetchImpl(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok)
      return { ok: false, reason: 'unavailable', codes: [`http-${response.status}`] };

    const parsed = verifyResponseSchema.safeParse(await response.json());
    if (!parsed.success) return { ok: false, reason: 'unavailable', codes: ['bad-response'] };
    if (parsed.data.success) return { ok: true };
    return { ok: false, reason: 'rejected', codes: parsed.data['error-codes'] ?? [] };
  } catch {
    return { ok: false, reason: 'unavailable', codes: ['network'] };
  }
}
