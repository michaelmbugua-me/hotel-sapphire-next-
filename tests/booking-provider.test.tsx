import { act, render, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BookNowLink } from '@/components/booking/book-now-link';
import {
  BookingProvider,
  useBooking,
  useOptionalBooking,
} from '@/components/booking/booking-provider';
import type { BookingIds } from '@/lib/booking';

const IDS: BookingIds = { hotelId: '26609', styleId: '20249', dcId: '1161' };

function wrapperFor(initialToday: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <BookingProvider initialToday={initialToday} ids={IDS}>
        {children}
      </BookingProvider>
    );
  };
}

const params = (url: string) => new URL(url).searchParams;

beforeEach(() => {
  vi.useFakeTimers({ now: new Date('2026-10-06T09:00:00Z') }); // 12:00 in Nairobi
});

afterEach(() => {
  vi.useRealTimers();
});

describe('BookingProvider: defaults', () => {
  it('starts with one night from today, 1 room and 2 adults, and a valid search', () => {
    const { result } = renderHook(() => useBooking(), { wrapper: wrapperFor('2026-10-06') });
    expect(result.current.today).toBe('2026-10-06');
    expect(result.current.search).toEqual({
      checkIn: '2026-10-06',
      checkOut: '2026-10-07',
      rooms: 1,
      adults: 2,
      children: 0,
    });
    expect(result.current.validation.ok).toBe(true);
    const url = params(result.current.bookingUrl);
    expect(url.get('gg')).toBe('6');
    expect(url.get('ggf')).toBe('7');
    expect(url.get('tot_adulti')).toBe('2');
  });
});

describe('BookingProvider: dates', () => {
  it('moves check-out to the next day when check-in is set on or after it', () => {
    const { result } = renderHook(() => useBooking(), { wrapper: wrapperFor('2026-10-06') });
    act(() => result.current.setCheckIn('2026-10-20'));
    expect(result.current.search.checkIn).toBe('2026-10-20');
    expect(result.current.search.checkOut).toBe('2026-10-21');
    expect(params(result.current.bookingUrl).get('gg')).toBe('20');
  });

  it('keeps a still-valid check-out when check-in changes', () => {
    const { result } = renderHook(() => useBooking(), { wrapper: wrapperFor('2026-10-06') });
    act(() => result.current.setCheckOut('2026-10-15'));
    act(() => result.current.setCheckIn('2026-10-10'));
    expect(result.current.search).toMatchObject({ checkIn: '2026-10-10', checkOut: '2026-10-15' });
  });

  it('reports a rule violation and falls back to the default link instead of an invalid one', () => {
    const { result } = renderHook(() => useBooking(), { wrapper: wrapperFor('2026-10-06') });
    act(() => result.current.setCheckOut('2026-11-20')); // 45 nights
    expect(result.current.validation).toEqual({
      ok: false,
      errors: { checkOut: 'Maximum stay is 30 nights.' },
    });
    const url = params(result.current.bookingUrl);
    expect(url.get('ggf')).toBe('7'); // the default one-night link, not the invalid dates
  });
});

describe('BookingProvider: guests', () => {
  it('stores guest counts and puts them in the booking link', () => {
    const { result } = renderHook(() => useBooking(), { wrapper: wrapperFor('2026-10-06') });
    act(() => result.current.setGuests({ rooms: 2, adults: 3, children: 1 }));
    const url = params(result.current.bookingUrl);
    expect([url.get('tot_camere'), url.get('tot_adulti'), url.get('tot_bambini')]).toEqual([
      '2',
      '3',
      '1',
    ]);
  });

  it('clamps out-of-range and non-numeric counts to the booking rules', () => {
    const { result } = renderHook(() => useBooking(), { wrapper: wrapperFor('2026-10-06') });
    act(() => result.current.setGuests({ rooms: 0, adults: 99, children: -3 }));
    expect(result.current.search).toMatchObject({ rooms: 1, adults: 10, children: 0 });
    act(() => result.current.setGuests({ adults: Number.NaN }));
    expect(result.current.search.adults).toBe(1);
    expect(result.current.validation.ok).toBe(true);
  });
});

describe('BookingProvider: the hotel date rolling over', () => {
  it('moves an untouched search to the new day', () => {
    const { result } = renderHook(() => useBooking(), { wrapper: wrapperFor('2026-10-06') });
    act(() => {
      vi.setSystemTime(new Date('2026-10-07T09:00:00Z'));
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current.today).toBe('2026-10-07');
    expect(result.current.search).toMatchObject({ checkIn: '2026-10-07', checkOut: '2026-10-08' });
    expect(result.current.validation.ok).toBe(true);
  });

  it("keeps the visitor's dates and flags them once they fall in the past", () => {
    const { result } = renderHook(() => useBooking(), { wrapper: wrapperFor('2026-10-06') });
    act(() => result.current.setCheckIn('2026-10-06'));
    act(() => {
      vi.setSystemTime(new Date('2026-10-07T09:00:00Z'));
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current.search.checkIn).toBe('2026-10-06');
    expect(result.current.validation).toMatchObject({
      ok: false,
      errors: { checkIn: 'Check-in cannot be in the past.' },
    });
    // The header link still works: it falls back to a valid link for the new today.
    expect(params(result.current.bookingUrl).get('gg')).toBe('7');
  });

  it('uses the server date for the first render so hydration matches the server markup', () => {
    // The client clock says 2026-10-06, but the server rendered this page on 2026-01-15.
    function Probe() {
      return <span>{useBooking().bookingUrl}</span>;
    }
    const html = renderToStaticMarkup(
      <BookingProvider initialToday="2026-01-15" ids={IDS}>
        <Probe />
      </BookingProvider>,
    );
    expect(html).toContain('gg=15');
    expect(html).toContain('mm=1&amp;');
    expect(html).not.toContain('mm=10');
  });
});

describe('useBooking / useOptionalBooking', () => {
  it('throws a clear error outside a provider', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useBooking())).toThrowError(
      'useBooking must be used within a BookingProvider',
    );
    error.mockRestore();
  });

  it('returns null outside a provider for optional consumers', () => {
    const { result } = renderHook(() => useOptionalBooking());
    expect(result.current).toBeNull();
  });
});

describe('BookNowLink', () => {
  const DEFAULT_HREF = 'https://book.travelbookgroup.com/premium/index2.html?default=1';

  it('uses the href it is given when there is no provider', () => {
    render(<BookNowLink href={DEFAULT_HREF} />);
    const link = screen.getByRole('link', { name: 'Book Now' });
    expect(link).toHaveAttribute('href', DEFAULT_HREF);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it("follows the visitor's choices when inside a provider", () => {
    function Controls() {
      const { setGuests } = useBooking();
      return <button onClick={() => setGuests({ adults: 4 })}>more adults</button>;
    }
    render(
      <BookingProvider initialToday="2026-10-06" ids={IDS}>
        <BookNowLink href={DEFAULT_HREF} />
        <Controls />
      </BookingProvider>,
    );
    const link = screen.getByRole('link', { name: 'Book Now' });
    expect(link.getAttribute('href')).not.toBe(DEFAULT_HREF);
    expect(params(link.getAttribute('href')!).get('tot_adulti')).toBe('2');

    act(() => screen.getByText('more adults').click());
    expect(params(link.getAttribute('href')!).get('tot_adulti')).toBe('4');
  });
});
