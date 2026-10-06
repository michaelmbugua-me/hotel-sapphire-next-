import type { Metadata } from 'next';
import { GalleryGrid } from '@/components/gallery/gallery-grid';
import { PageHeader } from '@/components/ui/page-header';
import { GALLERY_IMAGES } from '@/lib/data/gallery';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Gallery',
  description:
    'Photos of Hotel Sapphire in Mombasa: rooms and suites, dining, the pool, spa and gym, and our meeting and event spaces.',
  path: '/gallery',
  image: '/image/gallery/one.webp',
});

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-luxury-dark pb-24 font-jost">
      <PageHeader
        title="Gallery"
        subtitle="Explore Our Stunning Coastal Property"
        spacing="compact"
      />
      <GalleryGrid images={GALLERY_IMAGES} />
    </div>
  );
}
