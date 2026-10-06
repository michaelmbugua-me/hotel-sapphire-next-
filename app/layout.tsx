import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { fontVariables } from '@/app/fonts';
import { BookingProvider } from '@/components/booking/booking-provider';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { defaultBookingUrl, getBookingIds } from '@/lib/booking';
import { todayInZone } from '@/lib/dates';
import { getPublicEnv } from '@/lib/env';
import { buildRootMetadata, rootViewport } from '@/lib/seo';
import './globals.css';

export const metadata: Metadata = buildRootMetadata(getPublicEnv().NEXT_PUBLIC_SITE_URL);
export const viewport: Viewport = rootViewport;

// Every page renders a server-built booking link that carries today's date (hotel time), so pages
// are regenerated hourly instead of being frozen at build time. Still served statically from the CDN.
export const revalidate = 3600;

export default function RootLayout({ children }: { children: ReactNode }) {
  const ids = getBookingIds();
  const today = todayInZone();
  const bookingUrl = defaultBookingUrl(ids, today);

  return (
    <html lang="en" className={fontVariables}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10000] focus:bg-white focus:px-4 focus:py-2 focus:text-black"
        >
          Skip to main content
        </a>
        {/* Analytics hook point: mount an analytics provider or script here when one is adopted (none today). */}
        <BookingProvider initialToday={today} ids={ids}>
          <Header bookingUrl={bookingUrl} />
          <main id="main-content" tabIndex={-1} className="focus:outline-none">
            {children}
          </main>
          <Footer />
          <WhatsAppButton />
        </BookingProvider>
      </body>
    </html>
  );
}
