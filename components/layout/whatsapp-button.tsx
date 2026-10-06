import { WhatsAppIcon } from '@/components/ui/brand-icons';
import { CONTACT } from '@/lib/site';

/** Floating click-to-chat button, fixed to the bottom-right of every page. */
export function WhatsAppButton() {
  return (
    <div className="group fixed right-6 bottom-6 z-[9999] md:right-10 md:bottom-10">
      <a
        href={CONTACT.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-3xl text-white shadow-[0_10px_25px_-5px_rgba(37,211,102,0.4)] transition-all duration-300 ease-out hover:scale-110 hover:shadow-[0_15px_30px_-5px_rgba(37,211,102,0.6)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-luxury-gold active:scale-95 md:h-16 md:w-16 md:text-4xl"
      >
        <WhatsAppIcon className="h-[1em] w-[1em]" />
      </a>
      {/* Visual hint only (desktop): the link already has an accessible name. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-full mr-4 hidden -translate-y-1/2 rounded bg-white px-4 py-2 text-[10px] font-bold tracking-[0.2em] whitespace-nowrap text-black uppercase opacity-0 shadow-xl transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 md:block"
      >
        Chat with us
      </span>
    </div>
  );
}
