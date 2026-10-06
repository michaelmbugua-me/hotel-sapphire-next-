import { z } from 'zod';

/** A file served from /public/image, e.g. "/image/room/one.webp". */
export const publicImagePath = z
  .string()
  .regex(/^\/image\/[\w/-]+\.(webp|svg|png|jpg)$/, 'must be a /image/... path under /public');
