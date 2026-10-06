import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Marquee } from '@/components/ui/marquee';
import { TICKER_ITEMS } from '@/lib/data/ticker';

const renderMarquee = () => render(<Marquee items={TICKER_ITEMS} label="Hotel highlights" />);
const track = (container: HTMLElement) => container.querySelector<HTMLElement>('.animate-marquee')!;

describe('TICKER_ITEMS', () => {
  it('has the six original entries, unique and non-empty', () => {
    expect(TICKER_ITEMS).toHaveLength(6);
    expect(new Set(TICKER_ITEMS).size).toBe(6);
    expect(TICKER_ITEMS.every((item) => item.trim().length > 0)).toBe(true);
  });
});

describe('Marquee', () => {
  it('is a labelled region that exposes each item to assistive tech exactly once', () => {
    renderMarquee();
    const region = screen.getByRole('region', { name: 'Hotel highlights' });
    const items = within(region).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual(TICKER_ITEMS);
  });

  it('renders four copies for the seamless loop, three of them aria-hidden', () => {
    const { container } = renderMarquee();
    const lists = container.querySelectorAll('ul');
    expect(lists).toHaveLength(4);
    expect(lists[0]).not.toHaveAttribute('aria-hidden');
    expect([...lists].slice(1).every((list) => list.getAttribute('aria-hidden') === 'true')).toBe(
      true,
    );
  });

  it('runs by default and has a visible Pause control', () => {
    const { container } = renderMarquee();
    expect(track(container).style.animationPlayState).toBe('');
    expect(screen.getByRole('button', { name: 'Pause ticker' })).toBeVisible();
  });

  it('pauses and resumes from the button, updating its name', async () => {
    const user = userEvent.setup();
    const { container } = renderMarquee();

    await user.click(screen.getByRole('button', { name: 'Pause ticker' }));
    expect(track(container).style.animationPlayState).toBe('paused');
    expect(screen.getByRole('button', { name: 'Play ticker' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pause ticker' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Play ticker' }));
    expect(track(container).style.animationPlayState).toBe('');
    expect(screen.getByRole('button', { name: 'Pause ticker' })).toBeInTheDocument();
  });

  it('can be operated from the keyboard', async () => {
    const user = userEvent.setup();
    const { container } = renderMarquee();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Pause ticker' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(track(container).style.animationPlayState).toBe('paused');
  });

  it('declares the reduced-motion fallbacks (no animation, no duplicate copies, no control)', () => {
    const { container } = renderMarquee();
    expect(track(container)).toHaveClass('motion-reduce:animate-none');
    const lists = [...container.querySelectorAll('ul')];
    expect(lists.slice(1).every((list) => list.classList.contains('motion-reduce:hidden'))).toBe(
      true,
    );
    expect(screen.getByRole('button', { name: 'Pause ticker' }).parentElement).toHaveClass(
      'motion-reduce:hidden',
    );
  });

  it('renders an empty region without crashing when given no items', () => {
    render(<Marquee items={[]} label="Empty" />);
    expect(screen.getByRole('region', { name: 'Empty' })).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
