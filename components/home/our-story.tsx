import Image from 'next/image';
import Link from 'next/link';
import { Accent, SectionHeading } from '@/components/ui/section-heading';
import { STORY_FEATURES } from '@/lib/data/home';

const STRONG = 'font-medium text-white';

export function OurStory() {
  return (
    <section
      aria-labelledby="our-story-title"
      className="overflow-hidden bg-luxury-footer py-24 font-jost text-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-20 lg:grid-cols-2">
          <div className="relative w-full pb-[100px]">
            <div className="hover-zoom-wrap relative z-10 ml-auto aspect-[4/5] w-4/5">
              <Image
                src="/image/gallery/four.webp"
                alt="Onyx Fitness Gym"
                fill
                sizes="(min-width: 1024px) 40vw, 80vw"
                className="hover-zoom-img"
              />
            </div>

            <div
              aria-hidden="true"
              className="absolute top-10 left-4 z-20 h-8 w-8 rotate-45 bg-linear-to-b from-cobalt to-azure"
            />

            <div className="hover-zoom-wrap absolute bottom-0 left-0 z-20 aspect-square w-[48%] border-4 border-luxury-navy">
              <Image
                src="/image/home/wellness_spa.webp"
                alt="Aura Wellness Spa"
                fill
                sizes="(min-width: 1024px) 20vw, 40vw"
                className="hover-zoom-img"
              />
              <div className="pointer-events-none absolute inset-0 bg-luxury-gold/10" />
            </div>
          </div>

          <div className="space-y-10">
            <div>
              <SectionHeading
                id="our-story-title"
                eyebrow="Our Story"
                size="lg"
                className="mb-8"
                titleClassName="leading-tight"
              >
                Where Every Stay <br />
                Becomes a <Accent>Memory</Accent>
              </SectionHeading>
              <p className="max-w-xl text-sm leading-relaxed font-light text-white/60">
                Hotel Sapphire is Mombasa&apos;s premier urban retreat — where luxury meets the
                vibrant energy of the city. From the{' '}
                <span className={STRONG}>Onyx Fitness Gym</span> and{' '}
                <span className={STRONG}>Aura Wellness Spa</span> to our rooftop pool and Indian
                &amp; International restaurant, every corner is crafted to refresh and inspire.
                Whether you&apos;re joining us for a Kizo Fusion event, a corporate conference, or a
                family getaway — we are your home in the heart of Mombasa.
              </p>
            </div>

            <ul className="mb-3 space-y-4">
              {STORY_FEATURES.map((feature) => (
                <li
                  key={feature.title}
                  className="flex items-start border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10"
                >
                  <span
                    aria-hidden="true"
                    className="flex w-12 shrink-0 items-center justify-center text-3xl"
                  >
                    {feature.emoji}
                  </span>
                  <div className="ml-6 flex-grow">
                    <h3 className="mb-1 font-jost text-sm font-bold tracking-wider">
                      {feature.title}
                    </h3>
                    <p className="text-[11px] text-white/60">{feature.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div>
              <Link
                href="/rooms"
                className="flex w-full items-center justify-center bg-luxury-gold px-10 py-5 text-xs font-bold tracking-widest text-luxury-dark uppercase transition-all hover:bg-gold-dark md:inline-flex md:w-auto"
              >
                EXPLORE ROOMS →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
