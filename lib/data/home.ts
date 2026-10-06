/** Home-page-only content, carried over verbatim from the Angular home component. */

export type HeroStat = { readonly value: string; readonly label: string; readonly star?: true };

export const HERO_STATS: readonly HeroStat[] = [
  { value: '4.9', label: 'Guest Rating', star: true },
  { value: '500+', label: 'Happy Guests' },
  { value: '15+', label: 'Years of Luxury' },
];

export const HERO_HIGHLIGHTS = [
  'Onyx Fitness Gym',
  'Aura Wellness Spa',
  'Pool',
  'Indian & International Dining',
] as const;

export type StoryFeature = {
  /** Decorative emoji. */
  readonly emoji: string;
  readonly title: string;
  readonly text: string;
};

export const STORY_FEATURES: readonly StoryFeature[] = [
  {
    emoji: '💎',
    title: 'Premium Accommodation',
    text: 'Elegantly furnished rooms with modern amenities',
  },
  {
    emoji: '🧘',
    title: 'Aura Wellness Spa',
    text: 'Expert therapists — massages, facials & body treatments',
  },
  {
    emoji: '🍽️',
    title: 'Indian & International Dining',
    text: 'Signature dishes crafted by master chefs',
  },
];

export type RoomPreview = {
  /** Slug of the room in `lib/data/rooms.ts`; the price and link come from there. */
  readonly slug: string;
  /** Name shown on the home card. The Angular home calls the executive room "Suite Room". */
  readonly title: string;
  readonly description: string;
  readonly image: string;
  readonly features: readonly string[];
  readonly badge?: { readonly label: string; readonly tone: 'gold' | 'blue' };
};

export const ROOM_PREVIEWS: readonly RoomPreview[] = [
  {
    slug: 'deluxe-room',
    title: 'Deluxe Room',
    description:
      'Spacious and elegantly furnished with stunning city views, premium comfort and every modern amenity for an exceptional stay.',
    image: '/image/home/home_one.webp',
    features: ['King Bed', 'City View', 'Free WiFi', 'Mini Bar', 'Smart TV'],
    badge: { label: 'MOST POPULAR', tone: 'gold' },
  },
  {
    slug: 'executive-room',
    title: 'Suite Room',
    description:
      'Our signature suites redefine luxury — separate living area, premium furnishings and exclusive butler service for the ultimate indulgence.',
    image: '/image/home/home_two.webp',
    features: ['King Bed', 'Living Room', 'Jacuzzi', 'Butler', 'Balcony'],
    badge: { label: 'LUXURY SUITE', tone: 'blue' },
  },
  {
    slug: 'standard-room',
    title: 'Standard Room',
    description:
      'Perfect for business or leisure travellers — comfortable, well-appointed accommodation with all essential amenities included.',
    image: '/image/home/home_one.webp',
    features: ['Queen Bed', 'Free WiFi', 'Work Desk', 'Smart TV', 'AC'],
  },
];

export type JourneyTile = {
  readonly src: string;
  readonly alt: string;
  /** Tailwind grid-span classes at `md` and up. */
  readonly span: string;
};

export const VISUAL_JOURNEY: readonly JourneyTile[] = [
  {
    src: '/image/home/home_hero.webp',
    alt: 'Hotel Sapphire swimming pool',
    span: 'md:col-span-1 md:row-span-2',
  },
  { src: '/image/gallery/three.webp', alt: 'Hotel Sapphire gallery photo', span: 'md:col-span-1' },
  {
    src: '/image/gallery/ten.webp',
    alt: 'Hotel Sapphire gallery photo, wide view',
    span: 'md:col-span-2',
  },
  { src: '/image/home/home_five.webp', alt: 'Hotel Sapphire interior', span: 'md:col-span-1' },
  {
    src: '/image/home/home_four.webp',
    alt: 'Hotel Sapphire dining',
    span: 'md:col-span-2',
  },
];
