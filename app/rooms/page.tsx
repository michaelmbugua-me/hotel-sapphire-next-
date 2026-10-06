import type { Metadata } from 'next';
import { RoomListItem } from '@/components/rooms/room-list-item';
import { PageHeader } from '@/components/ui/page-header';
import { getDefaultBookingUrl } from '@/lib/booking';
import { getRooms } from '@/lib/data/rooms';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Our Rooms',
  description:
    'Explore the Deluxe, Deluxe Twin and Executive rooms at Hotel Sapphire in Mombasa: en-suite bathrooms, private verandas and modern comforts.',
  path: '/rooms',
  image: '/image/room/one.webp',
});

/** The original's list text is identical for every room. */
const LIST_BLURB =
  'Choose from one of our beautifully designed Superior Rooms and Executive Suites with modern en-suite bathrooms and a private veranda.';

/** The Standard Room has a detail page but, as in the original, is not on the list. */
const UNLISTED = new Set(['standard-room']);

export default async function RoomsPage() {
  const rooms = (await getRooms()).filter((room) => !UNLISTED.has(room.slug));
  const bookingUrl = getDefaultBookingUrl();

  return (
    <div className="min-h-screen bg-luxury-dark pb-24 font-jost">
      <PageHeader title="Our Rooms" subtitle="Explore Our Rooms In Mombasa">
        <div className="mx-auto mb-12 max-w-3xl space-y-2 text-sm font-light text-white/70 md:text-base">
          <p className="font-bold text-white">Check-in at 1400hrs and Check-out at 1000hrs</p>
          <p>Enjoy accommodation by our 160 ensuite guest rooms and suites comprising of:</p>
          <p>
            15 Suites-lounge area in Suites, 30 Standard Twins, 15 Standard Triples, 96 Standard
            Doubles, 4 Paraplegic Rooms
          </p>
          <p>Interconnecting rooms also available</p>
        </div>

        <ul className="mx-auto max-w-6xl space-y-12">
          {rooms.map((room, index) => (
            <RoomListItem
              key={room.slug}
              room={room}
              blurb={LIST_BLURB}
              bookingUrl={bookingUrl}
              priority={index === 0}
            />
          ))}
        </ul>
      </PageHeader>
    </div>
  );
}
