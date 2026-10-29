import React from 'react';

interface UniversityCrestProps {
  className?: string;
}

/**
 * Pure Vector Line-Art University Crest for राम रमन विज्ञान विश्वविद्यालय.
 * Designed with zero solid dark fills (unfilled crisp strokes only) so it prints
 * razor-sharp on both Color Printers and Black & White Laser/Photocopy Printers.
 */
export const UniversityCrest: React.FC<UniversityCrestProps> = ({ className = 'w-11 h-11' }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="राम रमन विज्ञान विश्वविद्यालय प्रतीक चिन्ह"
    >
      {/* Outer Double Shield Ring */}
      <circle cx="50" cy="50" r="46" stroke="#1e1b4b" strokeWidth="2.5" fill="#ffffff" />
      <circle cx="50" cy="50" r="41" stroke="#1d4ed8" strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
      <circle cx="50" cy="50" r="37" stroke="#1e1b4b" strokeWidth="1.5" fill="none" />

      {/* Science Atomic Elliptical Orbits (Unfilled crisp strokes) */}
      <ellipse
        cx="50"
        cy="44"
        rx="24"
        ry="9"
        transform="rotate(-30 50 44)"
        stroke="#1d4ed8"
        strokeWidth="1.5"
        fill="none"
      />
      <ellipse
        cx="50"
        cy="44"
        rx="24"
        ry="9"
        transform="rotate(30 50 44)"
        stroke="#1d4ed8"
        strokeWidth="1.5"
        fill="none"
      />
      <ellipse
        cx="50"
        cy="44"
        rx="24"
        ry="9"
         transform="rotate(90 50 44)"
        stroke="#1e1b4b"
        strokeWidth="1.2"
        fill="none"
      />

      {/* Central Nucleus / Sun of Knowledge */}
      <circle cx="50" cy="44" r="3.5" stroke="#991b1b" strokeWidth="2" fill="#ffffff" />

      {/* Open Book of Wisdom at Base */}
      <path
        d="M32 64 C38 61, 45 62, 50 66 C55 62, 62 61, 68 64 L68 73 C62 70, 55 71, 50 75 C45 71, 38 70, 32 73 Z"
        stroke="#1e1b4b"
        strokeWidth="2"
        fill="#ffffff"
        strokeLinejoin="round"
      />
      <line x1="50" y1="66" x2="50" y2="75" stroke="#1e1b4b" strokeWidth="1.8" />

      {/* Top Star / Flame of Discovery */}
      <path
        d="M50 15 L52 20 L57 20 L53 23 L54.5 28 L50 25 L45.5 28 L47 23 L43 20 L48 20 Z"
        stroke="#991b1b"
        strokeWidth="1.4"
        fill="#ffffff"
      />

      {/* Left & Right Laurel Accent Dots */}
      <circle cx="20" cy="50" r="1.8" stroke="#1e1b4b" strokeWidth="1.5" fill="#ffffff" />
      <circle cx="80" cy="50" r="1.8" stroke="#1e1b4b" strokeWidth="1.5" fill="#ffffff" />
    </svg>
  );
};
