'use client';
// Client component: modal open state, focus trap and scroll lock (see useModalFocus).

import { X } from 'lucide-react';
import { useId, useState } from 'react';
import { BookNowLink } from '@/components/booking/book-now-link';
import { BookingErrors } from '@/components/booking/booking-errors';
import { useBooking } from '@/components/booking/booking-provider';
import { DateField } from '@/components/booking/date-field';
import { GuestsPicker } from '@/components/booking/guests-picker';
import { useModalFocus } from '@/lib/hooks/use-modal-focus';

const LABEL = 'mb-1 block text-xs font-bold tracking-wider text-white/50 uppercase';

/** The "BOOK NOW" button and bottom-sheet form shown on phones, in place of the booking bar. */
export function MobileBookingModal() {
  const [open, setOpen] = useState(false);
  const { validation, bookingUrl } = useBooking();
  const titleId = useId();
  const dialogRef = useModalFocus<HTMLDivElement>(open, () => setOpen(false));

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="flex h-14 w-full items-center justify-center rounded-lg bg-luxury-gold text-sm font-bold tracking-widest text-luxury-dark uppercase shadow-lg transition-all hover:bg-gold-dark"
      >
        BOOK NOW
      </button>

      {open && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="fixed inset-0 z-[9999] focus:outline-none"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 bottom-0 left-0 max-h-full animate-fade-in overflow-y-auto rounded-t-3xl border-t border-white/10 bg-luxury-footer p-6 shadow-2xl motion-reduce:animate-none">
            <div className="mb-6 flex items-center justify-between">
              <h2 id={titleId} className="font-serif text-xl font-bold text-white">
                Book Now
              </h2>
              <button
                type="button"
                aria-label="Close booking form"
                onClick={() => setOpen(false)}
                className="text-white/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-luxury-gold"
              >
                <X aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className={LABEL}>Check-in</span>
                <DateField kind="check-in" variant="modal" />
              </div>
              <div>
                <span className={LABEL}>Check-out</span>
                <DateField kind="check-out" variant="modal" />
              </div>
              <div>
                <span className={LABEL}>Guests</span>
                <GuestsPicker variant="modal" />
              </div>
              <div>
                <label htmlFor={`${titleId}-promo`} className={LABEL}>
                  Promocode
                </label>
                {/* Inert by design (as in the original). */}
                <input
                  id={`${titleId}-promo`}
                  type="text"
                  placeholder="Promocode"
                  autoComplete="off"
                  className="h-14 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-medium text-white outline-none placeholder:text-white/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-luxury-gold"
                />
              </div>

              {!validation.ok && <BookingErrors errors={validation.errors} />}

              <BookNowLink
                href={bookingUrl}
                onClick={() => setOpen(false)}
                className="mt-4 flex h-14 w-full items-center justify-center rounded-lg bg-luxury-gold text-sm font-bold tracking-widest text-luxury-dark uppercase shadow-md transition-all hover:bg-gold-dark"
              >
                BOOK NOW
              </BookNowLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
