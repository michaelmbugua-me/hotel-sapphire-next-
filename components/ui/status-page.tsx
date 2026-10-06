import type { ReactNode } from 'react';

type StatusPageProps = {
  /** Small gold label above the title, e.g. "404". */
  eyebrow: string;
  title: string;
  children: ReactNode;
  /** Buttons or links. */
  actions: ReactNode;
};

/** Shared layout for not-found and error screens, in the site's visual language. */
export function StatusPage({ eyebrow, title, children, actions }: StatusPageProps) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-luxury-dark px-4 py-24 font-jost">
      <div className="max-w-xl text-center">
        <p className="mb-6 text-xs font-bold tracking-[0.4em] text-luxury-gold uppercase">
          {eyebrow}
        </p>
        <h1 className="mb-6 font-cormorant text-4xl text-white md:text-5xl">{title}</h1>
        <div aria-hidden="true" className="mx-auto mb-8 h-px w-24 bg-luxury-gold/30" />
        <div className="mb-10 text-sm leading-relaxed font-light text-white/70 md:text-base">
          {children}
        </div>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">{actions}</div>
      </div>
    </div>
  );
}

export const PRIMARY_ACTION =
  'inline-flex items-center justify-center bg-luxury-gold px-10 py-4 text-xs font-bold tracking-widest text-luxury-dark uppercase transition-all hover:bg-gold-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxury-gold';

export const SECONDARY_ACTION =
  'inline-flex items-center justify-center border border-white/30 px-10 py-4 text-xs font-bold tracking-widest text-white uppercase transition-all hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxury-gold';
