export const GALLERY_CATEGORIES = [
  'Hotel',
  'Rooms',
  'Dining',
  'Amenities',
  'Meetings & Events',
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export type GalleryImage = {
  /** Path under /public. */
  readonly src: string;
  readonly alt: string;
  readonly category: GalleryCategory;
};
