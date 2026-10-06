import { expect, test } from '@playwright/test';

test('footer shows contact details and the WhatsApp button stays pinned to the viewport', async ({
  page,
}) => {
  await page.goto('/');
  const footer = page.getByRole('contentinfo');
  await footer.scrollIntoViewIfNeeded();
  await expect(footer.getByRole('link', { name: '(+254) 722 206 496' })).toBeVisible();
  await expect(footer.getByRole('link', { name: 'Gallery' })).toHaveAttribute('href', '/gallery');

  const whatsapp = page.getByRole('link', { name: 'Contact us on WhatsApp' });
  await expect(whatsapp).toBeInViewport();
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(whatsapp).toBeInViewport();
});
