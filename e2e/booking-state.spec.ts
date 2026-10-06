import { expect, test, type Page } from '@playwright/test';

/**
 * Collects uncaught exceptions and console errors.
 *
 * While the site is only partly built, the header's links prefetch routes that do not exist yet and
 * the browser logs "Failed to load resource: 404" for each. Those are filtered out here; once every
 * page exists (end of Phase 4) this filter should be removed so the assertion is strictly "no errors".
 */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().startsWith('Failed to load resource')) {
      errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

const bookNow = (page: Page) =>
  page.getByRole('banner').getByRole('link', { name: 'Book Now' }).first();
const param = async (page: Page, name: string) =>
  new URL((await bookNow(page).getAttribute('href')) ?? '').searchParams.get(name);

/** Resolves once React has hydrated: a client-only interaction (the ticker's pause toggle) works. */
async function waitForHydration(page: Page) {
  await page.getByRole('button', { name: 'Pause ticker' }).click();
  await expect(page.getByRole('button', { name: 'Play ticker' })).toBeVisible();
}

test('hydrates without errors when the booking provider wraps the app', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await waitForHydration(page);
  await page.waitForTimeout(1000); // let post-hydration work and prefetches run
  expect(errors).toEqual([]);
});

test('hydrates cleanly even when the visitor clock disagrees with the server, then follows the clock', async ({
  page,
}) => {
  const errors = collectErrors(page);
  // The server rendered "today" from its own clock; the visitor's clock says a different day.
  await page.clock.setFixedTime(new Date('2026-12-25T09:00:00Z'));
  await page.goto('/');
  await waitForHydration(page);

  await expect.poll(() => param(page, 'mm')).toBe('12');
  expect(await param(page, 'gg')).toBe('25');
  expect(await param(page, 'ggf')).toBe('26');
  await page.waitForTimeout(1000);
  expect(errors).toEqual([]);
});
