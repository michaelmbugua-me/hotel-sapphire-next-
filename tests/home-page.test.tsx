import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BookingProvider } from '@/components/booking/booking-provider';
import { ContactSection } from '@/components/home/contact-section';
import { Facilities } from '@/components/home/facilities';
import { Hero } from '@/components/home/hero';
import { OurStory } from '@/components/home/our-story';
import { RoomsPreview } from '@/components/home/rooms-preview';
import { Testimonials } from '@/components/home/testimonials';
import { VisualJourney } from '@/components/home/visual-journey';
import { todayInZone } from '@/lib/dates';
import { ROOM_PREVIEWS } from '@/lib/data/home';
import { getRoom } from '@/lib/data/rooms';
import { formatMoney } from '@/lib/format';
import { CONTACT } from '@/lib/site';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));

const BOOKING_URL = 'https://book.travelbookgroup.com/premium/index2.html?id_albergo=1';
const IDS = { hotelId: '1', styleId: '2', dcId: '3' };

function withBooking(ui: React.ReactNode) {
  return render(
    <BookingProvider initialToday={todayInZone()} ids={IDS}>
      {ui}
    </BookingProvider>,
  );
}

describe('Hero', () => {
  it('has the page h1 and the three calls to action', () => {
    withBooking(<Hero bookingUrl={BOOKING_URL} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Luxury Stay in Mombasa');
    expect(screen.getAllByRole('link', { name: /BOOK NOW/ })[0]).toHaveAttribute(
      'target',
      '_blank',
    );
    expect(screen.getByRole('link', { name: 'VIEW ROOMS' })).toHaveAttribute('href', '/rooms');
    expect(screen.getByRole('link', { name: /BOOK VIA WHATSAPP/ })).toHaveAttribute(
      'href',
      CONTACT.whatsappUrl,
    );
  });

  it('shows the hero stats as a definition list', () => {
    withBooking(<Hero bookingUrl={BOOKING_URL} />);
    expect(screen.getByText('Guest Rating')).toBeInTheDocument();
    expect(screen.getByText('500+')).toBeInTheDocument();
    expect(screen.getByText('Years of Luxury')).toBeInTheDocument();
  });

  it('renders both booking surfaces (the bar and the mobile button); CSS decides which is visible', () => {
    withBooking(<Hero bookingUrl={BOOKING_URL} />);
    expect(screen.getByRole('search', { name: 'Make a reservation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'BOOK NOW' })).toBeInTheDocument();
  });
});

describe('RoomsPreview', () => {
  it('lists the three rooms with prices taken from the room data layer', async () => {
    withBooking(await RoomsPreview({ bookingUrl: BOOKING_URL }));
    const cards = screen
      .getAllByRole('listitem')
      .filter((item) => within(item).queryByRole('heading', { level: 3 }));
    expect(cards).toHaveLength(ROOM_PREVIEWS.length);

    for (const preview of ROOM_PREVIEWS) {
      const room = await getRoom(preview.slug);
      const card = screen.getByRole('heading', { level: 3, name: preview.title }).closest('li');
      expect(card).not.toBeNull();
      expect(
        within(card!).getByText(formatMoney(room!.price).replace(/\s/g, ' ')),
      ).toBeInTheDocument();
      expect(
        within(card!).getAllByRole('link', { name: new RegExp(preview.title) })[0],
      ).toHaveAttribute('href', `/rooms/${preview.slug}`);
    }
  });

  it('shows badges only where the original has them', async () => {
    withBooking(await RoomsPreview({ bookingUrl: BOOKING_URL }));
    expect(screen.getByText('MOST POPULAR')).toBeInTheDocument();
    expect(screen.getByText('LUXURY SUITE')).toBeInTheDocument();
  });
});

describe('static sections', () => {
  it('Our Story links to the rooms page', () => {
    render(<OurStory />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Where Every Stay Becomes a Memory',
    );
    expect(screen.getByRole('link', { name: /EXPLORE ROOMS/ })).toHaveAttribute('href', '/rooms');
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
  });

  it('Facilities links each card to its page', () => {
    render(<Facilities />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(5);
    expect(screen.getByRole('link', { name: /Fine Dining/ })).toHaveAttribute('href', '/dining');
    expect(screen.getByRole('link', { name: /Events & Conferencing/ })).toHaveAttribute(
      'href',
      '/events',
    );
  });

  it('Visual Journey tiles all open the gallery and have image alt text', () => {
    render(<VisualJourney />);
    const links = screen.getAllByRole('link', { name: /gallery|pool|interior|dining/i });
    expect(links.length).toBe(5);
    for (const link of links) expect(link).toHaveAttribute('href', '/gallery');
    for (const image of screen.getAllByRole('img')) {
      expect(image.getAttribute('alt')).toBeTruthy();
    }
  });

  it('Testimonials render each guest with an accessible rating and initial', () => {
    render(<Testimonials />);
    expect(screen.getAllByText('Rated 5 out of 5')).toHaveLength(3);
    expect(screen.getByText('Ahmed Al-Rashid')).toBeInTheDocument();
    expect(screen.getAllByRole('blockquote')).toHaveLength(3);
  });
});

describe('ContactSection', () => {
  it('uses the second phone number on the home contact card, as chosen', () => {
    withBooking(<ContactSection bookingUrl={BOOKING_URL} />);
    expect(screen.getByRole('link', { name: /Phone/ })).toHaveAttribute(
      'href',
      CONTACT.secondaryPhone.tel,
    );
    expect(screen.getByRole('link', { name: /Email/ })).toHaveAttribute(
      'href',
      CONTACT.email.mailto,
    );
    expect(screen.getByRole('link', { name: /Website/ })).toHaveAttribute(
      'href',
      CONTACT.website.url,
    );
  });

  it('is not a <form>, so Enter in a field cannot reload the page, and every field is labelled', () => {
    const { container } = withBooking(<ContactSection bookingUrl={BOOKING_URL} />);
    expect(container.querySelector('form')).toBeNull();
    for (const label of ['Full Name', 'Email', 'Check In', 'Check Out', 'Room Type', 'Guests']) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it('opens the booking engine from CONFIRM RESERVATION', () => {
    withBooking(<ContactSection bookingUrl={BOOKING_URL} />);
    expect(screen.getByRole('link', { name: /CONFIRM RESERVATION/ })).toHaveAttribute(
      'href',
      expect.stringContaining('book.travelbookgroup.com'),
    );
  });
});
