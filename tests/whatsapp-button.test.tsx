import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';

describe('WhatsAppButton', () => {
  it('is an accessibly named, safe link to the WhatsApp chat', () => {
    render(<WhatsAppButton />);
    const link = screen.getByRole('link', { name: 'Contact us on WhatsApp' });
    expect(link).toHaveAttribute('href', 'https://wa.me/254722206496');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('keeps the decorative tooltip out of the accessibility tree', () => {
    render(<WhatsAppButton />);
    const tooltip = screen.getByText('Chat with us');
    expect(tooltip).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('link', { name: /chat with us/i })).not.toBeInTheDocument();
  });

  it('is fixed to the viewport corner above other layers', () => {
    const { container } = render(<WhatsAppButton />);
    expect(container.firstElementChild).toHaveClass('fixed', 'right-6', 'bottom-6', 'z-[9999]');
  });
});
