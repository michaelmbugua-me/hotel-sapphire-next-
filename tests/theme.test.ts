import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(path.join(process.cwd(), 'app/globals.css'), 'utf8').toLowerCase();

/** Every colour token from the Angular tailwind.config.js, under the same class names. */
const ANGULAR_TOKENS: Record<string, string> = {
  'luxury-dark': '#060d1f',
  'luxury-book': '#0f1e3a',
  'luxury-footer': '#0a1428',
  'luxury-navy': '#050a24',
  'luxury-gold': '#59a4c3',
  sapphire: '#0056b3',
  'sapphire-light': '#4a90e2',
  'sapphire-dark': '#080c2e',
  'sapphire-navy': '#0b1341',
  'sapphire-teal': '#008080',
  gold: '#59a4c3',
  'gold-light': '#59a4c3',
  'gold-dark': '#4e8ca3',
  'mombasa-bg': '#060d1f',
  'mombasa-text': '#f8f9fa',
};

describe('globals.css theme', () => {
  it.each(Object.entries(ANGULAR_TOKENS))('defines --color-%s as %s', (name, hex) => {
    expect(css).toContain(`--color-${name}: ${hex};`);
  });

  it('keeps the h1–h4 font rule inside @layer base so utilities can override it', () => {
    const baseLayer = css.slice(css.indexOf('@layer base'), css.indexOf('@layer components'));
    expect(baseLayer).toContain('h4 {\n    font-family: var(--font-serif);');
  });

  it('clamps extreme font weights to what the Angular app actually rendered (300-700)', () => {
    expect(css).toContain('--font-weight-thin: 300;');
    expect(css).toContain('--font-weight-extralight: 300;');
    expect(css).toContain('--font-weight-extrabold: 700;');
    expect(css).toContain('--font-weight-black: 700;');
  });

  it('maps all four font utilities used by the design', () => {
    for (const token of ['--font-sans', '--font-serif', '--font-cormorant', '--font-jost']) {
      expect(css).toContain(token);
    }
  });
});
