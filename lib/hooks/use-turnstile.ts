'use client';
// Client-only: loads Cloudflare's script and renders the widget into a DOM node.

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const SCRIPT_ID = 'cf-turnstile-script';

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: 'light' | 'dark' | 'auto';
      callback: (token: string) => void;
      'expired-callback': () => void;
      'error-callback': () => void;
    },
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileState = {
  /** Attach to the empty element the widget should render into. */
  containerRef: RefObject<HTMLDivElement | null>;
  /** The current single-use token, or `null` until the visitor passes the check. */
  token: string | null;
  /** `failed` when the script could not load or the widget errored (e.g. blocked by an extension). */
  status: 'loading' | 'ready' | 'failed';
  /** Discards the used token and shows a fresh challenge. Call after every submit attempt. */
  reset: () => void;
};

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    const script = existing ?? document.createElement('script');
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('Turnstile failed to load')), {
      once: true,
    });
    if (!existing) {
      script.id = SCRIPT_ID;
      (script as HTMLScriptElement).src = SCRIPT_SRC;
      (script as HTMLScriptElement).async = true;
      document.head.appendChild(script);
    }
  });
}

export function useTurnstile(siteKey: string): TurnstileState {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<TurnstileState['status']>('loading');

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    loadScript()
      .then(() => {
        if (cancelled || !window.turnstile) return;
        widgetId.current = window.turnstile.render(container, {
          sitekey: siteKey,
          theme: 'dark',
          callback: (value) => setToken(value),
          'expired-callback': () => setToken(null),
          'error-callback': () => {
            setToken(null);
            setStatus('failed');
          },
        });
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('failed');
      });

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey]);

  const reset = useCallback(() => {
    setToken(null);
    if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
  }, []);

  return { containerRef, token, status, reset };
}
