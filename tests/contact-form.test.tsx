import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ContactPage from '@/app/contact/page';
import { ContactForm } from '@/components/contact/contact-form';

const turnstile = vi.hoisted(() => ({
  state: { token: 'tok-1' as string | null, status: 'ready' as 'loading' | 'ready' | 'failed' },
  reset: vi.fn(),
}));

vi.mock('@/lib/hooks/use-turnstile', () => ({
  useTurnstile: () => ({
    containerRef: { current: null },
    token: turnstile.state.token,
    status: turnstile.state.status,
    reset: turnstile.reset,
  }),
}));

const fetchMock = vi.fn();

beforeEach(() => {
  turnstile.state.token = 'tok-1';
  turnstile.state.status = 'ready';
  turnstile.reset.mockClear();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

const reply = (status: number, body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Your Name'), 'Jane Doe');
  await user.type(screen.getByLabelText('Email Address'), 'jane@example.com');
  await user.type(screen.getByLabelText('Subject'), 'Booking');
  await user.type(screen.getByLabelText('Your Message'), 'Do you have rooms?');
}

describe('ContactForm', () => {
  it('shows a message next to each empty field, focuses the first, and sends nothing', async () => {
    const user = userEvent.setup();
    render(<ContactForm siteKey="k" />);
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Subject is required')).toBeInTheDocument();
    expect(screen.getByText('Message is required')).toBeInTheDocument();
    expect(screen.getByLabelText('Your Name')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Your Name')).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a malformed email', async () => {
    const user = userEvent.setup();
    render(<ContactForm siteKey="k" />);
    await fill(user);
    await user.clear(screen.getByLabelText('Email Address'));
    await user.type(screen.getByLabelText('Email Address'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Send Message' }));
    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('asks for the verification when the Turnstile token is missing', async () => {
    turnstile.state.token = null;
    const user = userEvent.setup();
    render(<ContactForm siteKey="k" />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Send Message' }));
    expect(screen.getByText('Please complete the verification below.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts the fields with the token and honeypot, then shows success and resets the widget', async () => {
    fetchMock.mockReturnValue(reply(200, { success: true, message: 'Thank you! Sent.' }));
    const user = userEvent.setup();
    render(<ContactForm siteKey="k" />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Thank you! Sent.');
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/contact');
    expect(JSON.parse(init.body as string)).toEqual({
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'Booking',
      message: 'Do you have rooms?',
      website: '',
      turnstileToken: 'tok-1',
    });
    expect(turnstile.reset).toHaveBeenCalled();
  });

  it('lets the visitor send another message after success, with a blank form', async () => {
    fetchMock.mockReturnValue(reply(200, { success: true, message: 'Sent' }));
    const user = userEvent.setup();
    render(<ContactForm siteKey="k" />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Send Message' }));
    await user.click(await screen.findByRole('button', { name: 'Send another message' }));
    expect(screen.getByLabelText('Your Name')).toHaveValue('');
  });

  it('disables the form and shows progress while sending, preventing double submits', async () => {
    let finish: (value: Response) => void = () => undefined;
    fetchMock.mockReturnValue(new Promise<Response>((resolve) => (finish = resolve)));
    const user = userEvent.setup();
    render(<ContactForm siteKey="k" />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    const sending = await screen.findByRole('button', { name: /Sending/ });
    expect(sending).toBeDisabled();
    expect(screen.getByLabelText('Your Name')).toBeDisabled();
    finish(new Response(JSON.stringify({ success: true, message: 'ok' })));
    await screen.findByRole('status');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows the server's message on a rejected request and keeps what was typed", async () => {
    fetchMock.mockReturnValue(
      reply(429, { success: false, message: 'Too many messages. Please wait.' }),
    );
    const user = userEvent.setup();
    render(<ContactForm siteKey="k" />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Too many messages. Please wait.');
    expect(screen.getByLabelText('Your Name')).toHaveValue('Jane Doe');
    expect(turnstile.reset).toHaveBeenCalled();
  });

  it('shows a generic message on a network failure or an unreadable reply', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    const user = userEvent.setup();
    render(<ContactForm siteKey="k" />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Send Message' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to send message. Please try again later.',
    );

    fetchMock.mockReturnValueOnce(
      Promise.resolve(new Response('<html>oops</html>', { status: 502 })),
    );
    await user.click(screen.getByRole('button', { name: 'Send Message' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Unable to send message/);
  });

  it('tells the visitor when the verification widget could not load', () => {
    turnstile.state.status = 'failed';
    render(<ContactForm siteKey="k" />);
    expect(screen.getByRole('alert')).toHaveTextContent(/verification could not load/i);
  });

  it('keeps the honeypot out of the accessibility tree and the tab order', () => {
    const { container } = render(<ContactForm siteKey="k" />);
    const honeypot = container.querySelector('input[name="website"]');
    expect(honeypot).toHaveAttribute('tabindex', '-1');
    expect(honeypot?.closest('[aria-hidden="true"]')).not.toBeNull();
  });
});

describe('Contact page', () => {
  it('shows the contact details and the form', () => {
    render(<ContactPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Contact Us' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '(+254) 722 206 496' })).toHaveAttribute(
      'href',
      expect.stringMatching(/^tel:/),
    );
    expect(screen.getByRole('link', { name: /@hotelsapphire/ })).toHaveAttribute(
      'href',
      expect.stringMatching(/^mailto:/),
    );
    expect(screen.getByRole('button', { name: 'Send Message' })).toBeInTheDocument();
  });
});
