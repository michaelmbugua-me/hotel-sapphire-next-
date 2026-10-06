import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import AmenitiesPage from '@/app/amenities/page';
import DiningPage from '@/app/dining/page';
import EventsPage from '@/app/events/page';
import GalleryPage from '@/app/gallery/page';
import RoomsPage from '@/app/rooms/page';
import RoomPage, {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
} from '@/app/rooms/[slug]/page';
import { GalleryGrid } from '@/components/gallery/gallery-grid';
import { GALLERY_IMAGES } from '@/lib/data/gallery';
import { getRooms } from '@/lib/data/rooms';
import { mosaicTileClass } from '@/lib/gallery-layout';

const slug = (value: string) => ({ params: Promise.resolve({ slug: value }) });

describe('rooms list', () => {
  it('lists Deluxe, Deluxe Twin and Executive, and leaves the Standard Room off as the original does', async () => {
    render(await RoomsPage());
    expect(screen.getByRole('heading', { level: 1, name: 'Our Rooms' })).toBeInTheDocument();
    const names = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(names).toEqual([
      'Explore Our Rooms In Mombasa',
      'Deluxe Room',
      'Deluxe Twin Room',
      'Executive Room',
    ]);
  });

  it('links each room to its detail page and offers Book Now; slider art is hidden from assistive tech', async () => {
    const { container } = render(await RoomsPage());
    expect(
      screen.getByRole('link', { name: 'Read more about the Deluxe Twin Room' }),
    ).toHaveAttribute('href', '/rooms/deluxe-twin-room');
    expect(screen.getAllByRole('link', { name: 'Book Now' })).toHaveLength(3);
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(3);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('room detail', () => {
  it('pre-renders exactly the known rooms and 404s anything else', async () => {
    expect(dynamicParams).toBe(false);
    const params = await generateStaticParams();
    const rooms = await getRooms();
    expect(params.map((p) => p.slug)).toEqual(rooms.map((r) => r.slug));
  });

  it('renders name, description, formatted price, facilities and booking link', async () => {
    render(await RoomPage(slug('executive-room')));
    expect(screen.getByRole('heading', { level: 1, name: 'Executive Room' })).toBeInTheDocument();
    expect(screen.getByText(/Ksh\s19,000/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Facilities' })).toBeInTheDocument();
    expect(screen.getByText('King-size bed')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Book Now' })).toHaveAttribute('target', '_blank');
  });

  it('steps to the previous and next room, wrapping at both ends', async () => {
    const { unmount } = render(await RoomPage(slug('deluxe-room')));
    const nav = screen.getByRole('navigation', { name: 'Room navigation' });
    expect(within(nav).getByRole('link', { name: /PREVIOUS/ })).toHaveAttribute(
      'href',
      '/rooms/executive-room',
    );
    expect(within(nav).getByRole('link', { name: /NEXT/ })).toHaveAttribute(
      'href',
      '/rooms/standard-room',
    );
    expect(within(nav).getByRole('link', { name: /BACK TO THE LIST/ })).toHaveAttribute(
      'href',
      '/rooms',
    );
    unmount();
  });

  it('throws notFound for an unknown slug', async () => {
    await expect(RoomPage(slug('penthouse'))).rejects.toThrow();
  });

  it('builds metadata from the room, and none for an unknown one', async () => {
    const meta = await generateMetadata(slug('standard-room'));
    expect(meta.title).toBe('Standard Room');
    expect(meta.alternates?.canonical).toBe('/rooms/standard-room');
    expect(await generateMetadata(slug('penthouse'))).toEqual({});
  });
});

describe('dining, events and amenities', () => {
  it('dining shows both restaurants, each with a reservation link', () => {
    render(<DiningPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Dining At Hotel Sapphire' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Tsavorite Restaurant' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Mehfil Indian Restaurant' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Make Reservation' })).toHaveLength(2);
  });

  it('events renders the capacity chart as an accessible table, with "-" where a layout is not offered', () => {
    render(<EventsPage />);
    const table = screen.getByRole('table', { name: /capacity/i });
    expect(within(table).getAllByRole('columnheader')).toHaveLength(4);
    const almasi = within(table).getByRole('row', { name: /Almasi/ });
    expect(
      within(almasi)
        .getAllByRole('cell')
        .map((c) => c.textContent),
    ).toEqual(['-', '200pax', '250pax']);
  });

  it('amenities lists all six', () => {
    render(<AmenitiesPage />);
    expect(
      screen.getAllByRole('heading', { level: 2 }).filter((h) => h.className.includes('text-2xl')),
    ).toHaveLength(6);
    expect(screen.getByText('Secure Parking')).toBeInTheDocument();
  });
});

describe('gallery', () => {
  it('shows all 17 photos at first', () => {
    render(<GalleryPage />);
    expect(screen.getAllByRole('img')).toHaveLength(17);
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('filters by category, marks the active filter and announces the count', async () => {
    const user = userEvent.setup();
    render(<GalleryGrid images={GALLERY_IMAGES} />);
    await user.click(screen.getByRole('button', { name: 'Rooms' }));
    expect(screen.getAllByRole('img').map((img) => img.getAttribute('alt'))).toEqual([
      'Bedroom',
      'Suite',
      'Deluxe Room',
      'Executive Suite',
    ]);
    expect(screen.getByRole('button', { name: 'Rooms' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Showing 4 photos in Rooms')).toBeInTheDocument();
  });

  it('shows an empty-safe message when no photos match', () => {
    render(<GalleryGrid images={[]} />);
    expect(screen.queryAllByRole('img')).toHaveLength(0);
    expect(screen.getByText('Showing 0 photos')).toBeInTheDocument();
  });

  it('mosaic has a tile class for every original image and a safe fallback', () => {
    expect(mosaicTileClass(0)).toContain('md:col-span-2');
    expect(mosaicTileClass(6)).toContain('md:aspect-[1/2]');
    expect(mosaicTileClass(99)).toBe('aspect-[4/3]');
  });
});
