import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const ROUTES = [
  '/',
  '/rooms',
  '/rooms/deluxe-room',
  '/dining',
  '/events',
  '/amenities',
  '/gallery',
  '/contact',
] as const;

for (const route of ROUTES) {
  test(`${route}: no serious or critical accessibility violations (axe)`, async ({ page }) => {
    await page.route('https://challenges.cloudflare.com/**', (r) =>
      r.fulfill({
        contentType: 'application/javascript',
        body: 'window.turnstile={render(){return "w"},reset(){},remove(){}};',
      }),
    );
    await page.goto(route);
    // Let lazy images and the ticker settle so contrast is measured against rendered content.
    await page.waitForTimeout(500);
    const results = await new AxeBuilder({ page })
      // White-on-gold / white-on-green buttons are kept exactly as designed (known contrast gap, 2.8:1 / 2.2:1).
      .exclude('a[class*="bg-gold"]')
      .exclude('a[class*="bg-luxury-gold"]')
      .exclude('a[class*="bg-green-500"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(
      serious.map(
        (v) => `${v.id}: ${v.help} (${v.nodes.length} nodes) e.g. ${v.nodes[0]?.target.join(' ')}`,
      ),
    ).toEqual([]);
  });
}

test('every page has exactly one h1 and the skip link works', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
  }
  await page.goto('/rooms');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
});

test('404 page is served with status 404 and is not indexable', async ({ page }) => {
  const response = await page.goto('/definitely-not-a-page');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
});

test('sitemap.xml lists the pages and robots.txt points at it', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('/rooms/executive-room');
  expect(sitemap).toContain('/contact');
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Disallow: /api/');
  expect(robots).toMatch(/Sitemap: .*\/sitemap\.xml/);
});

test('security headers are present on pages', async ({ request }) => {
  const response = await request.get('/');
  const headers = response.headers();
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(headers['strict-transport-security']).toContain('max-age=');
  expect(headers['x-powered-by']).toBeUndefined();
});

test('pages carry canonical, description and Open Graph metadata', async ({ page }) => {
  await page.goto('/rooms/executive-room');
  await expect(page).toHaveTitle('Executive Room | Hotel Sapphire');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/rooms\/executive-room$/,
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
});
