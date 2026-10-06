import type { Metadata, Viewport } from 'next';
import { SITE } from '@/lib/site';

/** Root metadata. Routes override `title` (templated) and `description`. */
export function buildRootMetadata(siteUrl: string): Metadata {
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${SITE.name} | ${SITE.tagline}`,
      template: `%s | ${SITE.name}`,
    },
    description: SITE.description,
    applicationName: SITE.name,
    openGraph: {
      type: 'website',
      siteName: SITE.name,
      locale: SITE.locale,
      title: `${SITE.name} | ${SITE.tagline}`,
      description: SITE.description,
    },
    twitter: { card: 'summary' },
  };
}

export const rootViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#060d1f',
};

type PageMetadataInput = {
  /** Page title; the root template appends the site name. Omit for the home page (uses the default). */
  title?: string;
  description: string;
  /** Route path starting with "/", e.g. "/rooms". Used for the canonical URL and Open Graph URL. */
  path: string;
  /** Optional social-share image path under /public. */
  image?: string;
};

/** Per-route metadata: title, description, canonical and Open Graph, resolved against `metadataBase`. */
export function buildPageMetadata({
  title,
  description,
  path,
  image,
}: PageMetadataInput): Metadata {
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      url: path,
      description,
      ...(title ? { title: `${title} | ${SITE.name}` } : {}),
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}
