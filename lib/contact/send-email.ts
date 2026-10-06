import { z } from 'zod';
import type { ContactFields } from '@/lib/schemas/contact';

export const RESEND_API_URL = 'https://api.resend.com/emails';

const resendErrorSchema = z.object({ message: z.string().optional() });

/** Escapes text for safe inclusion in HTML. */
export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export type ContactEmail = {
  readonly subject: string;
  readonly text: string;
  readonly html: string;
};

/** Builds the notification email. Visitor-supplied values are escaped in the HTML part. */
export function buildContactEmail({ name, email, subject, message }: ContactFields): ContactEmail {
  const text = `New message from the Hotel Sapphire website\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}\n`;
  const html = `<h2>New message from the Hotel Sapphire website</h2>
<p><strong>Name:</strong> ${escapeHtml(name)}<br>
<strong>Email:</strong> ${escapeHtml(email)}<br>
<strong>Subject:</strong> ${escapeHtml(subject)}</p>
<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`;
  return { subject: `[Website] ${subject}`, text, html };
}

type SendOptions = {
  readonly apiKey: string;
  readonly from: string;
  readonly to: string;
  readonly fields: ContactFields;
  readonly fetchImpl?: typeof fetch;
  readonly timeoutMs?: number;
};

export type SendResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly status: number | null; readonly detail: string };

/**
 * Sends the notification through Resend's REST API (no SDK, so no extra dependency). The visitor's
 * address goes in `reply_to`, so replying from the inbox answers them; the sender stays the
 * verified domain.
 */
export async function sendContactEmail({
  apiKey,
  from,
  to,
  fields,
  fetchImpl = fetch,
  timeoutMs = 10_000,
}: SendOptions): Promise<SendResult> {
  const content = buildContactEmail(fields);
  try {
    const response = await fetchImpl(RESEND_API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: fields.email,
        subject: content.subject,
        text: content.text,
        html: content.html,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (response.ok) return { ok: true };

    const parsed = resendErrorSchema.safeParse(await response.json().catch(() => ({})));
    return {
      ok: false,
      status: response.status,
      detail: (parsed.success && parsed.data.message) || response.statusText,
    };
  } catch (error) {
    return { ok: false, status: null, detail: error instanceof Error ? error.message : 'network' };
  }
}
