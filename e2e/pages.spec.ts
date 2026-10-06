import { expect, test } from '@playwright/test';

const PAGES = [
  { path: '/rooms', h1: 'Our Rooms' },
  { path: '/rooms/deluxe-room', h1: 'Deluxe Room' },
  { path: '/rooms/standard-room', h1: 'Standard Room' },
  { path: '/dining', h1: 'Dining At Hotel Sapphire' },
  { path: '/events', h1: 'Meeting And Events In Mombasa' },
  { path: '/amenities', h1: 'Amenities' },
  { path: '/gallery', h1: 'Gallery' },
] as const;

for (const { path, h1 } of PAGES) {
  test(`${path}: renders its heading, has a title and hydrates without errors`, async ({
    page,
  }) => {
    const problems: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') problems.push(message.text());
    });
    page.on('pageerror', (error) => problems.push(error.message));

    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1, name: h1 })).toBeVisible();
    await expect(page).toHaveTitle(/Hotel Sapphire/);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);

    // Open and close the mobile-menu-free interaction that proves hydration: the header Book Now.
    await expect(page.getByRole('link', { name: 'Book Now' }).first()).toHaveAttribute(
      'href',
      /travelbookgroup/,
    );
    expect(problems).toEqual([]);
  });
}

test('an unknown room is a real 404, not a silent fallback', async ({ page }) => {
  const response = await page.goto('/rooms/penthouse');
  expect(response?.status()).toBe(404);
});

test('rooms list links through to a room and the detail page steps to the next room', async ({
  page,
}) => {
  await page.goto('/rooms');
  await page.getByRole('link', { name: 'Read more about the Deluxe Twin Room' }).click();
  await expect(page).toHaveURL(/\/rooms\/deluxe-twin-room$/);
  await page.getByRole('link', { name: /NEXT/ }).click();
  await expect(page).toHaveURL(/\/rooms\/executive-room$/);
  await expect(page.getByText('Ksh 19,000')).toBeVisible();
});

test('gallery filter narrows the photos and marks the active tab', async ({ page }) => {
  await page.goto('/gallery');
  const main = page.locator('main');
  await expect(main.getByRole('img')).toHaveCount(17);
  await main.getByRole('button', { name: 'Dining' }).click();
  await expect(main.getByRole('img')).toHaveCount(2);
  await expect(main.getByRole('button', { name: 'Dining' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('events capacity chart is a real table', async ({ page }) => {
  await page.goto('/events');
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('row', { name: /Almasi/ })).toContainText('250pax');
});
