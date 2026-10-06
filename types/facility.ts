/** Keys for the icon shown on a featured-facility card; mapped to actual icons in the UI layer. */
export type FeaturedFacilityIcon = 'pool' | 'spa' | 'gym' | 'dining' | 'events';

/** A hotel-wide facility highlighted on the home page (not to be confused with in-room `Facility`). */
export type FeaturedFacility = {
  readonly name: string;
  readonly icon: FeaturedFacilityIcon;
  /** Path under /public. */
  readonly image: string;
  /** Internal route the card links to. */
  readonly href: string;
};
