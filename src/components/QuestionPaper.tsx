import React, { useMemo } from 'react';
import { Edit3 } from 'lucide-react';
import { QuizMetadata, QuizQuestion } from '../types/quiz';
import { MathRenderer } from './MathRenderer';
import { UniversityCrest } from './UniversityCrest';
import { PageBoundaryFrame } from './PageBoundaryFrame';

interface QuestionPaperProps {
  metadata: QuizMetadata;
  questions: QuizQuestion[];
  onEditQuestion?: (questionId: number) => void;
}

function estimateVisibleLength(str: string): number {
  return str.replace(/\\[a-zA-Z]+/g, 'XX').replace(/[$^{}_]/g, '').length;
}

export const QuestionPaper: React.FC<QuestionPaperProps> = ({
  metadata,
  questions,
  onEditQuestion,
}) => {
  const optionLetters = ['(A)', '(B)', '(C)', '(D)'];
  const sizeMode = metadata.fontSize || 'normal';

  // Font size classes
  const fontSizes = {
    compact: {
      text: 'text-xs',
      title: 'text-base',
      spacing: 'space-y-2',
      padding: 'p-2',
    },
    normal: {
      text: 'text-sm',
      title: 'text-lg',
      spacing: 'space-y-2.5',
      padding: 'p-3',
    },
    relaxed: {
      text: 'text-base',
      title: 'text-xl',
      spacing: 'space-y-3.5',
      padding: 'p-4',
    },
  }[sizeMode];

  // Paginate questions into discrete A4 pages so EVERY page has a complete aesthetic boundary
  const questionPages = useMemo(() => {
    if (questions.length === 0) return [];

    const isTwoCol = Boolean(metadata.twoColumnLayout);

    const firstPageBudget = isTwoCol
      ? sizeMode === 'compact'
        ? 74
        : sizeMode === 'normal'
        ? 60
        : 46
      : sizeMode === 'compact'
      ? 37
      : sizeMode === 'normal'
      ? 30
      : 23;

    const nextPageBudget = isTwoCol
      ? sizeMode === 'compact'
        ? 88
        : sizeMode === 'normal'
        ? 72
        : 56
      : sizeMode === 'compact'
      ? 45
      : sizeMode === 'normal'
      ? 36
      : 28;

    const pages: QuizQuestion[][] = [];
    let currentPage: QuizQuestion[] = [];
    let currentLoad = 0;

    questions.forEach((q) => {
      const qLen = estimateVisibleLength(q.q);
      const optLens = q.o.map(estimateVisibleLength);
      const maxOptLen = Math.max(...optLens, 1);

      let weight = 0;
      if (isTwoCol) {
        const qLines = Math.max(1, Math.ceil(qLen / 38));
        const optRows =
          maxOptLen <= 24
            ? 2
            : 4 + optLens.reduce((acc, l) => acc + Math.floor(l / 38), 0);
        weight = qLines + optRows * 0.85 + 1.15;
      } else {
        const qLines = Math.max(1, Math.ceil(qLen / 80));
        const optRows = maxOptLen <= 16 ? 1 : maxOptLen <= 34 ? 2 : 4;
        weight = qLines + optRows * 0.9 + 1.15;
      }

      const activeBudget = pages.length === 0 ? firstPageBudget : nextPageBudget;

      if (currentPage.length > 0 && currentLoad + weight > activeBudget) {
        pages.push(currentPage);
        currentPage = [q];
        currentLoad = weight;
      } else {
        currentPage.push(q);
        currentLoad += weight;
      }
    });

    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    return pages;
  }, [questions, metadata.twoColumnLayout, sizeMode]);

  const totalPages = questionPages.length;

  return (
    <div className="w-full space-y-6 print:space-y-0">
      {questionPages.map((pageQuestions, pageIdx) => {
        const isFirstPage = pageIdx === 0;
        const firstQId = pageQuestions[0]?.id ?? 1;
        const lastQId = pageQuestions[pageQuestions.length - 1]?.id ?? pageQuestions.length;

        return (
          <PageBoundaryFrame
            key={`q-page-${pageIdx}`}
            pageBreakAfter
            showWatermark={metadata.showWatermark}
            watermarkText={metadata.watermarkText}
            innerClassName="p-2.5 sm:p-3.5 pb-3.5"
            pageNumberText={`PAGE ${String(pageIdx + 1).padStart(2, '0')} OF ${String(totalPages).padStart(2, '0')}`}
          >
            {/* ========================================================
                HEADER + QUESTIONS FOR THIS PAGE (NO BOTTOM FOOTER)
            ======================================================== */}
            <div>
              {isFirstPage ? (
                <>
                  {/* PAGE 1: FULL PRESTIGE UNIVERSITY EXAM HEADER WITH VECTOR CREST */}
                  <div className="border-b-2 border-indigo-950 pb-2 mb-2 text-center">
                    <div className="grid grid-cols-3 items-center justify-items-center text-center text-xs font-bold text-indigo-950 mb-1">
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center justify-center border-[1.5px] border-blue-900 text-blue-950 px-2.5 py-0.5 rounded-xs font-mono bg-white leading-none tabular-nums">
                          SET:{' '}
                          <strong className="text-blue-950 text-xs ml-1">
                            {metadata.testCode || 'SET-A'}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center justify-center border-[1.5px] border-indigo-900 text-indigo-950 px-2.5 py-0.5 rounded-xs font-mono text-[10px] font-extrabold uppercase bg-white leading-none">
                          QUESTION BOOKLET / प्रश्न पुस्तिका
                        </span>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center justify-center border-[1.5px] border-indigo-900 px-2.5 py-0.5 rounded-xs bg-white text-indigo-950 leading-none tabular-nums">
                          DATE:{' '}
                          <strong className="text-indigo-950 ml-1">
                            {metadata.date || '2026-10-29'}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* University Crest + Name + Title */}
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="flex items-center justify-center gap-3 my-0.5">
                        <UniversityCrest className="w-10 h-10 sm:w-11 sm:h-11" />
                        <div className="flex flex-col items-center justify-center text-center">
                          <span className="text-[9.5px] font-bold text-rose-950 tracking-widest leading-none mb-0.5">
                            ॥ विद्या ददाति विनयम् ॥
                          </span>
                          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-indigo-950 font-serif text-center leading-tight">
                            {metadata.instituteName || 'राम रमन विज्ञान विश्वविद्यालय'}
                          </h1>
                          <h2 className={`${fontSizes.title} font-bold text-slate-900 mt-0.5 text-center`}>
                            {metadata.examTitle ||
                              'वार्षिक बहुविकल्पीय परीक्षा (Annual MCQ Assessment)'}
                          </h2>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs sm:text-sm font-bold text-slate-900 mt-1 text-center">
                        <span className="inline-flex items-center justify-center">
                          SUBJECT:{' '}
                          <strong className="text-indigo-950 ml-1">
                            {metadata.subject || 'MATHEMATICS / सामान्य ज्ञान'}
                          </strong>
                        </span>
                        {metadata.classGrade && (
                          <span className="inline-flex items-center justify-center">
                            • CLASS:{' '}
                            <strong className="text-indigo-950 ml-1">{metadata.classGrade}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-1.5 pt-1.5 border-t-[1.5px] border-indigo-900 grid grid-cols-3 items-center justify-items-center text-center text-xs font-bold text-slate-900 tabular-nums">
                      <div className="flex items-center justify-center text-center">
                        <span>
                          TIME:{' '}
                          <strong className="text-indigo-950">
                            {metadata.timeLimit || '120 Minutes'}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center justify-center text-center">
                        <span>
                          TOTAL QUESTIONS:{' '}
                          <strong className="text-indigo-950">{questions.length}</strong>
                        </span>
                      </div>
                      <div className="flex items-center justify-center text-center">
                        <span>
                          MAX MARKS:{' '}
                          <strong className="text-indigo-950">
                            {metadata.maxMarks || questions.length}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* GENERAL INSTRUCTIONS (COMPACT CENTER ALIGNED ON PAGE 1) */}
                  {metadata.instructions && metadata.instructions.length > 0 && (
                    <div className="bg-white border-[1.5px] border-indigo-900 px-2.5 py-1.5 rounded-xs mb-2 text-[11px] leading-relaxed text-slate-900 text-center">
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
                              <div
                                key={idx}
                                className="inline-flex items-center justify-center gap-1.5 leading-normal text-center"
                              >
                                <span className="font-extrabold text-indigo-950 font-mono tabular-nums">
                                  {idx + 1}.
                                </span>
                                <MathRenderer text={inst} />
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* CONTINUATION PAGES: COMPACT INSTITUTIONAL RUNNING HEADER */
                <div className="border-b-2 border-indigo-950 pb-1.5 mb-2 grid grid-cols-3 items-center justify-items-center text-center text-[10px] font-bold text-indigo-950 tabular-nums">
                  <span className="border border-indigo-900 px-2 py-0.5 rounded-xs font-mono bg-white">
                    SET: {metadata.testCode || 'SET-A'} • Q. {firstQId}–{lastQId}
                  </span>
                  <span className="font-serif font-black text-xs uppercase tracking-tight text-indigo-950 truncate max-w-full">
                    {metadata.instituteName || 'राम रमन विज्ञान विश्वविद्यालय'}
                  </span>
                  <span className="border border-indigo-900 px-2 py-0.5 rounded-xs font-mono bg-white">
                    PAGE {String(pageIdx + 1).padStart(2, '0')} OF{' '}
                    {String(totalPages).padStart(2, '0')}
                  </span>
                </div>
              )}

              {/* ========================================================
                  QUESTIONS & OPTIONS LIST FOR THIS PAGE
                  (Central Vertical Divider Rule in 2-Column Mode)
              ======================================================== */}
              <div
                className={`${
                  metadata.twoColumnLayout ? 'exam-two-columns' : ''
                } ${fontSizes.spacing}`}
              >
                {pageQuestions.map((question) => {
                  const visibleLengths = question.o.map(estimateVisibleLength);
                  const maxOptLen = Math.max(...visibleLengths);

                  const optionGridClass = metadata.twoColumnLayout
                    ? maxOptLen <= 24
                      ? 'grid grid-cols-2 gap-x-3 gap-y-1 items-center'
                      : 'grid grid-cols-1 gap-y-1 items-center'
                    : maxOptLen <= 16
                    ? 'grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1 items-center'
                    : maxOptLen <= 34
                    ? 'grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 items-center'
                    : 'grid grid-cols-1 gap-y-1 items-center';

                  return (
                    <div
                      key={question.id}
                      className="group relative avoid-break mb-2 p-1.5 bg-white border-b border-dashed border-slate-300 last:border-none break-inside-avoid hover:bg-blue-50/30 transition-colors rounded-xs"
                    >
                      {/* On-Screen Quick Edit Button (Hidden on Print) */}
                      {onEditQuestion && (
                        <button
                          type="button"
                          onClick={() => onEditQuestion(question.id)}
                          title={`Click to edit Question #${question.id} in Visual Editor`}
                          className="no-print opacity-0 group-hover:opacity-100 focus:opacity-100 absolute top-1 right-1 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shadow-xs transition cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Q{question.id}</span>
                        </button>
                      )}

                      {/* Question Row: Unfilled Question Number Box + Question Text */}
                      <div className="flex flex-row items-start gap-2 mb-1">
                        <span className="inline-flex items-center justify-center min-w-5.5 h-5.5 px-1 mt-0.5 rounded-xs border-[1.5px] border-indigo-950 text-indigo-950 font-black text-[11px] font-mono tabular-nums shrink-0 bg-white leading-none">
                          {question.id}
                        </span>
                        <div
                          className={`font-semibold text-slate-950 leading-snug flex-1 min-w-0 ${fontSizes.text}`}
                        >
                          <MathRenderer text={question.q} />
                        </div>
                      </div>

                      {/* Options Row */}
                      <div className={`mt-1 pl-7 ${optionGridClass}`}>
                        {question.o.map((option, optIdx) => (
                          <div
                            key={optIdx}
                            className="flex flex-row items-center gap-1.5 text-slate-950 min-h-5"
                          >
                            <span className="inline-flex items-center justify-center font-extrabold font-mono text-indigo-950 text-xs shrink-0 whitespace-nowrap leading-none">
                              {optionLetters[optIdx]}
                            </span>
                            <div
                              className={`flex-1 min-w-0 flex items-center ${fontSizes.text} leading-snug`}
                            >
                              <MathRenderer text={option} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </PageBoundaryFrame>
        );
      })}
    </div>
  );
};
