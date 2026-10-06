import { describe, expect, it } from 'vitest';
import { MONTH_NAMES, WEEKDAY_LABELS, buildMonthWeeks, dayLabel, monthName } from '@/lib/calendar';
import { addMonths, daysInMonth, isBefore, startOfMonth, weekdayOf } from '@/lib/dates';

describe('date helpers for the calendar', () => {
  it('knows month lengths including leap Februaries', () => {
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(2026, 10)).toBe(31);
    expect(daysInMonth(2026, 11)).toBe(30);
  });

  it('computes the weekday (0 = Sunday)', () => {
    expect(weekdayOf('2026-10-06')).toBe(2); // Tuesday
    expect(weekdayOf('2026-10-04')).toBe(0);
    expect(weekdayOf('2026-10-10')).toBe(6);
  });

  it('compares and truncates dates', () => {
    expect(isBefore('2026-10-05', '2026-10-06')).toBe(true);
    expect(isBefore('2026-10-06', '2026-10-06')).toBe(false);
    expect(startOfMonth('2026-10-27')).toBe('2026-10-01');
  });

  it('adds months across year boundaries in both directions', () => {
    expect(addMonths('2026-12-15', 1)).toBe('2027-01-15');
    expect(addMonths('2026-01-15', -1)).toBe('2025-12-15');
    expect(addMonths('2026-10-06', 12)).toBe('2027-10-06');
    expect(addMonths('2026-10-06', -22)).toBe('2024-12-06');
  });

  it('clamps the day when the target month is shorter', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2028-01-31', 1)).toBe('2028-02-29');
    expect(addMonths('2026-03-31', -1)).toBe('2026-02-28');
  });

  it('rejects fractional months and years out of range', () => {
    expect(() => addMonths('2026-10-06', 0.5)).toThrowError(RangeError);
    expect(() => addMonths('9999-12-01', 1)).toThrowError(RangeError);
  });
});

describe('calendar labels', () => {
  it('has seven weekday headers starting on Sunday and twelve month names', () => {
    expect(WEEKDAY_LABELS).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    expect(MONTH_NAMES).toHaveLength(12);
  });

  it('names months and spells out full days', () => {
    expect(monthName('2026-10-06')).toBe('October');
    expect(dayLabel('2026-10-06')).toBe('Tuesday, 6 October 2026');
    expect(dayLabel('2028-02-29')).toBe('Tuesday, 29 February 2028');
  });
});

describe('buildMonthWeeks', () => {
  it('lays out October 2026 (starts on a Thursday) as five complete rows', () => {
    const weeks = buildMonthWeeks('2026-10-17');
    expect(weeks).toHaveLength(5);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(weeks[0]).toEqual([null, null, null, null, '2026-10-01', '2026-10-02', '2026-10-03']);
    expect(weeks[4]).toEqual([
      '2026-10-25',
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
    ]);
  });

  it('contains every day exactly once, in order, with no extra days', () => {
    const days = buildMonthWeeks('2028-02-01')
      .flat()
      .filter((day) => day !== null);
    expect(days).toHaveLength(29);
    expect(days[0]).toBe('2028-02-01');
    expect(days.at(-1)).toBe('2028-02-29');
  });

  it('needs no leading blanks when the month starts on Sunday', () => {
    // 1 Feb 2026 is a Sunday and the month is exactly four weeks.
    const weeks = buildMonthWeeks('2026-02-10');
    expect(weeks).toHaveLength(4);
    expect(weeks[0]?.[0]).toBe('2026-02-01');
    expect(weeks.flat().every((day) => day !== null)).toBe(true);
  });

  it('can need six rows', () => {
    // 1 Aug 2026 is a Saturday, 31 days: 1 + 30 spills into a sixth row.
    expect(buildMonthWeeks('2026-08-01')).toHaveLength(6);
  });
});
