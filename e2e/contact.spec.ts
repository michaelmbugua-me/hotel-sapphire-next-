import { expect, test, type Page } from '@playwright/test';

/** Replaces Cloudflare's script with a stub that "solves" the challenge immediately and deterministically. */
async function stubTurnstile(page: Page) {
  await page.route('https://challenges.cloudflare.com/**', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: `window.turnstile = {
        render(el, o) { setTimeout(() => o.callback('stub-token'), 0); return 'w1'; },
        reset() {}, remove() {}
      };`,
    }),
  );
}

async function fillForm(page: Page) {
  await page.getByLabel('Your Name').fill('Jane Doe');
  await page.getByLabel('Email Address').fill('jane@example.com');
  await page.getByLabel('Subject').fill('Booking');
  await page.getByLabel('Your Message').fill('Do you have rooms next weekend?');
}

test('submitting a valid message posts to the API and shows success', async ({ page }) => {
  await stubTurnstile(page);
  let payload: Record<string, unknown> | undefined;
  await page.route('**/api/contact', async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Thank you! Your message has been sent.' }),
    });
  });

  await page.goto('/contact');
  await fillForm(page);
  await page.getByRole('button', { name: 'Send Message' }).click();

  await expect(page.getByRole('status')).toContainText('Your message has been sent');
  expect(payload).toMatchObject({
    name: 'Jane Doe',
    email: 'jane@example.com',
    website: '',
    turnstileToken: 'stub-token',
  });
});

test('empty submit shows field errors and does not call the API', async ({ page }) => {
  await stubTurnstile(page);
  let called = false;
  await page.route('**/api/contact', (route) => {
    called = true;
    return route.abort();
  });

  await page.goto('/contact');
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByText('Name is required')).toBeVisible();
  await expect(page.getByLabel('Your Name')).toBeFocused();
  expect(called).toBe(false);
});

test('a server rejection is shown to the visitor and the typed text is kept', async ({ page }) => {
  await stubTurnstile(page);
  await page.route('**/api/contact', (route) =>
    route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({ success: false, message: 'Too many messages. Please wait.' }),
    }),
  );
  await page.goto('/contact');
  await fillForm(page);
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Too many messages' })).toBeVisible();
  await expect(page.getByLabel('Your Name')).toHaveValue('Jane Doe');
});

test('the real route handler rejects an invalid body with the { success, message } shape', async ({
  request,
}) => {
  const response = await request.post('/api/contact', { data: { name: '' } });
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ success: false, message: expect.any(String) });
});

test('the real route handler rejects a missing Turnstile token', async ({ request }) => {
  const response = await request.post('/api/contact', {
    data: { name: 'A', email: 'a@b.co', subject: 's', message: 'm' },
  });
  expect(response.status()).toBe(400);
});

test('the real route handler silently accepts a honeypot hit without needing Turnstile', async ({
  request,
}) => {
  const response = await request.post('/api/contact', {
    data: {
      name: 'Bot',
      email: 'bot@spam.co',
      subject: 's',
      message: 'm',
      website: 'http://spam',
      turnstileToken: 'x',
    },
  });
  expect(response.status()).toBe(200);
  expect((await response.json()).success).toBe(true);
});

test('the contact API refuses GET', async ({ request }) => {
  expect((await request.get('/api/contact')).status()).toBe(405);
});
