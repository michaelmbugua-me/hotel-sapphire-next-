'use client';
// Client component: needs focus management and key handling (see useModalFocus).

import { X } from 'lucide-react';
import Link from 'next/link';
import { BookNowLink } from '@/components/booking/book-now-link';
import { Logo } from '@/components/layout/logo';
import { useModalFocus } from '@/lib/hooks/use-modal-focus';
import { NAV_LINKS } from '@/lib/site';

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  bookingUrl: string;
};

const LINK_CLASS =
  'hover:text-luxury-gold text-2xl font-bold tracking-widest whitespace-nowrap uppercase transition-colors';

export function MobileMenu({ open, onClose, bookingUrl }: MobileMenuProps) {
  const dialogRef = useModalFocus<HTMLDivElement>(open, onClose);
  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      tabIndex={-1}
      className="fixed inset-0 z-[60] flex animate-fade-in flex-col items-center justify-center space-y-8 bg-luxury-dark text-white focus:outline-none motion-reduce:animate-none"
    >
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute top-8 right-8 text-white transition-colors hover:text-luxury-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-luxury-gold"
      >
        <X className="h-10 w-10" strokeWidth={2} />
      </button>

      <div className="mb-4">
        <Logo className="h-12" />
      </div>

      <nav aria-label="Mobile" className="flex flex-col items-center space-y-8">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} onClick={onClose} className={LINK_CLASS}>
            {link.fullLabel ?? link.label}
          </Link>
        ))}
      </nav>

      <BookNowLink
        href={bookingUrl}
        onClick={onClose}
        className="mt-4 bg-luxury-gold px-10 py-4 text-sm font-bold tracking-[0.2em] text-white uppercase transition-all hover:brightness-110"
      />
    </div>
  );
}
