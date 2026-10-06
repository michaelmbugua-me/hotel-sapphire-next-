import { describe, expect, it } from 'vitest';
import { BOOKING_RULES } from '@/lib/booking-rules';
import {
  addDays,
  currentYear,
  isPlainDate,
  nightsBetween,
  parsePlainDate,
  todayInZone,
} from '@/lib/dates';

describe('BOOKING_RULES', () => {
  it('has internally consistent ranges', () => {
    for (const range of [BOOKING_RULES.rooms, BOOKING_RULES.adults, BOOKING_RULES.children]) {
      expect(range.min).toBeLessThanOrEqual(range.max);
    }
    expect(BOOKING_RULES.maxNights).toBeGreaterThanOrEqual(1);
  });
});

describe('isPlainDate / parsePlainDate', () => {
  it('accepts real dates including a leap day', () => {
    expect(isPlainDate('2026-10-06')).toBe(true);
    expect(isPlainDate('2028-02-29')).toBe(true);
  });

  it.each(['2026-02-29', '2026-02-30', '2026-13-01', '2026-00-10', '2026-1-1', '', 'abc'])(
    'rejects %j',
    (value) => {
      expect(isPlainDate(value)).toBe(false);
      expect(() => parsePlainDate(value)).toThrowError(RangeError);
    },
  );

  it('returns numeric parts', () => {
    expect(parsePlainDate('2026-10-06')).toEqual({ year: 2026, month: 10, day: 6 });
  });
});

describe('addDays', () => {
  it('rolls over months, years and leap days', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
  });

  it('supports zero and negative offsets', () => {
    expect(addDays('2026-10-06', 0)).toBe('2026-10-06');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('rejects fractional offsets and invalid dates', () => {
    expect(() => addDays('2026-10-06', 1.5)).toThrowError(RangeError);
    expect(() => addDays('2026-02-30', 1)).toThrowError(RangeError);
  });
});

describe('nightsBetween', () => {
  it('counts nights across months and leap days', () => {
    expect(nightsBetween('2026-10-06', '2026-10-07')).toBe(1);
    expect(nightsBetween('2026-10-30', '2026-11-02')).toBe(3);
    expect(nightsBetween('2028-02-28', '2028-03-01')).toBe(2);
    expect(nightsBetween('2026-02-28', '2026-03-01')).toBe(1);
  });

  it('is zero for the same day and negative when reversed', () => {
    expect(nightsBetween('2026-10-06', '2026-10-06')).toBe(0);
    expect(nightsBetween('2026-10-08', '2026-10-06')).toBe(-2);
  });
});

describe('todayInZone', () => {
  it('uses the hotel time zone (UTC+3) by default, flipping the date at local midnight', () => {
    expect(todayInZone(new Date('2026-10-06T20:59:59Z'))).toBe('2026-10-06');
    expect(todayInZone(new Date('2026-10-06T21:00:00Z'))).toBe('2026-10-07');
  });

  it('handles a year boundary', () => {
    expect(todayInZone(new Date('2026-12-31T22:00:00Z'))).toBe('2027-01-01');
  });

  it('respects an explicit zone', () => {
    expect(todayInZone(new Date('2026-10-06T21:30:00Z'), 'America/Los_Angeles')).toBe('2026-10-06');
  });

  it('throws a RangeError for an invalid zone', () => {
    expect(() => todayInZone(new Date(), 'Not/AZone')).toThrowError(RangeError);
  });
});

describe('currentYear', () => {
  it('uses the hotel time zone, so the year flips at Nairobi midnight', () => {
    expect(currentYear(new Date('2026-12-31T20:59:59Z'))).toBe(2026);
    expect(currentYear(new Date('2026-12-31T21:00:00Z'))).toBe(2027);
  });
});
