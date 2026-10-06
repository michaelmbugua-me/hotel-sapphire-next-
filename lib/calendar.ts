import { daysInMonth, parsePlainDate, startOfMonth, weekdayOf, type PlainDate } from '@/lib/dates';

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** "October" for any date in October. */
export function monthName(value: PlainDate): string {
  return MONTH_NAMES[parsePlainDate(value).month - 1] ?? '';
}

/** Full spoken label for a day button, e.g. "Tuesday, 6 October 2026". */
export function dayLabel(value: PlainDate): string {
  const { year, month, day } = parsePlainDate(value);
  return `${WEEKDAY_NAMES[weekdayOf(value)]}, ${day} ${MONTH_NAMES[month - 1]} ${year}`;
}

/**
 * The month containing `value` as rows of seven (Sunday first). Days outside the month are `null`
 * (leading and trailing blanks), so every row is complete.
 */
export function buildMonthWeeks(value: PlainDate): (PlainDate | null)[][] {
  const first = startOfMonth(value);
  const { year, month } = parsePlainDate(first);
  const lead = weekdayOf(first);
  const total = daysInMonth(year, month);

  const cells: (PlainDate | null)[] = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= total; day += 1) {
    cells.push(`${first.slice(0, 8)}${String(day).padStart(2, '0')}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (PlainDate | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
