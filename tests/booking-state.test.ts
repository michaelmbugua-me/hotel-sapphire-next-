import { describe, expect, it } from 'vitest';
import { applyCheckIn, checkOutBounds, clampGuests, clampToRange } from '@/lib/booking-state';

describe('clampToRange', () => {
  const range = { min: 1, max: 5 };

  it('keeps in-range values and clamps the rest', () => {
    expect(clampToRange(3, range)).toBe(3);
    expect(clampToRange(0, range)).toBe(1);
    expect(clampToRange(99, range)).toBe(5);
    expect(clampToRange(-4, range)).toBe(1);
  });

  it('truncates fractions and treats non-finite input as the minimum', () => {
    expect(clampToRange(2.9, range)).toBe(2);
    expect(clampToRange(Number.NaN, range)).toBe(1);
    expect(clampToRange(Number.POSITIVE_INFINITY, range)).toBe(1);
  });
});

describe('clampGuests', () => {
  it('clamps each field to its own rule (rooms 1–5, adults 1–10, children 0–6)', () => {
    expect(clampGuests({ rooms: 9, adults: 0, children: 9 })).toEqual({
      rooms: 5,
      adults: 1,
      children: 6,
    });
    expect(clampGuests({ children: -2 })).toEqual({ children: 0 });
  });

  it('returns only the fields that were provided', () => {
    expect(clampGuests({ adults: 4 })).toEqual({ adults: 4 });
    expect(clampGuests({})).toEqual({});
  });
});

describe('applyCheckIn', () => {
  it('keeps the existing check-out while it is still a valid stay', () => {
    expect(applyCheckIn({ checkOut: '2026-10-15' }, '2026-10-10')).toEqual({
      checkIn: '2026-10-10',
      checkOut: '2026-10-15',
    });
  });

  it('moves check-out to the next day when the new check-in is on or after it', () => {
    expect(applyCheckIn({ checkOut: '2026-10-15' }, '2026-10-15')).toEqual({
      checkIn: '2026-10-15',
      checkOut: '2026-10-16',
    });
    expect(applyCheckIn({ checkOut: '2026-10-15' }, '2026-10-20')).toEqual({
      checkIn: '2026-10-20',
      checkOut: '2026-10-21',
    });
  });

  it('moves check-out when the stay would exceed the maximum, but not at exactly the maximum', () => {
    // 2026-10-06 + 30 nights = 2026-11-05 (allowed); 31 nights is not.
    expect(applyCheckIn({ checkOut: '2026-11-05' }, '2026-10-06').checkOut).toBe('2026-11-05');
    expect(applyCheckIn({ checkOut: '2026-11-05' }, '2026-10-05').checkOut).toBe('2026-10-06');
  });

  it('rolls over month and year boundaries', () => {
    expect(applyCheckIn({ checkOut: '2026-12-01' }, '2026-12-31')).toEqual({
      checkIn: '2026-12-31',
      checkOut: '2027-01-01',
    });
  });
});

describe('checkOutBounds', () => {
  it('allows 1 to 30 nights after check-in', () => {
    expect(checkOutBounds('2026-10-06')).toEqual({ min: '2026-10-07', max: '2026-11-05' });
  });
});
