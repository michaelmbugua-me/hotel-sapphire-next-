'use client';
// Client component: reads the shared booking state from the BookingProvider.

import { BookNowLink } from '@/components/booking/book-now-link';
import { BookingErrors } from '@/components/booking/booking-errors';
import { useBooking } from '@/components/booking/booking-provider';
import { DateField } from '@/components/booking/date-field';
import { GuestsPicker } from '@/components/booking/guests-picker';

/** The desktop/tablet "Make a reservation" bar of the home hero. Hidden below the `md` breakpoint. */
export function BookingBar() {
  const { validation, bookingUrl } = useBooking();

  return (
    <div className="hidden md:block">
      <form
        role="search"
        aria-label="Make a reservation"
        onSubmit={(event) => event.preventDefault()}
        className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md lg:p-6"
      >
        <div className="flex flex-col space-y-4 xl:items-start">
          <p className="text-sm font-medium text-white md:text-base lg:ml-2">Make a reservation</p>

          <div className="flex w-full flex-col items-stretch gap-4 xl:flex-row xl:items-center">
            <div className="grid flex-grow grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <DateField kind="check-in" variant="bar" />
              <DateField kind="check-out" variant="bar" />
              <GuestsPicker variant="bar" />
              {/* Inert by design (as in the original): the booking link always sends an empty promo code. */}
              <input
                type="text"
                aria-label="Promocode"
                placeholder="Promocode"
                autoComplete="off"
                className="h-14 border border-white/20 bg-white/10 px-4 text-sm font-medium text-white outline-none placeholder:text-white/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-luxury-gold"
              />
            </div>

            <BookNowLink
              href={bookingUrl}
              className="flex h-14 items-center justify-center bg-luxury-gold px-10 text-sm font-bold tracking-widest whitespace-nowrap text-luxury-dark uppercase transition-all hover:bg-gold-dark"
            >
              BOOK NOW
            </BookNowLink>
          </div>

          {!validation.ok && <BookingErrors errors={validation.errors} />}
        </div>
      </form>
    </div>
  );
}
