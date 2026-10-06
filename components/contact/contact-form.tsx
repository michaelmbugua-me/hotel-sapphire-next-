'use client';
// Client component: form state, validation feedback, the Turnstile widget and the fetch to the API.

import { CheckCircle2, CircleAlert, Loader2 } from 'lucide-react';
import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useTurnstile } from '@/lib/hooks/use-turnstile';
import {
  CONTACT_LIMITS,
  contactFieldsSchema,
  fieldErrorsFrom,
  type ContactFieldErrors,
} from '@/lib/schemas/contact';
import { z } from 'zod';

const responseSchema = z.object({ success: z.boolean(), message: z.string() });

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

const FIELD_ORDER = ['name', 'email', 'subject', 'message'] as const;

const FALLBACK_ERROR = 'Unable to send message. Please try again later.';

const INPUT =
  'w-full border border-white/10 bg-white/5 px-2 py-4 text-sm text-white transition-colors focus:border-luxury-gold focus:outline-none disabled:opacity-50 aria-[invalid=true]:border-red-400/60';
const LABEL = 'mb-2 block text-[10px] font-bold tracking-widest text-white/60 uppercase';

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export function ContactForm({ siteKey }: { siteKey: string }) {
  const baseId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const { containerRef, token, status: widgetStatus, reset } = useTurnstile(siteKey);

  const submitting = status.kind === 'submitting';
  const id = (name: string) => `${baseId}-${name}`;
  const fieldProps = (name: keyof ContactFieldErrors) => ({
    id: id(name),
    name,
    disabled: submitting,
    'aria-invalid': errors[name] ? (true as const) : undefined,
    'aria-describedby': errors[name] ? `${id(name)}-error` : undefined,
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const raw = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      subject: String(data.get('subject') ?? ''),
      message: String(data.get('message') ?? ''),
    };

    const checked = contactFieldsSchema.safeParse(raw);
    if (!checked.success) {
      const fieldErrors = fieldErrorsFrom(checked.error);
      setErrors(fieldErrors);
      setStatus({ kind: 'idle' });
      // Focus the first invalid field in form order (the re-render hasn't happened yet, so look it up by id).
      const first = FIELD_ORDER.find((name) => fieldErrors[name]);
      if (first) document.getElementById(id(first))?.focus();
      return;
    }
    if (!token) {
      setErrors({ turnstileToken: 'Please complete the verification below.' });
      return;
    }

    setErrors({});
    setStatus({ kind: 'submitting' });
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...checked.data,
          website: String(data.get('website') ?? ''),
          turnstileToken: token,
        }),
      });
      const body = responseSchema.safeParse(await response.json().catch(() => null));
      if (response.ok && body.success && body.data.success) {
        setStatus({ kind: 'success', message: body.data.message });
        formRef.current?.reset();
      } else {
        setStatus({ kind: 'error', message: body.success ? body.data.message : FALLBACK_ERROR });
      }
    } catch {
      setStatus({ kind: 'error', message: FALLBACK_ERROR });
    } finally {
      // A Turnstile token works once; always get a fresh one.
      reset();
    }
  }

  if (status.kind === 'success') {
    return (
      <div className="text-center">
        <p
          role="status"
          className="mb-8 flex items-center justify-center rounded-sm border border-green-500/20 bg-green-900/20 p-4 text-green-400"
        >
          <CheckCircle2 aria-hidden="true" className="mr-2 h-4 w-4 shrink-0" />
          {status.message}
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: 'idle' })}
          className="text-[10px] font-bold tracking-widest text-luxury-gold uppercase transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-luxury-gold"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={submitting} className="space-y-6">
      {status.kind === 'error' && (
        <p
          role="alert"
          className="flex items-center justify-center rounded-sm border border-red-500/20 bg-red-900/20 p-4 text-center text-red-400"
        >
          <CircleAlert aria-hidden="true" className="mr-2 h-4 w-4 shrink-0" />
          {status.message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field id={id('name')} label="Your Name" error={errors.name}>
          <input
            type="text"
            autoComplete="name"
            maxLength={CONTACT_LIMITS.name}
            required
            className={INPUT}
            {...fieldProps('name')}
          />
        </Field>
        <Field id={id('email')} label="Email Address" error={errors.email}>
          <input
            type="email"
            autoComplete="email"
            maxLength={CONTACT_LIMITS.email}
            required
            className={INPUT}
            {...fieldProps('email')}
          />
        </Field>
      </div>
      <Field id={id('subject')} label="Subject" error={errors.subject}>
        <input
          type="text"
          maxLength={CONTACT_LIMITS.subject}
          required
          className={INPUT}
          {...fieldProps('subject')}
        />
      </Field>
      <Field id={id('message')} label="Your Message" error={errors.message}>
        <textarea
          rows={5}
          maxLength={CONTACT_LIMITS.message}
          required
          className={INPUT}
          {...fieldProps('message')}
        />
      </Field>

      {/* Honeypot: invisible and unreachable for people; bots fill every field they find. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Leave this field empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div>
        <div ref={containerRef} />
        {widgetStatus === 'failed' && (
          <p role="alert" className="mt-2 text-xs text-red-400">
            The verification could not load. Disable any content blocker for this page and reload,
            or contact us directly.
          </p>
        )}
        {errors.turnstileToken && (
          <p role="alert" className="mt-2 text-xs text-red-400">
            {errors.turnstileToken}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center bg-luxury-gold px-8 py-5 text-xs font-bold tracking-[0.2em] text-luxury-dark uppercase transition-all hover:bg-gold-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxury-gold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? (
          <span className="flex items-center">
            <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </span>
        ) : (
          'Send Message'
        )}
      </button>
    </form>
  );
}
