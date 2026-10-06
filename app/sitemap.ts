import type { MetadataRoute } from 'next';
import { getRooms } from '@/lib/data/rooms';
import { getPublicEnv } from '@/lib/env';
import { NAV_LINKS } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getPublicEnv().NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  const rooms = await getRooms();

  return [
    ...NAV_LINKS.map((link) => ({
      url: `${base}${link.href === '/' ? '' : link.href}`,
      changeFrequency: 'monthly' as const,
      priority: link.href === '/' ? 1 : 0.8,
    })),
    ...rooms.map((room) => ({
      url: `${base}/rooms/${room.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
