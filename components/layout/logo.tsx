import Image from 'next/image';

/**
 * The hotel logo, rendered white via `brightness-0 invert`. The Angular app shipped this as a 523 KB
 * SVG wrapping a 4096×956 PNG; serving the PNG through next/image yields a right-sized WebP.
 */
type LogoProps = {
  className?: string;
  /** Load immediately. Set for the header logo (above the fold); the footer logo stays lazy. */
  eager?: boolean;
};

export function Logo({ className = '', eager = false }: LogoProps) {
  return (
    <Image
      src="/image/hotel-sapphire-logo.png"
      alt="Hotel Sapphire"
      width={4096}
      height={956}
      sizes="280px"
      loading={eager ? 'eager' : 'lazy'}
      className={`w-auto object-contain brightness-0 invert ${className}`.trim()}
    />
  );
}
