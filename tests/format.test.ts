import { describe, expect, it } from 'vitest';
import { formatGuestSummary, formatMoney } from '@/lib/format';

/** Intl inserts a non-breaking space between the symbol and the number; normalise for assertions. */
const normalise = (value: string) => value.replace(/\s/g, ' ');

describe('formatMoney', () => {
  it('formats KES with a currency symbol and thousands separator', () => {
    expect(normalise(formatMoney({ amount: 11900, currency: 'KES' }))).toBe('Ksh 11,900');
  });

  it('omits the currency symbol when showCurrency is false', () => {
    expect(formatMoney({ amount: 19000, currency: 'KES' }, { showCurrency: false })).toBe('19,000');
  });

  it('formats zero and small amounts', () => {
    expect(normalise(formatMoney({ amount: 0, currency: 'KES' }))).toBe('Ksh 0');
    expect(normalise(formatMoney({ amount: 950, currency: 'KES' }))).toBe('Ksh 950');
  });

  it('rounds to whole shillings', () => {
    expect(formatMoney({ amount: 10399.6, currency: 'KES' }, { showCurrency: false })).toBe(
      '10,400',
    );
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1])('throws a RangeError for %s', (amount) => {
    expect(() => formatMoney({ amount, currency: 'KES' })).toThrowError(RangeError);
  });
});

describe('formatGuestSummary', () => {
  it('uses singular and plural forms', () => {
    expect(formatGuestSummary({ rooms: 1, adults: 1, children: 0 })).toBe('1 Room, 1 Guest');
    expect(formatGuestSummary({ rooms: 1, adults: 2, children: 0 })).toBe('1 Room, 2 Guests');
    expect(formatGuestSummary({ rooms: 3, adults: 6, children: 0 })).toBe('3 Rooms, 6 Guests');
  });

  it('breaks out adults and children once there are children', () => {
    expect(formatGuestSummary({ rooms: 1, adults: 2, children: 1 })).toBe(
      '1 Room, 2 Adults, 1 Child',
    );
    expect(formatGuestSummary({ rooms: 2, adults: 1, children: 3 })).toBe(
      '2 Rooms, 1 Adult, 3 Children',
    );
  });
});
