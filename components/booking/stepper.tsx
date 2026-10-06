import { Minus, Plus } from 'lucide-react';

type StepperProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

const BUTTON =
  'flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:border-luxury-gold hover:text-luxury-gold focus-visible:outline-2 focus-visible:outline-luxury-gold focus-visible:outline-offset-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-30 aria-disabled:hover:border-white/30 aria-disabled:hover:text-white';

/**
 * A labelled number control with minus and plus buttons. At a limit the button is `aria-disabled`
 * (not `disabled`), so keyboard focus is not dropped when the limit is reached.
 */
export function Stepper({ label, value, min, max, onChange }: StepperProps) {
  const atMin = value <= min;
  const atMax = value >= max;
  const lower = label.toLowerCase();

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-white">{label}</span>
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label={`Decrease ${lower}`}
          aria-disabled={atMin}
          onClick={() => !atMin && onChange(value - 1)}
          className={BUTTON}
        >
          <Minus aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
        <span
          aria-label={`${label}: ${value}`}
          aria-live="polite"
          className="w-6 text-center text-sm font-bold text-white tabular-nums"
        >
          {value}
        </span>
        <button
          type="button"
          aria-label={`Increase ${lower}`}
          aria-disabled={atMax}
          onClick={() => !atMax && onChange(value + 1)}
          className={BUTTON}
        >
          <Plus aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
