/**
 * HelixLogo — SVG icon for Helix by Hrone Studio
 * Double-helix mark in the Mistral amber/orange gradient on Mistral Black.
 */

interface HelixLogoProps {
  size?: number;
  className?: string;
}

export function HelixLogo({ size = 40, className }: HelixLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Helix logo"
    >
      <rect width="512" height="512" fill="#1f1f1f" />
      <defs>
        <linearGradient id="hg1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#ffd900" />
          <stop offset="45%"  stopColor="#ffa110" />
          <stop offset="100%" stopColor="#fa520f" />
        </linearGradient>
        <linearGradient id="hg2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#ffd900" />
          <stop offset="45%"  stopColor="#ffa110" />
          <stop offset="100%" stopColor="#fa520f" />
        </linearGradient>
        <clipPath id="top">
          <rect x="0" y="0" width="512" height="260" />
        </clipPath>
        <clipPath id="bot">
          <rect x="0" y="252" width="512" height="260" />
        </clipPath>
      </defs>

      {/* Strand A — front at bottom */}
      <path
        d="M 162 82 C 162 162, 350 172, 350 256 C 350 340, 162 350, 162 430"
        stroke="url(#hg1)" strokeWidth="60" fill="none" strokeLinecap="square"
      />

      {/* Strand B bottom — dimmer (behind A) */}
      <path
        d="M 350 256 C 350 340, 162 350, 162 430"
        stroke="url(#hg2)" strokeWidth="60" fill="none" strokeLinecap="square"
        opacity="0.32"
        clipPath="url(#bot)"
      />

      {/* Strand B top — front (crosses A at top) */}
      <path
        d="M 350 82 C 350 162, 162 172, 162 256"
        stroke="url(#hg2)" strokeWidth="60" fill="none" strokeLinecap="square"
        clipPath="url(#top)"
      />

      {/* Strand A bottom — redraw on top */}
      <path
        d="M 350 256 C 350 340, 162 350, 162 430"
        stroke="url(#hg1)" strokeWidth="60" fill="none" strokeLinecap="square"
        clipPath="url(#bot)"
      />

      {/* Mistral gradient accent bar */}
      <rect x="0" y="498" width="512" height="14" fill="url(#hg1)" />
    </svg>
  );
}
