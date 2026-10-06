import type { Metadata } from 'next';
import { ContactSection } from '@/components/home/contact-section';
import { Facilities } from '@/components/home/facilities';
import { Hero } from '@/components/home/hero';
import { OurStory } from '@/components/home/our-story';
import { RoomsPreview } from '@/components/home/rooms-preview';
import { Testimonials } from '@/components/home/testimonials';
import { VisualJourney } from '@/components/home/visual-journey';
import { Marquee } from '@/components/ui/marquee';
import { getDefaultBookingUrl } from '@/lib/booking';
import { TICKER_ITEMS } from '@/lib/data/ticker';
import { buildPageMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';

export const metadata: Metadata = buildPageMetadata({
  description: SITE.description,
  path: '/',
});

export default function HomePage() {
  // The server-built default link keeps every "Book Now" working without JavaScript.
  const bookingUrl = getDefaultBookingUrl();

  return (
    <>
      <Hero bookingUrl={bookingUrl} />
      <Marquee items={TICKER_ITEMS} label="Hotel highlights" />
      <OurStory />
      <RoomsPreview bookingUrl={bookingUrl} />
      <Facilities />
      <VisualJourney />
      <Testimonials />
      <ContactSection bookingUrl={bookingUrl} />
    </>
  );
}
