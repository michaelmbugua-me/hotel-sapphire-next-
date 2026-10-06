import Image from 'next/image';
import Link from 'next/link';
import { BookNowLink } from '@/components/booking/book-now-link';
import { Accent, SectionHeading } from '@/components/ui/section-heading';
import { ROOM_PREVIEWS } from '@/lib/data/home';
import { getRoom } from '@/lib/data/rooms';
import { formatMoney } from '@/lib/format';

const BADGE_TONE = {
  gold: 'bg-luxury-gold text-luxury-dark',
  blue: 'bg-azure text-white',
} as const;

export async function RoomsPreview({ bookingUrl }: { bookingUrl: string }) {
  const cards = await Promise.all(
    ROOM_PREVIEWS.map(async (preview) => {
      const room = await getRoom(preview.slug);
      if (!room) throw new Error(`Home room preview references unknown room "${preview.slug}"`);
      return { preview, price: room.price };
    }),
  );

  return (
    <section aria-labelledby="rooms-title" className="bg-luxury-dark py-32 font-jost text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading id="rooms-title" eyebrow="Accommodation" align="after" className="mb-20">
          Our <Accent>Rooms &amp; Suites</Accent>
        </SectionHeading>

        <ul className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {cards.map(({ preview, price }) => (
            <li key={preview.slug} className="group flex h-full flex-col bg-luxury-book">
              <div className="hover-zoom-wrap relative mb-8 aspect-[4/5] shrink-0">
                <Link href={`/rooms/${preview.slug}`} className="block h-full">
                  <Image
                    src={preview.image}
                    alt={preview.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="hover-zoom-img"
                  />
                </Link>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-linear-to-t from-luxury-dark via-transparent to-transparent opacity-80"
                />
                {preview.badge && (
                  <div
                    className={`absolute top-4 right-4 px-3 py-1 text-[8px] font-bold tracking-widest uppercase ${BADGE_TONE[preview.badge.tone]}`}
                  >
                    {preview.badge.label}
                  </div>
                )}
              </div>

              <div className="flex flex-grow flex-col px-4 pb-4">
                <div className="flex-grow space-y-6">
                  <div className="text-[10px] font-bold tracking-[0.3em] text-white/60 uppercase">
                    Room Type
                  </div>
                  <Link
                    href={`/rooms/${preview.slug}`}
                    className="inline-block w-fit transition-colors hover:text-luxury-gold"
                  >
                    <h3 className="font-cormorant text-3xl">{preview.title}</h3>
                  </Link>
                  <p className="text-xs leading-relaxed font-light text-white/50">
                    {preview.description}
                  </p>
                  <ul className="flex flex-wrap gap-2 pt-2">
                    {preview.features.map((feature) => (
                      <li
                        key={feature}
                        className="border border-white/10 px-2 py-1 text-[8px] font-bold tracking-widest text-white/60 uppercase"
                      >
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                  <div>
                    <span className="font-cormorant text-2xl text-luxury-gold">
                      {formatMoney(price)}
                    </span>
                    <span className="ml-2 text-[10px] text-white/60 uppercase">/ night</span>
                  </div>
                  <BookNowLink
                    href={bookingUrl}
                    className="cursor-pointer bg-luxury-gold px-6 py-3 text-center text-[10px] font-bold tracking-widest text-black uppercase transition-all hover:bg-gold-dark"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
