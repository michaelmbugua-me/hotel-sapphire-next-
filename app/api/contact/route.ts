import { NextResponse } from 'next/server';
import { handleContact } from '@/lib/contact/handler';
import { getContactRateLimiter } from '@/lib/contact/rate-limit';
import { sendContactEmail } from '@/lib/contact/send-email';
import { verifyTurnstile } from '@/lib/contact/turnstile';
import { getServerEnv } from '@/lib/env.server';
import type { ContactResponse } from '@/types/contact';

// Sends mail and reads secrets, so it needs the Node runtime and must never be cached.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse<ContactResponse>> {
  let env;
  try {
    env = getServerEnv();
  } catch (error) {
    // Misconfiguration: say so in the log, stay generic to the client.
    console.error('[contact] invalid server environment', error);
    return NextResponse.json(
      { success: false, message: 'Unable to send your message right now. Please try again later.' },
      { status: 500 },
    );
  }

  const result = await handleContact(request, {
    rateLimiter: getContactRateLimiter(env),
    verifyTurnstile: (token, ip) =>
      verifyTurnstile({ token, ip, secret: env.TURNSTILE_SECRET_KEY }),
    sendEmail: (fields) =>
      sendContactEmail({
        apiKey: env.RESEND_API_KEY,
        from: env.CONTACT_FROM_EMAIL,
        to: env.CONTACT_TO_EMAIL,
        fields,
      }),
    log: (message, detail) => console.error(`[contact] ${message}`, detail ?? ''),
  });

  return NextResponse.json(result.body, {
    status: result.status,
    headers: {
      'Cache-Control': 'no-store',
      ...(result.retryAfterSeconds === undefined
        ? {}
        : { 'Retry-After': String(result.retryAfterSeconds) }),
    },
  });
}
