import { BOOKING_RULES } from './booking-rules';

/**
 * Calendar dates are plain "YYYY-MM-DD" strings, never `Date` objects, so values can't shift across
 * time zones. Arithmetic is done in UTC, which has no daily offset or DST.
 */
export type PlainDate = string;

export type DateParts = { readonly year: number; readonly month: number; readonly day: number };

const PLAIN_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;

function partsOf(value: string): DateParts | null {
  const match = PLAIN_DATE.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  // Round-trip through Date.UTC to reject impossible dates such as 2026-02-30.
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

export function isPlainDate(value: string): value is PlainDate {
  return partsOf(value) !== null;
}

/** @throws RangeError if `value` is not a real calendar date in "YYYY-MM-DD" form. */
export function parsePlainDate(value: string): DateParts {
  const parts = partsOf(value);
  if (!parts) throw new RangeError(`Invalid plain date: "${value}"`);
  return parts;
}

function toUtcMs(value: PlainDate): number {
  const { year, month, day } = parsePlainDate(value);
  return Date.UTC(year, month - 1, day);
}

/** @throws RangeError if `value` is invalid. */
export function addDays(value: PlainDate, days: number): PlainDate {
  if (!Number.isInteger(days)) throw new RangeError(`days must be an integer, got ${days}`);
  return new Date(toUtcMs(value) + days * MS_PER_DAY).toISOString().slice(0, 10);
}

/** Whole nights from `checkIn` to `checkOut`. Negative when `checkOut` is earlier. */
export function nightsBetween(checkIn: PlainDate, checkOut: PlainDate): number {
  return Math.round((toUtcMs(checkOut) - toUtcMs(checkIn)) / MS_PER_DAY);
}

const pad = (value: number, length: number) => String(value).padStart(length, '0');

function format(year: number, month: number, day: number): PlainDate {
  if (year < 1 || year > 9999) throw new RangeError(`Year out of range: ${year}`);
  return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
}

/** Number of days in a month (`month` is 1–12). */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Day of the week, 0 = Sunday. */
export function weekdayOf(value: PlainDate): number {
  return new Date(toUtcMs(value)).getUTCDay();
}

export function isBefore(a: PlainDate, b: PlainDate): boolean {
  return toUtcMs(a) < toUtcMs(b);
}

/** The first day of the month containing `value`. */
export function startOfMonth(value: PlainDate): PlainDate {
  const { year, month } = parsePlainDate(value);
  return format(year, month, 1);
}

/** Moves by whole months, clamping the day (e.g. Jan 31 + 1 month = Feb 28/29). */
export function addMonths(value: PlainDate, months: number): PlainDate {
  if (!Number.isInteger(months)) throw new RangeError(`months must be an integer, got ${months}`);
  const { year, month, day } = parsePlainDate(value);
  const total = year * 12 + (month - 1) + months;
  const newYear = Math.floor(total / 12);
  const newMonth = (total % 12) + 1;
  return format(newYear, newMonth, Math.min(day, daysInMonth(newYear, newMonth)));
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

/**
 * The current calendar date in the given time zone (the hotel's by default).
 * @throws RangeError if `timeZone` is not a valid IANA zone.
 */
export function todayInZone(
  now: Date = new Date(),
  timeZone: string = BOOKING_RULES.timeZone,
): PlainDate {
  const parts = formatterFor(timeZone).formatToParts(now);
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value;
  const year = pick('year');
  const month = pick('month');
  const day = pick('day');
  if (!year || !month || !day) throw new RangeError(`Could not resolve date in zone "${timeZone}"`);
  return `${year.padStart(4, '0')}-${month}-${day}`;
}

/** The current calendar year in the hotel's time zone (for the copyright line). */
export function currentYear(
  now: Date = new Date(),
  timeZone: string = BOOKING_RULES.timeZone,
): number {
  return Number(todayInZone(now, timeZone).slice(0, 4));
}
