import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookNowLink } from '@/components/booking/book-now-link';
import { getDefaultBookingUrl } from '@/lib/booking';
import { getRoom, getRooms } from '@/lib/data/rooms';
import { formatMoney } from '@/lib/format';
import { buildPageMetadata } from '@/lib/seo';

type RoomPageProps = { params: Promise<{ slug: string }> };

// Unknown slugs are a real 404 (the Angular app silently showed the Deluxe Room instead).
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getRooms()).map((room) => ({ slug: room.slug }));
}

export async function generateMetadata({ params }: RoomPageProps): Promise<Metadata> {
  const { slug } = await params;
  const room = await getRoom(slug);
  if (!room) return {};
  return buildPageMetadata({
    title: room.name,
    description: room.description,
    path: `/rooms/${room.slug}`,
    image: room.image,
  });
}

const NAV_ITEM =
  'flex items-center transition-colors hover:text-luxury-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-luxury-gold';

export default async function RoomPage({ params }: RoomPageProps) {
  const { slug } = await params;
  const [room, rooms] = await Promise.all([getRoom(slug), getRooms()]);
  if (!room) notFound();

  const index = rooms.findIndex((candidate) => candidate.slug === room.slug);
  // The original's Previous/Next did nothing; here they step through the rooms, wrapping around.
  const previous = rooms[(index - 1 + rooms.length) % rooms.length]!;
  const next = rooms[(index + 1) % rooms.length]!;
  const bookingUrl = getDefaultBookingUrl();

  return (
    <div className="min-h-screen bg-luxury-dark pb-24 font-jost">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav
          aria-label="Room navigation"
          className="flex items-center justify-between border border-white/10 bg-luxury-book px-6 py-4 text-[10px] font-bold tracking-widest text-white/60 uppercase"
        >
          <Link href="/rooms" className={NAV_ITEM}>
            <ChevronLeft aria-hidden="true" className="mr-2 h-3 w-3" /> BACK TO THE LIST
          </Link>
          <div className="flex items-center space-x-8">
            <Link href={`/rooms/${previous.slug}`} className={NAV_ITEM}>
              <ChevronLeft aria-hidden="true" className="mr-2 h-3 w-3" /> PREVIOUS
              <span className="sr-only"> room: {previous.name}</span>
            </Link>
            <Link href={`/rooms/${next.slug}`} className={NAV_ITEM}>
              NEXT <ChevronRight aria-hidden="true" className="ml-2 h-3 w-3" />
              <span className="sr-only"> room: {next.name}</span>
            </Link>
          </div>
        </nav>
      </div>

      <header className="mx-auto max-w-7xl px-4 pt-16 pb-12 text-center sm:px-6 lg:px-8">
        <h1 className="mb-8 font-cormorant text-3xl text-white md:text-5xl">{room.name}</h1>
        <p className="mx-auto mb-8 max-w-4xl text-sm leading-relaxed font-light text-white/70 md:text-base">
          {room.description}
        </p>

        <div className="mb-8">
          <span className="font-cormorant text-3xl text-luxury-gold">
            {formatMoney(room.price)}
          </span>
          <span className="ml-2 text-xs text-white/60 uppercase">/ night</span>
        </div>

        <div className="mb-16 flex justify-center">
          <BookNowLink
            href={bookingUrl}
            className="inline-flex items-center justify-center rounded-sm bg-luxury-gold px-10 py-3 text-[11px] font-bold tracking-[0.2em] text-luxury-dark uppercase shadow-md transition-all hover:bg-gold-dark"
          />
        </div>

        <div className="relative mx-auto max-w-5xl">
          <div className="hover-zoom-wrap relative mb-4 aspect-[16/9] rounded-sm shadow-lg">
            <Image
              src={room.image}
              alt={room.name}
              fill
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="hover-zoom-img"
            />
          </div>

          {/* Decorative, as in the original: there is only one photo per room and no gallery behind these. */}
          <div
            aria-hidden="true"
            className="flex items-center justify-end space-x-4 text-sm text-luxury-gold"
          >
            <div className="flex items-center space-x-4">
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs font-medium">1 / 4</span>
              <ChevronRight className="h-4 w-4" />
            </div>
            <Expand className="h-4 w-4" />
          </div>
        </div>
      </header>

      <section
        aria-labelledby="facilities-heading"
        className="mx-auto mt-16 max-w-5xl px-4 sm:px-6 lg:px-8"
      >
        <h2
          id="facilities-heading"
          className="mb-8 text-[10px] font-bold tracking-[0.25em] text-luxury-gold uppercase"
        >
          Facilities
        </h2>

        <ul className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {room.facilities.map((facility) => (
            <li key={facility.label} className="flex items-start space-x-4">
              <div className="flex w-10 justify-center">
                <Image
                  src={facility.iconSrc}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 opacity-70 invert"
                />
              </div>
              <span className="text-[13px] font-light text-white/80">{facility.label}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
