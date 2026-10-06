import { featuredFacilitiesSchema } from '@/lib/schemas/content';
import type { FeaturedFacility } from '@/types/facility';

export const FEATURED_FACILITIES: readonly FeaturedFacility[] = featuredFacilitiesSchema.parse([
  { name: 'Swimming Pool', icon: 'pool', image: '/image/home/home_hero.webp', href: '/amenities' },
  {
    name: 'Aura Wellness Spa',
    icon: 'spa',
    image: '/image/home/wellness_spa.webp',
    href: '/amenities',
  },
  { name: 'Onyx Fitness Gym', icon: 'gym', image: '/image/gallery/four.webp', href: '/amenities' },
  { name: 'Fine Dining', icon: 'dining', image: '/image/home/home_four.webp', href: '/dining' },
  {
    name: 'Events & Conferencing',
    icon: 'events',
    image: '/image/gallery/nine.webp',
    href: '/events',
  },
]);
