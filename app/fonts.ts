import { Cormorant_Garamond, Cormorant_Infant, Inter, Jost } from 'next/font/google';

// All four are variable fonts, so no `weight` is passed: one file per style instead of one per weight.
// Poppins is intentionally absent: the Angular app loaded it but never used it.

/** Body text (Tailwind `font-sans`). */
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

/** h1–h4 default and Tailwind `font-serif`. */
const cormorantInfant = Cormorant_Infant({
  subsets: ['latin'],
  variable: '--font-cormorant-infant',
  display: 'swap',
});

/** Tailwind `font-cormorant`; the design uses its italic for heading accents. */
const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant-garamond',
  display: 'swap',
});

/** Tailwind `font-jost`. */
const jost = Jost({ subsets: ['latin'], variable: '--font-jost', display: 'swap' });

/** Class names that declare the font CSS variables; apply on <html>. */
export const fontVariables = [
  inter.variable,
  cormorantInfant.variable,
  cormorantGaramond.variable,
  jost.variable,
].join(' ');
