import { parsePlainDate } from '@/lib/dates';
import type { Money } from '@/types/money';

const LOCALE = 'en-KE';

const withCurrency = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0,
});

const plain = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });

export type FormatMoneyOptions = {
  /** Include the currency symbol (default true). Use false where the currency is shown separately. */
  readonly showCurrency?: boolean;
};

/**
 * Formats a price for display, e.g. `{ amount: 11900, currency: 'KES' }` → "Ksh 11,900".
 * Whole shillings only: hotel rates here are never fractional.
 */
export function formatMoney(
  money: Money,
  { showCurrency = true }: FormatMoneyOptions = {},
): string {
  if (!Number.isFinite(money.amount) || money.amount < 0) {
    throw new RangeError(`Invalid money amount: ${money.amount}`);
  }
  return (showCurrency ? withCurrency : plain).format(money.amount);
}

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

/**
 * Summary shown on the guests control: "1 Room, 2 Guests", or with children
 * "2 Rooms, 3 Adults, 1 Child".
 */
export function formatGuestSummary({
  rooms,
  adults,
  children,
}: {
  rooms: number;
  adults: number;
  children: number;
}): string {
  const guests =
    children === 0
      ? plural(adults, 'Guest', 'Guests')
      : `${plural(adults, 'Adult', 'Adults')}, ${plural(children, 'Child', 'Children')}`;
  return `${plural(rooms, 'Room', 'Rooms')}, ${guests}`;
}

/** "2026-10-06" → "10/06/2026", the order the original booking fields displayed. */
export function formatDisplayDate(date: string): string {
  const { year, month, day } = parsePlainDate(date);
  return `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year}`;
}
