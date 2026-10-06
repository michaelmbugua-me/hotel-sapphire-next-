import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AnchorHTMLAttributes } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from '@/components/layout/header';

const router = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => router.pathname }));
// next/link needs the app-router context for navigation; a plain anchor is enough for unit tests
// (real navigation is covered by the Playwright suite).
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    onClick,
    ...rest
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault(); // jsdom can't navigate
        onClick?.(event);
      }}
      {...rest}
    >
      {children}
    </a>
  ),
}));

const BOOKING_URL = 'https://book.travelbookgroup.com/premium/index2.html?x=1';

function renderHeader() {
  return render(<Header bookingUrl={BOOKING_URL} />);
}

const primaryNav = () => screen.getByRole('navigation', { name: 'Primary' });

beforeEach(() => {
  router.pathname = '/';
});

describe('Header: home variant', () => {
  it('is a transparent, absolutely positioned single row without socials or phone', () => {
    renderHeader();
    expect(screen.getByRole('banner')).toHaveClass('absolute');
    expect(screen.queryByRole('link', { name: 'Facebook' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /722 206 496/ })).not.toBeInTheDocument();
  });

  it('labels the events link "Events"', () => {
    renderHeader();
    expect(within(primaryNav()).getByRole('link', { name: 'Events' })).toHaveAttribute(
      'href',
      '/events',
    );
    expect(
      within(primaryNav()).queryByRole('link', { name: 'Meetings & Events' }),
    ).not.toBeInTheDocument();
  });

  it('lists the seven primary links in order', () => {
    renderHeader();
    expect(
      within(primaryNav())
        .getAllByRole('link')
        .map((a) => a.textContent),
    ).toEqual(['Home', 'Rooms', 'Dining', 'Events', 'Amenities', 'Gallery', 'Contact']);
  });

  it('marks Home as the current page', () => {
    renderHeader();
    expect(within(primaryNav()).getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});

describe('Header: site variant', () => {
  beforeEach(() => {
    router.pathname = '/dining';
  });

  it('is a relative, solid header', () => {
    renderHeader();
    expect(screen.getByRole('banner')).toHaveClass('relative', 'bg-luxury-dark');
  });

  it('shows Facebook, Instagram and TikTok (not X) as safe external links', () => {
    renderHeader();
    for (const name of ['Facebook', 'Instagram', 'TikTok']) {
      const link = screen.getByRole('link', { name });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
    }
    expect(screen.queryByRole('link', { name: 'X' })).not.toBeInTheDocument();
  });

  it('shows the phone number as a tel: link', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: '(+254) 722 206 496' })).toHaveAttribute(
      'href',
      'tel:+254722206496',
    );
  });

  it('spells out "Meetings & Events"', () => {
    renderHeader();
    expect(
      within(primaryNav()).getByRole('link', { name: 'Meetings & Events' }),
    ).toBeInTheDocument();
  });
});

describe('Header: active link', () => {
  it('highlights a section for its subtree but only marks the exact page as current', () => {
    router.pathname = '/rooms/deluxe-room';
    renderHeader();
    const rooms = within(primaryNav()).getByRole('link', { name: 'Rooms' });
    expect(rooms).toHaveClass('text-luxury-gold');
    expect(rooms).not.toHaveAttribute('aria-current');
    expect(within(primaryNav()).getByRole('link', { name: 'Home' })).not.toHaveClass(
      'text-luxury-gold',
    );
  });

  it('marks the exact page as current', () => {
    router.pathname = '/rooms';
    renderHeader();
    expect(within(primaryNav()).getByRole('link', { name: 'Rooms' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});

describe('Header: Book Now', () => {
  it('opens the booking engine in a new tab without leaking the opener', () => {
    renderHeader();
    const link = screen.getByRole('link', { name: 'Book Now' });
    expect(link).toHaveAttribute('href', BOOKING_URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });
});

describe('Header: mobile menu', () => {
  it('is closed by default', () => {
    renderHeader();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('opens as a labelled modal dialog with focus on the close button', async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    const dialog = screen.getByRole('dialog', { name: 'Site menu' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(within(dialog).getByRole('button', { name: 'Close menu' })).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('lists every link (spelling out Meetings & Events) plus Book Now', async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    const mobileNav = within(screen.getByRole('dialog')).getByRole('navigation', {
      name: 'Mobile',
    });
    expect(
      within(mobileNav)
        .getAllByRole('link')
        .map((a) => a.textContent),
    ).toEqual(['Home', 'Rooms', 'Dining', 'Meetings & Events', 'Amenities', 'Gallery', 'Contact']);
    expect(
      within(screen.getByRole('dialog')).getByRole('link', { name: 'Book Now' }),
    ).toHaveAttribute('href', BOOKING_URL);
  });

  it('closes on Escape, restores focus to the menu button and unlocks scrolling', async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
  });

  it('closes via the close button and via a menu link', async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('link', { name: 'Gallery' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes when the route changes while it is open', async () => {
    const user = userEvent.setup();
    const { rerender } = renderHeader();
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    router.pathname = '/gallery';
    rerender(<Header bookingUrl={BOOKING_URL} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('traps Tab inside the dialog in both directions', async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    const dialog = screen.getByRole('dialog');
    const close = within(dialog).getByRole('button', { name: 'Close menu' });
    const bookNow = within(dialog).getByRole('link', { name: 'Book Now' });

    await user.tab({ shift: true });
    expect(bookNow).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
  });
});
