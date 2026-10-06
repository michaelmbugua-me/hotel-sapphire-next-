import Image from 'next/image';
import Link from 'next/link';
import { BookNowLink } from '@/components/booking/book-now-link';
import { DecorativeSliderControls } from '@/components/ui/decorative-slider-controls';
import type { Room } from '@/types/room';

type RoomListItemProps = {
  room: Room;
  /** Blurb shown on the list. The original uses the same text for every room here. */
  blurb: string;
  bookingUrl: string;
  /** The first card is likely above the fold on large screens. */
  priority?: boolean;
};

export function RoomListItem({ room, blurb, bookingUrl, priority = false }: RoomListItemProps) {
  const href = `/rooms/${room.slug}`;
  return (
    <li className="flex flex-col items-stretch gap-0 md:flex-row">
      <div className="hover-zoom-wrap relative aspect-[4/3] w-full rounded-sm shadow-md md:w-1/2">
        <Link href={href} className="block h-full">
          <Image
            src={room.image}
            alt={room.name}
            fill
            priority={priority}
            sizes="(min-width: 768px) 576px, 100vw"
            className="hover-zoom-img"
          />
        </Link>
      </div>
      <div className="relative flex w-full flex-col justify-center space-y-5 rounded-sm border border-white/5 bg-luxury-book px-8 pt-12 pb-20 text-left shadow-xl md:w-1/2 md:px-12">
        <Link href={href} className="inline-block w-fit transition-colors hover:text-luxury-gold">
          <h2 className="font-cormorant text-2xl md:text-3xl">{room.name}</h2>
        </Link>
        <p className="text-sm leading-relaxed font-light text-white/70">{blurb}</p>
        <Link
          href={href}
          aria-label={`Read more about the ${room.name}`}
          className="inline-block text-xs font-medium text-luxury-gold transition-colors hover:text-white md:text-sm"
        >
          Read more
        </Link>
        <div className="pt-2">
          <BookNowLink
            href={bookingUrl}
            className="inline-flex items-center justify-center bg-luxury-gold px-10 py-3 text-[11px] font-bold tracking-[0.2em] text-luxury-dark uppercase transition-all hover:bg-gold-dark"
          />
        </div>
        <DecorativeSliderControls />
      </div>
    </li>
  );
}
