import { ChevronLeft, ChevronRight, Pause } from 'lucide-react';

/**
 * Non-interactive stand-in for the slider controls drawn on the original rooms pages. The Angular
 * app never had a slider behind them (the buttons did nothing), so they are kept as visual
 * decoration only and hidden from assistive technology and the tab order.
 */
export function DecorativeSliderControls({ position = '2 / 5' }: { position?: string }) {
  return (
    <div
      aria-hidden="true"
      className="absolute right-8 bottom-6 flex items-center space-x-6 text-luxury-gold md:right-12"
    >
      <span className="text-[10px] font-medium">{position}</span>
      <div className="flex items-center space-x-4">
        <ChevronLeft className="h-3 w-3" />
        <Pause className="h-3 w-3" />
        <ChevronRight className="h-3 w-3" />
      </div>
    </div>
  );
}
