import Image from 'next/image';

/**
 * The hotel logo, rendered white via `brightness-0 invert`. The Angular app shipped this as a 523 KB
 * SVG wrapping a 4096×956 PNG. It is shipped here as a 640×149 transparent WebP (15 KB), pre-sized at the
 * source because Firebase App Hosting serves images as-is (no on-demand resizing).
 */
type LogoProps = {
  className?: string;
  /** Load immediately. Set for the header logo (above the fold); the footer logo stays lazy. */
  eager?: boolean;
};

export function Logo({ className = '', eager = false }: LogoProps) {
  return (
    <Image
      src="/image/hotel-sapphire-logo.webp"
      alt="Hotel Sapphire"
      width={640}
      height={149}
      sizes="280px"
      loading={eager ? 'eager' : 'lazy'}
      className={`w-auto object-contain brightness-0 invert ${className}`.trim()}
    />
  );
}
