import type { ReactNode } from 'react';

/** The gold, italic emphasis used inside section titles: `Our <Accent>Facilities</Accent>`. */
export function Accent({ children }: { children: ReactNode }) {
  return <span className="font-light text-luxury-gold italic">{children}</span>;
}

type SectionHeadingProps = {
  /** Small uppercase label beside the gold rule. */
  eyebrow: string;
  /** Title content; wrap emphasised words in <Accent>. */
  children: ReactNode;
  size?: 'xl' | 'lg';
  /** Extra classes for the wrapper, typically spacing such as `mb-20`. */
  className?: string;
  /** Extra non-conflicting classes for the <h2>, e.g. `leading-tight`. */
  titleClassName?: string;
  /**
   * Where the gold rules sit: `before` (left-aligned, the default), `both` (centred, rule each side)
   * or `after` (centred, rule after the label only).
   */
  align?: 'before' | 'both' | 'after';
  /** Id for the <h2>, so a section can reference it with `aria-labelledby`. */
  id?: string;
};

const SIZE = { xl: 'text-6xl', lg: 'text-5xl' } as const;

const Rule = () => <div aria-hidden="true" className="h-px w-12 bg-luxury-gold" />;

export function SectionHeading({
  eyebrow,
  children,
  size = 'xl',
  className = '',
  titleClassName = '',
  align = 'before',
  id,
}: SectionHeadingProps) {
  const centred = align !== 'before';
  return (
    <div className={`${centred ? 'text-center' : ''} ${className}`.trim()}>
      <div className={`mb-6 flex items-center space-x-4 ${centred ? 'justify-center' : ''}`.trim()}>
        {align !== 'after' && <Rule />}
        <span className="text-xs font-bold tracking-[0.4em] text-luxury-gold uppercase">
          {eyebrow}
        </span>
        {align === 'both' || align === 'after' ? <Rule /> : null}
      </div>
      <h2 id={id} className={`font-cormorant ${SIZE[size]} ${titleClassName}`.trim()}>
        {children}
      </h2>
    </div>
  );
}
