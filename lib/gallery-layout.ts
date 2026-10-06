/**
 * Tile sizes for the "All" view of the gallery: a mosaic of 1×1, 2×2 and 1×2 tiles, in the exact
 * order of the original. Images beyond the list (none today) fall back to a plain 4:3 tile.
 */
const TWO_BY_TWO = 'md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-square';
const ONE_BY_TWO = 'md:row-span-2 aspect-[4/3] md:aspect-[1/2]';
const SQUARE = 'aspect-square';

const MOSAIC: readonly string[] = [
  TWO_BY_TWO,
  SQUARE,
  SQUARE,
  SQUARE,
  SQUARE,
  SQUARE,
  ONE_BY_TWO,
  TWO_BY_TWO,
  TWO_BY_TWO,
  SQUARE,
  SQUARE,
  SQUARE,
  SQUARE,
  SQUARE,
  ONE_BY_TWO,
  TWO_BY_TWO,
  SQUARE,
];

export function mosaicTileClass(index: number): string {
  return MOSAIC[index] ?? 'aspect-[4/3]';
}
