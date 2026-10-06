import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Footer } from '@/components/layout/footer';
import { FEATURED_FACILITIES } from '@/lib/data/facilities';
import { FOOTER_EXPLORE_LINKS, NAV_LINKS } from '@/lib/site';

describe('Footer', () => {
  it('is the page-level contentinfo landmark with the logo and description', () => {
    render(<Footer year={2026} />);
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByRole('img', { name: 'Hotel Sapphire' })).toBeInTheDocument();
    expect(footer).toHaveTextContent(
      'Urban retreat in Mombasa city. Luxury rooms, Onyx Fitness Gym, Aura Wellness Spa, Pool, fine dining and premier events.',
    );
  });

  it('shows the four social links in the original order as safe external links with names', () => {
    render(<Footer year={2026} />);
    const footer = screen.getByRole('contentinfo');
    const socials = ['Facebook', 'TikTok', 'X', 'Instagram'].map((name) =>
      within(footer).getByRole('link', { name }),
    );
    for (const link of socials) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      expect(link.getAttribute('href')).toMatch(/^https:\/\//);
    }
    // Document order matches the original footer: Facebook, TikTok, X, Instagram.
    const order = socials.map((link) => link.compareDocumentPosition(socials[0]!));
    expect(order.slice(1).every((position) => position & Node.DOCUMENT_POSITION_PRECEDING)).toBe(
      true,
    );
  });

  it('lists the Explore links without the dead "About Us" entry', () => {
    render(<Footer year={2026} />);
    const explore = screen.getByRole('heading', { level: 2, name: 'Explore' }).parentElement!;
    expect(
      within(explore)
        .getAllByRole('link')
        .map((a) => a.textContent),
    ).toEqual(['Rooms & Suites', 'Facilities', 'Gallery', 'Reservations']);
    expect(screen.queryByRole('link', { name: /about/i })).not.toBeInTheDocument();
  });

  it('lists the five facilities with their routes', () => {
    render(<Footer year={2026} />);
    const column = screen.getByRole('heading', { level: 2, name: 'Facilities' }).parentElement!;
    const links = within(column).getAllByRole('link');
    expect(links.map((a) => a.textContent)).toEqual(FEATURED_FACILITIES.map((f) => f.name));
    expect(links.map((a) => a.getAttribute('href'))).toEqual(
      FEATURED_FACILITIES.map((f) => f.href),
    );
  });

  it('never links to a route that does not exist', () => {
    render(<Footer year={2026} />);
    const routes = new Set(NAV_LINKS.map((link) => link.href));
    const internal = within(screen.getByRole('contentinfo'))
      .getAllByRole('link')
      .map((a) => a.getAttribute('href') ?? '')
      .filter((href) => href.startsWith('/'));
    expect(internal.length).toBeGreaterThan(0);
    expect(internal.filter((href) => !routes.has(href))).toEqual([]);
    expect(FOOTER_EXPLORE_LINKS.every((link) => routes.has(link.href))).toBe(true);
  });

  it('shows contact details as actionable links plus the front-desk lines', () => {
    render(<Footer year={2026} />);
    expect(screen.getByRole('link', { name: '(+254) 722 206 496' })).toHaveAttribute(
      'href',
      'tel:+254722206496',
    );
    expect(screen.getByRole('link', { name: 'reservations@hotelsapphire.co.ke' })).toHaveAttribute(
      'href',
      'mailto:reservations@hotelsapphire.co.ke',
    );
    expect(screen.getByText('Mombasa Town, Kenya')).toBeInTheDocument();
    for (const line of ['24/7 Front Desk', 'Check-in: 2:00 PM', 'Check-out: 11:00 AM']) {
      expect(screen.getByText(line)).toBeInTheDocument();
    }
  });

  it('prints the copyright year it is given', () => {
    render(<Footer year={2031} />);
    expect(screen.getByText('© 2031 Hotel Sapphire. All rights reserved.')).toBeInTheDocument();
  });

  it('defaults the year to the current hotel-time year', () => {
    render(<Footer />);
    expect(
      screen.getByText(/^© \d{4} Hotel Sapphire\. All rights reserved\.$/),
    ).toBeInTheDocument();
  });
});
