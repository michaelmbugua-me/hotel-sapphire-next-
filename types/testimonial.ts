export type Testimonial = {
  readonly name: string;
  /** Display line such as "NAIROBI · DELUXE ROOM". */
  readonly location: string;
  readonly text: string;
  /** Whole stars, 1–5. */
  readonly rating: 1 | 2 | 3 | 4 | 5;
};
