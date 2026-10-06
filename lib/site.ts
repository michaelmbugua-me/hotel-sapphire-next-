/** Site-wide constants: identity, navigation, contact details and social links. */

export const SITE = {
  name: 'Hotel Sapphire',
  tagline: 'Urban Retreat In Mombasa City',
  description:
    'Urban retreat in Mombasa city. Luxury rooms, Onyx Fitness Gym, Aura Wellness Spa, Pool, fine dining and premier events.',
  locale: 'en_KE',
} as const;

export type NavLink = {
  readonly label: string;
  /** Longer label used by the secondary header and the mobile menu where the original spells it out. */
  readonly fullLabel?: string;
  readonly href: string;
};

/** Primary navigation, in display order. */
export const NAV_LINKS: readonly NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Rooms', href: '/rooms' },
  { label: 'Dining', href: '/dining' },
  { label: 'Events', fullLabel: 'Meetings & Events', href: '/events' },
  { label: 'Amenities', href: '/amenities' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
];

const PHONE_E164 = '+254722206496';

const phone = (display: string, e164: string) => ({ display, tel: `tel:${e164}` }) as const;

export const CONTACT = {
  address: 'Mombasa Town, Kenya',
  phone: phone('(+254) 722 206 496', PHONE_E164),
  /** A second number, shown only on the home page's contact card (confirmed intentional). */
  secondaryPhone: phone('(+254) 722 306 496', '+254722306496'),
  email: {
    address: 'reservations@hotelsapphire.co.ke',
    mailto: 'mailto:reservations@hotelsapphire.co.ke',
  },
  website: { display: 'www.hotelsapphire.co.ke', url: 'https://www.hotelsapphire.co.ke' },
  /** WhatsApp click-to-chat uses the number without the leading "+". */
  whatsappUrl: `https://wa.me/${PHONE_E164.slice(1)}`,
  /** Footer lines, verbatim. NB: the Rooms page says check-out is 10:00; see the open question on policy times. */
  frontDesk: ['24/7 Front Desk', 'Check-in: 2:00 PM', 'Check-out: 11:00 AM'],
} as const;

/** "Explore" column of the footer. The original's "About Us" pointed at a route that doesn't exist and is omitted. */
export const FOOTER_EXPLORE_LINKS: readonly NavLink[] = [
  { label: 'Rooms & Suites', href: '/rooms' },
  { label: 'Facilities', href: '/amenities' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Reservations', href: '/contact' },
];

export type SocialId = 'facebook' | 'instagram' | 'tiktok' | 'x';
export type SocialLink = { readonly id: SocialId; readonly label: string; readonly href: string };

export const SOCIAL_LINKS: readonly SocialLink[] = [
  { id: 'facebook', label: 'Facebook', href: 'https://web.facebook.com/HotelSapphireMombasa/' },
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/hotel_sapphire_/' },
  { id: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@hotelsapphire_msa' },
  { id: 'x', label: 'X', href: 'https://x.com/SapphireHotel_' },
];
