import Image from 'next/image';
import Link from 'next/link';
import { Accent, SectionHeading } from '@/components/ui/section-heading';
import { VISUAL_JOURNEY } from '@/lib/data/home';

export function VisualJourney() {
  return (
    <section aria-labelledby="journey-title" className="bg-luxury-dark py-32 font-jost text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="journey-title"
          eyebrow="A Visual Journey"
          align="both"
          className="mb-20"
        >
          Inside Hotel <Accent>Sapphire</Accent>
        </SectionHeading>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="grid h-[800px] grid-cols-1 gap-4 md:grid-cols-4">
          {VISUAL_JOURNEY.map((tile) => (
            <li key={tile.src} className={`${tile.span} min-h-0`}>
              <Link href="/gallery" className="hover-zoom-wrap block h-full cursor-pointer">
                <Image
                  src={tile.src}
                  alt={tile.alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="hover-zoom-img"
                />
                <span className="sr-only">View the gallery</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
