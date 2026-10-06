import Image from 'next/image';
import Link from 'next/link';
import { FacilityIcon } from '@/components/ui/facility-icon';
import { Accent, SectionHeading } from '@/components/ui/section-heading';
import { FEATURED_FACILITIES } from '@/lib/data/facilities';

export function Facilities() {
  return (
    <section
      aria-labelledby="facilities-title"
      className="bg-luxury-footer py-32 font-jost text-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading id="facilities-title" eyebrow="World-Class Amenities" className="mb-20">
          Our <Accent>Facilities</Accent>
        </SectionHeading>

        <ul className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {FEATURED_FACILITIES.map((facility) => (
            <li key={facility.name}>
              <Link
                href={facility.href}
                className="hover-zoom-wrap group relative block aspect-[3/4] cursor-pointer"
              >
                <Image
                  src={facility.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 20vw, 100vw"
                  className="hover-zoom-img opacity-95"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-t from-luxury-dark to-transparent"
                />
                <div className="absolute right-0 bottom-8 left-0 z-10 px-4 text-center">
                  <div
                    aria-hidden="true"
                    className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors group-hover:bg-luxury-gold"
                  >
                    <FacilityIcon name={facility.icon} className="h-4 w-4" />
                  </div>
                  <h3 className="font-cormorant text-[20px] font-bold tracking-widest">
                    {facility.name}
                  </h3>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
