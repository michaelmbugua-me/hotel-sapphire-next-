import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { getRoom, getRooms } from '@/lib/data/rooms';
import { roomsSchema } from '@/lib/schemas/room';

const publicFile = (publicPath: string) => path.join(process.cwd(), 'public', publicPath);

describe('getRooms', () => {
  it('returns the four rooms with unique slugs, in the original order', async () => {
    const rooms = await getRooms();
    expect(rooms.map((room) => room.slug)).toEqual([
      'deluxe-room',
      'standard-room',
      'deluxe-twin-room',
      'executive-room',
    ]);
  });

  it('stores prices as numbers in KES, never as formatted strings', async () => {
    const rooms = await getRooms();
    expect(rooms.map((room) => room.price)).toEqual([
      { amount: 11_900, currency: 'KES' },
      { amount: 10_400, currency: 'KES' },
      { amount: 11_900, currency: 'KES' },
      { amount: 19_000, currency: 'KES' },
    ]);
  });

  it('keeps the original facility counts (12, 8, 12, 12)', async () => {
    const rooms = await getRooms();
    expect(rooms.map((room) => room.facilities.length)).toEqual([12, 8, 12, 12]);
  });

  it('only references image files that exist under /public', async () => {
    const rooms = await getRooms();
    const paths = rooms.flatMap((room) => [room.image, ...room.facilities.map((f) => f.iconSrc)]);
    const missing = paths.filter((p) => !existsSync(publicFile(p)));
    expect(missing).toEqual([]);
  });
});

describe('getRoom', () => {
  it('finds a room by slug', async () => {
    const room = await getRoom('executive-room');
    expect(room?.name).toBe('Executive Room');
  });

  it.each([
    '',
    'unknown-room',
    'DELUXE-ROOM',
    ' deluxe-room',
    '__proto__',
    'constructor',
    'toString',
  ])('returns undefined for %j (no fallback room)', async (slug) => {
    expect(await getRoom(slug)).toBeUndefined();
  });
});

describe('roomsSchema', () => {
  it('rejects duplicate slugs', async () => {
    const [first] = await getRooms();
    expect(roomsSchema.safeParse([first, first]).success).toBe(false);
  });

  it('rejects a non-positive price, a non-KES currency and a bad image path', async () => {
    const [first] = await getRooms();
    expect(
      roomsSchema.safeParse([{ ...first, price: { amount: 0, currency: 'KES' } }]).success,
    ).toBe(false);
    expect(
      roomsSchema.safeParse([{ ...first, price: { amount: 100, currency: 'USD' } }]).success,
    ).toBe(false);
    expect(roomsSchema.safeParse([{ ...first, image: 'image/room/one.webp' }]).success).toBe(false);
  });
});
