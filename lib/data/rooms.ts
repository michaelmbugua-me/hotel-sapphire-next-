import { roomsSchema } from '@/lib/schemas/room';
import type { Facility, Room } from '@/types/room';

const facility = (icon: string, label: string): Facility => ({
  iconSrc: `/image/facilities/${icon}.svg`,
  label,
});

const BED = (label: string) => facility('bed', label);
const SHOWER = facility('shower', 'Rain shower');
const WINDOW = facility('window', 'Double-glazed windows');
const SAFE = facility('safe', 'In-room safe');
const CURTAIN = facility('curtain', 'Blackout curtains');
const HAIR_DRYER = facility('hair-dryer', 'Hair dryer');
const TV = facility('tv', '43" flat screen TV');
const AC = facility('ac', 'Independent Air conditioning');
const DESK = facility('desk', 'Work desk, comfortable chair');
const PLUG = facility('plug', 'International/USB plugs');
const SERVICE = facility('service', 'Unparalleled service');
const COFFEE = facility('coffee', 'Complimentary tea, coffee & water');

/** Facilities shared by every room above the standard category. */
const PREMIUM_FACILITIES = [
  SHOWER,
  WINDOW,
  SAFE,
  CURTAIN,
  HAIR_DRYER,
  TV,
  AC,
  DESK,
  PLUG,
  SERVICE,
  COFFEE,
];

// Copy and prices are carried over verbatim from the Angular room-detail component.
const ROOMS: readonly Room[] = roomsSchema.parse([
  {
    slug: 'deluxe-room',
    name: 'Deluxe Room',
    description:
      'Superior living is guaranteed as you take advantage of The set apart resting lounge with seats. Ergonomic Desk for work. Separate room with a shower, bathtub and washroom.',
    price: { amount: 11_900, currency: 'KES' },
    image: '/image/room/one.webp',
    facilities: [BED('King-size bed or Twin beds'), ...PREMIUM_FACILITIES],
  },
  {
    slug: 'standard-room',
    name: 'Standard Room',
    description:
      'Perfect for business or leisure travellers — comfortable, well-appointed accommodation with all essential amenities included.',
    price: { amount: 10_400, currency: 'KES' },
    // TODO: reuses the Deluxe Room photo; replace with a dedicated Standard Room image.
    image: '/image/room/one.webp',
    facilities: [BED('Queen-size bed'), SHOWER, WINDOW, SAFE, TV, AC, DESK, COFFEE],
  },
  {
    slug: 'deluxe-twin-room',
    name: 'Deluxe Twin Room',
    description:
      'Choose from one of our beautifully designed Superior Rooms and Executive Suites with modern en-suite bathrooms and a private veranda.',
    price: { amount: 11_900, currency: 'KES' },
    image: '/image/room/two.webp',
    facilities: [BED('Twin beds'), ...PREMIUM_FACILITIES],
  },
  {
    slug: 'executive-room',
    name: 'Executive Room',
    description:
      'Choose from one of our beautifully designed Superior Rooms and Executive Suites with modern en-suite bathrooms and a private veranda.',
    price: { amount: 19_000, currency: 'KES' },
    image: '/image/room/three.webp',
    facilities: [BED('King-size bed'), ...PREMIUM_FACILITIES],
  },
]);

/**
 * Async on purpose: swapping the static data for a CMS or database later is then a change inside
 * this module only, with no call-site changes.
 */
export async function getRooms(): Promise<readonly Room[]> {
  return ROOMS;
}

/** Returns `undefined` for an unknown slug; callers should respond with `notFound()`. */
export async function getRoom(slug: string): Promise<Room | undefined> {
  return ROOMS.find((room) => room.slug === slug);
}
