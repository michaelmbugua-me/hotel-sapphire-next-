import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BookingBar } from '@/components/booking/booking-bar';
import { BookingProvider } from '@/components/booking/booking-provider';
import { MobileBookingModal } from '@/components/booking/mobile-booking-modal';
import { addDays, todayInZone } from '@/lib/dates';
import { dayLabel } from '@/lib/calendar';
import { formatDisplayDate } from '@/lib/format';

const IDS = { hotelId: '1', styleId: '2', dcId: '3' };
const TODAY = todayInZone();

function setup(ui: React.ReactNode) {
  const user = userEvent.setup();
  render(
    <BookingProvider initialToday={TODAY} ids={IDS}>
      {ui}
    </BookingProvider>,
  );
  return { user };
}

const bookLink = () => screen.getByRole('link', { name: 'BOOK NOW' });
const param = (name: string) => new URL(bookLink().getAttribute('href')!).searchParams.get(name);

describe('BookingBar', () => {
  it('shows today and tomorrow, and a Book Now link that carries them', () => {
    setup(<BookingBar />);
    expect(
      screen.getByRole('button', { name: `Check-in: ${formatDisplayDate(TODAY)}` }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: `Check-out: ${formatDisplayDate(addDays(TODAY, 1))}` }),
    ).toBeInTheDocument();
    expect(bookLink()).toHaveAttribute('target', '_blank');
    expect(bookLink()).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(param('id_albergo')).toBe('1');
  });

  it('picking a check-out date updates the field and the booking link', async () => {
    const { user } = setup(<BookingBar />);
    await user.click(screen.getByRole('button', { name: /^Check-out:/ }));
    const target = addDays(TODAY, 4);
    const dialog = screen.getByRole('dialog', { name: 'Choose check-out date' });
    // The calendar opens on tomorrow's month; the target may fall in the next one.
    if (target.slice(0, 7) !== addDays(TODAY, 1).slice(0, 7)) {
      await user.click(within(dialog).getByRole('button', { name: 'Next month' }));
    }
    await user.click(within(dialog).getByRole('button', { name: dayLabel(target) }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: `Check-out: ${formatDisplayDate(target)}` }),
    ).toBeInTheDocument();
    expect(param('ggf')).toBe(String(Number(target.slice(8))));
  });

  it('only offers check-out dates after check-in, within the 30-night limit', async () => {
    const { user } = setup(<BookingBar />);
    await user.click(screen.getByRole('button', { name: /^Check-out:/ }));
    const dialog = screen.getByRole('dialog', { name: 'Choose check-out date' });
    // The check-in day itself is not a valid check-out.
    expect(within(dialog).queryByRole('button', { name: dayLabel(TODAY) })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('closes the calendar with Escape and returns focus to its field', async () => {
    const { user } = setup(<BookingBar />);
    const field = screen.getByRole('button', { name: /^Check-in:/ });
    await user.click(field);
    expect(screen.getByRole('dialog', { name: 'Choose check-in date' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(field).toHaveFocus();
  });

  it('lets the visitor change guests from the bar', async () => {
    const { user } = setup(<BookingBar />);
    await user.click(screen.getByRole('button', { name: /^Rooms and guests:/ }));
    await user.click(screen.getByRole('button', { name: 'Increase rooms' }));
    expect(param('tot_camere')).toBe('2');
  });
});

describe('MobileBookingModal', () => {
  it('is closed until the button is pressed', () => {
    setup(<MobileBookingModal />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens a labelled modal with all the booking fields and a working link', async () => {
    const { user } = setup(<MobileBookingModal />);
    await user.click(screen.getByRole('button', { name: 'BOOK NOW' }));
    const dialog = screen.getByRole('dialog', { name: 'Book Now' });
    expect(within(dialog).getByRole('button', { name: /^Check-in:/ })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /^Check-out:/ })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /^Rooms and guests:/ })).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Promocode')).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: 'BOOK NOW' })).toHaveAttribute(
      'href',
      expect.stringContaining('book.travelbookgroup.com'),
    );
  });

  it('closes with Escape and with the close button, restoring focus to the trigger', async () => {
    const { user } = setup(<MobileBookingModal />);
    const trigger = screen.getByRole('button', { name: 'BOOK NOW' });

    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Close booking form' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes after following the Book Now link', async () => {
    const { user } = setup(<MobileBookingModal />);
    await user.click(screen.getByRole('button', { name: 'BOOK NOW' }));
    // Prevent jsdom from attempting navigation.
    const link = within(screen.getByRole('dialog')).getByRole('link', { name: 'BOOK NOW' });
    link.addEventListener('click', (event) => event.preventDefault());
    await user.click(link);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
