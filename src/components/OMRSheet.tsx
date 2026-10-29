import React from 'react';
import { QuizMetadata, QuizQuestion } from '../types/quiz';
import { UniversityCrest } from './UniversityCrest';

interface OMRSheetProps {
  metadata: QuizMetadata;
  questions: QuizQuestion[];
  userAnswers?: Record<number, number>;
  onAnswerSelect?: (questionId: number, optionIndex: number) => void;
  isInteractive?: boolean;
}

export const OMRSheet: React.FC<OMRSheetProps> = ({
  metadata,
  questions,
  userAnswers = {},
  onAnswerSelect,
  isInteractive = false,
}) => {
  const targetCapacity = Math.max(metadata.omrCapacity || 100, questions.length);

  // Generate question slots from 1 to targetCapacity
  const questionSlots = Array.from({ length: targetCapacity }, (_, i) => {
    const qId = i + 1;
    const actualQ = questions.find((q) => q.id === qId);
    return {
      id: qId,
      actual: actualQ,
    };
  });

  // For 100 questions, 5 columns of 20 questions
  let columnCount = 5;
  if (targetCapacity <= 30) columnCount = 2;
  else if (targetCapacity <= 60) columnCount = 3;
  else if (targetCapacity <= 80) columnCount = 4;
  else columnCount = 5;

  const rowsPerColumn = Math.ceil(targetCapacity / columnCount);

  const columns: Array<Array<{ id: number; actual?: QuizQuestion }>> = [];
  for (let c = 0; c < columnCount; c++) {
    const start = c * rowsPerColumn;
    const end = Math.min(start + rowsPerColumn, targetCapacity);
    columns.push(questionSlots.slice(start, end));
  }

  const optionLetters = ['A', 'B', 'C', 'D'];
  const testSeriesLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="relative bg-white text-slate-950 w-full mx-auto p-2.5 sm:p-4 border border-slate-300 rounded-xl print:rounded-none screen-only-shadow print:border-none print:p-0 page-break-after box-border leading-tight">
      {/* 4 Corner OMR Optical Scanner Alignment Marks (Fiducial markers) */}
      <div className="absolute top-1 left-1 w-3.5 h-3.5 bg-black" aria-hidden="true" />
      <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-black" aria-hidden="true" />
      <div className="absolute bottom-1 left-1 w-3.5 h-3.5 bg-black" aria-hidden="true" />
      <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-black" aria-hidden="true" />

      {/* Architectural Thick-Thin Double Outer Frame (Zero solid dark fills) */}
      <div className="border-2 border-indigo-950 p-0.5 rounded-xs bg-white">
        <div className="border border-indigo-900 p-2 sm:p-2.5 bg-white">
          {/* ========================================================
              PRESTIGE UNIVERSITY HEADER WITH VECTOR CREST (ALL CENTER ALIGNED)
          ======================================================== */}
          <div className="text-center pb-1.5 border-b-2 border-indigo-950 mb-1.5">
            <div className="grid grid-cols-3 items-center justify-items-center text-center mb-1">
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center justify-center text-[9px] font-mono font-bold tracking-wider uppercase border-[1.5px] border-blue-900 text-blue-950 bg-white px-2 py-0.5 rounded-xs leading-none tabular-nums">
                  OMR-100 / RRVV
                </span>
              </div>
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center justify-center text-[9.5px] font-bold text-rose-950 tracking-widest leading-none">
                  ॥ विद्या ददाति विनयम् ॥
                </span>
              </div>
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center justify-center text-[9px] font-mono text-indigo-950 border-[1.5px] border-indigo-900 px-2 py-0.5 rounded-xs bg-white leading-none">
                  SET: <strong className="text-blue-950 text-[10.5px] ml-1">{metadata.testCode || 'SET-A'}</strong>
                </span>
              </div>
            </div>

            {/* Center University Crest + Title Row */}
            <div className="flex items-center justify-center gap-2.5 my-0.5">
              <UniversityCrest className="w-9 h-9 sm:w-10 sm:h-10" />
              <div className="flex flex-col items-center justify-center text-center">
                <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-indigo-950 font-serif text-center leading-tight">
                  {metadata.instituteName || 'राम रमन विज्ञान विश्वविद्यालय'}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-0.5 text-[10px] text-slate-900 text-center">
                  <span className="font-bold text-indigo-950">
                    {metadata.examTitle || 'वार्षिक बहुविकल्पीय परीक्षा (MCQ Assessment)'}
                  </span>
                  <span className="text-indigo-900 font-bold">•</span>
                  <span className="inline-flex items-center justify-center border-[1.5px] border-blue-900 text-blue-950 bg-white px-2 py-0.5 rounded-xs font-extrabold leading-none">
                    100 QUESTIONS OMR ANSWER SHEET / ओ.एम.आर. उत्तर पत्रक
                  </span>
                  <span className="text-indigo-900 font-bold">•</span>
                  <span className="font-bold text-indigo-950 tabular-nums">
                    पूर्णांक: <strong>{metadata.maxMarks || 100}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              STREAMLINED CANDIDATE & SERIES DATA STRIP (ALL CENTER ALIGNED)
          ======================================================== */}
          <div className="border-[1.5px] border-indigo-950 rounded-xs p-1.5 bg-white mb-1.5 text-[9.5px]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center justify-items-center text-center">
              {/* Candidate Name */}
              <div className="md:col-span-6 w-full flex flex-col items-center justify-center text-center">
                <div className="text-indigo-950 font-extrabold uppercase text-[8.5px] mb-0.5 text-center tracking-wide">
                  Candidate Name / अभ्यर्थी का नाम (In Block Letters)
                </div>
                <div className="w-full grid grid-cols-16 gap-0 h-5 bg-white border-[1.5px] border-indigo-900 rounded-xs overflow-hidden">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className="border-r border-indigo-300 last:border-none flex items-center justify-center font-mono font-bold text-[8.5px]"
                    />
                  ))}
                </div>
              </div>

              {/* Roll Number (7 Clean character cells) */}
              <div className="md:col-span-3 w-full flex flex-col items-center justify-center text-center">
                <div className="text-indigo-950 font-extrabold uppercase text-[8.5px] mb-0.5 text-center tracking-wide">
                  Roll No. / अनुक्रमांक (7 Digits)
                </div>
                <div className="w-full grid grid-cols-7 gap-0 h-5 bg-white border-[1.5px] border-indigo-900 rounded-xs overflow-hidden tabular-nums">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className="border-r border-indigo-300 last:border-none flex items-center justify-center font-mono font-bold text-[9px]"
                    />
                  ))}
                </div>
              </div>

              {/* Question Booklet Series (Unfilled outline circles) */}
              <div className="md:col-span-3 w-full md:border-l border-indigo-300 md:pl-2 flex flex-col items-center justify-center text-center">
                <div className="text-indigo-950 font-extrabold uppercase text-[8.5px] mb-0.5 text-center tracking-wide">
                  Booklet Series / श्रृंखला
                </div>
                <div className="flex justify-center items-center gap-1.5 h-5">
                  {testSeriesLetters.map((series) => (
                    <div
                      key={series}
                      className="w-4.5 h-4.5 rounded-full border-[1.5px] border-indigo-950 bg-white font-black text-[9px] inline-flex items-center justify-center text-indigo-950 leading-none"
                    >
                      {series}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Compact Instructions & Marking Guide (Strictly Center Aligned) */}
            <div className="mt-1 pt-1 border-t border-indigo-200 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[8.5px] text-slate-900 text-center">
              <div className="inline-flex items-center justify-center gap-1">
                <strong className="text-indigo-950 font-extrabold">निर्देश:</strong>
                <span className="font-medium">केवल नीले/काले बॉल पेन से गोलों को पूर्ण रूप से गहरा भरें।</span>
              </div>
              <div className="inline-flex items-center justify-center gap-2">
                <span className="font-bold text-indigo-950">सही तरीका:</span>
                <span className="inline-flex items-center justify-center gap-0.5">
                  <span className="w-3.5 h-3.5 rounded-full border-[1.5px] border-blue-950 bg-white text-blue-950 font-black text-[7.5px] inline-flex items-center justify-center leading-none">
                    A
                  </span>
                  <strong className="text-emerald-900 text-[9.5px] font-black leading-none">✓</strong>
                </span>
                <span className="font-bold text-indigo-950 ml-1">गलत तरीका:</span>
                <span className="inline-flex items-center justify-center gap-0.5 text-rose-900 font-black">
                  <span className="w-3.5 h-3.5 rounded-full border-[1.5px] border-rose-900 bg-white text-[7.5px] inline-flex items-center justify-center line-through leading-none">
                    B
                  </span>
                  <span className="leading-none">✗</span>
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================
              100 QUESTIONS OMR BUBBLE MATRIX (5 COLUMNS OF 20)
              (Deep Ink Outlines, Tabular Numerals, 5-Row Double Rule Grouping)
          ======================================================== */}
          <div
            className="grid gap-1 sm:gap-1.5 my-1"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
          >
            {columns.map((colGroup, colIdx) => (
              <div
                key={colIdx}
                className="border-[1.5px] border-indigo-950 rounded-xs p-0.5 sm:p-1 bg-white"
              >
                {/* Column Header: Unfilled White Background with Crisp Double Bottom Rule */}
                <div className="grid grid-cols-5 items-center justify-items-center text-center font-black text-[9px] py-0.5 border-b-2 border-indigo-950 text-indigo-950 bg-white">
                  <span className="inline-flex items-center justify-center leading-none">Q#</span>
                  <span className="inline-flex items-center justify-center leading-none text-blue-950">A</span>
                  <span className="inline-flex items-center justify-center leading-none text-emerald-950">B</span>
                  <span className="inline-flex items-center justify-center leading-none text-purple-950">C</span>
                  <span className="inline-flex items-center justify-center leading-none text-rose-950">D</span>
                </div>

                {/* Rows inside this column */}
                <div className="divide-y divide-slate-300">
                  {colGroup.map((slot, rowIdx) => {
                    const selected = userAnswers[slot.id];
                    const isFiveGroup = slot.id % 5 === 0 && rowIdx !== colGroup.length - 1;

                    return (
                      <div
                        key={slot.id}
                        className={`grid grid-cols-5 items-center justify-items-center text-center py-[2px] sm:py-[2.5px] hover:bg-slate-50 transition-colors bg-white ${
                          isFiveGroup ? 'border-b-2 border-indigo-900' : ''
                        }`}
                      >
                        {/* Q Number: Tabular Numerals, Strictly centered on same horizontal line */}
                        <span className="inline-flex items-center justify-center w-5 h-4 sm:h-4.5 text-[10px] font-black font-mono tabular-nums text-center text-indigo-950 leading-none">
                          {String(slot.id).padStart(2, '0')}
                        </span>

                        {/* Bubbles A, B, C, D: Deep Ink Unfilled Circles, Strictly Centered */}
                        {optionLetters.map((letter, optIdx) => {
                          const isFilled = selected === optIdx;

                          return (
                            <div key={optIdx} className="flex items-center justify-center">
                              <button
                                type="button"
                                disabled={!isInteractive}
                                onClick={() => onAnswerSelect?.(slot.id, optIdx)}
                                title={`Question ${slot.id}: Option ${letter}`}
                                className={`
                                  w-4 h-4 sm:w-4.5 sm:h-4.5 text-[9px] font-extrabold rounded-full
                                  border-[1.5px] transition-all inline-flex items-center justify-center leading-none
                                  ${
                                    isFilled
                                      ? 'border-indigo-950 bg-indigo-950 text-white shadow-inner'
                                      : 'border-indigo-900 text-indigo-950 bg-white hover:border-blue-800'
                                  }
                                  ${
                                    isInteractive
                                      ? 'cursor-pointer hover:scale-110 active:scale-95'
                                      : 'cursor-default'
                                  }
                                `}
                              >
                                {letter}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* ========================================================
              SIGNATURES & CERTIFICATION FOOTER (ALL CENTER ALIGNED)
          ======================================================== */}
          <div className="mt-1.5 pt-1.5 border-t-2 border-indigo-950 grid grid-cols-3 gap-2 text-center text-[8.5px] text-slate-900">
            <div className="border border-dashed border-indigo-900 p-1 h-11 flex flex-col items-center justify-between bg-white text-center">
              <span className="text-slate-700 font-medium text-[7.5px]">अभ्यर्थी के पूर्ण हस्ताक्षर</span>
              <span className="w-full font-bold text-indigo-950 border-t border-indigo-300 pt-0.5 text-center">
                Candidate&apos;s Signature
              </span>
            </div>

            <div className="border border-dashed border-indigo-900 p-1 h-11 flex flex-col items-center justify-between bg-white text-center">
              <span className="text-slate-700 font-medium text-[7.5px]">कक्ष निरीक्षक के हस्ताक्षर</span>
              <span className="w-full font-bold text-indigo-950 border-t border-indigo-300 pt-0.5 text-center">
                Invigilator&apos;s Signature
              </span>
            </div>

            <div className="border border-dashed border-indigo-900 p-1 h-11 flex flex-col items-center justify-between bg-white text-center">
              <span className="text-slate-700 font-medium text-[7.5px]">केंद्राध्यक्ष की मुहर</span>
              <span className="w-full font-bold text-indigo-950 border-t border-indigo-300 pt-0.5 text-center">
                Center Superintendent Seal
              </span>
            </div>
          </div>

          {/* Micro Barcode & Timing Track Mockup (All Center Aligned) */}
          <div className="mt-1 pt-0.5 border-t border-indigo-300 grid grid-cols-3 items-center justify-items-center text-center text-[8px] text-indigo-950 font-mono font-bold tabular-nums">
            <span className="text-center">BARCODE: *RRVV-100-OMR-2026*</span>
            <div className="flex justify-center items-center gap-0.5" aria-hidden="true">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-indigo-950"
                  style={{
                    width: i % 4 === 0 ? '2px' : '1px',
                    height: '7px',
                  }}
                />
              ))}
            </div>
            <span className="text-center">PAGE 01 - OMR RESPONSE SHEET (1-100)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
