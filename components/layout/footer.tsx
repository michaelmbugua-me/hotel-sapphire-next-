import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { SOCIAL_ICONS } from '@/components/ui/brand-icons';
import { FEATURED_FACILITIES } from '@/lib/data/facilities';
import { currentYear } from '@/lib/dates';
import { CONTACT, FOOTER_EXPLORE_LINKS, SITE, SOCIAL_LINKS, type SocialId } from '@/lib/site';

// The footer lists all four networks, in this order (the header shows only three).
const SOCIAL_ORDER: readonly SocialId[] = ['facebook', 'tiktok', 'x', 'instagram'];
const FOOTER_SOCIALS = SOCIAL_ORDER.flatMap((id) => SOCIAL_LINKS.filter((link) => link.id === id));

const HEADING = 'text-luxury-gold mb-6 text-[10px] font-bold tracking-[0.25em] uppercase';
const LINK = 'text-xs text-white/60 transition-colors hover:text-white';

export function Footer({ year = currentYear() }: { year?: number }) {
  return (
    <footer className="bg-luxury-footer py-16 font-jost text-white">
      <div className="mx-auto max-w-7xl px-8 lg:px-16">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="flex flex-col gap-6">
            <div className="mb-4">
              <Logo className="h-12" />
            </div>
            <p className="text-xs leading-relaxed text-white/60">{SITE.description}</p>
            <div className="flex items-center gap-4">
              {FOOTER_SOCIALS.map(({ id, label, href }) => {
                const Icon = SOCIAL_ICONS[id];
                return (
                  <a
                    key={id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-white/70 transition-colors hover:text-luxury-gold"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className={HEADING}>Explore</h2>
            <ul className="space-y-3">
              {FOOTER_EXPLORE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={LINK}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={HEADING}>Facilities</h2>
            <ul className="space-y-3">
              {FEATURED_FACILITIES.map((facility) => (
                <li key={facility.name}>
                  <Link href={facility.href} className={LINK}>
                    {facility.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={HEADING}>Contact</h2>
            <div className="space-y-4">
              <p className="text-xs text-white/60">{CONTACT.address}</p>
              <div>
                <p>
                  <a href={CONTACT.phone.tel} className={LINK}>
                    {CONTACT.phone.display}
                  </a>
                </p>
                <p>
                  <a href={CONTACT.email.mailto} className={LINK}>
                    {CONTACT.email.address}
                  </a>
                </p>
              </div>
              <div className="space-y-1">
                {CONTACT.frontDesk.map((line) => (
                  <p key={line} className="text-xs text-white/60">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10" />

        <div className="mt-8">
          <p className="text-[11px] text-white/60">
            © {year} {SITE.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
