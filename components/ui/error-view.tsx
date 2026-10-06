'use client';
// Client component: Next error boundaries must be Client Components and receive a `reset` callback.

import Link from 'next/link';
import { useEffect } from 'react';
import { PRIMARY_ACTION, SECONDARY_ACTION, StatusPage } from '@/components/ui/status-page';
import { CONTACT } from '@/lib/site';

type ErrorViewProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** The body of every `error.tsx`: a friendly message, a retry, and a way out. */
export function ErrorView({ error, reset }: ErrorViewProps) {
  useEffect(() => {
    // Surface it for monitoring. The message is never shown to the visitor.
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      eyebrow="Something went wrong"
      title="We hit a snag"
      actions={
        <>
          <button type="button" onClick={reset} className={PRIMARY_ACTION}>
            Try again
          </button>
          <Link href="/" className={SECONDARY_ACTION}>
            Back to home
          </Link>
        </>
      }
    >
      <p>
        Something unexpected happened on our side. Please try again, or reach us directly on{' '}
        <a href={CONTACT.phone.tel} className="text-luxury-gold hover:text-white">
          {CONTACT.phone.display}
        </a>
        .
      </p>
      {error.digest && <p className="mt-4 text-xs text-white/60">Reference: {error.digest}</p>}
    </StatusPage>
  );
}
