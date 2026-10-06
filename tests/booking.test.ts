import { describe, expect, it } from 'vitest';
import {
  bookingIdsFromEnv,
  buildBookingUrl,
  defaultBookingSearch,
  defaultBookingUrl,
  resolveBookingUrl,
  validateBookingSearch,
  type BookingIds,
  type BookingSearch,
} from '@/lib/booking';
import { parsePublicEnv } from '@/lib/env';

const TODAY = '2026-10-06';
const IDS: BookingIds = { hotelId: '26609', styleId: '20249', dcId: '1161' };
const valid: BookingSearch = {
  checkIn: '2026-10-06',
  checkOut: '2026-10-08',
  rooms: 1,
  adults: 2,
  children: 0,
};

function errorsFor(input: unknown) {
  const result = validateBookingSearch(input, TODAY);
  if (result.ok) throw new Error('expected validation to fail');
  return result.errors;
}

describe('defaultBookingSearch', () => {
  it('is one night from the given date for 1 room, 2 adults, 0 children', () => {
    expect(defaultBookingSearch('2026-12-31')).toEqual({
      checkIn: '2026-12-31',
      checkOut: '2027-01-01',
      rooms: 1,
      adults: 2,
      children: 0,
    });
  });

  it('passes its own validation on the day it was built for', () => {
    expect(validateBookingSearch(defaultBookingSearch(TODAY), TODAY).ok).toBe(true);
  });
});

describe('validateBookingSearch', () => {
  it('accepts a valid search, including check-in today', () => {
    expect(validateBookingSearch(valid, TODAY)).toEqual({ ok: true, value: valid });
  });

  it('accepts exactly the maximum stay and the maximum guest counts', () => {
    const max = { ...valid, checkOut: '2026-11-05', rooms: 5, adults: 10, children: 6 };
    expect(validateBookingSearch(max, TODAY).ok).toBe(true);
  });

  it('rejects check-in in the past but allows yesterday relative to a different "today"', () => {
    expect(errorsFor({ ...valid, checkIn: '2026-10-05', checkOut: '2026-10-06' }).checkIn).toBe(
      'Check-in cannot be in the past.',
    );
    expect(
      validateBookingSearch(
        { ...valid, checkIn: '2026-10-05', checkOut: '2026-10-06' },
        '2026-10-05',
      ).ok,
    ).toBe(true);
  });

  it('rejects check-out on or before check-in', () => {
    expect(errorsFor({ ...valid, checkOut: '2026-10-06' }).checkOut).toBe(
      'Check-out must be after check-in.',
    );
    expect(errorsFor({ ...valid, checkOut: '2026-10-05' }).checkOut).toBe(
      'Check-out must be after check-in.',
    );
  });

  it('rejects stays longer than 30 nights', () => {
    expect(errorsFor({ ...valid, checkOut: '2026-11-06' }).checkOut).toBe(
      'Maximum stay is 30 nights.',
    );
  });

  it.each([
    ['rooms', 0, 'Rooms must be between 1 and 5.'],
    ['rooms', 6, 'Rooms must be between 1 and 5.'],
    ['adults', 0, 'Adults must be between 1 and 10.'],
    ['adults', 11, 'Adults must be between 1 and 10.'],
    ['children', -1, 'Children must be between 0 and 6.'],
    ['children', 7, 'Children must be between 0 and 6.'],
    ['adults', 2.5, 'Adults must be between 1 and 10.'],
  ] as const)('rejects %s = %s', (field, value, message) => {
    expect(errorsFor({ ...valid, [field]: value })[field]).toBe(message);
  });

  it('rejects malformed dates without throwing', () => {
    const errors = errorsFor({ ...valid, checkIn: '2026-02-30', checkOut: 'tomorrow' });
    expect(errors.checkIn).toBe('Enter a valid check-in date.');
    expect(errors.checkOut).toBe('Enter a valid check-out date.');
  });

  it('rejects wrong types and non-objects without throwing', () => {
    expect(errorsFor({ ...valid, rooms: '1' }).rooms).toBeDefined();
    expect(validateBookingSearch(null, TODAY).ok).toBe(false);
    expect(validateBookingSearch(undefined, TODAY).ok).toBe(false);
  });

  it('reports errors on several fields at once', () => {
    const errors = errorsFor({ ...valid, rooms: 9, adults: 0 });
    expect(Object.keys(errors).sort()).toEqual(['adults', 'rooms']);
  });
});

describe('buildBookingUrl', () => {
  it('matches the Angular URL format exactly (names, order, unpadded day and month)', () => {
    expect(buildBookingUrl(valid, IDS)).toBe(
      'https://book.travelbookgroup.com/premium/index2.html?tot_camere=1&tot_adulti=2&tot_bambini=0&gg=6&mm=10&aa=2026&ggf=8&mmf=10&aaf=2026&id_stile=20249&lingua_int=eng&sconto=&id_albergo=26609&dc=1161',
    );
  });

  it('handles a stay that crosses a year boundary', () => {
    const url = new URL(
      buildBookingUrl({ ...valid, checkIn: '2026-12-30', checkOut: '2027-01-02' }, IDS),
    );
    expect(url.searchParams.get('mm')).toBe('12');
    expect(url.searchParams.get('aa')).toBe('2026');
    expect(url.searchParams.get('ggf')).toBe('2');
    expect(url.searchParams.get('mmf')).toBe('1');
    expect(url.searchParams.get('aaf')).toBe('2027');
  });
});

describe('resolveBookingUrl', () => {
  it('returns a URL for a valid search', () => {
    const result = resolveBookingUrl(valid, IDS, TODAY);
    expect(result.ok && result.url.startsWith('https://book.travelbookgroup.com/')).toBe(true);
  });

  it('refuses to build a URL for an invalid search and returns the errors instead', () => {
    const result = resolveBookingUrl({ ...valid, rooms: 99 }, IDS, TODAY);
    expect(result).toEqual({ ok: false, errors: { rooms: 'Rooms must be between 1 and 5.' } });
  });
});

describe('bookingIdsFromEnv', () => {
  it('maps the validated public env to booking ids', () => {
    const env = parsePublicEnv({
      NEXT_PUBLIC_SITE_URL: 'https://example.com',
      NEXT_PUBLIC_BOOKING_HOTEL_ID: '1',
      NEXT_PUBLIC_BOOKING_STYLE_ID: '2',
      NEXT_PUBLIC_BOOKING_DC_ID: '3',
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'k',
    });
    expect(bookingIdsFromEnv(env)).toEqual({ hotelId: '1', styleId: '2', dcId: '3' });
  });
});

describe('defaultBookingUrl', () => {
  it('builds the link for one night starting today in hotel time', () => {
    const url = new URL(defaultBookingUrl(IDS, '2026-12-31'));
    expect(url.searchParams.get('gg')).toBe('31');
    expect(url.searchParams.get('mm')).toBe('12');
    expect(url.searchParams.get('aa')).toBe('2026');
    expect(url.searchParams.get('ggf')).toBe('1');
    expect(url.searchParams.get('mmf')).toBe('1');
    expect(url.searchParams.get('aaf')).toBe('2027');
    expect(url.searchParams.get('tot_adulti')).toBe('2');
  });

  it('is a valid search per the rules', () => {
    expect(resolveBookingUrl(defaultBookingSearch(TODAY), IDS, TODAY).ok).toBe(true);
  });
});
