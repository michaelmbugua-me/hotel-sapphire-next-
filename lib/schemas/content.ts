import { z } from 'zod';
import { publicImagePath } from '@/lib/schemas/shared';
import { GALLERY_CATEGORIES, type GalleryImage } from '@/types/gallery';
import type { FeaturedFacility } from '@/types/facility';
import type { Testimonial } from '@/types/testimonial';

const internalHref = z.string().regex(/^\/[a-z0-9/-]*$/, 'must be an internal path');

export const galleryImagesSchema = z
  .array(
    z.object({
      src: publicImagePath,
      alt: z.string().min(1),
      category: z.enum(GALLERY_CATEGORIES),
    }) satisfies z.ZodType<GalleryImage>,
  )
  .min(1)
  .refine((images) => new Set(images.map((image) => image.src)).size === images.length, {
    error: 'Gallery image paths must be unique',
  });

export const testimonialsSchema = z
  .array(
    z.object({
      name: z.string().min(1),
      location: z.string().min(1),
      text: z.string().min(1),
      rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    }) satisfies z.ZodType<Testimonial>,
  )
  .min(1);

export const featuredFacilitiesSchema = z
  .array(
    z.object({
      name: z.string().min(1),
      icon: z.enum(['pool', 'spa', 'gym', 'dining', 'events']),
      image: publicImagePath,
      href: internalHref,
    }) satisfies z.ZodType<FeaturedFacility>,
  )
  .min(1);
