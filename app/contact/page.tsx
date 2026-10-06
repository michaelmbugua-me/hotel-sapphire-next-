import { Mail, MapPin, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import type { ComponentType } from 'react';
import { ContactForm } from '@/components/contact/contact-form';
import { PageHeader } from '@/components/ui/page-header';
import { getPublicEnv } from '@/lib/env';
import { buildPageMetadata } from '@/lib/seo';
import { CONTACT } from '@/lib/site';

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact Us',
  description:
    'Contact Hotel Sapphire in Mombasa for room reservations, event planning and dining enquiries. Call, email or send us a message.',
  path: '/contact',
});

const DETAILS: ReadonlyArray<{
  label: string;
  value: string;
  href?: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { label: 'Address', value: CONTACT.address, icon: MapPin },
  { label: 'Phone', value: CONTACT.phone.display, href: CONTACT.phone.tel, icon: Phone },
  {
    label: 'Email',
    value: CONTACT.email.address,
    href: CONTACT.email.mailto,
    icon: Mail,
  },
];

export default function ContactPage() {
  const { NEXT_PUBLIC_TURNSTILE_SITE_KEY } = getPublicEnv();

  return (
    <div className="min-h-screen bg-luxury-dark pb-24 font-jost">
      <PageHeader title="Contact Us" subtitle="We're Here To Help You With Any Questions">
        <p className="mx-auto max-w-4xl text-sm leading-relaxed font-light text-white/70 md:text-base">
          We&apos;re here to help you with any questions about your stay, event planning, or dining
          reservations. Reach out to us through any of our channels and we&apos;ll be happy to
          assist you in any way possible.
        </p>
      </PageHeader>

      <section className="bg-luxury-dark py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            <div className="space-y-12">
              <div>
                <h2 className="mb-8 font-cormorant text-2xl text-white">Contact Information</h2>
                <p className="mb-8 leading-relaxed font-light text-white/70">
                  Reach out to us through any of the channels below.
                </p>
              </div>

              <ul className="space-y-8">
                {DETAILS.map(({ label, value, href, icon: Icon }) => (
                  <li key={label} className="flex items-start">
                    <div
                      aria-hidden="true"
                      className="mr-6 rounded-full border border-white/5 bg-luxury-book p-4 shadow-2xl"
                    >
                      <Icon className="h-5 w-5 text-luxury-gold" />
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] font-bold tracking-widest text-luxury-gold uppercase">
                        {label}
                      </p>
                      <p className="font-light text-white/70">
                        {href ? (
                          <a href={href} className="transition-colors hover:text-white">
                            {value}
                          </a>
                        ) : (
                          value
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-sm border border-white/5 bg-luxury-book p-10 shadow-2xl md:p-16">
              <h2 className="mb-8 text-center font-cormorant text-2xl font-bold tracking-widest text-white uppercase">
                Send Us A Message
              </h2>
              <ContactForm siteKey={NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
