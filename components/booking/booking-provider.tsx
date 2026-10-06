'use client';
// Client component: shared booking state (dates and guests). It replaces Angular's root-provided
// BookingService, so the header, booking bar, mobile modal and room pages all see the same search.

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  buildBookingUrl,
  defaultBookingSearch,
  defaultBookingUrl,
  validateBookingSearch,
  type BookingIds,
  type BookingSearch,
  type BookingValidation,
} from '@/lib/booking';
import { applyCheckIn, clampGuests, type GuestFields } from '@/lib/booking-state';
import type { PlainDate } from '@/lib/dates';
import { useHotelToday } from '@/lib/hooks/use-hotel-today';

type BookingContextValue = {
  /** The hotel's current date (what "today" and "in the past" mean). */
  today: PlainDate;
  /** The current search. Untouched fields follow today's date. */
  search: BookingSearch;
  /** Whether the search satisfies the booking rules, and the per-field errors if not. */
  validation: BookingValidation;
  /** Booking-engine link: the current search when valid, otherwise a link for the default search. */
  bookingUrl: string;
  setCheckIn: (date: PlainDate) => void;
  setCheckOut: (date: PlainDate) => void;
  setGuests: (patch: Partial<GuestFields>) => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

type BookingProviderProps = {
  /** The hotel's date as computed by the server; keeps hydration identical to the server markup. */
  initialToday: PlainDate;
  ids: BookingIds;
  children: ReactNode;
};

export function BookingProvider({ initialToday, ids, children }: BookingProviderProps) {
  const today = useHotelToday(initialToday);
  // Only what the visitor has changed is stored; everything else is derived from the default
  // search, so an untouched form rolls to the new day on its own.
  const [overrides, setOverrides] = useState<Partial<BookingSearch>>({});

  const search = useMemo<BookingSearch>(
    () => ({ ...defaultBookingSearch(today), ...overrides }),
    [today, overrides],
  );
  const validation = useMemo(() => validateBookingSearch(search, today), [search, today]);
  const bookingUrl = useMemo(
    () => (validation.ok ? buildBookingUrl(validation.value, ids) : defaultBookingUrl(ids, today)),
    [validation, ids, today],
  );

  const setCheckIn = useCallback(
    (date: PlainDate) =>
      setOverrides((previous) => ({
        ...previous,
        ...applyCheckIn({ ...defaultBookingSearch(today), ...previous }, date),
      })),
    [today],
  );
  const setCheckOut = useCallback(
    (date: PlainDate) => setOverrides((previous) => ({ ...previous, checkOut: date })),
    [],
  );
  const setGuests = useCallback(
    (patch: Partial<GuestFields>) =>
      setOverrides((previous) => ({ ...previous, ...clampGuests(patch) })),
    [],
  );

  const value = useMemo<BookingContextValue>(
    () => ({ today, search, validation, bookingUrl, setCheckIn, setCheckOut, setGuests }),
    [today, search, validation, bookingUrl, setCheckIn, setCheckOut, setGuests],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

/** The booking state, or `null` outside a provider (for components that can fall back). */
export function useOptionalBooking(): BookingContextValue | null {
  return useContext(BookingContext);
}

/** The booking state. @throws if used outside a `BookingProvider`. */
export function useBooking(): BookingContextValue {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within a BookingProvider');
  return context;
}
