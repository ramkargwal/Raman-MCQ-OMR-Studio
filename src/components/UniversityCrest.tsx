import React from 'react';
import { LogoPresetStyle } from '../types/quiz';

interface UniversityCrestProps {
  className?: string;
  logoStyle?: LogoPresetStyle;
  customLogoUrl?: string;
  monogramText?: string;
}

/**
 * Pure Vector Line-Art University / School Crest & Custom Logo Renderer.
 * Supports 5 crisp vector crests (designed for both Color & B&W Laser Printers)
 * plus custom uploaded image logos (PNG/JPG/SVG/WebP).
 */
export const UniversityCrest: React.FC<UniversityCrestProps> = ({
  className = 'w-11 h-11',
  logoStyle = 'science',
  customLogoUrl,
  monogramText = 'RRVV',
}) => {
  // If custom uploaded/URL logo is selected and has a non-empty URL
  if (logoStyle === 'custom' && customLogoUrl && customLogoUrl.trim() !== '') {
    return (
      <img
        src={customLogoUrl}
        alt="Institution Logo"
        className={`shrink-0 object-contain rounded-full bg-white ${className}`}
      />
    );
  }

  // 1. BOOK & LOTUS CREST (सरस्वती कमल एवं पुस्तक प्रतीक)
  if (logoStyle === 'book_lotus') {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
        aria-label="Book and Lotus Institutional Emblem"
      >
        <circle cx="50" cy="50" r="46" stroke="#1e1b4b" strokeWidth="2.5" fill="#ffffff" />
        <circle
          cx="50"
          cy="50"
          r="41"
          stroke="#991b1b"
          strokeWidth="1.2"
          strokeDasharray="3 2"
          fill="none"
        />
        <circle cx="50" cy="50" r="37" stroke="#1e1b4b" strokeWidth="1.5" fill="none" />

        {/* Rising Sun Rays at Top */}
        <circle cx="50" cy="30" r="6" stroke="#991b1b" strokeWidth="1.8" fill="#ffffff" />
        <line x1="50" y1="18" x2="50" y2="21" stroke="#991b1b" strokeWidth="1.6" />
        <line x1="39" y1="22" x2="42" y2="24" stroke="#991b1b" strokeWidth="1.6" />
        <line x1="61" y1="22" x2="58" y2="24" stroke="#991b1b" strokeWidth="1.6" />
        <line x1="35" y1="30" x2="39" y2="30" stroke="#991b1b" strokeWidth="1.6" />
        <line x1="65" y1="30" x2="61" y2="30" stroke="#991b1b" strokeWidth="1.6" />

        {/* Central Lotus Petals */}
        <path
          d="M50 35 C44 43, 44 52, 50 58 C56 52, 56 43, 50 35 Z"
          stroke="#1d4ed8"
          strokeWidth="1.8"
          fill="#ffffff"
        />
        <path
          d="M50 58 C41 54, 34 47, 36 39 C42 42, 46 49, 50 58 Z"
          stroke="#1d4ed8"
          strokeWidth="1.6"
          fill="#ffffff"
        />
        <path
          d="M50 58 C59 54, 66 47, 64 39 C58 42, 54 49, 50 58 Z"
          stroke="#1d4ed8"
          strokeWidth="1.6"
          fill="#ffffff"
        />

        {/* Open Book of Wisdom at Base */}
        <path
          d="M28 63 C36 60, 44 61, 50 65 C56 61, 64 60, 72 63 L72 73 C64 70, 56 71, 50 75 C44 71, 36 70, 28 73 Z"
          stroke="#1e1b4b"
          strokeWidth="2"
          fill="#ffffff"
          strokeLinejoin="round"
        />
        <line x1="50" y1="65" x2="50" y2="75" stroke="#1e1b4b" strokeWidth="1.8" />
      </svg>
    );
  }

  // 2. TORCH & SHIELD CREST (ज्ञान मशाल एवं ढाल प्रतीक)
  if (logoStyle === 'torch_shield') {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
        aria-label="Torch and Shield Institutional Emblem"
      >
        <circle cx="50" cy="50" r="46" stroke="#1e1b4b" strokeWidth="2.5" fill="#ffffff" />
        <circle
          cx="50"
          cy="50"
          r="41"
          stroke="#1d4ed8"
          strokeWidth="1.2"
          strokeDasharray="4 2"
          fill="none"
        />

        {/* Inner Heraldic Shield */}
        <path
          d="M30 26 L70 26 L70 50 C70 66, 50 78, 50 78 C50 78, 30 66, 30 50 Z"
          stroke="#1e1b4b"
          strokeWidth="2.2"
          fill="#ffffff"
          strokeLinejoin="round"
        />

        {/* Torch Handle */}
        <path
          d="M47 46 L53 46 L51.5 68 L48.5 68 Z"
          stroke="#1e1b4b"
          strokeWidth="1.8"
          fill="#ffffff"
        />
        <line x1="44" y1="46" x2="56" y2="46" stroke="#1e1b4b" strokeWidth="2.2" />

        {/* Torch Flame */}
        <path
          d="M50 28 C44 34, 44 41, 50 44 C56 41, 56 34, 50 28 Z"
          stroke="#991b1b"
          strokeWidth="1.8"
          fill="#ffffff"
        />
        <path
          d="M50 33 C48 36, 48 40, 50 42 C52 40, 52 36, 50 33 Z"
          stroke="#1d4ed8"
          strokeWidth="1.2"
          fill="none"
        />

        {/* Left & Right Stars */}
        <circle cx="38" cy="40" r="2" stroke="#1d4ed8" strokeWidth="1.5" fill="#ffffff" />
        <circle cx="62" cy="40" r="2" stroke="#1d4ed8" strokeWidth="1.5" fill="#ffffff" />
      </svg>
    );
  }

  // 3. CHAKRA / WHEEL OF EXCELLENCE CREST (धर्मचक्र एवं ज्ञान चक्र प्रतीक)
  if (logoStyle === 'chakra') {
    const spokes = Array.from({ length: 12 }, (_, i) => i * 30);
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
        aria-label="Chakra Institutional Emblem"
      >
        <circle cx="50" cy="50" r="46" stroke="#1e1b4b" strokeWidth="2.5" fill="#ffffff" />
        <circle
          cx="50"
          cy="50"
          r="41"
          stroke="#1d4ed8"
          strokeWidth="1.2"
          strokeDasharray="3 2"
          fill="none"
        />

        {/* Outer & Inner Chakra Wheel */}
        <circle cx="50" cy="50" r="28" stroke="#1e1b4b" strokeWidth="2.2" fill="#ffffff" />
        <circle cx="50" cy="50" r="23" stroke="#1d4ed8" strokeWidth="1.2" fill="none" />
        <circle cx="50" cy="50" r="5" stroke="#991b1b" strokeWidth="2" fill="#ffffff" />

        {spokes.map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 50 + 5 * Math.cos(rad);
          const y1 = 50 + 5 * Math.sin(rad);
          const x2 = 50 + 23 * Math.cos(rad);
          const y2 = 50 + 23 * Math.sin(rad);
          return (
            <line
              key={angle}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#1e1b4b"
              strokeWidth="1.3"
            />
          );
        })}
      </svg>
    );
  }

  // 4. MONOGRAM SEAL (अक्षर मुद्रा प्रतीक - e.g. RRVV, KV, DPS)
  if (logoStyle === 'monogram') {
    const cleanText = (monogramText || 'RRVV').trim().slice(0, 5).toUpperCase();
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
        aria-label={`${cleanText} Institutional Seal`}
      >
        <circle cx="50" cy="50" r="46" stroke="#1e1b4b" strokeWidth="2.5" fill="#ffffff" />
        <circle
          cx="50"
          cy="50"
          r="41"
          stroke="#991b1b"
          strokeWidth="1.3"
          strokeDasharray="3 2"
          fill="none"
        />
        <circle cx="50" cy="50" r="35" stroke="#1e1b4b" strokeWidth="1.6" fill="none" />

        {/* Top Crown Star */}
        <path
          d="M50 18 L51.8 22.5 L56.5 22.5 L52.7 25.2 L54 29.8 L50 27 L46 29.8 L47.3 25.2 L43.5 22.5 L48.2 22.5 Z"
          stroke="#991b1b"
          strokeWidth="1.3"
          fill="#ffffff"
        />

        {/* Monogram Letters */}
        <text
          x="50"
          y="55"
          textAnchor="middle"
          fill="#1e1b4b"
          fontSize={cleanText.length >= 4 ? '18' : '22'}
          fontWeight="900"
          fontFamily="serif"
          letterSpacing="1"
        >
          {cleanText}
        </text>

        {/* Bottom Ornamental Line */}
        <line x1="32" y1="67" x2="68" y2="67" stroke="#1d4ed8" strokeWidth="1.6" />
        <circle cx="50" cy="73" r="2" fill="#991b1b" />
      </svg>
    );
  }

  // 5. DEFAULT: SCIENCE ATOMIC & BOOK CREST (राम रमन विज्ञान विश्वविद्यालय प्रतीक चिन्ह)
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
      <circle
        cx="50"
        cy="50"
        r="41"
        stroke="#1d4ed8"
        strokeWidth="1.2"
        strokeDasharray="3 2"
        fill="none"
      />
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
