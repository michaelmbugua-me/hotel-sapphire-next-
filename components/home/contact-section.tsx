import { ArrowRight, Globe, Mail, Phone } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { BookNowLink } from '@/components/booking/book-now-link';
import { WhatsAppIcon } from '@/components/ui/brand-icons';
import { Accent } from '@/components/ui/section-heading';
import { CONTACT } from '@/lib/site';

type ContactCardProps = {
  href: string;
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  /** Tailwind `group-hover:` background for the icon tile and text colour for the arrow. */
  hoverTile: string;
  hoverArrow: string;
  external?: boolean;
};

function ContactCard({
  href,
  label,
  value,
  icon: Icon,
  hoverTile,
  hoverArrow,
  external,
}: ContactCardProps) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group flex cursor-pointer items-center border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10"
    >
      <div
        aria-hidden="true"
        className={`mr-6 flex h-12 w-12 items-center justify-center bg-white/10 transition-colors ${hoverTile}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-grow">
        <div className="mb-1 text-[8px] font-bold tracking-widest text-white/60 uppercase">
          {label}
        </div>
        <div className="text-sm font-bold tracking-wider text-white/90">{value}</div>
      </div>
      <ArrowRight
        aria-hidden="true"
        className={`h-2.5 w-2.5 text-white/20 transition-colors ${hoverArrow}`}
      />
    </a>
  );
}

const FIELD =
  'w-full border border-white/10 bg-white/5 px-6 py-4 text-sm transition-colors focus:border-luxury-gold focus:outline-none';
const LABEL = 'text-[8px] font-bold tracking-[0.2em] text-white/50 uppercase';

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      {children}
    </div>
  );
}

const ROOM_OPTIONS = ['Select room', 'Deluxe Room', 'Suite Room', 'Standard Room'] as const;
const GUEST_OPTIONS = ['1 Guest', '2 Guests', '3+ Guests'] as const;

/**
 * "Get In Touch" column and the "Book Your Room" card. As in the original, the card's fields are
 * not connected to anything (a known quirk of the Angular site, ported 1:1): "CONFIRM RESERVATION"
 * simply opens the booking engine with the shared booking state. It is a group, not a <form>, so
 * pressing Enter can't reload the page.
 */
export function ContactSection({ bookingUrl }: { bookingUrl: string }) {
  return (
    <section
      aria-labelledby="contact-title"
      className="relative overflow-hidden bg-luxury-dark py-32 font-jost text-white"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-20 lg:grid-cols-2">
          <div className="space-y-12">
            <div>
              <div className="mb-6 flex items-center space-x-4">
                <div aria-hidden="true" className="h-px w-12 bg-luxury-gold" />
                <span className="text-xs font-bold tracking-[0.4em] text-luxury-gold uppercase">
                  Get In Touch
                </span>
              </div>
              <h2 id="contact-title" className="font-cormorant text-6xl leading-tight">
                Reserve Your <br />
                <Accent>Perfect Stay</Accent>
              </h2>
              <p className="mt-8 max-w-md font-light text-white/60">
                Ready to experience the finest hospitality in Mombasa? Contact our reservations team
                directly or fill in the form — we reply within the hour.
              </p>
            </div>

            <div className="space-y-4">
              <ContactCard
                href={CONTACT.secondaryPhone.tel}
                label="Phone"
                value={CONTACT.secondaryPhone.display}
                icon={Phone}
                hoverTile="group-hover:bg-luxury-gold"
                hoverArrow="group-hover:text-luxury-gold"
              />
              <ContactCard
                href={CONTACT.email.mailto}
                label="Email"
                value={CONTACT.email.address}
                icon={Mail}
                hoverTile="group-hover:bg-luxury-gold"
                hoverArrow="group-hover:text-luxury-gold"
              />
              <ContactCard
                href={CONTACT.whatsappUrl}
                label="WhatsApp"
                value="Book Instantly on WhatsApp"
                icon={WhatsAppIcon}
                hoverTile="group-hover:bg-green-500"
                hoverArrow="group-hover:text-green-500"
                external
              />
              <ContactCard
                href={CONTACT.website.url}
                label="Website"
                value={CONTACT.website.display}
                icon={Globe}
                hoverTile="group-hover:bg-sapphire-teal"
                hoverArrow="group-hover:text-sapphire-teal"
                external
              />
            </div>
          </div>

          <div
            role="group"
            aria-labelledby="book-room-title"
            className="relative overflow-hidden border border-white/10 bg-luxury-book p-12 backdrop-blur-md"
          >
            <h3 id="book-room-title" className="mb-4 font-cormorant text-4xl">
              Book Your Room
            </h3>
            <p className="mb-10 text-xs font-light text-white/60">
              Fill in your details and we&apos;ll confirm your reservation
            </p>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field id="home-name" label="Full Name">
                  <input id="home-name" type="text" placeholder="John Doe" className={FIELD} />
                </Field>
                <Field id="home-email" label="Email">
                  <input
                    id="home-email"
                    type="email"
                    placeholder="john@email.com"
                    className={FIELD}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field id="home-check-in" label="Check In">
                  <input id="home-check-in" type="date" className={`${FIELD} scheme-dark`} />
                </Field>
                <Field id="home-check-out" label="Check Out">
                  <input id="home-check-out" type="date" className={`${FIELD} scheme-dark`} />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field id="home-room-type" label="Room Type">
                  <select id="home-room-type" className={`${FIELD} appearance-none`}>
                    {ROOM_OPTIONS.map((option) => (
                      <option key={option} className="bg-luxury-dark">
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field id="home-guests" label="Guests">
                  <select
                    id="home-guests"
                    defaultValue="2 Guests"
                    className={`${FIELD} appearance-none`}
                  >
                    {GUEST_OPTIONS.map((option) => (
                      <option key={option} className="bg-luxury-dark">
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <BookNowLink
                href={bookingUrl}
                className="flex w-full items-center justify-center bg-luxury-gold py-5 text-[10px] font-bold tracking-[0.2em] text-luxury-dark uppercase transition-all hover:bg-gold-dark"
              >
                CONFIRM RESERVATION <ArrowRight aria-hidden="true" className="ml-3 h-4 w-4" />
              </BookNowLink>

              <div className="my-6 flex items-center">
                <div aria-hidden="true" className="h-px flex-grow bg-white/10" />
                <span className="px-4 text-[8px] font-bold tracking-widest text-white/50 uppercase">
                  or book instantly via
                </span>
                <div aria-hidden="true" className="h-px flex-grow bg-white/10" />
              </div>

              <a
                href={CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center bg-green-500 py-5 text-[10px] font-bold tracking-[0.2em] text-white uppercase transition-all hover:bg-green-600"
              >
                <WhatsAppIcon className="mr-3 h-5 w-5" /> BOOK VIA WHATSAPP
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
