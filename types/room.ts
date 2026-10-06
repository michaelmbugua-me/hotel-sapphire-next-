import type { Money } from './money';

export type Facility = {
  /** Path under /public, e.g. "/image/facilities/bed.svg". */
  readonly iconSrc: string;
  readonly label: string;
};

export type Room = {
  /** URL segment: /rooms/[slug]. */
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  /** Nightly rate. */
  readonly price: Money;
  /** Path under /public. */
  readonly image: string;
  readonly facilities: readonly Facility[];
};
