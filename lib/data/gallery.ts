import { galleryImagesSchema } from '@/lib/schemas/content';
import { GALLERY_CATEGORIES, type GalleryCategory, type GalleryImage } from '@/types/gallery';

export type GalleryFilter = 'All' | GalleryCategory;

/** Filter tabs in display order. */
export const GALLERY_FILTERS: readonly GalleryFilter[] = ['All', ...GALLERY_CATEGORIES];

export const GALLERY_IMAGES: readonly GalleryImage[] = galleryImagesSchema.parse([
  { src: '/image/gallery/one.webp', alt: 'Pool', category: 'Amenities' },
  { src: '/image/gallery/two.webp', alt: 'Restaurant', category: 'Dining' },
  { src: '/image/gallery/three.webp', alt: 'Reception', category: 'Hotel' },
  { src: '/image/gallery/four.webp', alt: 'Gym', category: 'Amenities' },
  { src: '/image/gallery/five.webp', alt: 'Lounge', category: 'Hotel' },
  { src: '/image/gallery/six.webp', alt: 'Bedroom', category: 'Rooms' },
  { src: '/image/gallery/seven.webp', alt: 'Spa', category: 'Amenities' },
  { src: '/image/gallery/eight.webp', alt: 'Suite', category: 'Rooms' },
  { src: '/image/gallery/nine.webp', alt: 'Conference Hall', category: 'Meetings & Events' },
  { src: '/image/gallery/ten.webp', alt: 'Seating Area', category: 'Hotel' },
  { src: '/image/gallery/eleven.webp', alt: 'Banquet Hall', category: 'Meetings & Events' },
  { src: '/image/gallery/twelve.webp', alt: 'Deluxe Room', category: 'Rooms' },
  { src: '/image/gallery/thirteen.webp', alt: 'Meeting Room', category: 'Meetings & Events' },
  { src: '/image/gallery/fourteen.webp', alt: 'Fine Dining', category: 'Dining' },
  { src: '/image/gallery/fifteen.webp', alt: 'Lobby', category: 'Hotel' },
  { src: '/image/gallery/sixteen.webp', alt: 'Garden Terrace', category: 'Amenities' },
  { src: '/image/gallery/seventeen.webp', alt: 'Executive Suite', category: 'Rooms' },
]);

/** Pure filter used by the gallery UI. 'All' returns every image in the original order. */
export function filterGalleryImages(
  images: readonly GalleryImage[],
  filter: GalleryFilter,
): readonly GalleryImage[] {
  return filter === 'All' ? images : images.filter((image) => image.category === filter);
}
