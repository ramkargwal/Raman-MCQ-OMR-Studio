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

  // Group questions into 5 balanced columns (20 questions per column for 100 questions)
  let columnCount = 5;
  if (totalQuestions <= 20) columnCount = 2;
  else if (totalQuestions <= 40) columnCount = 3;
  else if (totalQuestions <= 60) columnCount = 4;
  else columnCount = 5;

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
      pageBreakBefore
      innerClassName="p-2.5 sm:p-3.5 pb-3.5"
      pageNumberText="FINAL PAGE • ANSWER KEY"
    >
      <div>
        {/* ========================================================
            PRESTIGE HEADER WITH UNIVERSITY CREST
            (DEEP INK OUTLINES, ZERO DARK FILL, STRICTLY CENTER ALIGNED)
        ======================================================== */}
        <div className="text-center pb-2 border-b-2 border-indigo-950 mb-2">
          <div className="grid grid-cols-3 items-center justify-items-center text-center text-[10px] font-bold text-indigo-950 mb-1">
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center justify-center font-mono border-[1.5px] border-blue-900 text-blue-950 bg-white px-2 py-0.5 rounded-xs font-extrabold text-[9px] uppercase leading-none tabular-nums">
                SET: {metadata.testCode || 'SET-A'}
              </span>
            </div>
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center justify-center font-bold text-indigo-950 font-mono leading-none tabular-nums">
                DATE: {metadata.date || new Date().toLocaleDateString('hi-IN')}
              </span>
            </div>
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center justify-center font-mono text-indigo-950 font-extrabold text-[9px] uppercase border-[1.5px] border-indigo-900 px-2 py-0.5 rounded-xs bg-white leading-none tabular-nums">
                TOTAL: {questions.length} QUESTIONS
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 my-0.5">
            <UniversityCrest className="w-9 h-9 sm:w-10 sm:h-10" />
            <div className="flex flex-col items-center justify-center text-center">
              <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-indigo-950 font-serif text-center leading-tight">
                {metadata.instituteName || 'राम रमन विज्ञान विश्वविद्यालय'}
              </h1>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 text-center">
                {metadata.examTitle || 'वार्षिक बहुविकल्पीय परीक्षा (Annual Assessment)'}
              </h2>
            </div>
          </div>

          <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-center">
            <span className="inline-flex items-center justify-center border-2 border-indigo-950 text-indigo-950 bg-white font-black text-[10px] sm:text-xs uppercase px-3 py-0.5 rounded-xs tracking-wider leading-none">
              OFFICIAL FINAL ANSWER KEY / अंतिम उत्तर कुंजी
            </span>
            <span className="inline-flex items-center justify-center text-[10px] font-extrabold text-indigo-950 border-[1.5px] border-indigo-900 bg-white px-2 py-0.5 rounded-xs leading-none tabular-nums">
              पूर्णांक: {metadata.maxMarks || questions.length}
            </span>
          </div>
        </div>

        {/* ========================================================
            SCORING SCHEME & UNIFORM DISTRIBUTION STRIP (ALL CENTER ALIGNED)
        ======================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mb-2 text-[10px] text-center tabular-nums">
          <div className="border-[1.5px] border-indigo-900 p-1 rounded-xs flex flex-col items-center justify-center text-center bg-white">
            <span className="text-indigo-950 block text-[8.5px] uppercase font-extrabold">Total Questions</span>
            <span className="text-sm font-black text-indigo-950">{questions.length}</span>
          </div>
          <div className="border-[1.5px] border-emerald-900 p-1 rounded-xs flex flex-col items-center justify-center text-center bg-white">
            <span className="text-emerald-950 block text-[8.5px] uppercase font-extrabold">Marks / Correct</span>
            <span className="text-sm font-black text-emerald-950">+{metadata.marksPerQuestion || 1}</span>
          </div>
          <div className="border-[1.5px] border-rose-900 p-1 rounded-xs flex flex-col items-center justify-center text-center bg-white">
            <span className="text-rose-950 block text-[8.5px] uppercase font-extrabold">Negative Mark</span>
            <span className="text-sm font-black text-rose-950">
              {metadata.negativeMarking ? `-${metadata.negativeMarking}` : '0 (Nil)'}
            </span>
          </div>
          <div className="col-span-2 border-[1.5px] border-indigo-900 p-1 rounded-xs flex items-center justify-around text-center bg-white">
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-[8px] font-extrabold uppercase text-blue-950 block">Option A</span>
              <span className="font-mono font-black text-xs text-blue-950">{distribution.A}</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-[8px] font-extrabold uppercase text-emerald-950 block">Option B</span>
              <span className="font-mono font-black text-xs text-emerald-950">{distribution.B}</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-[8px] font-extrabold uppercase text-purple-950 block">Option C</span>
              <span className="font-mono font-black text-xs text-purple-950">{distribution.C}</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-[8px] font-extrabold uppercase text-rose-950 block">Option D</span>
              <span className="font-mono font-black text-xs text-rose-950">{distribution.D}</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            ANSWER KEY MATRIX: CLEAN BOLD LETTERS (NO CIRCLES)
            (Strictly Center Aligned Q. NO. and KEY on the Same Line)
        ======================================================== */}
        <div
          className="grid gap-1.5 sm:gap-2"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {columns.map((colGroup, colIdx) => (
            <div
              key={colIdx}
              className="border-[1.5px] border-indigo-950 rounded-xs overflow-hidden bg-white"
            >
              {/* Column Header: Unfilled White Background with Crisp Double Bottom Rule */}
              <div className="grid grid-cols-2 items-center justify-items-center text-center font-black text-[9.5px] py-1 bg-white text-indigo-950 tracking-wider border-b-2 border-indigo-950">
                <span className="w-full border-r border-indigo-300 inline-flex items-center justify-center leading-none">
                  Q. NO.
                </span>
                <span className="w-full inline-flex items-center justify-center leading-none">
                  KEY
                </span>
              </div>

              {/* Rows inside column */}
              <div className="divide-y divide-slate-300">
                {colGroup.map((q, rowIdx) => {
                  const correctLetter = optionLetters[q.a] || 'A';
                  const textStyle = optionTextStyles[correctLetter] || 'text-indigo-950';
                  const isFiveGroup = q.id % 5 === 0 && rowIdx !== colGroup.length - 1;

                  return (
                    <div
                      key={q.id}
                      className={`grid grid-cols-2 items-center justify-items-center text-center py-[2.5px] sm:py-[3px] px-1 hover:bg-slate-50 transition-colors bg-white ${
                        isFiveGroup ? 'border-b-2 border-indigo-900' : ''
                      }`}
                    >
                      {/* Question Number: Tabular Numerals, Strictly centered on same line */}
                      <span className="w-full border-r border-slate-200 inline-flex items-center justify-center h-4.5 text-[10.5px] font-bold font-mono tabular-nums text-center text-slate-900 leading-none">
                        {String(q.id).padStart(2, '0')}
                      </span>

                      {/* Answer Key Letter: Clean Bold Text (NO Circle), Strictly Centered */}
                      <span
                        className={`w-full inline-flex items-center justify-center h-4.5 text-[11px] sm:text-xs font-black font-mono text-center leading-none ${textStyle}`}
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
