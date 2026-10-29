import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  text: string;
  className?: string;
}

/**
 * Component that parses mixed text containing LaTeX formulas ($...$ or $$...$$)
 * and renders them cleanly on the exact same horizontal line using KaTeX
 * with Hindi (Devanagari) and English text preservation.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({ text, className = '' }) => {
  const parts = useMemo(() => {
    if (!text) return [];

    // Normalize stray newlines so options and questions stay on the same line
    const normalizedText = text.replace(/\r?\n+/g, ' ').trim();

    const segments: Array<{ type: 'text' | 'math'; content: string }> = [];
    let currentIndex = 0;

    // Regex to match $$...$$ or $...$
    const mathRegex = /(\$\$[\s\S]+?\$\$|\$(?!\$)[\s\S]+?\$)/g;
    let match: RegExpExecArray | null;

    while ((match = mathRegex.exec(normalizedText)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > currentIndex) {
        segments.push({
          type: 'text',
          content: normalizedText.substring(currentIndex, matchIndex),
        });
      }

      const raw = match[0];
      if (raw.startsWith('$$') && raw.endsWith('$$')) {
        segments.push({
          type: 'math',
          content: raw.slice(2, -2).trim(),
        });
      } else if (raw.startsWith('$') && raw.endsWith('$')) {
        segments.push({
          type: 'math',
          content: raw.slice(1, -1).trim(),
        });
      }

      currentIndex = matchIndex + raw.length;
    }

    if (currentIndex < normalizedText.length) {
      segments.push({
        type: 'text',
        content: normalizedText.substring(currentIndex),
      });
    }

    return segments;
  }, [text]);

  return (
    <span className={`inline-flex items-center flex-wrap gap-x-1 align-middle leading-normal ${className}`}>
      {parts.map((segment, idx) => {
        if (segment.type === 'text') {
          return (
            <span key={idx} className="inline-flex items-center align-middle leading-normal">
              {segment.content}
            </span>
          );
        }

        try {
          const html = katex.renderToString(segment.content, {
            displayMode: false,
            throwOnError: false,
            output: 'html',
          });

          return (
            <span
              key={idx}
              className="inline-flex items-center align-middle mx-0.5 leading-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <code
              key={idx}
              className="inline-flex items-center text-amber-900 border border-amber-400 bg-white px-1 rounded text-xs align-middle"
            >
              ${segment.content}$
            </code>
          );
        }
      })}
    </span>
  );
};
