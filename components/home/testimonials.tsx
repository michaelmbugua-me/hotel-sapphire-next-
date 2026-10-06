import { Quote, Star } from 'lucide-react';
import { Accent, SectionHeading } from '@/components/ui/section-heading';
import { TESTIMONIALS, testimonialInitial } from '@/lib/data/testimonials';

export function Testimonials() {
  return (
    <section
      aria-labelledby="testimonials-title"
      className="bg-luxury-footer py-32 font-jost text-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="testimonials-title"
          eyebrow="Guest Experiences"
          align="both"
          className="mb-20"
        >
          What Our <Accent>Guests Say</Accent>
        </SectionHeading>

        <ul className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <li
              key={testimonial.name}
              className="relative border border-white/10 bg-luxury-book p-10 transition-all hover:bg-white/10"
            >
              <Quote
                aria-hidden="true"
                className="absolute top-8 right-8 h-9 w-9 text-white/5"
                fill="currentColor"
              />
              <p className="sr-only">Rated {testimonial.rating} out of 5</p>
              <div aria-hidden="true" className="mb-6 flex text-luxury-gold">
                {Array.from({ length: testimonial.rating }, (_, index) => (
                  <Star key={index} className="mr-1 h-2.5 w-2.5" fill="currentColor" />
                ))}
              </div>
              <blockquote className="mb-10 font-cormorant text-[17px] leading-relaxed font-light text-white italic">
                {testimonial.text}
              </blockquote>
              <div className="flex items-center space-x-4 border-t border-white/5 pt-8">
                <div
                  aria-hidden="true"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-b from-cobalt to-azure text-lg font-bold"
                >
                  {testimonialInitial(testimonial)}
                </div>
                <div className="text-left">
                  <p className="font-jost text-xs font-bold tracking-widest uppercase">
                    {testimonial.name}
                  </p>
                  <p className="mt-1 font-jost text-[9px] tracking-widest text-white/60 uppercase">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
