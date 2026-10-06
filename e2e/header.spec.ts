import { expect, test } from '@playwright/test';

test.describe('header: desktop', () => {
  test('home shows the transparent header with Home marked current', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: 'Events', exact: true })).toBeVisible();
  });

  test('other pages switch to the two-row header with socials and phone', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'Contact' })
      .click();
    await expect(page).toHaveURL(/\/contact$/);
    const header = page.getByRole('banner');
    await expect(header.getByRole('link', { name: 'Facebook' })).toBeVisible();
    await expect(header.getByRole('link', { name: '(+254) 722 206 496' })).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Primary' })
        .getByRole('link', { name: 'Meetings & Events' }),
    ).toBeVisible();
  });

  test('the logo is served as a small optimized WebP, not the 4096px original', async ({
    page,
  }) => {
    const logoResponse = page.waitForResponse(
      (r) => r.url().includes('/_next/image') && r.url().includes('logo'),
    );
    await page.goto('/');
    const response = await logoResponse;
    expect(response.headers()['content-type']).toBe('image/webp');
    const body = await response.body();
    expect(body.byteLength).toBeLessThan(40_000);
  });
});

test.describe('header: mobile menu', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens, traps focus, closes with Escape, and navigates', async ({ page }) => {
    await page.goto('/');
    const open = page.getByRole('button', { name: 'Open menu' });
    await open.click();

    const dialog = page.getByRole('dialog', { name: 'Site menu' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Close menu' })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(open).toBeFocused();

    await open.click();
    await dialog.getByRole('link', { name: 'Gallery' }).click();
    await expect(page).toHaveURL(/\/gallery$/);
    await expect(dialog).toBeHidden();
  });
});

test.describe('header: without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('Book Now is a working server-rendered link to the booking engine', async ({ page }) => {
    await page.goto('/');
    const href = await page.getByRole('link', { name: 'Book Now' }).first().getAttribute('href');
    const url = new URL(href ?? '');
    expect(url.origin + url.pathname).toBe('https://book.travelbookgroup.com/premium/index2.html');
    expect(url.searchParams.get('id_albergo')).toBe('26609');
    expect(url.searchParams.get('tot_adulti')).toBe('2');
    expect(url.searchParams.get('aa')).toMatch(/^20\d{2}$/);
  });
});

test('the white logo has no background box (transparent PNG must not get a filled placeholder)', async ({
  page,
}) => {
  await page.goto('/');
  const logo = page.getByRole('banner').getByRole('img', { name: 'Hotel Sapphire' }).first();
  await expect(logo).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});
