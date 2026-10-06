import { renderToStaticMarkup } from 'react-dom/server';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

// next/font only works inside the Next compiler, so the fonts module is replaced in unit tests.
vi.mock('@/app/fonts', () => ({ fontVariables: 'font-a font-b' }));
vi.mock('next/navigation', () => ({ usePathname: () => '/' }));

describe('RootLayout', () => {
  beforeAll(() => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://hotelsapphire.example');
    vi.stubEnv('NEXT_PUBLIC_BOOKING_HOTEL_ID', '1');
    vi.stubEnv('NEXT_PUBLIC_BOOKING_STYLE_ID', '2');
    vi.stubEnv('NEXT_PUBLIC_BOOKING_DC_ID', '3');
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'key');
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it('renders an English document with font variables, a skip link and a labelled main landmark', async () => {
    const { default: RootLayout } = await import('@/app/layout');
    const html = renderToStaticMarkup(
      <RootLayout>
        <p>page content</p>
      </RootLayout>,
    );

    expect(html).toContain('<html lang="en" class="font-a font-b">');
    expect(html).toContain('href="#main-content"');
    expect(html).toContain('<header');
    expect(html).toContain('<footer');
    expect(html).toContain('aria-label="Contact us on WhatsApp"');
    // Server-rendered booking link, so "Book Now" works without JavaScript.
    expect(html).toMatch(
      /href="https:\/\/book\.travelbookgroup\.com\/premium\/index2\.html\?[^"]*id_albergo=1/,
    );
    expect(html).toMatch(/<main id="main-content"[^>]*><p>page content<\/p><\/main>/);
    // The skip link must be the first focusable element in the body.
    expect(html.indexOf('href="#main-content"')).toBeLessThan(html.indexOf('<main'));
    // Landmark order: header, main, footer.
    expect(html.indexOf('<header')).toBeLessThan(html.indexOf('<main'));
    expect(html.indexOf('<main')).toBeLessThan(html.indexOf('<footer'));
  });

  it('exports metadata built from the configured site URL', async () => {
    const { metadata } = await import('@/app/layout');
    expect(String(metadata.metadataBase)).toBe('https://hotelsapphire.example/');
  });
});
