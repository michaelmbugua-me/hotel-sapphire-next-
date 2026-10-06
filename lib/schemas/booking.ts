import { z } from 'zod';
import { BOOKING_RULES, type Range } from '@/lib/booking-rules';
import { isPlainDate, nightsBetween, type PlainDate } from '@/lib/dates';

function guestCount(label: string, { min, max }: Range) {
  const message = `${label} must be between ${min} and ${max}.`;
  return z.number({ error: message }).int(message).min(min, message).max(max, message);
}

function plainDate(message: string) {
  return z.string({ error: message }).refine(isPlainDate, { error: message });
}

/**
 * Builds the schema for a booking search. `today` is injected (the hotel's current date) so the
 * "not in the past" rule is deterministic and testable.
 */
export function createBookingSearchSchema(today: PlainDate) {
  return z
    .object({
      checkIn: plainDate('Enter a valid check-in date.'),
      checkOut: plainDate('Enter a valid check-out date.'),
      rooms: guestCount('Rooms', BOOKING_RULES.rooms),
      adults: guestCount('Adults', BOOKING_RULES.adults),
      children: guestCount('Children', BOOKING_RULES.children),
    })
    .superRefine((search, ctx) => {
      if (isPlainDate(search.checkIn) && nightsBetween(today, search.checkIn) < 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['checkIn'],
          message: 'Check-in cannot be in the past.',
        });
      }
      if (!isPlainDate(search.checkIn) || !isPlainDate(search.checkOut)) return;
      const nights = nightsBetween(search.checkIn, search.checkOut);
      if (nights < 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['checkOut'],
          message: 'Check-out must be after check-in.',
        });
      } else if (nights > BOOKING_RULES.maxNights) {
        ctx.addIssue({
          code: 'custom',
          path: ['checkOut'],
          message: `Maximum stay is ${BOOKING_RULES.maxNights} nights.`,
        });
      }
    });
}

export type BookingSearch = z.infer<ReturnType<typeof createBookingSearchSchema>>;
