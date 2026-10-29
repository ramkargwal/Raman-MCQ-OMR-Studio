import React from 'react';
import { Edit3 } from 'lucide-react';
import { QuizMetadata, QuizQuestion } from '../types/quiz';
import { MathRenderer } from './MathRenderer';
import { UniversityCrest } from './UniversityCrest';

interface QuestionPaperProps {
  metadata: QuizMetadata;
  questions: QuizQuestion[];
  onEditQuestion?: (questionId: number) => void;
}

export const QuestionPaper: React.FC<QuestionPaperProps> = ({
  metadata,
  questions,
  onEditQuestion,
}) => {
  const optionLetters = ['(A)', '(B)', '(C)', '(D)'];

  // Font size classes
  const fontSizes = {
    compact: {
      text: 'text-xs',
      title: 'text-base',
      spacing: 'space-y-2.5',
      padding: 'p-2',
    },
    normal: {
      text: 'text-sm',
      title: 'text-lg',
      spacing: 'space-y-3.5',
      padding: 'p-3',
    },
    relaxed: {
      text: 'text-base',
      title: 'text-xl',
      spacing: 'space-y-4.5',
      padding: 'p-4',
    },
  }[metadata.fontSize || 'normal'];

  return (
    <div className="relative bg-white text-slate-950 w-full max-w-[210mm] mx-auto p-3 sm:p-5 border border-slate-300 screen-only-shadow print:border-none print:p-0 page-break-after box-border">
      {/* Optional Watermark */}
      {metadata.showWatermark && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-4 select-none z-0 overflow-hidden"
          aria-hidden="true"
        >
          <span className="text-6xl sm:text-7xl font-black text-slate-900 uppercase -rotate-45 tracking-widest whitespace-nowrap">
            {metadata.watermarkText || 'EXAM PAPER'}
          </span>
        </div>
      )}

      {/* Architectural Thick-Thin Double Outer Frame (Zero solid dark fills) */}
      <div className="relative z-10 border-2 border-indigo-950 p-0.5 rounded-xs bg-white">
        <div className="border border-indigo-900 p-3 sm:p-4 bg-white">
          {/* ========================================================
              PRESTIGE UNIVERSITY EXAM HEADER WITH VECTOR CREST
              (ALL STRICTLY CENTER ALIGNED)
          ======================================================== */}
          <div className="border-b-2 border-indigo-950 pb-2.5 mb-3 text-center">
            <div className="grid grid-cols-3 items-center justify-items-center text-center text-xs font-bold text-indigo-950 mb-1.5">
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center justify-center border-[1.5px] border-blue-900 text-blue-950 px-2.5 py-0.5 rounded-xs font-mono bg-white leading-none tabular-nums">
                  SET: <strong className="text-blue-950 text-xs ml-1">{metadata.testCode || 'SET-A'}</strong>
                </span>
              </div>
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center justify-center border-[1.5px] border-indigo-900 text-indigo-950 px-2.5 py-0.5 rounded-xs font-mono text-[10px] font-extrabold uppercase bg-white leading-none">
                  QUESTION BOOKLET / प्रश्न पुस्तिका
                </span>
              </div>
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center justify-center border-[1.5px] border-indigo-900 px-2.5 py-0.5 rounded-xs bg-white text-indigo-950 leading-none tabular-nums">
                  DATE: <strong className="text-indigo-950 ml-1">{metadata.date || '2026-10-29'}</strong>
                </span>
              </div>
            </div>

            {/* University Crest + Name + Title */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex items-center justify-center gap-3 my-0.5">
                <UniversityCrest className="w-11 h-11 sm:w-12 sm:h-12" />
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-[9.5px] font-bold text-rose-950 tracking-widest leading-none mb-0.5">
                    ॥ विद्या ददाति विनयम् ॥
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-indigo-950 font-serif text-center leading-tight">
                    {metadata.instituteName || 'राम रमन विज्ञान विश्वविद्यालय'}
                  </h1>
                  <h2 className={`${fontSizes.title} font-bold text-slate-900 mt-0.5 text-center`}>
                    {metadata.examTitle || 'वार्षिक बहुविकल्पीय परीक्षा (Annual MCQ Assessment)'}
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs sm:text-sm font-bold text-slate-900 mt-1 text-center">
                <span className="inline-flex items-center justify-center">
                  SUBJECT: <strong className="text-indigo-950 ml-1">{metadata.subject || 'MATHEMATICS / सामान्य ज्ञान'}</strong>
                </span>
                {metadata.classGrade && (
                  <span className="inline-flex items-center justify-center">
                    • CLASS: <strong className="text-indigo-950 ml-1">{metadata.classGrade}</strong>
                  </span>
                )}
              </div>
            </div>

            <div className="mt-2 pt-2 border-t-[1.5px] border-indigo-900 grid grid-cols-3 items-center justify-items-center text-center text-xs font-bold text-slate-900 tabular-nums">
              <div className="flex items-center justify-center text-center">
                <span>TIME: <strong className="text-indigo-950">{metadata.timeLimit || '120 Minutes'}</strong></span>
              </div>
              <div className="flex items-center justify-center text-center">
                <span>TOTAL QUESTIONS: <strong className="text-indigo-950">{questions.length}</strong></span>
              </div>
              <div className="flex items-center justify-center text-center">
                <span>MAX MARKS: <strong className="text-indigo-950">{metadata.maxMarks || questions.length}</strong></span>
              </div>
            </div>
          </div>

          {/* ========================================================
              GENERAL INSTRUCTIONS (COMPACT CENTER ALIGNED)
          ======================================================== */}
          {metadata.instructions && metadata.instructions.length > 0 && (
            <div className="bg-white border-[1.5px] border-indigo-900 px-2.5 py-1.5 rounded-xs mb-3 text-[11px] leading-relaxed text-slate-900 text-center">
              {metadata.instructions.length === 1 ? (
                <div className="inline-flex flex-wrap items-center justify-center gap-1.5 text-center leading-normal">
                  <span className="font-extrabold text-indigo-950 uppercase tracking-wide">
                    सामान्य निर्देश (Note):
                  </span>
                  <MathRenderer text={metadata.instructions[0]} />
                </div>
              ) : (
                <>
                  <div className="font-extrabold text-indigo-950 uppercase mb-1 tracking-wider text-center border-b border-indigo-300 pb-0.5">
                    सामान्य निर्देश / General Instructions
                  </div>
                  <div className="flex flex-col items-center justify-center space-y-0.5 pt-0.5 text-center">
                    {metadata.instructions.map((inst, idx) => (
                      <div key={idx} className="inline-flex items-center justify-center gap-1.5 leading-normal text-center">
                        <span className="font-extrabold text-indigo-950 font-mono tabular-nums">{idx + 1}.</span>
                        <MathRenderer text={inst} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ========================================================
              QUESTIONS & OPTIONS LIST
              (Central Vertical Divider Rule in 2-Column Mode;
               Option (A)/(B)/(C)/(D) & Answer Strictly on Same Line)
          ======================================================== */}
          <div
            className={`
              ${metadata.twoColumnLayout ? 'exam-two-columns' : ''}
              ${fontSizes.spacing}
            `}
          >
            {questions.map((question) => {
              // Calculate visible length of options (stripping LaTeX command names for accurate width estimation)
              const visibleLengths = question.o.map((opt) =>
                opt.replace(/\\[a-zA-Z]+/g, 'X').replace(/[$^{}_]/g, '').length
              );
              const maxOptLen = Math.max(...visibleLengths);

              // In 2-column page layout, each page column is narrow, so use 2-col grid for short/medium options
              // In 1-column full-width layout, allow 4-col grid for short options
              const optionGridClass = metadata.twoColumnLayout
                ? maxOptLen <= 24
                  ? 'grid grid-cols-2 gap-x-3 gap-y-1.5 items-center'
                  : 'grid grid-cols-1 gap-y-1.5 items-center'
                : maxOptLen <= 16
                ? 'grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1.5 items-center'
                : maxOptLen <= 34
                ? 'grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 items-center'
                : 'grid grid-cols-1 gap-y-1.5 items-center';

              return (
                <div
                  key={question.id}
                  className="group relative avoid-break mb-3 p-2 bg-white border-b border-dashed border-slate-400 last:border-none break-inside-avoid hover:bg-blue-50/30 transition-colors rounded-xs"
                >
                  {/* On-Screen Quick Edit Button (Hidden on Print) */}
                  {onEditQuestion && (
                    <button
                      type="button"
                      onClick={() => onEditQuestion(question.id)}
                      title={`Click to edit Question #${question.id} in Visual Editor`}
                      className="no-print opacity-0 group-hover:opacity-100 focus:opacity-100 absolute top-1.5 right-1.5 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shadow-xs transition cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Q{question.id}</span>
                    </button>
                  )}

                  {/* Question Row: Unfilled Question Number Box + Question Text aligned on same horizontal line */}
                  <div className="flex flex-row items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center justify-center min-w-6 h-6 px-1 rounded-xs border-[1.5px] border-indigo-950 text-indigo-950 font-black text-xs font-mono tabular-nums shrink-0 bg-white leading-none">
                      {question.id}
                    </span>
                    <div className={`font-semibold text-slate-950 leading-normal flex-1 min-w-0 flex items-center ${fontSizes.text}`}>
                      <MathRenderer text={question.q} />
                    </div>
                  </div>

                  {/* Options Row: Option (A)/(B)/(C)/(D) and Answer strictly on the exact same horizontal line */}
                  <div className={`mt-1 pl-7 ${optionGridClass}`}>
                    {question.o.map((option, optIdx) => (
                      <div
                        key={optIdx}
                        className="flex flex-row items-center gap-1.5 text-slate-950 min-h-6"
                      >
                        <span className="inline-flex items-center justify-center font-extrabold font-mono text-indigo-950 text-xs shrink-0 whitespace-nowrap leading-none">
                          {optionLetters[optIdx]}
                        </span>
                        <div className={`flex-1 min-w-0 flex items-center ${fontSizes.text} leading-normal`}>
                          <MathRenderer text={option} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================
              SPACE FOR ROUGH WORK / रफ कार्य के लिए स्थान
          ======================================================== */}
          <div className="mt-4 pt-2 border-t-2 border-dashed border-indigo-900">
            <div className="text-center text-[10px] font-extrabold uppercase tracking-widest text-indigo-950 mb-1">
              SPACE FOR ROUGH WORK / रफ कार्य के लिए स्थान
            </div>
            <div className="h-14 border border-indigo-300 rounded-xs bg-white flex items-center justify-center text-[9.5px] text-slate-400 font-mono">
              (अभ्यर्थी गणना एवं रफ कार्य यहाँ कर सकते हैं / Candidates may use this space for calculations)
            </div>
          </div>

          {/* ========================================================
              OFFICIAL INSTITUTIONAL RUNNING FOOTER (CENTER ALIGNED)
          ======================================================== */}
          <div className="mt-3 pt-2 border-t-2 border-indigo-950 grid grid-cols-3 items-center justify-items-center text-center text-[9.5px] font-bold text-indigo-950 font-mono">
            <span className="text-center">CODE: {metadata.testCode || 'RRVV-100/SET-A'}</span>
            <span className="text-center font-sans font-extrabold">
              {metadata.instituteName || 'राम रमन विज्ञान विश्वविद्यालय'}
            </span>
            <span className="text-center border border-indigo-900 px-2 py-0.5 rounded-xs bg-white">
              [ P.T.O. / कृपया पृष्ठ पलटें ]
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
