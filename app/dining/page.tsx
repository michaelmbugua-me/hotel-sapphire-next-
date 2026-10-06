import type { Metadata } from 'next';
import Image from 'next/image';
import { BookNowLink } from '@/components/booking/book-now-link';
import { PageHeader } from '@/components/ui/page-header';
import { getDefaultBookingUrl } from '@/lib/booking';
import { RESTAURANTS } from '@/lib/data/pages';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Dining',
  description:
    'Dine at Hotel Sapphire: the Tsavorite Restaurant and the authentic Mehfil Indian Restaurant, with room service, a poolside bar and buffet breakfast.',
  path: '/dining',
  image: '/image/dining/dining_one.webp',
});

export default function DiningPage() {
  const bookingUrl = getDefaultBookingUrl();

  return (
    <div className="min-h-screen bg-luxury-dark font-jost">
      <PageHeader
        title="Dining At Hotel Sapphire"
        subtitle="The Hotel Also Makes An Exquisite, Memorable Venue For Intimate Weddings, Parties And Product Launches."
      >
        <p className="mx-auto max-w-4xl text-sm leading-relaxed font-light text-white/70 md:text-base">
          Welcome to the Roshani Restaurant &amp; Bar, a culinary haven located on the Pool Terrace
          of Hotel Sapphire. Start your day off right with our buffet breakfast, available from
          7:00am to 10:00am. Delight in an array of delectable options to suit every palate. Beyond
          breakfast, our A la-Carte menu offers a variety of mouthwatering meals and snacks, all
          served on request until 10:00pm. Indulge in a gastronomic journey as our talented chefs
          prepare each dish with precision and passion. Whether you crave local flavors or
          international cuisine, our menu is thoughtfully crafted to satisfy every culinary desire.
        </p>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {RESTAURANTS.map((restaurant, index) => (
            <li key={restaurant.name} className="flex flex-col">
              <div className="hover-zoom-wrap relative aspect-[4/3]">
                <Image
                  src={restaurant.image}
                  alt={restaurant.name}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="hover-zoom-img"
                />
              </div>
              <div className="flex-grow space-y-4 border-x border-b border-white/5 bg-luxury-book p-8 text-center">
                <h2 className="font-cormorant text-2xl text-white">{restaurant.name}</h2>
                <div className="space-y-4 text-xs leading-relaxed font-light text-white/70 md:text-sm">
                  {restaurant.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <div className="pt-6">
                  <BookNowLink
                    href={bookingUrl}
                    className="text-[10px] font-bold tracking-widest text-luxury-gold uppercase transition-colors hover:brightness-110"
                  >
                    Make Reservation
                  </BookNowLink>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
