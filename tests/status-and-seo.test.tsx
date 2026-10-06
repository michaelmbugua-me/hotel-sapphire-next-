import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RootError from '@/app/error';
import GlobalError from '@/app/global-error';
import NotFound, { metadata as notFoundMetadata } from '@/app/not-found';
import robots from '@/app/robots';
import RoomNotFound from '@/app/rooms/[slug]/not-found';
import sitemap from '@/app/sitemap';
import { buildPageMetadata } from '@/lib/seo';
import { SECURITY_HEADERS } from '@/lib/security-headers';

afterEach(() => vi.restoreAllMocks());

describe('not-found pages', () => {
  it('root 404 explains and links home and to rooms, and is not indexed', () => {
    render(<NotFound />);
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'View rooms' })).toHaveAttribute('href', '/rooms');
    // Next adds <meta name="robots" content="noindex"> to not-found responses itself.
    expect(notFoundMetadata.title).toBe('Page not found');
  });

  it('room 404 sends visitors back to the list', () => {
    render(<RoomNotFound />);
    expect(screen.getByRole('link', { name: 'See all rooms' })).toHaveAttribute('href', '/rooms');
  });
});

describe('error boundaries', () => {
  it('shows a friendly message, never the raw error, a reference digest, and retries on demand', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const reset = vi.fn();
    const error = Object.assign(new Error('secret stack detail'), { digest: 'abc123' });
    render(<RootError error={error} reset={reset} />);

    expect(screen.getByRole('heading', { level: 1, name: 'We hit a snag' })).toBeInTheDocument();
    expect(screen.queryByText(/secret stack detail/)).not.toBeInTheDocument();
    expect(screen.getByText('Reference: abc123')).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledWith(error);

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('global error renders its own document shell with a retry', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const reset = vi.fn();
    render(<GlobalError error={new Error('boom')} reset={reset} />, {
      container: document.documentElement,
    });
    await userEvent.click(screen.getByRole('button', { name: 'TRY AGAIN' }));
    expect(reset).toHaveBeenCalled();
  });
});

describe('sitemap and robots', () => {
  it('lists every page and every room with absolute URLs', async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);
    expect(urls).toContain('http://localhost:3000');
    for (const path of ['/rooms', '/dining', '/events', '/amenities', '/gallery', '/contact']) {
      expect(urls).toContain(`http://localhost:3000${path}`);
    }
    expect(urls).toContain('http://localhost:3000/rooms/deluxe-twin-room');
    expect(urls.every((url) => url.startsWith('http://localhost:3000'))).toBe(true);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('robots allow the site, keep the API out and point at the sitemap', () => {
    expect(robots()).toEqual({
      rules: { userAgent: '*', allow: '/', disallow: '/api/' },
      sitemap: 'http://localhost:3000/sitemap.xml',
    });
  });
});

describe('page metadata and headers', () => {
  it('builds canonical and Open Graph data for a page', () => {
    const meta = buildPageMetadata({
      title: 'Gallery',
      description: 'Photos',
      path: '/gallery',
      image: '/image/gallery/one.webp',
    });
    expect(meta.title).toBe('Gallery');
    expect(meta.alternates?.canonical).toBe('/gallery');
    expect(meta.openGraph).toMatchObject({
      url: '/gallery',
      title: 'Gallery | Hotel Sapphire',
      images: [{ url: '/image/gallery/one.webp' }],
    });
  });

  it('omits title and image when not given (home page)', () => {
    const meta = buildPageMetadata({ description: 'd', path: '/' });
    expect(meta).not.toHaveProperty('title');
    expect(meta.openGraph).not.toHaveProperty('images');
  });

  it('sends the baseline security headers', () => {
    const keys = SECURITY_HEADERS.map((header) => header.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        'X-Content-Type-Options',
        'X-Frame-Options',
        'Referrer-Policy',
        'Strict-Transport-Security',
        'Permissions-Policy',
      ]),
    );
    expect(SECURITY_HEADERS.find((h) => h.key === 'X-Frame-Options')?.value).toBe('DENY');
  });
});
