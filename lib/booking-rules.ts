/**
 * Single source of truth for booking constraints. Enforced in the UI for fast feedback and again on
 * the server (lib/booking.ts) as the authority.
 */

export type Range = { readonly min: number; readonly max: number };

export const BOOKING_RULES = {
  /** The hotel's time zone. "Today" for the not-in-the-past rule is evaluated here, not in the visitor's zone. */
  timeZone: 'Africa/Nairobi',
  /** Maximum length of stay. Check-out must also be strictly after check-in (at least 1 night). */
  maxNights: 30,
  rooms: { min: 1, max: 5 },
  adults: { min: 1, max: 10 },
  children: { min: 0, max: 6 },
} as const satisfies {
  timeZone: string;
  maxNights: number;
  rooms: Range;
  adults: Range;
  children: Range;
};
