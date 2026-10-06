'use client';
// Client component: popover open state and outside-click / Escape handling around the Calendar.

import { CalendarDays } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { useBooking } from '@/components/booking/booking-provider';
import { Calendar } from '@/components/booking/calendar';
import { checkOutBounds } from '@/lib/booking-state';
import { formatDisplayDate } from '@/lib/format';
import { useDismiss } from '@/lib/hooks/use-dismiss';

type DateFieldProps = {
  kind: 'check-in' | 'check-out';
  /** `bar`: the desktop booking bar (calendar opens above). `modal`: the mobile sheet (calendar centred on screen). */
  variant: 'bar' | 'modal';
};

const LABELS = { 'check-in': 'Check-in', 'check-out': 'Check-out' } as const;

const TRIGGER = {
  bar: 'border-white/20 bg-white/10 hover:bg-white/20',
  modal: 'rounded-lg border-white/10 bg-white/5',
} as const;

const POPOVER = {
  bar: 'absolute bottom-full left-0 z-[100] mb-2',
  modal: 'fixed top-1/2 left-1/2 z-[10000] -translate-x-1/2 -translate-y-1/2',
} as const;

export function DateField({ kind, variant }: DateFieldProps) {
  const { today, search, setCheckIn, setCheckOut } = useBooking();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverId = useId();

  useDismiss(
    open,
    (reason) => {
      setOpen(false);
      if (reason === 'escape') triggerRef.current?.focus();
    },
    rootRef,
  );

  const isCheckIn = kind === 'check-in';
  const value = isCheckIn ? search.checkIn : search.checkOut;
  const bounds = checkOutBounds(search.checkIn);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={popoverId}
        aria-label={`${LABELS[kind]}: ${formatDisplayDate(value)}`}
        onClick={() => setOpen((previous) => !previous)}
        className={`flex h-14 w-full items-center justify-between border px-4 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-luxury-gold ${TRIGGER[variant]}`}
      >
        <span className="text-sm font-medium text-white">{formatDisplayDate(value)}</span>
        <CalendarDays aria-hidden="true" className="ml-2 h-4 w-4 shrink-0 text-luxury-gold" />
      </button>

      {open && (
        <div
          id={popoverId}
          role="dialog"
          aria-label={`Choose ${LABELS[kind].toLowerCase()} date`}
          className={POPOVER[variant]}
        >
          <Calendar
            today={today}
            selected={value}
            rangeStart={search.checkIn}
            rangeEnd={search.checkOut}
            minDate={isCheckIn ? today : bounds.min}
            maxDate={isCheckIn ? undefined : bounds.max}
            onSelect={(date) => {
              if (isCheckIn) setCheckIn(date);
              else setCheckOut(date);
              setOpen(false);
              triggerRef.current?.focus();
            }}
          />
        </div>
      )}
    </div>
  );
}
