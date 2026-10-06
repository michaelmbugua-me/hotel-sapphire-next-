'use client';
// Client component: popover open state, outside-click and Escape handling.

import { User } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { useBooking } from '@/components/booking/booking-provider';
import { Stepper } from '@/components/booking/stepper';
import { BOOKING_RULES } from '@/lib/booking-rules';
import { formatGuestSummary } from '@/lib/format';
import { useDismiss } from '@/lib/hooks/use-dismiss';

type GuestsPickerProps = {
  /** `bar`: the desktop booking bar (panel opens above). `modal`: the mobile sheet (panel expands in place). */
  variant: 'bar' | 'modal';
};

const TRIGGER = {
  bar: 'h-14 border-white/20 bg-white/10 hover:bg-white/20',
  modal: 'h-14 rounded-lg border-white/10 bg-white/5 hover:bg-white/10',
} as const;

const PANEL = {
  bar: 'absolute bottom-full left-0 z-[100] mb-2 w-72 rounded-2xl border border-white/20 bg-luxury-navy/95 p-5 shadow-2xl backdrop-blur-md',
  modal: 'mt-2 rounded-lg border border-white/10 bg-white/5 p-4',
} as const;

export function GuestsPicker({ variant }: GuestsPickerProps) {
  const { search, setGuests } = useBooking();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useDismiss(
    open,
    (reason) => {
      setOpen(false);
      if (reason === 'escape') triggerRef.current?.focus();
    },
    rootRef,
  );

  const summary = formatGuestSummary(search);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Rooms and guests: ${summary}`}
        onClick={() => setOpen((value) => !value)}
        className={`flex w-full items-center border px-4 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-luxury-gold ${TRIGGER[variant]}`}
      >
        <User aria-hidden="true" className="mr-3 h-4 w-4 shrink-0 text-luxury-gold" />
        <span className="text-sm font-medium text-white">{summary}</span>
      </button>

      {open && (
        <div id={panelId} role="group" aria-label="Rooms and guests" className={PANEL[variant]}>
          <Stepper
            label="Rooms"
            value={search.rooms}
            {...BOOKING_RULES.rooms}
            onChange={(rooms) => setGuests({ rooms })}
          />
          <Stepper
            label="Adults"
            value={search.adults}
            {...BOOKING_RULES.adults}
            onChange={(adults) => setGuests({ adults })}
          />
          <Stepper
            label="Children"
            value={search.children}
            {...BOOKING_RULES.children}
            onChange={(children) => setGuests({ children })}
          />
        </div>
      )}
    </div>
  );
}
