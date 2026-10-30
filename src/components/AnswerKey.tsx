import React from 'react';
import { QuizMetadata, QuizQuestion } from '../types/quiz';
import { UniversityCrest } from './UniversityCrest';
import { PageBoundaryFrame } from './PageBoundaryFrame';

interface AnswerKeyProps {
  metadata: QuizMetadata;
  questions: QuizQuestion[];
}

export const AnswerKey: React.FC<AnswerKeyProps> = ({ metadata, questions }) => {
  const optionLetters = ['A', 'B', 'C', 'D'];
  const totalQuestions = questions.length || 100;

  // Calculate answer distributions (how many A, B, C, D)
  const distribution = questions.reduce(
    (acc, q) => {
      const letter = optionLetters[q.a] || 'A';
      acc[letter] = (acc[letter] || 0) + 1;
      return acc;
    },
    { A: 0, B: 0, C: 0, D: 0 } as Record<string, number>
  );

  // Group questions into up to 5 compact columns so the sheet stays short and compact
  const columnCount =
    totalQuestions >= 25 ? 5 : totalQuestions >= 16 ? 4 : totalQuestions >= 9 ? 3 : 2;
  const rowsPerColumn = Math.ceil(totalQuestions / columnCount);

  const columns: QuizQuestion[][] = [];
  for (let c = 0; c < columnCount; c++) {
    const start = c * rowsPerColumn;
    const end = Math.min(start + rowsPerColumn, totalQuestions);
    const colItems = questions.slice(start, end);
    if (colItems.length > 0) {
      columns.push(colItems);
    }
  }

  // High-contrast text color styling for Answer Key letters (No circle border)
  const optionTextStyles: Record<string, string> = {
    A: 'text-blue-950',
    B: 'text-emerald-950',
    C: 'text-purple-950',
    D: 'text-rose-950',
  };

  return (
    <PageBoundaryFrame
      compact
      innerClassName="p-2 sm:p-2.5 pb-3"
      pageNumberText="FINAL PAGE • ANSWER KEY"
    >
      <div>
        {/* ========================================================
            COMPACT HEADER WITH UNIVERSITY CREST
        ======================================================== */}
        <div className="text-center pb-1.5 border-b-2 border-indigo-950 mb-1.5">
          <div className="flex flex-wrap items-center justify-between gap-1 text-[9.5px] font-bold text-indigo-950 mb-1 px-0.5">
            <span className="inline-flex items-center justify-center font-mono border border-blue-900 text-blue-950 bg-white px-1.5 py-0.5 rounded-xs font-extrabold text-[8.5px] uppercase leading-none tabular-nums">
              SET: {metadata.testCode || 'SET-A'}
            </span>
            <span className="inline-flex items-center justify-center border-[1.5px] border-indigo-950 text-indigo-950 bg-white font-black text-[9.5px] sm:text-[10.5px] uppercase px-2.5 py-0.5 rounded-xs tracking-wider leading-none">
              OFFICIAL ANSWER KEY / उत्तर कुंजी
            </span>
            <span className="inline-flex items-center justify-center font-mono text-indigo-950 font-extrabold text-[8.5px] uppercase border border-indigo-900 px-1.5 py-0.5 rounded-xs bg-white leading-none tabular-nums">
              TOTAL: {questions.length} Qs | MARKS: {metadata.maxMarks || questions.length}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <UniversityCrest
              className="w-7 h-7 sm:w-8 sm:h-8 shrink-0"
              logoStyle={metadata.logoStyle || 'science'}
              customLogoUrl={metadata.customLogoUrl}
              monogramText={metadata.logoMonogramText}
            />
            <div className="flex flex-col items-center justify-center text-center">
              <h1 className="text-sm sm:text-base font-black uppercase tracking-tight text-indigo-950 font-serif text-center leading-tight">
                {metadata.instituteName || 'राम रमन विज्ञान विश्वविद्यालय'}
              </h1>
              <h2 className="text-[10.5px] sm:text-xs font-bold text-slate-900 text-center leading-tight">
                {metadata.examTitle || 'वार्षिक बहुविकल्पीय परीक्षा (Annual Assessment)'}{' '}
                <span className="font-mono text-[9.5px] text-slate-700 font-semibold">
                  ({metadata.date || new Date().toLocaleDateString('hi-IN')})
                </span>
              </h2>
            </div>
          </div>
        </div>

        {/* ========================================================
            COMPACT SINGLE-LINE SCORING & DISTRIBUTION BAR
        ======================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5 px-2 py-1 border border-indigo-900 rounded-xs bg-slate-50/60 text-[9px] tabular-nums">
          <div className="flex items-center gap-2 font-bold text-indigo-950">
            <span>
              Correct: <strong className="text-emerald-950">+{metadata.marksPerQuestion || 1}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span>
              Negative:{' '}
              <strong className="text-rose-950">
                {metadata.negativeMarking ? `-${metadata.negativeMarking}` : '0'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono font-bold">
            <span className="text-blue-950">A: {distribution.A}</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-950">B: {distribution.B}</span>
            <span className="text-slate-300">•</span>
            <span className="text-purple-950">C: {distribution.C}</span>
            <span className="text-slate-300">•</span>
            <span className="text-rose-950">D: {distribution.D}</span>
          </div>
        </div>

        {/* ========================================================
            COMPACT ANSWER KEY MATRIX (AUTO HEIGHT, TIGHT ROWS)
        ======================================================== */}
        <div
          className="grid gap-1 sm:gap-1.5"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {columns.map((colGroup, colIdx) => (
            <div
              key={colIdx}
              className="border-[1.25px] border-indigo-950 rounded-xs overflow-hidden bg-white"
            >
              {/* Column Header */}
              <div className="grid grid-cols-2 items-center justify-items-center text-center font-black text-[8.5px] py-0.5 bg-slate-100 text-indigo-950 tracking-wider border-b-[1.25px] border-indigo-950">
                <span className="w-full border-r border-indigo-300 inline-flex items-center justify-center leading-none">
                  Q.NO
                </span>
                <span className="w-full inline-flex items-center justify-center leading-none">
                  KEY
                </span>
              </div>

              {/* Compact Auto-Height Rows */}
              <div className="divide-y divide-slate-200">
                {Array.from({ length: rowsPerColumn }).map((_, rowIdx) => {
                  const q = colGroup[rowIdx];
                  if (!q) {
                    return (
                      <div
                        key={`empty-ans-${colIdx}-${rowIdx}`}
                        className="grid grid-cols-2 items-center justify-items-center h-[17px] bg-slate-50/30"
                      />
                    );
                  }

                  const correctLetter = optionLetters[q.a] || 'A';
                  const textStyle = optionTextStyles[correctLetter] || 'text-indigo-950';
                  const isFiveGroup = q.id % 5 === 0 && rowIdx !== rowsPerColumn - 1;

                  return (
                    <div
                      key={q.id}
                      className={`grid grid-cols-2 items-center justify-items-center text-center h-[17px] px-0.5 hover:bg-slate-50 transition-colors bg-white ${
                        isFiveGroup ? 'border-b-[1.5px] border-indigo-900' : ''
                      }`}
                    >
                      <span className="w-full h-full border-r border-slate-200 inline-flex items-center justify-center text-[9.5px] font-bold font-mono tabular-nums text-center text-slate-900 leading-none">
                        {String(q.id).padStart(2, '0')}
                      </span>

                      <span
                        className={`w-full h-full inline-flex items-center justify-center text-[10px] font-black font-mono text-center leading-none ${textStyle}`}
                      >
                        {correctLetter}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageBoundaryFrame>
  );
};
