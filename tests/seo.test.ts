import { describe, expect, it } from 'vitest';
import { buildRootMetadata, rootViewport } from '@/lib/seo';

describe('buildRootMetadata', () => {
  const metadata = buildRootMetadata('https://hotelsapphire.example');

  it('sets metadataBase from the site URL so relative metadata URLs resolve', () => {
    expect(String(metadata.metadataBase)).toBe('https://hotelsapphire.example/');
  });

  it('uses a default title and a template for child routes', () => {
    expect(metadata.title).toEqual({
      default: 'Hotel Sapphire | Urban Retreat In Mombasa City',
      template: '%s | Hotel Sapphire',
    });
  });

  it('declares Open Graph basics', () => {
    expect(metadata.openGraph).toMatchObject({
      type: 'website',
      siteName: 'Hotel Sapphire',
      locale: 'en_KE',
    });
    expect(metadata.description).toContain('Mombasa');
  });

  it('throws on an invalid site URL instead of emitting broken metadata', () => {
    expect(() => buildRootMetadata('not a url')).toThrowError(TypeError);
  });
});

describe('rootViewport', () => {
  it('matches the dark theme colour', () => {
    expect(rootViewport.themeColor).toBe('#060d1f');
  });
});
