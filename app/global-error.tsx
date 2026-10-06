'use client';
// Client component: required by Next. It replaces the root layout, so it brings its own <html>/<body>
// and cannot rely on Tailwind classes from fonts or providers: it uses plain inline styles.

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#060d1f',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '1rem',
        }}
      >
        <main>
          <h1 style={{ fontWeight: 400 }}>Something went wrong</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>
            Hotel Sapphire is having trouble loading. Please try again, or call (+254) 722 206 496.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: '#59a4c3',
              color: '#060d1f',
              border: 0,
              padding: '1rem 2.5rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            TRY AGAIN
          </button>
        </main>
      </body>
    </html>
  );
}
