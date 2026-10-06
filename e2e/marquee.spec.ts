import { expect, test, type Page } from '@playwright/test';

const ticker = (page: Page) => page.getByRole('region', { name: 'Hotel highlights' });
const track = (page: Page) => ticker(page).locator('.animate-marquee');
const computed = (page: Page, property: 'animationName' | 'animationPlayState') =>
  track(page).evaluate((element, prop) => getComputedStyle(element)[prop], property);

test.describe('ticker: default motion', () => {
  test('scrolls, and the visible button pauses and resumes it', async ({ page }) => {
    await page.goto('/');
    expect(await computed(page, 'animationName')).toBe('marquee');
    expect(await computed(page, 'animationPlayState')).toBe('running');

    await ticker(page).getByRole('button', { name: 'Pause ticker' }).click();
    expect(await computed(page, 'animationPlayState')).toBe('paused');

    await ticker(page).getByRole('button', { name: 'Play ticker' }).click();
    expect(await computed(page, 'animationPlayState')).toBe('running');
  });

  test('pauses while the pointer is over it and resumes when it leaves', async ({ page }) => {
    await page.goto('/');
    // Hover the (stable) region: the pointer lands on the moving track, which Playwright can't target.
    await ticker(page).hover({ position: { x: 200, y: 20 } });
    expect(await computed(page, 'animationPlayState')).toBe('paused');
    await page.mouse.move(0, 0);
    expect(await computed(page, 'animationPlayState')).toBe('running');
  });
});

test.describe('ticker: prefers-reduced-motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('does not animate, shows each item once, and hides the pointless pause button', async ({
    page,
  }) => {
    await page.goto('/');
    expect(await computed(page, 'animationName')).toBe('none');
    await expect(ticker(page).getByRole('button')).toBeHidden();
    await expect(ticker(page).locator('li:visible')).toHaveCount(6);
    await expect(ticker(page).getByText('LUXURY ROOMS').first()).toBeVisible();
    await expect(ticker(page).getByText('EVENTS & CONFERENCING').first()).toBeVisible();
  });
});
