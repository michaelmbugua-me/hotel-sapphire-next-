export type Currency = 'KES';

/** Prices are stored as numbers and formatted only at the display edge (see lib/format.ts). */
export type Money = {
  readonly amount: number;
  readonly currency: Currency;
};
