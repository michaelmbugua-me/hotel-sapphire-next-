import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useModalFocus } from '@/lib/hooks/use-modal-focus';

function Harness({ onClose, withButtons = true }: { onClose: () => void; withButtons?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useModalFocus<HTMLDivElement>(open, () => {
    onClose();
    setOpen(false);
  });
  return (
    <>
      <button onClick={() => setOpen(true)}>trigger</button>
      <button>outside</button>
      {open && (
        <div ref={ref} role="dialog" tabIndex={-1} aria-label="test dialog">
          {withButtons && (
            <>
              <button>first</button>
              <button>last</button>
            </>
          )}
        </div>
      )}
    </>
  );
}

describe('useModalFocus', () => {
  it('moves focus in on open, locks scroll, and restores both on close', async () => {
    const user = userEvent.setup();
    render(<Harness onClose={() => {}} />);
    await user.click(screen.getByText('trigger'));
    expect(screen.getByText('first')).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('trigger')).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
  });

  it('calls onClose on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    await user.click(screen.getByText('trigger'));
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('wraps Tab from the last control to the first and Shift+Tab from the first to the last', async () => {
    const user = userEvent.setup();
    render(<Harness onClose={() => {}} />);
    await user.click(screen.getByText('trigger'));

    await user.tab();
    expect(screen.getByText('last')).toHaveFocus();
    await user.tab();
    expect(screen.getByText('first')).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByText('last')).toHaveFocus();
  });

  it('keeps focus on the container when it has nothing focusable', async () => {
    const user = userEvent.setup();
    render(<Harness onClose={() => {}} withButtons={false} />);
    await user.click(screen.getByText('trigger'));
    expect(screen.getByRole('dialog')).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('dialog')).toHaveFocus();
  });

  it('pulls focus back in if it somehow ended up outside', async () => {
    const user = userEvent.setup();
    render(<Harness onClose={() => {}} />);
    await user.click(screen.getByText('trigger'));
    screen.getByText('outside').focus();
    await user.tab();
    expect(screen.getByText('first')).toHaveFocus();
  });
});
