'use client';
// Client component: month navigation, roving focus and keyboard handling for the date grid.

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { MONTH_NAMES, WEEKDAY_LABELS, buildMonthWeeks, dayLabel } from '@/lib/calendar';
import {
  addDays,
  addMonths,
  isBefore,
  parsePlainDate,
  startOfMonth,
  weekdayOf,
  type PlainDate,
} from '@/lib/dates';

type CalendarProps = {
  /** The hotel's current date. Injected so rendering is deterministic and server/client agree. */
  today: PlainDate;
  /** The single date drawn as a filled circle. If omitted, `rangeStart` and `rangeEnd` are circled. */
  selected?: PlainDate | null;
  rangeStart?: PlainDate | null;
  rangeEnd?: PlainDate | null;
  /** First selectable date (inclusive). Defaults to `today`. */
  minDate?: PlainDate;
  /** Last selectable date (inclusive). */
  maxDate?: PlainDate;
  onSelect: (date: PlainDate) => void;
};

const NAV_BUTTON =
  'group rounded-full p-2 text-white/60 transition-all hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-luxury-gold active:scale-95 aria-disabled:cursor-not-allowed aria-disabled:opacity-30 aria-disabled:hover:bg-transparent';

export function Calendar({
  today,
  selected = null,
  rangeStart = null,
  rangeEnd = null,
  minDate = today,
  maxDate,
  onSelect,
}: CalendarProps) {
  const gridId = useId();
  const gridRef = useRef<HTMLDivElement>(null);
  const moveFocusAfterRender = useRef(false);

  // Open on the month of the current selection (the original always opened on today's month).
  const [focusedDate, setFocusedDate] = useState<PlainDate>(
    selected ?? rangeStart ?? (isBefore(today, minDate) ? minDate : today),
  );
  const [visibleMonth, setVisibleMonth] = useState<PlainDate>(startOfMonth(focusedDate));

  useEffect(() => {
    if (!moveFocusAfterRender.current) return;
    moveFocusAfterRender.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focusedDate}"]`)?.focus();
  });

  const isDisabled = (date: PlainDate) =>
    isBefore(date, minDate) || (maxDate !== undefined && isBefore(maxDate, date));

  const firstMonth = startOfMonth(minDate);
  const canGoPrevious = isBefore(firstMonth, visibleMonth);
  const canGoNext = maxDate === undefined || !isBefore(maxDate, addMonths(visibleMonth, 1));

  /** Navigation never leaves the months that contain selectable dates. */
  const inBounds = (date: PlainDate) =>
    !isBefore(date, firstMonth) &&
    (maxDate === undefined || !isBefore(maxDate, startOfMonth(date)));

  function moveTo(date: PlainDate, { focus }: { focus: boolean }) {
    if (!inBounds(date)) return;
    moveFocusAfterRender.current = focus;
    setFocusedDate(date);
    setVisibleMonth(startOfMonth(date));
  }

  function onGridKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const weekday = weekdayOf(focusedDate);
    const targets: Record<string, PlainDate> = {
      ArrowLeft: addDays(focusedDate, -1),
      ArrowRight: addDays(focusedDate, 1),
      ArrowUp: addDays(focusedDate, -7),
      ArrowDown: addDays(focusedDate, 7),
      Home: addDays(focusedDate, -weekday),
      End: addDays(focusedDate, 6 - weekday),
      PageUp: addMonths(focusedDate, event.shiftKey ? -12 : -1),
      PageDown: addMonths(focusedDate, event.shiftKey ? 12 : 1),
    };
    const target = targets[event.key];
    if (!target) return;
    event.preventDefault();
    moveTo(target, { focus: true });
  }

  const { year, month } = parsePlainDate(visibleMonth);
  const monthTitle = `${MONTH_NAMES[month - 1]} ${year}`;
  const weeks = buildMonthWeeks(visibleMonth);

  const isCircled = (date: PlainDate) =>
    selected ? date === selected : date === rangeStart || date === rangeEnd;
  const isInRange = (date: PlainDate) =>
    rangeStart !== null &&
    rangeEnd !== null &&
    isBefore(rangeStart, date) &&
    isBefore(date, rangeEnd);

  return (
    <div className="w-[340px] rounded-2xl border border-white/20 bg-luxury-navy/95 p-6 text-white shadow-2xl backdrop-blur-md">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            aria-label="Previous month"
            aria-disabled={!canGoPrevious}
            onClick={() => canGoPrevious && moveTo(addMonths(focusedDate, -1), { focus: false })}
            className={NAV_BUTTON}
          >
            <ChevronLeft className="h-4 w-4 group-hover:text-luxury-gold" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            aria-disabled={!canGoNext}
            onClick={() => canGoNext && moveTo(addMonths(focusedDate, 1), { focus: false })}
            className={NAV_BUTTON}
          >
            <ChevronRight className="h-4 w-4 group-hover:text-luxury-gold" />
          </button>
        </div>

        <div className="text-right">
          <div
            aria-hidden="true"
            className="mb-0.5 text-xs font-bold tracking-[0.2em] text-luxury-gold uppercase"
          >
            {year}
          </div>
          <div aria-hidden="true" className="font-serif text-lg leading-tight font-bold text-white">
            {MONTH_NAMES[month - 1]}
          </div>
          {/* The single accessible, announced copy of the visible month heading. */}
          <span id={gridId} aria-live="polite" className="sr-only">
            {monthTitle}
          </span>
        </div>
      </div>

      <div role="grid" aria-labelledby={gridId} ref={gridRef} onKeyDown={onGridKeyDown}>
        <div role="row" className="mb-2 grid grid-cols-7">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              role="columnheader"
              className="py-2 text-center text-[10px] font-bold text-white/60 uppercase"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} role="row" className="grid grid-cols-7">
              {week.map((date, cellIndex) =>
                date === null ? (
                  <div key={`blank-${cellIndex}`} role="gridcell" className="aspect-square p-1" />
                ) : (
                  <DayCell
                    key={date}
                    date={date}
                    disabled={isDisabled(date)}
                    circled={isCircled(date)}
                    inRange={isInRange(date)}
                    isToday={date === today}
                    tabbable={date === focusedDate}
                    onChoose={() => {
                      setFocusedDate(date);
                      onSelect(date);
                    }}
                  />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type DayCellProps = {
  date: PlainDate;
  disabled: boolean;
  circled: boolean;
  inRange: boolean;
  isToday: boolean;
  tabbable: boolean;
  onChoose: () => void;
};

function DayCell({ date, disabled, circled, inRange, isToday, tabbable, onChoose }: DayCellProps) {
  const style = circled
    ? 'bg-luxury-gold text-luxury-dark shadow-luxury-gold/30 scale-110 shadow-lg'
    : disabled
      ? 'text-white'
      : `hover:text-luxury-gold text-white hover:bg-white/10 ${inRange ? 'text-luxury-gold' : ''}`;

  return (
    <div
      role="gridcell"
      aria-selected={circled}
      className={`relative flex aspect-square items-center justify-center p-1 ${disabled ? 'opacity-30' : ''}`}
    >
      {inRange && (
        <div aria-hidden="true" className="absolute inset-y-1 right-0 left-0 bg-luxury-gold/20" />
      )}
      <button
        type="button"
        data-date={date}
        tabIndex={tabbable ? 0 : -1}
        aria-label={dayLabel(date)}
        aria-disabled={disabled}
        aria-current={isToday ? 'date' : undefined}
        onClick={() => {
          if (!disabled) onChoose();
        }}
        className={`relative z-10 flex h-full w-full items-center justify-center rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxury-gold ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${style}`}
      >
        {parsePlainDate(date).day}
      </button>
    </div>
  );
}
