import type { BookingErrors as Errors } from '@/lib/booking';

/** Lists why the current search is invalid. Announced to assistive tech when it appears. */
export function BookingErrors({ errors }: { errors: Errors }) {
  const messages = Object.values(errors);
  if (messages.length === 0) return null;
  return (
    <ul role="alert" className="space-y-1 text-xs text-red-300">
      {messages.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  );
}
