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
  pageBreakAfterLast?: boolean;
}

function estimateVisibleLength(str: string): number {
  return str.replace(/\\[a-zA-Z]+/g, 'XX').replace(/[$^{}_]/g, '').length;
}

export const QuestionPaper: React.FC<QuestionPaperProps> = ({
  metadata,
  questions,
  onEditQuestion,
  pageBreakAfterLast = false,
}) => {
  const optionLetters = ['(A)', '(B)', '(C)', '(D)'];
  const sizeMode = metadata.fontSize || 'normal';

  // Font size classes tuned for A4 density
  const fontSizes = {
    compact: {
      text: 'text-[11px]',
      title: 'text-sm',
      padding: 'py-0.5 px-1',
    },
    normal: {
      text: 'text-xs',
      title: 'text-base',
      padding: 'py-1 px-1',
    },
    relaxed: {
      text: 'text-sm',
      title: 'text-lg',
      padding: 'py-1.5 px-1.5',
    },
  }[sizeMode];

  // Paginate questions into full A4 pages with proportional balancing so no page has empty bottom space
  const questionPages = useMemo(() => {
    if (questions.length === 0) return [];

    const isTwoCol = Boolean(metadata.twoColumnLayout);

    // Calibrated A4 page capacity budgets (284mm printable height)
    const firstPageBudget = isTwoCol
      ? sizeMode === 'compact'
        ? 124
        : sizeMode === 'normal'
        ? 104
        : 82
      : sizeMode === 'compact'
      ? 58
      : sizeMode === 'normal'
      ? 48
      : 38;

    const nextPageBudget = isTwoCol
      ? sizeMode === 'compact'
        ? 142
        : sizeMode === 'normal'
        ? 118
        : 94
      : sizeMode === 'compact'
      ? 68
      : sizeMode === 'normal'
      ? 56
      : 44;

    const weights = questions.map((q) => {
      const qLen = estimateVisibleLength(q.q);
      const optLens = q.o.map(estimateVisibleLength);
      const maxOptLen = Math.max(...optLens, 1);

      if (isTwoCol) {
        const qLines = Math.max(1, Math.ceil(qLen / 42));
        const optRows =
          maxOptLen <= 26
            ? 2
            : 4 + optLens.reduce((acc, l) => acc + Math.floor(l / 42), 0);
        return qLines + optRows * 0.72 + 0.85;
      } else {
        const qLines = Math.max(1, Math.ceil(qLen / 85));
        const optRows = maxOptLen <= 18 ? 1 : maxOptLen <= 38 ? 2 : 4;
        return qLines + optRows * 0.78 + 0.85;
      }
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    // Single A4 page if all questions fit within Page 1 budget
    if (totalWeight <= firstPageBudget) {
      return [questions];
    }

    // Calculate total number of A4 pages needed and balance load proportionally across pages
    const numPages = 1 + Math.ceil((totalWeight - firstPageBudget) / nextPageBudget);
    const rawTotalCapacity = firstPageBudget + (numPages - 1) * nextPageBudget;
    const scale = totalWeight / rawTotalCapacity;

    const pages: QuizQuestion[][] = [];
    let currentPage: QuizQuestion[] = [];
    let currentLoad = 0;

    questions.forEach((q, idx) => {
      const weight = weights[idx];
      const pageIdx = pages.length;
      const targetBudget =
        (pageIdx === 0 ? firstPageBudget : nextPageBudget) * scale;

      if (
        currentPage.length > 0 &&
        pages.length < numPages - 1 &&
        currentLoad + weight * 0.65 > targetBudget
      ) {
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

  const renderQuestionItem = (question: QuizQuestion) => {
    const visibleLengths = question.o.map(estimateVisibleLength);
    const maxOptLen = Math.max(...visibleLengths);

    const optionGridClass = metadata.twoColumnLayout
      ? maxOptLen <= 26
        ? 'grid grid-cols-2 gap-x-2.5 gap-y-0.5 items-center'
        : 'grid grid-cols-1 gap-y-0.5 items-center'
      : maxOptLen <= 18
      ? 'grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-0.5 items-center'
      : maxOptLen <= 38
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 items-center'
      : 'grid grid-cols-1 gap-y-0.5 items-center';

    return (
      <div
        key={question.id}
        className={`group relative avoid-break ${fontSizes.padding} bg-white border-b border-dashed border-slate-300 last:border-none break-inside-avoid hover:bg-blue-50/30 transition-colors rounded-xs`}
      >
        {/* On-Screen Quick Edit Button (Hidden on Print) */}
        {onEditQuestion && (
          <button
            type="button"
            onClick={() => onEditQuestion(question.id)}
            title={`Click to edit Question #${question.id} in Visual Editor`}
            className="no-print opacity-0 group-hover:opacity-100 focus:opacity-100 absolute top-0.5 right-1 z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[9.5px] font-bold shadow-xs transition cursor-pointer"
          >
            <Edit3 className="w-2.5 h-2.5" />
            <span>Edit Q{question.id}</span>
          </button>
        )}

        {/* Question Row: Unfilled Question Number Box + Question Text */}
        <div className="flex flex-row items-start gap-1.5">
          <span className="inline-flex items-center justify-center min-w-5 h-4.5 px-1 mt-0.5 rounded-xs border-[1.5px] border-indigo-950 text-indigo-950 font-black text-[10px] font-mono tabular-nums shrink-0 bg-white leading-none">
            {question.id}
          </span>
          <div
            className={`font-semibold text-slate-950 leading-snug flex-1 min-w-0 ${fontSizes.text}`}
          >
            <MathRenderer text={question.q} />
          </div>
        </div>

        {/* Options Row */}
        <div className={`mt-0.5 pl-6.5 ${optionGridClass}`}>
          {question.o.map((option, optIdx) => (
            <div
              key={optIdx}
              className="flex flex-row items-center gap-1 text-slate-950 min-h-4"
            >
              <span className="inline-flex items-center justify-center font-extrabold font-mono text-indigo-950 text-[11px] shrink-0 whitespace-nowrap leading-none">
                {optionLetters[optIdx]}
              </span>
              <div
                className={`flex-1 min-w-0 flex items-center ${fontSizes.text} leading-tight`}
              >
                <MathRenderer text={option} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6 print:space-y-0">
      {questionPages.map((pageQuestions, pageIdx) => {
        const isFirstPage = pageIdx === 0;
        const firstQId = pageQuestions[0]?.id ?? 1;
        const lastQId = pageQuestions[pageQuestions.length - 1]?.id ?? pageQuestions.length;

        const halfIdx = Math.ceil(pageQuestions.length / 2);
        const leftColQuestions = pageQuestions.slice(0, halfIdx);
        const rightColQuestions = pageQuestions.slice(halfIdx);

        return (
          <PageBoundaryFrame
            key={`q-page-${pageIdx}`}
            pageBreakAfter={pageIdx < totalPages - 1 ? true : pageBreakAfterLast}
            showWatermark={metadata.showWatermark}
            watermarkText={metadata.watermarkText}
            innerClassName="p-2.5 sm:p-3 pb-3"
            pageNumberText={`PAGE ${String(pageIdx + 1).padStart(2, '0')} OF ${String(totalPages).padStart(2, '0')}`}
          >
            {/* ========================================================
                HEADER + FULL-HEIGHT A4 QUESTIONS CONTAINER
            ======================================================== */}
            <div className="flex-1 flex flex-col h-full">
              {isFirstPage ? (
                <>
                  {/* PAGE 1: FULL PRESTIGE UNIVERSITY EXAM HEADER WITH VECTOR CREST */}
                  <div className="border-b-2 border-indigo-950 pb-1.5 mb-1.5 text-center shrink-0">
                    <div className="grid grid-cols-3 items-center justify-items-center text-center text-[11px] font-bold text-indigo-950 mb-0.5">
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center justify-center border-[1.5px] border-blue-900 text-blue-950 px-2 py-0.5 rounded-xs font-mono bg-white leading-none tabular-nums">
                          SET:{' '}
                          <strong className="text-blue-950 text-[11px] ml-1">
                            {metadata.testCode || 'SET-A'}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center justify-center border-[1.5px] border-indigo-900 text-indigo-950 px-2 py-0.5 rounded-xs font-mono text-[9.5px] font-extrabold uppercase bg-white leading-none">
                          QUESTION BOOKLET / प्रश्न पुस्तिका
                        </span>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center justify-center border-[1.5px] border-indigo-900 px-2 py-0.5 rounded-xs bg-white text-indigo-950 leading-none tabular-nums">
                          DATE:{' '}
                          <strong className="text-indigo-950 ml-1">
                            {metadata.date || '2026-10-29'}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* University Crest + Name + Title */}
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="flex items-center justify-center gap-2.5 my-0.5">
                        <UniversityCrest className="w-8 h-8 sm:w-9 sm:h-9" />
                        <div className="flex flex-col items-center justify-center text-center">
                          <span className="text-[8.5px] font-bold text-rose-950 tracking-widest leading-none mb-0.5">
                            ॥ विद्या ददाति विनयम् ॥
                          </span>
                          <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-indigo-950 font-serif text-center leading-tight">
                            {metadata.instituteName || 'राम रमन विज्ञान विश्वविद्यालय'}
                          </h1>
                          <h2 className={`${fontSizes.title} font-bold text-slate-900 text-center leading-tight`}>
                            {metadata.examTitle ||
                              'वार्षिक बहुविकल्पीय परीक्षा (Annual MCQ Assessment)'}
                          </h2>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-0.5 text-[11px] font-bold text-slate-900 mt-0.5 text-center">
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

                    <div className="mt-1 pt-1 border-t-[1.5px] border-indigo-900 grid grid-cols-3 items-center justify-items-center text-center text-[11px] font-bold text-slate-900 tabular-nums">
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
                    <div className="bg-white border-[1.5px] border-indigo-900 px-2 py-1 rounded-xs mb-1.5 text-[10px] leading-snug text-slate-900 text-center shrink-0">
                      {metadata.instructions.length === 1 ? (
                        <div className="inline-flex flex-wrap items-center justify-center gap-1 text-center leading-tight">
                          <span className="font-extrabold text-indigo-950 uppercase tracking-wide">
                            सामान्य निर्देश (Note):
                          </span>
                          <MathRenderer text={metadata.instructions[0]} />
                        </div>
                      ) : (
                        <>
                          <div className="font-extrabold text-indigo-950 uppercase mb-0.5 tracking-wider text-center border-b border-indigo-300 pb-0.5">
                            सामान्य निर्देश / General Instructions
                          </div>
                          <div className="flex flex-col items-center justify-center space-y-0.5 pt-0.5 text-center">
                            {metadata.instructions.map((inst, idx) => (
                              <div
                                key={idx}
                                className="inline-flex items-center justify-center gap-1 leading-tight text-center"
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
                <div className="border-b-2 border-indigo-950 pb-1 mb-1.5 grid grid-cols-3 items-center justify-items-center text-center text-[10px] font-bold text-indigo-950 shrink-0 tabular-nums">
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
                  Stretches vertically (flex-1 justify-between) to fill full A4 height!
              ======================================================== */}
              {metadata.twoColumnLayout && pageQuestions.length > 1 ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_1.5px_1fr] print:grid-cols-[1fr_1.5px_1fr] gap-x-3 items-stretch">
                  {/* Left Column */}
                  <div className="flex flex-col justify-between h-full">
                    {leftColQuestions.map(renderQuestionItem)}
                  </div>

                  {/* Center Vertical Divider Rule */}
                  <div
                    className="hidden md:block print:block bg-indigo-950 w-[1.5px] h-full"
                    aria-hidden="true"
                  />

                  {/* Right Column */}
                  <div className="flex flex-col justify-between h-full">
                    {rightColQuestions.map(renderQuestionItem)}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between h-full">
                  {pageQuestions.map(renderQuestionItem)}
                </div>
              )}
            </div>
          </PageBoundaryFrame>
        );
      })}
    </div>
  );
};
