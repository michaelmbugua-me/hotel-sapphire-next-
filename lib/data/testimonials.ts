import { testimonialsSchema } from '@/lib/schemas/content';
import type { Testimonial } from '@/types/testimonial';

// Copy carried over verbatim from the Angular home component.
export const TESTIMONIALS: readonly Testimonial[] = testimonialsSchema.parse([
  {
    name: 'Ahmed Al-Rashid',
    location: 'DUBAI · SUITE GUEST',
    text: '"Absolutely phenomenal stay. The suite was breathtaking, the Aura Spa was world-class and the food was outstanding. Hotel Sapphire exceeded every expectation."',
    rating: 5,
  },
  {
    name: 'Sarah Ochieng',
    location: 'NAIROBI · DELUXE ROOM',
    text: '"The perfect urban retreat. Staff were incredibly attentive, the pool area gorgeous and the location in Mombasa is unbeatable. Will return every year without question."',
    rating: 5,
  },
  {
    name: 'James Mwangi',
    location: 'MOMBASA · CORPORATE EVENT',
    text: '"We hosted our conference here — the facilities were top tier, catering excellent and the Onyx Gym was a great bonus. Will definitely use Hotel Sapphire for future events."',
    rating: 5,
  },
]);

/** The avatar is the guest's initial; derived, not stored. */
export function testimonialInitial(testimonial: Testimonial): string {
  return testimonial.name.trim().charAt(0).toUpperCase();
}
