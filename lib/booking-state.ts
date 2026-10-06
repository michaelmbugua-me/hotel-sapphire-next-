import { BOOKING_RULES, type Range } from '@/lib/booking-rules';
import { addDays, nightsBetween, type PlainDate } from '@/lib/dates';
import type { BookingSearch } from '@/lib/schemas/booking';

export type GuestFields = Pick<BookingSearch, 'rooms' | 'adults' | 'children'>;

/** Clamps to the range as a whole number. Non-finite input falls back to the minimum. */
export function clampToRange(value: number, { min, max }: Range): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

/** Clamps only the guest fields present in `patch` to the booking rules. */
export function clampGuests(patch: Partial<GuestFields>): Partial<GuestFields> {
  const result: Partial<GuestFields> = {};
  if (patch.rooms !== undefined) result.rooms = clampToRange(patch.rooms, BOOKING_RULES.rooms);
  if (patch.adults !== undefined) result.adults = clampToRange(patch.adults, BOOKING_RULES.adults);
  if (patch.children !== undefined) {
    result.children = clampToRange(patch.children, BOOKING_RULES.children);
  }
  return result;
}

/**
 * The search after choosing a new check-in. The existing check-out is kept while it is still a
 * valid stay (1 to `maxNights` nights later); otherwise it moves to the next day.
 */
export function applyCheckIn(
  search: Pick<BookingSearch, 'checkOut'>,
  checkIn: PlainDate,
): Pick<BookingSearch, 'checkIn' | 'checkOut'> {
  const nights = nightsBetween(checkIn, search.checkOut);
  const stillValid = nights >= 1 && nights <= BOOKING_RULES.maxNights;
  return { checkIn, checkOut: stillValid ? search.checkOut : addDays(checkIn, 1) };
}

/** The selectable check-out window for a given check-in. */
export function checkOutBounds(checkIn: PlainDate): { min: PlainDate; max: PlainDate } {
  return { min: addDays(checkIn, 1), max: addDays(checkIn, BOOKING_RULES.maxNights) };
}
