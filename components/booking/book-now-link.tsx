'use client';
// Client component: reads the live booking URL from the BookingProvider.

import type { ReactNode } from 'react';
import { useOptionalBooking } from '@/components/booking/booking-provider';

type BookNowLinkProps = {
  /**
   * Server-rendered default booking URL. It is what no-JS visitors get, and the fallback when no
   * BookingProvider is present; with one, the visitor's chosen dates and guests win.
   */
  href: string;
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
};

/** The one place "Book Now" links are rendered: opens the external booking engine in a new tab. */
export function BookNowLink({ href, className, onClick, children = 'Book Now' }: BookNowLinkProps) {
  const booking = useOptionalBooking();
  return (
    <a
      href={booking?.bookingUrl ?? href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={onClick}
    >
      {children}
    </a>
  );
}
