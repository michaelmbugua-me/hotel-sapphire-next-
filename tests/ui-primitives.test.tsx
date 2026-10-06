import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SOCIAL_ICONS, WhatsAppIcon, XIcon } from '@/components/ui/brand-icons';
import { FacilityIcon } from '@/components/ui/facility-icon';
import { PageHeader } from '@/components/ui/page-header';
import { Accent, SectionHeading } from '@/components/ui/section-heading';
import { FEATURED_FACILITIES } from '@/lib/data/facilities';
import { SOCIAL_LINKS } from '@/lib/site';

describe('brand icons', () => {
  it('render a decorative, currentColor SVG that accepts className', () => {
    const { container } = render(<XIcon className="h-5 w-5" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('fill', 'currentColor');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveClass('h-5', 'w-5');
    expect(svg?.querySelector('path')?.getAttribute('d')).toMatch(/^M/);
  });

  it('let a caller override aria-hidden', () => {
    const { container } = render(
      <WhatsAppIcon aria-hidden="false" role="img" aria-label="WhatsApp" />,
    );
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'false');
    expect(screen.getByRole('img', { name: 'WhatsApp' })).toBeInTheDocument();
  });

  it('cover every social link in site.ts, each with a distinct glyph', () => {
    const paths = SOCIAL_LINKS.map(({ id }) => {
      const Icon = SOCIAL_ICONS[id];
      const { container, unmount } = render(<Icon />);
      const d = container.querySelector('path')?.getAttribute('d');
      unmount();
      return d;
    });
    expect(paths.every(Boolean)).toBe(true);
    expect(new Set(paths).size).toBe(SOCIAL_LINKS.length);
  });

  it('leave the accessible name to the surrounding link', () => {
    render(
      <a href="https://example.com" aria-label="Facebook">
        <SOCIAL_ICONS.facebook />
      </a>,
    );
    expect(screen.getByRole('link', { name: 'Facebook' })).toBeInTheDocument();
  });
});

describe('FacilityIcon', () => {
  it('renders an SVG for every icon key used by the featured facilities', () => {
    for (const { icon } of FEATURED_FACILITIES) {
      const { container, unmount } = render(<FacilityIcon name={icon} className="h-4 w-4" />);
      expect(container.querySelector('svg')).toHaveClass('h-4', 'w-4');
      unmount();
    }
  });

  it('is hidden from assistive tech by default', () => {
    const { container } = render(<FacilityIcon name="pool" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('PageHeader', () => {
  it('renders one h1, the gold h2 subtitle and children', () => {
    render(
      <PageHeader title="Our Rooms" subtitle="Explore Our Rooms In Mombasa">
        <p>Intro copy</p>
      </PageHeader>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Our Rooms' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Explore Our Rooms In Mombasa' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Intro copy')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it.each([
    ['default', 'pb-16', 'mb-12'],
    ['short', 'pb-4', 'mb-8'],
    ['compact', 'pb-8', undefined],
  ] as const)('applies the %s spacing variant', (spacing, wrapperClass, dividerClass) => {
    const { container } = render(<PageHeader title="T" subtitle="S" spacing={spacing} />);
    expect(container.querySelector('header')).toHaveClass(wrapperClass);
    const divider = container.querySelector('div');
    if (dividerClass) expect(divider).toHaveClass(dividerClass);
    else expect(divider?.className).not.toMatch(/\bmb-/);
  });

  it('renders without children', () => {
    const { container } = render(<PageHeader title="Gallery" subtitle="Explore" />);
    expect(container.querySelector('header')?.children).toHaveLength(3);
  });
});

describe('SectionHeading', () => {
  it('renders the eyebrow and an h2 with an italic gold accent', () => {
    render(
      <SectionHeading eyebrow="World-Class Amenities">
        Our <Accent>Facilities</Accent>
      </SectionHeading>,
    );
    expect(screen.getByText('World-Class Amenities')).toBeInTheDocument();
    const heading = screen.getByRole('heading', { level: 2, name: 'Our Facilities' });
    expect(heading).toHaveClass('text-6xl', 'font-cormorant');
    expect(screen.getByText('Facilities')).toHaveClass('italic', 'text-luxury-gold');
  });

  it('supports the large size, wrapper spacing and extra title classes', () => {
    const { container } = render(
      <SectionHeading
        eyebrow="Our Story"
        size="lg"
        className="mb-20"
        titleClassName="leading-tight"
      >
        Title
      </SectionHeading>,
    );
    expect(container.firstElementChild).toHaveClass('mb-20');
    expect(screen.getByRole('heading', { level: 2 })).toHaveClass('text-5xl', 'leading-tight');
    expect(screen.getByRole('heading', { level: 2 })).not.toHaveClass('text-6xl');
  });
});
