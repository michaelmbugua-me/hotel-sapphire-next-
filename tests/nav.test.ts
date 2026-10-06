import { describe, expect, it } from 'vitest';
import { isActiveLink } from '@/lib/nav';

describe('isActiveLink', () => {
  it('matches Home only on the exact root path', () => {
    expect(isActiveLink('/', '/')).toBe(true);
    expect(isActiveLink('/rooms', '/')).toBe(false);
  });

  it('matches a section on its page and its whole subtree', () => {
    expect(isActiveLink('/rooms', '/rooms')).toBe(true);
    expect(isActiveLink('/rooms/deluxe-room', '/rooms')).toBe(true);
  });

  it('does not match a path that merely shares a prefix', () => {
    expect(isActiveLink('/roomservice', '/rooms')).toBe(false);
    expect(isActiveLink('/dining', '/rooms')).toBe(false);
  });
});
