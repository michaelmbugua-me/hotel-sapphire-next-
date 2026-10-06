'use client';
// Client component: the layout can't read the current path, and the header needs it to pick its
// variant (transparent on "/", two-row elsewhere) and to mark the active link. It also owns the
// mobile-menu state.

import { Menu, Phone } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { BookNowLink } from '@/components/booking/book-now-link';
import { DesktopNav } from '@/components/layout/desktop-nav';
import { Logo } from '@/components/layout/logo';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { CONTACT, SOCIAL_LINKS } from '@/lib/site';

// The original header shows Facebook, Instagram and TikTok in the top row (not X).
const HEADER_SOCIAL_IDS = new Set(['facebook', 'instagram', 'tiktok']);
const HEADER_SOCIALS = SOCIAL_LINKS.filter((link) => HEADER_SOCIAL_IDS.has(link.id));

type HeaderProps = {
  /** Server-rendered default booking URL. */
  bookingUrl: string;
};

function MenuButton({
  onClick,
  expanded,
  className,
}: {
  onClick: () => void;
  expanded: boolean;
  className: string;
}) {
  return (
    <button
      type="button"
      aria-label="Open menu"
      aria-haspopup="dialog"
      aria-expanded={expanded}
      onClick={onClick}
      className={`text-white transition-colors hover:text-luxury-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-luxury-gold ${className}`}
    >
      <Menu className="h-7 w-7" strokeWidth={1.5} />
    </button>
  );
}

export function Header({ bookingUrl }: HeaderProps) {
  const pathname = usePathname();
  // The menu is "open for a path": navigating changes the path, which closes it without an effect.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const openMenu = () => setMenuPath(pathname);
  const closeMenu = () => setMenuPath(null);

  const isHome = pathname === '/';

  return (
    <header
      className={`z-50 w-full overflow-hidden font-jost ${
        isHome ? 'absolute top-0 right-0 left-0' : 'relative bg-luxury-dark shadow-xl'
      }`}
    >
      {isHome ? (
        <div className="relative z-10 mx-auto flex h-20 max-w-[1400px] items-center justify-between px-4 sm:px-6 md:h-28 lg:px-8">
          <Link href="/" className="shrink-0">
            <Logo className="h-12 md:h-16" eager />
          </Link>

          <DesktopNav
            pathname={pathname}
            variant="home"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 xl:flex"
          />

          <div className="flex shrink-0 items-center gap-4">
            <BookNowLink
              href={bookingUrl}
              className="hidden bg-gold px-6 py-3 font-jost text-[12px] tracking-[0.2em] text-white uppercase transition-all hover:bg-gold-dark hover:brightness-110 md:inline-block md:px-8 md:py-3"
            />
            <MenuButton onClick={openMenu} expanded={menuOpen} className="xl:hidden" />
          </div>
        </div>
      ) : (
        <div className="relative z-10 mx-auto max-w-[1400px] px-4 pt-4 pb-0 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="hidden items-center gap-6 md:flex">
              {HEADER_SOCIALS.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold tracking-[0.2em] text-white uppercase transition-colors hover:text-luxury-gold"
                >
                  {social.label}
                </a>
              ))}
            </div>

            <Link href="/" className="flex items-center">
              <Logo className="h-10 md:h-14" eager />
            </Link>

            <a
              href={CONTACT.phone.tel}
              className="flex items-center gap-2 text-[9px] font-bold tracking-[0.2em] text-white uppercase md:text-[11px]"
            >
              <Phone aria-hidden="true" className="h-3 w-3 text-luxury-gold md:h-4 md:w-4" />
              <span className="whitespace-nowrap">{CONTACT.phone.display}</span>
            </a>
          </div>

          <div className="h-px w-full bg-white/30" />

          <div className="relative flex min-h-[60px] items-center justify-between md:min-h-[80px]">
            <div className="flex items-center py-2 xl:hidden">
              <MenuButton onClick={openMenu} expanded={menuOpen} className="" />
            </div>

            <DesktopNav
              pathname={pathname}
              variant="site"
              className="absolute left-1/2 hidden h-full -translate-x-1/2 items-center gap-6 xl:flex"
            />

            <div className="ml-auto flex items-center py-2">
              <BookNowLink
                href={bookingUrl}
                className="bg-luxury-gold px-5 py-3 text-[10px] font-bold tracking-[0.2em] whitespace-nowrap text-white uppercase transition-all hover:bg-gold-dark md:px-10 md:py-4 md:text-[13px]"
              />
            </div>
          </div>
        </div>
      )}

      <MobileMenu open={menuOpen} onClose={closeMenu} bookingUrl={bookingUrl} />
    </header>
  );
}
