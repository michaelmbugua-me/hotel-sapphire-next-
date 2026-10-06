'use client';
// Client-only: reads the clock.

import { useSyncExternalStore } from 'react';
import { todayInZone, type PlainDate } from '@/lib/dates';

const CHECK_INTERVAL_MS = 60_000;

function subscribe(onChange: () => void): () => void {
  // Re-read the clock each minute so the date flips at hotel midnight on a long-open page.
  const id = setInterval(onChange, CHECK_INTERVAL_MS);
  return () => clearInterval(id);
}

/**
 * The hotel's current date. During server rendering and hydration this is `serverToday`, so the
 * markup matches the server's; afterwards it is the live date in the hotel's time zone.
 */
export function useHotelToday(serverToday: PlainDate): PlainDate {
  return useSyncExternalStore(
    subscribe,
    () => todayInZone(),
    () => serverToday,
  );
}
