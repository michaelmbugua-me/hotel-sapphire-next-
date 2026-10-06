import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { PageHeader } from '@/components/ui/page-header';
import { CAPACITY_CHART } from '@/lib/data/pages';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Meetings & Events',
  description:
    'Host meetings, conferences, weddings and parties at Hotel Sapphire in Mombasa. See our meeting rooms and their capacities.',
  path: '/events',
  image: '/image/events/events_one.webp',
});

const seats = (value: number | null) => (value === null ? '-' : `${value}pax`);

const HEAD_CELL =
  'p-4 text-center font-cormorant text-[10px] font-normal tracking-widest text-luxury-gold uppercase';

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-luxury-dark pb-24 font-jost">
      <PageHeader
        title="Meeting And Events In Mombasa"
        subtitle="Explore Our Meeting & Conference Rooms"
      >
        <p className="mx-auto mb-12 max-w-4xl text-sm leading-relaxed font-light text-white/70 md:text-base">
          Hotel Sapphire understands the evolving needs of the corporate world, multinational
          companies, and individuals seeking unique and fresh alternatives for their events and
          meetings. Our conferencing facilities are designed to provide a pristine and serene
          environment, perfect for your next corporate gathering. Whether you&apos;re hosting a
          formal party, celebrating a birthday, organizing a corporate event, planning an
          end-of-year party, or launching a new product, our private set-up ensures a tailored
          experience to meet your specific requirements. The ambiance of our conferencing facilities
          provides the ideal backdrop for successful and memorable events.
        </p>

        <div className="relative mx-auto max-w-5xl">
          <div className="hover-zoom-wrap relative mb-4 aspect-[16/9] rounded-sm shadow-lg">
            <Image
              src="/image/events/events_one.webp"
              alt="Meeting Room"
              fill
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="hover-zoom-img"
            />
          </div>
          {/* Decorative, as in the original: there is one photo and no gallery behind these. */}
          <div
            aria-hidden="true"
            className="flex items-center justify-end space-x-4 text-sm text-luxury-gold"
          >
            <div className="flex items-center space-x-4">
              <ChevronLeft className="h-4 w-4" />
              <span className="text-[10px]">1 / 4</span>
              <ChevronRight className="h-4 w-4" />
            </div>
            <Expand className="h-4 w-4" />
          </div>
        </div>
      </PageHeader>

      <section
        aria-labelledby="capacity-title"
        className="mx-auto mt-12 max-w-5xl px-4 sm:px-6 lg:px-8"
      >
        <h2
          id="capacity-title"
          className="mb-6 font-cormorant text-xl tracking-widest text-luxury-gold uppercase"
        >
          Capacity Chart
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <caption className="sr-only">Meeting room capacity by seating layout</caption>
            <thead>
              <tr className="border border-white/10 bg-luxury-book">
                <th scope="col" className="p-4 text-left">
                  <span className="sr-only">Room</span>
                </th>
                <th scope="col" className={HEAD_CELL}>
                  U shape style
                </th>
                <th scope="col" className={HEAD_CELL}>
                  Classroom style
                </th>
                <th scope="col" className={HEAD_CELL}>
                  Theater style
                </th>
              </tr>
            </thead>
            <tbody className="text-center">
              {CAPACITY_CHART.map((row, index) => (
                <tr
                  key={row.room}
                  className={`border-t border-white/5 ${index % 2 === 1 ? 'bg-white/5' : ''}`}
                >
                  <th scope="row" className="p-6 text-left font-sans font-medium text-white/90">
                    {row.room}
                  </th>
                  <td className="p-6 font-light text-white/60">{seats(row.uShape)}</td>
                  <td className="p-6 font-light text-white/60">{seats(row.classroom)}</td>
                  <td className="p-6 font-light text-white/60">{seats(row.theater)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
