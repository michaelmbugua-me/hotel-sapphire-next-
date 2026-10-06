import {
  ConciergeBell,
  CircleParking,
  Users,
  Utensils,
  Waves,
  Wifi,
  type LucideProps,
} from 'lucide-react';
import type { Metadata } from 'next';
import type { ComponentType } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { AMENITIES, type AmenityIcon } from '@/lib/data/pages';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Amenities',
  description:
    'Comfort and convenience at Hotel Sapphire: swimming pool, dining, meeting rooms, free Wi-Fi, 24/7 room service and secure parking.',
  path: '/amenities',
});

// Lucide stand-ins for the Font Awesome glyphs: swimmer → Waves, parking → CircleParking.
const ICONS: Record<AmenityIcon, ComponentType<LucideProps>> = {
  pool: Waves,
  dining: Utensils,
  meetings: Users,
  wifi: Wifi,
  'room-service': ConciergeBell,
  parking: CircleParking,
};

export default function AmenitiesPage() {
  return (
    <div className="min-h-screen bg-luxury-dark pb-24 font-jost">
      <PageHeader
        title="Amenities"
        subtitle="Comfort & Convenience For Your Stay"
        spacing="short"
      />

      <section className="bg-luxury-dark py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ul className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
            {AMENITIES.map((amenity) => {
              const Icon = ICONS[amenity.icon];
              return (
                <li
                  key={amenity.title}
                  className="group rounded-sm border-t border-luxury-gold/20 bg-luxury-book p-12 shadow-2xl transition-transform duration-300 hover:-translate-y-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <div aria-hidden="true" className="mb-8 flex justify-center">
                    <Icon className="h-12 w-12 text-luxury-gold" strokeWidth={1.5} />
                  </div>
                  <h2 className="mb-6 text-center font-cormorant text-2xl text-white">
                    {amenity.title}
                  </h2>
                  <p className="text-center text-sm leading-relaxed font-light text-white/70">
                    {amenity.text}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
