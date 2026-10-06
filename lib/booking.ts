import { addDays, parsePlainDate, todayInZone, type PlainDate } from '@/lib/dates';
import { getPublicEnv, type PublicEnv } from '@/lib/env';
import { createBookingSearchSchema, type BookingSearch } from '@/lib/schemas/booking';

export type { BookingSearch } from '@/lib/schemas/booking';

/** TravelBook booking-engine entry point (same target the Angular app links to). */
export const BOOKING_ENGINE_URL = 'https://book.travelbookgroup.com/premium/index2.html';

/** The booking engine's interface language. English only; no i18n framework by design. */
export const BOOKING_LANGUAGE = 'eng';

export type BookingIds = {
  readonly hotelId: string;
  readonly styleId: string;
  readonly dcId: string;
};

export type BookingErrors = Partial<Record<keyof BookingSearch, string>>;

export type BookingValidation =
  | { readonly ok: true; readonly value: BookingSearch }
  | { readonly ok: false; readonly errors: BookingErrors };

export type BookingUrlResult =
  | { readonly ok: true; readonly url: string }
  | { readonly ok: false; readonly errors: BookingErrors };

export function bookingIdsFromEnv(env: PublicEnv): BookingIds {
  return {
    hotelId: env.NEXT_PUBLIC_BOOKING_HOTEL_ID,
    styleId: env.NEXT_PUBLIC_BOOKING_STYLE_ID,
    dcId: env.NEXT_PUBLIC_BOOKING_DC_ID,
  };
}

export function getBookingIds(): BookingIds {
  return bookingIdsFromEnv(getPublicEnv());
}

/** One night starting today (hotel time): 1 room, 2 adults, 0 children. Matches the Angular defaults. */
export function defaultBookingSearch(today: PlainDate = todayInZone()): BookingSearch {
  return { checkIn: today, checkOut: addDays(today, 1), rooms: 1, adults: 2, children: 0 };
}

/**
 * The booking link for the default search (today, one night). Rendered on the server so every
 * "Book Now" works without JavaScript; the client replaces it once the visitor picks dates.
 */
export function defaultBookingUrl(ids: BookingIds, today: PlainDate = todayInZone()): string {
  const result = resolveBookingUrl(defaultBookingSearch(today), ids, today);
  if (!result.ok) {
    // The default search is built from the rules themselves, so this is a programming error.
    throw new Error(`Default booking search failed validation: ${JSON.stringify(result.errors)}`);
  }
  return result.url;
}

/** The server-rendered default "Book Now" link for pages: today (hotel time), one night, from env ids. */
export function getDefaultBookingUrl(): string {
  return defaultBookingUrl(getBookingIds());
}

/**
 * Validates a search against the booking rules. Returns the first message per field.
 * Authoritative: call this on the server and in the UI with the same `today`.
 */
export function validateBookingSearch(
  input: unknown,
  today: PlainDate = todayInZone(),
): BookingValidation {
  const result = createBookingSearchSchema(today).safeParse(input);
  if (result.success) return { ok: true, value: result.data };

  const errors: BookingErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !(field in errors)) {
      errors[field as keyof BookingSearch] = issue.message;
    }
  }
  return { ok: false, errors };
}

/**
 * Pure URL formatter. Parameter names, order and unpadded day/month values match the Angular
 * `BookingService` exactly. Does not validate; use `resolveBookingUrl` for that.
 */
export function buildBookingUrl(search: BookingSearch, ids: BookingIds): string {
  const checkIn = parsePlainDate(search.checkIn);
  const checkOut = parsePlainDate(search.checkOut);

  const params = new URLSearchParams({
    tot_camere: String(search.rooms),
    tot_adulti: String(search.adults),
    tot_bambini: String(search.children),
    gg: String(checkIn.day),
    mm: String(checkIn.month),
    aa: String(checkIn.year),
    ggf: String(checkOut.day),
    mmf: String(checkOut.month),
    aaf: String(checkOut.year),
    id_stile: ids.styleId,
    lingua_int: BOOKING_LANGUAGE,
    sconto: '',
    id_albergo: ids.hotelId,
    dc: ids.dcId,
  });

  return `${BOOKING_ENGINE_URL}?${params.toString()}`;
}

/** Validates, then builds. The entry point for both server rendering and client updates. */
export function resolveBookingUrl(
  input: unknown,
  ids: BookingIds,
  today: PlainDate = todayInZone(),
): BookingUrlResult {
  const validation = validateBookingSearch(input, today);
  if (!validation.ok) return validation;
  return { ok: true, url: buildBookingUrl(validation.value, ids) };
}
