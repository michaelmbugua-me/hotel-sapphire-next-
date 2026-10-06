import { expect, test } from '@playwright/test';

test('hero tagline words render at weight 300, as in the Angular app (not a hairline 100)', async ({
  page,
}) => {
  await page.goto('/');
  const word = page.getByRole('listitem').filter({ hasText: /^COMFORT$/ });
  await expect(word).toHaveCSS('font-weight', '300');
});

test('header Book Now keeps white text on the gold button', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const book = page.getByRole('banner').getByRole('link', { name: 'Book Now' }).first();
  await expect(book).toHaveCSS('color', 'rgb(255, 255, 255)');
});
