'use client';
// Client component: holds the pause/play state that WCAG 2.2.2 requires for auto-moving content.
// Hover-pause and reduced-motion handling are pure CSS.

import { Pause, Play } from 'lucide-react';
import { useState } from 'react';

type MarqueeProps = {
  items: readonly string[];
  /** Accessible name of the region. */
  label: string;
};

// The track holds four identical copies and scrolls by -50%, so the loop is seamless.
const COPIES = [0, 1, 2, 3] as const;

export function Marquee({ items, label }: MarqueeProps) {
  const [paused, setPaused] = useState(false);

  return (
    <section
      aria-label={label}
      className="relative z-30 overflow-hidden border-y border-gold-dark/20 bg-luxury-gold py-4 font-jost"
    >
      <div
        style={{ animationPlayState: paused ? 'paused' : undefined }}
        className="flex w-max animate-marquee items-center whitespace-nowrap hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none motion-reduce:justify-center motion-reduce:whitespace-normal"
      >
        {COPIES.map((copy) => (
          // Only the first copy is exposed to assistive tech; the rest exist for the visual loop.
          // With reduced motion there is no loop, so the extra copies are removed.
          <ul
            key={copy}
            aria-hidden={copy === 0 ? undefined : true}
            className={`flex items-center motion-reduce:flex-wrap motion-reduce:justify-center ${copy === 0 ? '' : 'motion-reduce:hidden'}`}
          >
            {items.map((item) => (
              <li key={item} className="flex items-center px-8">
                <span aria-hidden="true" className="mr-8 h-2 w-2 rounded-full bg-luxury-dark/30" />
                <span className="font-jost text-[10px] font-medium tracking-[0.3em] text-luxury-dark uppercase">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>

      {/* With reduced motion nothing moves, so there is nothing to pause. */}
      <div className="absolute inset-y-0 right-0 flex items-center bg-linear-to-l from-luxury-gold from-70% to-transparent pr-4 pl-10 motion-reduce:hidden">
        <button
          type="button"
          aria-label={paused ? 'Play ticker' : 'Pause ticker'}
          onClick={() => setPaused((value) => !value)}
          className="flex h-7 w-7 items-center justify-center rounded-full text-luxury-dark transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxury-dark"
        >
          {paused ? (
            <Play aria-hidden="true" className="h-3.5 w-3.5" fill="currentColor" />
          ) : (
            <Pause aria-hidden="true" className="h-3.5 w-3.5" fill="currentColor" />
          )}
        </button>
      </div>
    </section>
  );
}
