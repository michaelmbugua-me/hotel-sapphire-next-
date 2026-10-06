import { z } from 'zod';
import { publicImagePath } from '@/lib/schemas/shared';
import type { Room } from '@/types/room';

export const roomSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'must be a lowercase kebab-case slug'),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.object({
    amount: z.number().int().positive(),
    currency: z.literal('KES'),
  }),
  image: publicImagePath,
  facilities: z.array(z.object({ iconSrc: publicImagePath, label: z.string().min(1) })).min(1),
}) satisfies z.ZodType<Room>;

export const roomsSchema = z
  .array(roomSchema)
  .refine((rooms) => new Set(rooms.map((room) => room.slug)).size === rooms.length, {
    error: 'Room slugs must be unique',
  });
