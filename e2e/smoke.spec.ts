import { expect, test } from '@playwright/test';

test('home page responds with the hero heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Luxury Stay');
});

test('pages hydrate cleanly: no console errors or uncaught exceptions', async ({ page }) => {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));

  await page.goto('/');
  // A client interaction that only works once hydrated doubles as the "hydration finished" signal.
  // (`networkidle` never settles: the header prefetches routes.)
  await page.getByRole('button', { name: 'Pause ticker' }).click();
  await expect(page.getByRole('button', { name: 'Play ticker' })).toBeVisible();

  expect(problems).toEqual([]);
});
