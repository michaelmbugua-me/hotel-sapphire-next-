import type { ReactNode } from 'react';

/** Vertical rhythm variants taken from the Angular pages (default: most pages; short: amenities; compact: gallery). */
type Spacing = 'default' | 'short' | 'compact';

const SPACING: Record<
  Spacing,
  { wrapper: string; title: string; subtitle: string; divider: string }
> = {
  default: { wrapper: 'pt-12 pb-16', title: 'mb-6', subtitle: 'mb-8', divider: 'mb-12' },
  short: { wrapper: 'pt-12 pb-4', title: 'mb-6', subtitle: 'mb-8', divider: 'mb-8' },
  compact: { wrapper: 'pt-12 pb-8', title: 'mb-4', subtitle: 'mb-6', divider: '' },
};

type PageHeaderProps = {
  /** The page's single <h1>. */
  title: string;
  /** Gold <h2> under the title. */
  subtitle: string;
  spacing?: Spacing;
  /** Rendered below the divider, inside the centred container (intro copy, details). */
  children?: ReactNode;
};

export function PageHeader({ title, subtitle, spacing = 'default', children }: PageHeaderProps) {
  const s = SPACING[spacing];
  return (
    <header className={`mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 ${s.wrapper}`}>
      <h1 className={`font-cormorant text-3xl text-white md:text-5xl ${s.title}`}>{title}</h1>
      <h2
        className={`mx-auto max-w-4xl font-cormorant text-lg leading-tight text-luxury-gold md:text-xl ${s.subtitle}`}
      >
        {subtitle}
      </h2>
      <div className={`mx-auto h-px w-24 bg-luxury-gold/30 ${s.divider}`} />
      {children}
    </header>
  );
}
