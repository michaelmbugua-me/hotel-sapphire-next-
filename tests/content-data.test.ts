import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { FEATURED_FACILITIES } from '@/lib/data/facilities';
import { GALLERY_FILTERS, GALLERY_IMAGES, filterGalleryImages } from '@/lib/data/gallery';
import { TESTIMONIALS, testimonialInitial } from '@/lib/data/testimonials';
import { featuredFacilitiesSchema, galleryImagesSchema } from '@/lib/schemas/content';
import { CONTACT, NAV_LINKS, SOCIAL_LINKS } from '@/lib/site';

const onDisk = (publicPath: string) => existsSync(path.join(process.cwd(), 'public', publicPath));

describe('gallery data', () => {
  it('has the original 17 images and every file exists', () => {
    expect(GALLERY_IMAGES).toHaveLength(17);
    expect(GALLERY_IMAGES.map((image) => image.src).filter((src) => !onDisk(src))).toEqual([]);
  });

  it('offers All plus each category as filters, in order', () => {
    expect(GALLERY_FILTERS).toEqual([
      'All',
      'Hotel',
      'Rooms',
      'Dining',
      'Amenities',
      'Meetings & Events',
    ]);
  });

  it('every filter yields at least one image, so no tab renders an empty grid', () => {
    for (const filter of GALLERY_FILTERS) {
      expect(filterGalleryImages(GALLERY_IMAGES, filter).length).toBeGreaterThan(0);
    }
  });

  it('filters by category and keeps "All" in the original order', () => {
    expect(filterGalleryImages(GALLERY_IMAGES, 'All')).toBe(GALLERY_IMAGES);
    const rooms = filterGalleryImages(GALLERY_IMAGES, 'Rooms');
    expect(rooms.map((image) => image.alt)).toEqual([
      'Bedroom',
      'Suite',
      'Deluxe Room',
      'Executive Suite',
    ]);
  });

  it('returns an empty list, not an error, when nothing matches', () => {
    expect(filterGalleryImages([], 'Dining')).toEqual([]);
  });

  it('schema rejects duplicate paths and unknown categories', () => {
    const [first] = GALLERY_IMAGES;
    expect(galleryImagesSchema.safeParse([first, first]).success).toBe(false);
    expect(galleryImagesSchema.safeParse([{ ...first, category: 'Spa' }]).success).toBe(false);
  });
});

describe('testimonials', () => {
  it('has three 5-star testimonials', () => {
    expect(TESTIMONIALS).toHaveLength(3);
    expect(TESTIMONIALS.every((t) => t.rating === 5)).toBe(true);
  });

  it('derives the avatar initial from the name', () => {
    expect(TESTIMONIALS.map(testimonialInitial)).toEqual(['A', 'S', 'J']);
    expect(testimonialInitial({ ...TESTIMONIALS[0]!, name: '  zed' })).toBe('Z');
  });
});

describe('featured facilities', () => {
  it('has five facilities whose images exist and which link to real routes', () => {
    expect(FEATURED_FACILITIES).toHaveLength(5);
    expect(FEATURED_FACILITIES.map((f) => f.image).filter((src) => !onDisk(src))).toEqual([]);
    const routes = new Set(NAV_LINKS.map((link) => link.href));
    expect(FEATURED_FACILITIES.every((f) => routes.has(f.href))).toBe(true);
  });

  it('schema rejects an external link', () => {
    const [first] = FEATURED_FACILITIES;
    expect(
      featuredFacilitiesSchema.safeParse([{ ...first, href: 'https://evil.example' }]).success,
    ).toBe(false);
  });
});

describe('site constants', () => {
  it('has seven unique nav links, all internal, in the original order', () => {
    expect(NAV_LINKS.map((link) => link.label)).toEqual([
      'Home',
      'Rooms',
      'Dining',
      'Events',
      'Amenities',
      'Gallery',
      'Contact',
    ]);
    expect(new Set(NAV_LINKS.map((link) => link.href)).size).toBe(NAV_LINKS.length);
    expect(NAV_LINKS.every((link) => link.href.startsWith('/'))).toBe(true);
  });

  it('spells out "Meetings & Events" only for the events link', () => {
    expect(
      NAV_LINKS.filter((link) => link.fullLabel).map((link) => [link.label, link.fullLabel]),
    ).toEqual([['Events', 'Meetings & Events']]);
  });

  it('keeps the phone number consistent across display, tel: and WhatsApp', () => {
    const digits = (value: string) => value.replace(/\D/g, '');
    expect(digits(CONTACT.phone.display)).toBe(digits(CONTACT.phone.tel));
    expect(digits(CONTACT.whatsappUrl)).toBe(digits(CONTACT.phone.tel));
    expect(CONTACT.phone.tel).toMatch(/^tel:\+254\d{9}$/);
  });

  it('keeps the secondary phone number consistent and distinct from the primary', () => {
    const digits = (value: string) => value.replace(/\D/g, '');
    expect(digits(CONTACT.secondaryPhone.display)).toBe(digits(CONTACT.secondaryPhone.tel));
    expect(CONTACT.secondaryPhone.tel).not.toBe(CONTACT.phone.tel);
  });

  it('keeps the email consistent between address and mailto:', () => {
    expect(CONTACT.email.mailto).toBe(`mailto:${CONTACT.email.address}`);
  });

  it('has https social links with unique ids', () => {
    expect(SOCIAL_LINKS.map((link) => link.id)).toEqual(['facebook', 'instagram', 'tiktok', 'x']);
    expect(SOCIAL_LINKS.every((link) => link.href.startsWith('https://'))).toBe(true);
  });
});
