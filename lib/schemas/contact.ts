import { z } from 'zod';

/** Limits shared by the form (maxLength attributes) and the server schema. */
export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  subject: 150,
  message: 5000,
  turnstileToken: 2048,
} as const;

const singleLine = (label: string, max: number) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`)
    // Names and subjects end up in email headers; line breaks there enable header injection.
    .refine((value) => !/[\r\n]/.test(value), `${label} must be a single line`);

/** The fields a visitor fills in. Used by the form for instant feedback and by the server as the authority. */
export const contactFieldsSchema = z.object({
  name: singleLine('Name', CONTACT_LIMITS.name),
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .min(1, 'Email is required')
    .max(CONTACT_LIMITS.email, 'Email is too long')
    .pipe(z.email('Enter a valid email address')),
  subject: singleLine('Subject', CONTACT_LIMITS.subject),
  message: z
    .string({ error: 'Message is required' })
    .trim()
    .min(1, 'Message is required')
    .max(CONTACT_LIMITS.message, `Message must be at most ${CONTACT_LIMITS.message} characters`),
});

/** The full request body of POST /api/contact. */
export const contactPayloadSchema = contactFieldsSchema.extend({
  /** Honeypot: hidden from people, so only bots fill it. Anything non-empty is treated as spam. */
  website: z.string().max(500).optional().default(''),
  /** Cloudflare Turnstile token from the widget. */
  turnstileToken: z
    .string({ error: 'Please complete the verification' })
    .min(1, 'Please complete the verification')
    .max(CONTACT_LIMITS.turnstileToken),
});

export type ContactFields = z.infer<typeof contactFieldsSchema>;
export type ContactPayload = z.infer<typeof contactPayloadSchema>;

export type ContactFieldErrors = Partial<Record<keyof ContactFields | 'turnstileToken', string>>;

/** First message per field, for showing next to inputs. */
export function fieldErrorsFrom(error: z.ZodError): ContactFieldErrors {
  const errors: ContactFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !(key in errors)) {
      errors[key as keyof ContactFieldErrors] = issue.message;
    }
  }
  return errors;
}
