import Link from 'next/link';
import { isActiveLink } from '@/lib/nav';
import { NAV_LINKS } from '@/lib/site';

type DesktopNavProps = {
  pathname: string;
  /** `home`: transparent header over the hero. `site`: header on every other page. */
  variant: 'home' | 'site';
  className: string;
};

const LINK_BASE = 'text-[11px] uppercase tracking-[0.2em]';

const VARIANTS = {
  home: {
    link: `${LINK_BASE} font-semibold transition-colors hover:text-white`,
    idle: 'text-white/80',
    active: 'text-luxury-gold',
  },
  site: {
    link: `${LINK_BASE} flex h-full items-center px-2 font-bold whitespace-nowrap transition-all hover:text-luxury-gold`,
    idle: 'text-white',
    active: 'border-luxury-gold text-luxury-gold border-b-2',
  },
} as const;

export function DesktopNav({ pathname, variant, className }: DesktopNavProps) {
  const styles = VARIANTS[variant];
  return (
    <nav aria-label="Primary" className={className}>
      {NAV_LINKS.map((link) => {
        const active = isActiveLink(pathname, link.href);
        // The original's home header says "Events"; the other header spells out "Meetings & Events".
        const label = variant === 'site' ? (link.fullLabel ?? link.label) : link.label;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? 'page' : undefined}
            className={`${styles.link} ${active ? styles.active : styles.idle}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
