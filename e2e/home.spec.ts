import { expect, test } from '@playwright/test';

test.describe('home: desktop booking bar', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('changing guests and the check-out date updates the Book Now link', async ({ page }) => {
    await page.goto('/');
    const bar = page.getByRole('search', { name: 'Make a reservation' });
    await expect(bar).toBeVisible();

    await bar.getByRole('button', { name: /^Rooms and guests:/ }).click();
    await page.getByRole('button', { name: 'Increase rooms' }).click();
    await page.getByRole('button', { name: 'Increase children' }).click();

    const href = await bar.getByRole('link', { name: 'BOOK NOW' }).getAttribute('href');
    const params = new URL(href!).searchParams;
    expect(params.get('tot_camere')).toBe('2');
    expect(params.get('tot_bambini')).toBe('1');
  });

  test('the calendar opens, keyboard-selects a later check-out and closes', async ({ page }) => {
    await page.goto('/');
    const bar = page.getByRole('search', { name: 'Make a reservation' });
    const checkOut = bar.getByRole('button', { name: /^Check-out:/ });
    const before = await checkOut.getAttribute('aria-label');

    await checkOut.click();
    const dialog = page.getByRole('dialog', { name: 'Choose check-out date' });
    await expect(dialog).toBeVisible();
    // Focus lands in the grid; arrow right then Enter picks the following day.
    await dialog.locator('button[data-date][tabindex="0"]').focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');

    await expect(dialog).toBeHidden();
    expect(await checkOut.getAttribute('aria-label')).not.toBe(before);
  });

  test('Book Now opens the external booking engine in a new tab', async ({ page, context }) => {
    await page.goto('/');
    const bar = page.getByRole('search', { name: 'Make a reservation' });
    const link = bar.getByRole('link', { name: 'BOOK NOW' });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('href', /^https:\/\/book\.travelbookgroup\.com\//);
    expect(context.pages()).toHaveLength(1);
  });
});

test.describe('home: mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('shows a Book Now button instead of the bar and opens the booking sheet', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('search', { name: 'Make a reservation' })).toBeHidden();

    await page.getByRole('button', { name: 'BOOK NOW' }).click();
    const dialog = page.getByRole('dialog', { name: 'Book Now' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: /^Check-in:/ })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('has no horizontal scroll', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test('every home section is present, in order', async ({ page }) => {
  await page.goto('/');
  const headings = await page.locator('main').getByRole('heading', { level: 2 }).allTextContents();
  expect(headings.map((text) => text.replace(/\s+/g, ' ').trim())).toEqual([
    'Where Every Stay Becomes a Memory',
    'Our Rooms & Suites',
    'Our Facilities',
    'Inside Hotel Sapphire',
    'What Our Guests Say',
    'Reserve Your Perfect Stay',
  ]);
});

test('visual journey images load and have a real size', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const tiles = page.locator('section[aria-labelledby="journey-title"] img');
  await tiles.first().scrollIntoViewIfNeeded();
  await expect(tiles).toHaveCount(5);
  for (let i = 0; i < 5; i += 1) {
    await tiles.nth(i).scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        tiles.nth(i).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
      )
      .toBe(true);
    const box = await tiles.nth(i).boundingBox();
    expect(box!.height).toBeGreaterThan(100);
  }
});
