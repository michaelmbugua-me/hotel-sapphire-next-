import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BookNowLink } from '@/components/booking/book-now-link';
import { BookingProvider } from '@/components/booking/booking-provider';
import { GuestsPicker } from '@/components/booking/guests-picker';
import { todayInZone } from '@/lib/dates';

const IDS = { hotelId: '1', styleId: '2', dcId: '3' };

function setup(variant: 'bar' | 'modal' = 'bar') {
  const user = userEvent.setup();
  render(
    <BookingProvider initialToday={todayInZone()} ids={IDS}>
      <GuestsPicker variant={variant} />
      <BookNowLink href="https://example.com/default" />
      <button>outside</button>
    </BookingProvider>,
  );
  return { user };
}

const trigger = () => screen.getByRole('button', { name: /^Rooms and guests:/ });
const panel = () => screen.getByRole('group', { name: 'Rooms and guests' });
const bookingParam = (name: string) =>
  new URL(screen.getByRole('link', { name: 'Book Now' }).getAttribute('href')!).searchParams.get(
    name,
  );

describe('GuestsPicker', () => {
  it('shows the truthful default summary and starts closed', () => {
    setup();
    expect(trigger()).toHaveTextContent('1 Room, 2 Guests');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('group', { name: 'Rooms and guests' })).not.toBeInTheDocument();
  });

  it('opens a panel with rooms, adults and children steppers', async () => {
    const { user } = setup();
    await user.click(trigger());
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(within(panel()).getByLabelText('Rooms: 1')).toBeInTheDocument();
    expect(within(panel()).getByLabelText('Adults: 2')).toBeInTheDocument();
    expect(within(panel()).getByLabelText('Children: 0')).toBeInTheDocument();
  });

  it('updates the summary and the booking link as counts change', async () => {
    const { user } = setup();
    await user.click(trigger());

    await user.click(screen.getByRole('button', { name: 'Increase adults' }));
    expect(trigger()).toHaveTextContent('1 Room, 3 Guests');
    expect(bookingParam('tot_adulti')).toBe('3');

    await user.click(screen.getByRole('button', { name: 'Increase children' }));
    expect(trigger()).toHaveTextContent('1 Room, 3 Adults, 1 Child');
    expect(bookingParam('tot_bambini')).toBe('1');

    await user.click(screen.getByRole('button', { name: 'Increase rooms' }));
    expect(trigger()).toHaveTextContent('2 Rooms, 3 Adults, 1 Child');
    expect(bookingParam('tot_camere')).toBe('2');
  });

  it('stops at the booking-rule limits and keeps keyboard focus on the button', async () => {
    const { user } = setup();
    await user.click(trigger());

    const decreaseRooms = screen.getByRole('button', { name: 'Decrease rooms' });
    expect(decreaseRooms).toHaveAttribute('aria-disabled', 'true'); // rooms min is 1
    await user.click(decreaseRooms);
    expect(within(panel()).getByLabelText('Rooms: 1')).toBeInTheDocument();

    const increaseRooms = screen.getByRole('button', { name: 'Increase rooms' });
    for (let i = 0; i < 6; i += 1) await user.click(increaseRooms); // more than the max of 5
    expect(within(panel()).getByLabelText('Rooms: 5')).toBeInTheDocument();
    expect(increaseRooms).toHaveAttribute('aria-disabled', 'true');
    expect(bookingParam('tot_camere')).toBe('5');

    increaseRooms.focus();
    await user.keyboard('{Enter}');
    expect(increaseRooms).toHaveFocus();
  });

  it('enforces adults 1–10 and children 0–6', async () => {
    const { user } = setup();
    await user.click(trigger());

    const decreaseAdults = screen.getByRole('button', { name: 'Decrease adults' });
    await user.click(decreaseAdults);
    expect(decreaseAdults).toHaveAttribute('aria-disabled', 'true'); // adults min is 1
    await user.click(decreaseAdults);
    expect(within(panel()).getByLabelText('Adults: 1')).toBeInTheDocument();

    const increaseAdults = screen.getByRole('button', { name: 'Increase adults' });
    for (let i = 0; i < 12; i += 1) await user.click(increaseAdults);
    expect(within(panel()).getByLabelText('Adults: 10')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Decrease children' })).toHaveAttribute(
      'aria-disabled',
      'true',
    ); // children min is 0
    const increaseChildren = screen.getByRole('button', { name: 'Increase children' });
    for (let i = 0; i < 8; i += 1) await user.click(increaseChildren);
    expect(within(panel()).getByLabelText('Children: 6')).toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const { user } = setup();
    await user.click(trigger());
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('group', { name: 'Rooms and guests' })).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it('closes when pressing outside, but not when interacting inside', async () => {
    const { user } = setup();
    await user.click(trigger());
    await user.click(screen.getByRole('button', { name: 'Increase adults' }));
    expect(panel()).toBeInTheDocument();

    await user.click(screen.getByText('outside'));
    expect(screen.queryByRole('group', { name: 'Rooms and guests' })).not.toBeInTheDocument();
  });

  it('toggles closed when the trigger is pressed again', async () => {
    const { user } = setup();
    await user.click(trigger());
    await user.click(trigger());
    expect(screen.queryByRole('group', { name: 'Rooms and guests' })).not.toBeInTheDocument();
  });

  it('renders the modal variant with its own styling', async () => {
    const { user } = setup('modal');
    expect(trigger()).toHaveClass('rounded-lg');
    await user.click(trigger());
    expect(panel()).not.toHaveClass('absolute');
  });
});
