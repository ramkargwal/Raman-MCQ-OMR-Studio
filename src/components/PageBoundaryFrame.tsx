import React from 'react';

interface PageBoundaryFrameProps {
  children: React.ReactNode;
  pageBreakAfter?: boolean;
  pageBreakBefore?: boolean;
  showOmrFiducials?: boolean;
  showWatermark?: boolean;
  watermarkText?: string;
  innerClassName?: string;
  pageNumberText?: string;
  compact?: boolean;
}

/**
 * Classic Ornamental Corner SVG (Architectural Fretwork + Diamond Lotus Motif)
 * Renders crisp vector geometry in both Color Ink and Monochrome B&W Laser modes.
 */
const CornerOrnament: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-6 h-6 sm:w-7 sm:h-7 text-indigo-950 pointer-events-none select-none ${className}`}
    aria-hidden="true"
  >
    {/* Outer stepped fretwork corner */}
    <path
      d="M1.5 26V1.5H26"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="square"
    />
    <path
      d="M5.5 20V5.5H20"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="square"
    />
    {/* Corner geometric box & central diamond */}
    <rect
      x="1.5"
      y="1.5"
      width="8"
      height="8"
      stroke="currentColor"
      strokeWidth="1.3"
      fill="white"
    />
    <path d="M5.5 3.2L7.8 5.5L5.5 7.8L3.2 5.5Z" fill="currentColor" />
    {/* Decorative inner corner scroll ticks */}
    <path
      d="M9.5 13.5H13.5V9.5"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="square"
    />
    <circle cx="15.5" cy="5.5" r="1" fill="currentColor" />
    <circle cx="5.5" cy="15.5" r="1" fill="currentColor" />
  </svg>
);

/**
 * Subtle Center-Edge Diamond Floret Ornament for Top/Side Midpoints
 */
const EdgeDiamondOrnament: React.FC<{ vertical?: boolean; className?: string }> = ({
  vertical = false,
  className = '',
}) => (
  <svg
    viewBox={vertical ? '0 0 12 36' : '0 0 36 12'}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`text-indigo-950 pointer-events-none select-none ${
      vertical ? 'w-2.5 h-7' : 'w-7 h-2.5'
    } ${className}`}
    aria-hidden="true"
  >
    {vertical ? (
      <>
        <rect x="2" y="4" width="8" height="28" fill="white" />
        <path d="M6 12L9.5 18L6 24L2.5 18Z" fill="currentColor" />
        <circle cx="6" cy="7.5" r="1.3" fill="currentColor" />
        <circle cx="6" cy="28.5" r="1.3" fill="currentColor" />
      </>
    ) : (
      <>
        <rect x="4" y="2" width="28" height="8" fill="white" />
        <path d="M12 6L18 2.5L24 6L18 9.5Z" fill="currentColor" />
        <circle cx="7.5" cy="6" r="1.3" fill="currentColor" />
        <circle cx="28.5" cy="6" r="1.3" fill="currentColor" />
      </>
    )}
  </svg>
);

export const PageBoundaryFrame: React.FC<PageBoundaryFrameProps> = ({
  children,
  pageBreakAfter = false,
  pageBreakBefore = false,
  showOmrFiducials = false,
  showWatermark = false,
  watermarkText = 'EXAM PAPER',
  innerClassName = 'p-2.5 sm:p-3.5',
  pageNumberText,
  compact = false,
}) => {
  return (
    <div
      className={`a4-page-outer relative bg-white text-slate-950 w-full mx-auto p-2.5 sm:p-4 border border-slate-300 rounded-xl print:rounded-none screen-only-shadow print:border-none print:p-0 box-border leading-tight ${
        compact ? '' : 'flex flex-col'
      } ${pageBreakAfter ? 'page-break-after' : ''} ${
        pageBreakBefore ? 'page-break-before' : ''
      }`}
    >
      {/* Optional Watermark */}
      {showWatermark && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-4 select-none z-0 overflow-hidden"
          aria-hidden="true"
        >
          <span className="text-6xl sm:text-7xl font-black text-slate-900 uppercase -rotate-45 tracking-widest whitespace-nowrap">
            {watermarkText || 'EXAM PAPER'}
          </span>
        </div>
      )}

      {/* Optional 4 Corner OMR Optical Scanner Alignment Marks (Fiducial markers) */}
      {showOmrFiducials && (
        <>
          <div className="absolute top-1 left-1 w-3 h-3 bg-black z-20" aria-hidden="true" />
          <div className="absolute top-1 right-1 w-3 h-3 bg-black z-20" aria-hidden="true" />
          <div className="absolute bottom-1 left-1 w-3 h-3 bg-black z-20" aria-hidden="true" />
          <div className="absolute bottom-1 right-1 w-3 h-3 bg-black z-20" aria-hidden="true" />
        </>
      )}

      {/* ====================================================================
          AESTHETIC TRIPLE-LINE ARCHITECTURAL PAGE BOUNDARY
          Locked to full A4 portrait height (284mm) unless compact=true
      ==================================================================== */}
      <div
        className={`${
          compact ? '' : 'a4-page-frame flex-1 flex flex-col'
        } page-frame-clone relative z-10 border-[2.5px] border-indigo-950 p-[3.5px] rounded-xs bg-white shadow-[inset_0_0_0_1px_rgba(30,27,75,0.12)]`}
      >
        {/* 4 Ornamental Corner Medallions */}
        <CornerOrnament className="absolute -top-[2px] -left-[2px] z-20" />
        <CornerOrnament className="absolute -top-[2px] -right-[2px] rotate-90 z-20" />
        <CornerOrnament className="absolute -bottom-[2px] -left-[2px] -rotate-90 z-20" />
        <CornerOrnament className="absolute -bottom-[2px] -right-[2px] rotate-180 z-20" />

        {/* Top & Side Midpoint Edge Diamond Ornaments */}
        <EdgeDiamondOrnament className="absolute -top-[6px] left-1/2 -translate-x-1/2 z-20" />
        <EdgeDiamondOrnament
          vertical
          className="absolute top-1/2 -left-[6px] -translate-y-1/2 z-20"
        />
        <EdgeDiamondOrnament
          vertical
          className="absolute top-1/2 -right-[6px] -translate-y-1/2 z-20"
        />

        {/* Bottom Center: Either Page Number Badge on the Boundary OR Diamond Ornament */}
        {pageNumberText ? (
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-20 bg-white px-3 py-0.5 border border-indigo-950 rounded-xs font-mono font-extrabold text-[9.5px] text-indigo-950 tracking-wider uppercase whitespace-nowrap leading-none">
            {pageNumberText}
          </div>
        ) : (
          <EdgeDiamondOrnament className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 z-20" />
        )}

        {/* Inner Fine Hairline Border Frame */}
        <div
          className={`page-frame-clone relative border-[1.25px] border-indigo-900 bg-white ${
            compact ? '' : 'flex-1 flex flex-col'
          } ${innerClassName}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
