'use client';
// Client component: holds the selected category filter.

import Image from 'next/image';
import { useState } from 'react';
import { GALLERY_FILTERS, filterGalleryImages, type GalleryFilter } from '@/lib/data/gallery';
import { mosaicTileClass } from '@/lib/gallery-layout';
import type { GalleryImage } from '@/types/gallery';

export function GalleryGrid({ images }: { images: readonly GalleryImage[] }) {
  const [selected, setSelected] = useState<GalleryFilter>('All');
  const visible = filterGalleryImages(images, selected);
  const isAll = selected === 'All';

  return (
    <>
      <div className="mx-auto mb-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          role="group"
          aria-label="Filter photos by category"
          className="flex flex-wrap justify-center gap-x-8 gap-y-4 border border-white/5 bg-luxury-book/50 px-6 py-5 text-[11px] font-bold tracking-[0.2em] uppercase md:gap-x-12"
        >
          {GALLERY_FILTERS.map((filter) => {
            const active = filter === selected;
            return (
              <button
                key={filter}
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(filter)}
                className={`relative py-1 transition-colors duration-300 hover:text-luxury-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-luxury-gold ${
                  active ? 'text-luxury-gold' : 'text-white/60'
                }`}
              >
                {filter}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-0 h-px w-full bg-luxury-gold"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p aria-live="polite" className="sr-only">
          Showing {visible.length} {visible.length === 1 ? 'photo' : 'photos'}
          {isAll ? '' : ` in ${selected}`}
        </p>
        <ul
          className={
            isAll
              ? 'grid grid-cols-1 gap-1 md:grid-cols-3'
              : 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
          }
        >
          {visible.map((image, index) => (
            <li
              key={image.src}
              className={`hover-zoom-wrap relative overflow-hidden rounded-sm ${
                isAll ? mosaicTileClass(index) : 'aspect-[4/3]'
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={index < 3}
                sizes={
                  isAll
                    ? '(min-width: 768px) 33vw, 100vw'
                    : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'
                }
                className="hover-zoom-img object-cover"
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
