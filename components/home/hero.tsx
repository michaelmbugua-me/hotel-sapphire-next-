import { ArrowRight, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { BookNowLink } from '@/components/booking/book-now-link';
import { BookingBar } from '@/components/booking/booking-bar';
import { MobileBookingModal } from '@/components/booking/mobile-booking-modal';
import { WhatsAppIcon } from '@/components/ui/brand-icons';
import { HERO_HIGHLIGHTS, HERO_STATS } from '@/lib/data/home';
import { CONTACT, SITE } from '@/lib/site';

const CTA =
  'flex w-full items-center justify-center px-10 py-4 text-xs font-bold tracking-widest uppercase transition-all md:w-auto';

export function Hero({ bookingUrl }: { bookingUrl: string }) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex min-h-screen items-start overflow-hidden bg-luxury-dark pt-20 font-jost md:items-center"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/image/home/home_bottom.webp"
          alt="Hotel Sapphire pool"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Left-to-right: dark on the left, letting the image show on the right. */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, #060d1fcc 0%, #060d1f55 80%, transparent 100%)',
          }}
        />
        {/* Top-to-bottom: light in the middle, dark towards the bottom. */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, #060d1f40 55%, #060d1faa 75%, #060d1ff5 100%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-6 flex items-center space-x-2 md:space-x-4">
            <div aria-hidden="true" className="h-px w-8 shrink-0 bg-luxury-gold md:w-12" />
            <p className="flex items-center text-[10px] font-bold tracking-[0.2em] text-luxury-gold uppercase md:text-xs md:tracking-[0.4em]">
              {SITE.tagline}
              <span
                aria-hidden="true"
                className="ml-2 -translate-y-1 transform text-xl drop-shadow-md md:ml-4"
              >
                🌴
              </span>
            </p>
            <div aria-hidden="true" className="h-px w-8 shrink-0 bg-luxury-gold md:w-12" />
          </div>

          <h1
            id="hero-title"
            className="mb-8 font-cormorant text-6xl leading-[1.1] text-white md:text-8xl"
          >
            Luxury Stay <br />
            in <span className="font-cormorant text-luxury-gold italic">Mombasa</span>
          </h1>

          <ul className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] font-thin tracking-[0.2em] text-white/80 uppercase">
            <li>COMFORT</li>
            <li aria-hidden="true" className="h-1 w-1 rounded-full bg-luxury-gold/50" />
            <li>ELEGANCE</li>
            <li aria-hidden="true" className="h-1 w-1 rounded-full bg-luxury-gold/50" />
            <li>EXPERIENCE</li>
          </ul>
        </div>

        <div className="mb-6 w-full">
          <ul className="mb-6 flex max-w-3xl flex-wrap gap-x-4 text-[12px] font-light tracking-widest text-white/60">
            {HERO_HIGHLIGHTS.map((item, index) => (
              <li key={item} className="flex gap-x-4">
                {index > 0 && <span aria-hidden="true">•</span>}
                {item}
              </li>
            ))}
          </ul>

          <BookingBar />
          <MobileBookingModal />
        </div>

        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-4">
            <BookNowLink
              href={bookingUrl}
              className={`${CTA} bg-luxury-gold text-luxury-dark hover:bg-gold-dark`}
            >
              BOOK NOW <ArrowRight aria-hidden="true" className="ml-3 h-3 w-3" />
            </BookNowLink>
            <Link
              href="/rooms"
              className={`${CTA} border border-white/30 text-white hover:bg-white/10`}
            >
              VIEW ROOMS
            </Link>
            <a
              href={CONTACT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${CTA} bg-green-500 text-white hover:bg-green-600`}
            >
              <WhatsAppIcon className="mr-3 h-5 w-5" /> BOOK VIA WHATSAPP
            </a>
          </div>
        </div>
      </div>

      <div className="absolute right-0 bottom-16 left-0 z-20 px-4 sm:px-6 lg:bottom-12 lg:px-8">
        <div className="mx-auto flex max-w-7xl justify-end">
          <dl className="flex gap-4">
            {HERO_STATS.map((stat) => (
              <div
                key={stat.label}
                className="min-w-[140px] border border-white/10 bg-black/40 p-4 text-center backdrop-blur-md"
              >
                <dd className="mb-1 font-cormorant text-2xl text-luxury-gold">
                  {stat.value}
                  {stat.star && (
                    <Star
                      aria-hidden="true"
                      className="ml-1 inline h-2.5 w-2.5"
                      fill="currentColor"
                    />
                  )}
                </dd>
                <dt className="text-[8px] font-bold tracking-widest text-white/50 uppercase">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
