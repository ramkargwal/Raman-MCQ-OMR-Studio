import React from 'react';
import { QuizMetadata, QuizQuestion } from '../types/quiz';
import { UniversityCrest } from './UniversityCrest';
import { PageBoundaryFrame } from './PageBoundaryFrame';

interface OMRSheetProps {
  metadata: QuizMetadata;
  questions: QuizQuestion[];
  userAnswers?: Record<number, number>;
  onAnswerSelect?: (questionId: number, optionIndex: number) => void;
  isInteractive?: boolean;
  pageBreakAfter?: boolean;
}

/**
 * Fixed 18px × 18px (~4.8mm on A4 print) circle class used across the entire OMR sheet.
 * Never scales or changes size regardless of the number of questions.
 */
const FIXED_OMR_CIRCLE =
  'w-[18px] h-[18px] min-w-[18px] min-h-[18px] max-w-[18px] max-h-[18px] rounded-full aspect-square shrink-0 text-[9.5px] font-mono font-extrabold inline-flex items-center justify-center leading-none select-none';

export const OMRSheet: React.FC<OMRSheetProps> = ({
  metadata,
  questions,
  userAnswers = {},
  onAnswerSelect,
  isInteractive = false,
  pageBreakAfter = false,
}) => {
  // Dynamically support ANY number of questions:
  // If omrCapacity is 0 (Auto), match exact questions.length (or 50 if empty).
  // If omrCapacity > 0, use at least omrCapacity (or questions.length if larger).
  const targetCapacity =
    metadata.omrCapacity && metadata.omrCapacity > 0
      ? Math.max(metadata.omrCapacity, questions.length)
      : questions.length > 0
      ? questions.length
      : 50;

  // Generate question slots from 1 to targetCapacity
  const questionSlots = Array.from({ length: targetCapacity }, (_, i) => {
    const qId = i + 1;
    const actualQ = questions.find((q) => q.id === qId);
    return {
      id: qId,
      actual: actualQ,
    };
  });

  // Fixed 5-column A4 grid where each full column holds 20 questions (for up to 100 questions).
  // Complete Column 1 (Q.01–20) from top to bottom FIRST, then move to Column 2 (Q.21–40),
  // then Column 3 (Q.41–60), Column 4 (Q.61–80), and Column 5 (Q.81–100).
  const totalGridColumns = 5;
  const rowsPerColumn = targetCapacity <= 100 ? 20 : Math.ceil(targetCapacity / totalGridColumns);

  // Build only the active question columns sequentially (completing Column 1 before Column 2, etc.)
  const activeColumns: Array<Array<{ id: number; actual?: QuizQuestion }>> = [];
  for (let start = 0; start < targetCapacity; start += rowsPerColumn) {
    const end = Math.min(start + rowsPerColumn, targetCapacity);
    activeColumns.push(questionSlots.slice(start, end));
  }

  const unusedColumnCount = Math.max(0, totalGridColumns - activeColumns.length);

  // Option bubble labels based on metadata.omrOptionStyle
  const optionLettersMap: Record<string, string[]> = {
    ABCD: ['A', 'B', 'C', 'D'],
    '1234': ['1', '2', '3', '4'],
    HINDI_A: ['अ', 'ब', 'स', 'द'],
    HINDI_KA: ['क', 'ख', 'ग', 'घ'],
    abcd: ['a', 'b', 'c', 'd'],
  };
  const optionLetters =
    optionLettersMap[metadata.omrOptionStyle || 'ABCD'] || optionLettersMap.ABCD;

  // Customizable Booklet Series & Shift options
  const testSeriesLetters = (metadata.omrBookletSeriesOptions ?? 'A, B, C, D')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const shiftOptions = (metadata.omrShiftOptions ?? 'I, II')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const digitsZeroToNine = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const activeSetLetter =
    (metadata.testCode || 'SET-A').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(-1) || '';

  // Customizable Box & Digit counts
  const candidateNameBoxes = Math.min(24, Math.max(6, Number(metadata.omrCandidateNameBoxes) || 16));
  const fatherNameBoxes = Math.min(24, Math.max(6, Number(metadata.omrFatherNameBoxes) || 16));
  const rollNoDigits = Math.min(12, Math.max(4, Number(metadata.omrRollNoDigits) || 8));
  const bookletNoDigits = Math.min(10, Math.max(3, Number(metadata.omrBookletNoDigits) || 6));
  const centerCodeDigits = Math.min(8, Math.max(2, Number(metadata.omrCenterCodeDigits) || 4));
  const roomNoDigits = Math.min(6, Math.max(2, Number(metadata.omrRoomNoDigits) || 3));

  const showLeftLogo = metadata.omrShowLeftLogo !== false;
  const showRightLogo = metadata.omrShowRightLogo !== false;
  const showBarcode = metadata.omrShowBarcode !== false;
  const showFatherName = metadata.omrShowFatherName !== false;
  const showInstructionsBar = metadata.omrShowInstructionsBar !== false;
  const showEvaluationTable = metadata.omrShowEvaluationTable !== false;

  const rightLogoStyle =
    metadata.omrRightLogoSameAsLeft === false && metadata.omrRightCustomLogoUrl
      ? 'custom'
      : metadata.logoStyle || 'science';
  const rightCustomLogoUrl =
    metadata.omrRightLogoSameAsLeft === false && metadata.omrRightCustomLogoUrl
      ? metadata.omrRightCustomLogoUrl
      : metadata.customLogoUrl;

  return (
    <PageBoundaryFrame
      pageBreakAfter={pageBreakAfter}
      showOmrFiducials
      innerClassName="p-3 sm:p-3.5 pb-4"
      pageNumberText={metadata.omrPageFooterText ?? 'PAGE 01 • OMR ANSWER SHEET'}
    >
      <div className="flex-1 flex flex-col justify-between h-full gap-2.5">
        {/* ========================================================
            1. PRESTIGE SYMMETRICAL INSTITUTIONAL OMR HEADER BLOCK
        ======================================================== */}
        <div className="shrink-0 border-[1.5px] border-indigo-950 rounded-xs bg-white overflow-hidden">
          {/* Tier 1: Royal Indigo Official Document & Barcode Crown Bar */}
          <div className="bg-indigo-950 text-white px-3 py-1 flex items-center justify-between gap-2 text-[9.5px] font-mono">
            <div className="flex items-center gap-2 min-w-0">
              <span className="bg-white text-indigo-950 font-black px-1.5 py-0.5 rounded-xs tracking-wider leading-none shrink-0">
                {metadata.omrBadgePrefix ?? 'OMR'}-{targetCapacity}
              </span>
              <span className="font-bold tracking-wider text-indigo-100 uppercase hidden sm:inline truncate">
                {metadata.omrTopBarTitle ??
                  'OPTICAL MARK RECOGNITION ANSWER SHEET • ओएमआर उत्तर पत्रक'}
              </span>
            </div>

            {(metadata.omrSlogan ?? '॥ विद्या ददाति विनयम् ॥') && (
              <div className="text-[10.5px] font-bold text-amber-200 tracking-widest font-serif leading-none shrink-0">
                {metadata.omrSlogan ?? '॥ विद्या ददाति विनयम् ॥'}
              </div>
            )}

            <div className="flex items-center gap-2 shrink-0">
              {showBarcode && (
                <div
                  className="hidden sm:flex items-center gap-[1.5px] h-3.5 px-1.5 bg-white rounded-xs"
                  aria-hidden="true"
                >
                  {[2, 1, 3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 1].map((w, idx) => (
                    <span
                      key={idx}
                      className="h-2.5 bg-indigo-950 inline-block"
                      style={{ width: `${w}px` }}
                    />
                  ))}
                </div>
              )}
              {(metadata.omrFormCode ?? 'FORM: A4-STD') && (
                <span className="border border-indigo-300/60 bg-indigo-900 px-2 py-0.5 rounded-xs font-black text-white leading-none">
                  {metadata.omrFormCode ?? 'FORM: A4-STD'}
                </span>
              )}
            </div>
          </div>

          {/* Tier 2: Symmetrical Left Crest + Centered School Name & Exam Title + Symmetrical Right Crest */}
          <div className="px-3.5 pt-2.5 pb-2 bg-gradient-to-b from-slate-50/80 to-white flex items-center justify-between gap-3">
            {/* Left Symmetrical Column: University Crest (w-16) */}
            {(showLeftLogo || showRightLogo) && (
              <div className="w-14 sm:w-16 shrink-0 flex flex-col items-center justify-center">
                {showLeftLogo && (
                  <div className="p-1 rounded-full border border-indigo-950/20 bg-white shadow-2xs">
                    <UniversityCrest
                      className="w-11 h-11 sm:w-12 sm:h-12 shrink-0"
                      logoStyle={metadata.logoStyle || 'science'}
                      customLogoUrl={metadata.customLogoUrl}
                      monogramText={metadata.logoMonogramText}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Center Symmetrical Column: School Name & Exam Title (100% Centered) */}
            <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center px-2">
              <h1 className="w-full text-center text-xl sm:text-2xl font-black uppercase tracking-tight text-indigo-950 font-serif leading-relaxed pt-1 pb-0.5">
                {metadata.instituteName || 'राम रमन विज्ञान विश्वविद्यालय'}
              </h1>

              {/* Ornamental Subtitle & Subject Row */}
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 mt-0.5 text-center">
                <span className="text-xs sm:text-[13px] font-extrabold text-rose-950 tracking-wide">
                  {metadata.examTitle || 'वार्षिक बहुविकल्पीय परीक्षा (Annual MCQ Assessment)'}
                </span>
                {(metadata.subject || metadata.classGrade) && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-xs bg-indigo-50 border border-indigo-950/30 text-[10px] font-extrabold text-indigo-950 uppercase tracking-wide">
                    {[metadata.subject, metadata.classGrade].filter(Boolean).join(' • ')}
                  </span>
                )}
              </div>
            </div>

            {/* Right Symmetrical Column: University Crest (w-16 to match Left Crest) */}
            {(showLeftLogo || showRightLogo) && (
              <div className="w-14 sm:w-16 shrink-0 flex flex-col items-center justify-center">
                {showRightLogo && (
                  <div className="p-1 rounded-full border border-indigo-950/20 bg-white shadow-2xs">
                    <UniversityCrest
                      className="w-11 h-11 sm:w-12 sm:h-12 shrink-0"
                      logoStyle={rightLogoStyle}
                      customLogoUrl={rightCustomLogoUrl}
                      monogramText={metadata.logoMonogramText}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tier 3: Unified 5-Cell Exam Metadata Ribbon (Time -> Date -> Questions -> Max Marks -> Negative) */}
          <div className="border-t-[1.5px] border-indigo-950 bg-slate-50 grid grid-cols-5 divide-x-[1.5px] divide-indigo-950 text-center font-mono">
            {/* 1. TIME */}
            <div className="px-2 py-1.5 flex flex-col items-center justify-center">
              <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-600 leading-none">
                {metadata.omrTimeLabel ?? 'TIME / समय'}
              </span>
              <span className="text-[11px] sm:text-xs font-black text-indigo-950 leading-tight mt-0.5 tabular-nums">
                {metadata.timeLimit || '120 Minutes'}
              </span>
            </div>

            {/* 2. DATE (Right after Time on the bottom line) */}
            <div className="px-2 py-1.5 flex flex-col items-center justify-center bg-white/70">
              <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-600 leading-none">
                {metadata.omrDateLabel ?? 'DATE / तारीख'}
              </span>
              <span className="text-[11px] sm:text-xs font-black text-indigo-950 leading-tight mt-0.5 tabular-nums">
                {metadata.date || new Date().toLocaleDateString('hi-IN')}
              </span>
            </div>

            {/* 3. TOTAL QUESTIONS */}
            <div className="px-2 py-1.5 flex flex-col items-center justify-center">
              <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-600 leading-none">
                {metadata.omrQuestionsLabel ?? 'QUESTIONS / कुल प्रश्न'}
              </span>
              <span className="text-[11px] sm:text-xs font-black text-indigo-950 leading-tight mt-0.5 tabular-nums">
                {targetCapacity} MCQs
              </span>
            </div>

            {/* 4. MAX MARKS */}
            <div className="px-2 py-1.5 flex flex-col items-center justify-center bg-white/70">
              <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-600 leading-none">
                {metadata.omrMaxMarksLabel ?? 'MAX MARKS / पूर्णांक'}
              </span>
              <span className="text-[11px] sm:text-xs font-black text-indigo-950 leading-tight mt-0.5 tabular-nums">
                {metadata.maxMarks || targetCapacity * (metadata.marksPerQuestion || 1)} Marks
              </span>
            </div>

            {/* 5. NEGATIVE MARKING */}
            <div className="px-2 py-1.5 flex flex-col items-center justify-center">
              <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-600 leading-none">
                {metadata.omrNegativeLabel ?? 'NEGATIVE / ऋणात्मक'}
              </span>
              <span
                className={`text-[11px] sm:text-xs font-black leading-tight mt-0.5 tabular-nums ${
                  metadata.negativeMarking ? 'text-rose-950' : 'text-emerald-950'
                }`}
              >
                {metadata.omrNegativeCustomText && metadata.omrNegativeCustomText.trim() !== ''
                  ? metadata.omrNegativeCustomText
                  : metadata.negativeMarking
                  ? `-${metadata.negativeMarking} Per Wrong`
                  : 'NIL (कोई नहीं)'}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. EXPANDED CANDIDATE PARTICULARS, ROLL NO, BOOKLET & SERIES
               Generous, loose write-in boxes that utilize page space
        ======================================================== */}
        <div className="flex-1 grid grid-cols-12 gap-2.5 text-[9.5px] items-stretch">
          {/* Panel A: Candidate Name, Father's Name & Exam Details (5 Cols) */}
          <div className="col-span-12 sm:col-span-5 border-[1.5px] border-indigo-950 rounded-xs p-2.5 bg-white flex flex-col justify-between gap-2">
            <div>
              <div className="font-extrabold uppercase text-[8.5px] text-indigo-950 tracking-wide mb-1">
                {metadata.omrCandidateNameLabel ??
                  '1. Candidate Name / अभ्यर्थी का नाम (In Block Letters)'}
              </div>
              <div
                className="w-full grid gap-0 h-6 bg-white border-[1.25px] border-indigo-950 rounded-xs overflow-hidden"
                style={{ gridTemplateColumns: `repeat(${candidateNameBoxes}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: candidateNameBoxes }).map((_, i) => (
                  <div
                    key={i}
                    className="border-r border-indigo-300 last:border-none flex items-center justify-center font-mono font-bold text-[9.5px]"
                  />
                ))}
              </div>
            </div>

            {showFatherName && (
              <div>
                <div className="font-extrabold uppercase text-[8.5px] text-indigo-950 tracking-wide mb-1">
                  {metadata.omrFatherNameLabel ??
                    "2. Father's / Guardian's Name / पिता या अभिभावक का नाम"}
                </div>
                <div
                  className="w-full grid gap-0 h-6 bg-white border-[1.25px] border-indigo-950 rounded-xs overflow-hidden"
                  style={{ gridTemplateColumns: `repeat(${fatherNameBoxes}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: fatherNameBoxes }).map((_, i) => (
                    <div
                      key={i}
                      className="border-r border-indigo-300 last:border-none flex items-center justify-center font-mono font-bold text-[9.5px]"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5 pt-1.5 border-t border-slate-200">
              <div>
                <span className="block text-[8px] font-bold uppercase text-slate-600 mb-1">
                  {metadata.omrSubjectClassLabel ?? 'Subject & Class / विषय एवं कक्षा:'}
                </span>
                <div className="h-5 border-b border-dotted border-indigo-900 font-bold text-[10px] text-indigo-950 truncate">
                  {[metadata.subject, metadata.classGrade].filter(Boolean).join(' • ')}
                </div>
              </div>
              <div>
                <span className="block text-[8px] font-bold uppercase text-slate-600 mb-1">
                  {metadata.omrExamCenterLabel ?? 'Exam Center / परीक्षा केंद्र:'}
                </span>
                <div className="h-5 border-b border-dotted border-indigo-900 font-bold text-[10px] text-indigo-950 truncate">
                  {metadata.omrExamCenterDefaultValue || ''}
                </div>
              </div>
            </div>
          </div>

          {/* Panel B: Roll Number, Booklet Number & Center Code Boxes (4 Cols) */}
          <div className="col-span-7 sm:col-span-4 border-[1.5px] border-indigo-950 rounded-xs p-2.5 bg-white flex flex-col justify-between gap-2">
            <div>
              <div className="font-extrabold uppercase text-[8.5px] text-indigo-950 tracking-wide mb-1">
                {metadata.omrRollNoLabel ?? `3. Roll Number / अनुक्रमांक (${rollNoDigits} Digits)`}
              </div>
              <div
                className="w-full grid gap-0 h-6 bg-white border-[1.25px] border-indigo-950 rounded-xs overflow-hidden tabular-nums"
                style={{ gridTemplateColumns: `repeat(${rollNoDigits}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: rollNoDigits }).map((_, i) => (
                  <div
                    key={i}
                    className="border-r border-indigo-300 last:border-none flex items-center justify-center font-mono font-bold text-[10px]"
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="font-extrabold uppercase text-[8.5px] text-indigo-950 tracking-wide mb-1">
                {metadata.omrBookletNoLabel ?? '4. Question Booklet No. / प्रश्न पुस्तिका संख्या'}
              </div>
              <div
                className="w-full grid gap-0 h-6 bg-white border-[1.25px] border-indigo-950 rounded-xs overflow-hidden tabular-nums"
                style={{ gridTemplateColumns: `repeat(${bookletNoDigits}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: bookletNoDigits }).map((_, i) => (
                  <div
                    key={i}
                    className="border-r border-indigo-300 last:border-none flex items-center justify-center font-mono font-bold text-[9.5px]"
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-200">
              <div>
                <span className="block text-[8px] font-bold uppercase text-slate-600 mb-1">
                  {metadata.omrCenterCodeLabel ?? 'Center Code / केंद्र कोड:'}
                </span>
                <div
                  className="grid gap-0 h-5 bg-white border border-indigo-950 rounded-xs overflow-hidden"
                  style={{ gridTemplateColumns: `repeat(${centerCodeDigits}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: centerCodeDigits }).map((_, i) => (
                    <div key={i} className="border-r border-indigo-300 last:border-none" />
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-[8px] font-bold uppercase text-slate-600 mb-1">
                  {metadata.omrRoomNoLabel ?? 'Room No. / कक्ष सं.:'}
                </span>
                <div
                  className="grid gap-0 h-5 bg-white border border-indigo-950 rounded-xs overflow-hidden"
                  style={{ gridTemplateColumns: `repeat(${roomNoDigits}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: roomNoDigits }).map((_, i) => (
                    <div key={i} className="border-r border-indigo-300 last:border-none" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Panel C: Booklet Series & Category (Fixed 18px Circles) (3 Cols) */}
          <div className="col-span-5 sm:col-span-3 border-[1.5px] border-indigo-950 rounded-xs p-2.5 bg-white flex flex-col justify-between items-center text-center">
            <div className="w-full">
              <div className="w-full font-extrabold uppercase text-[8.5px] text-indigo-950 tracking-wide border-b border-slate-200 pb-1 mb-1.5">
                {metadata.omrBookletSeriesLabel ?? '5. Booklet Series / श्रृंखला'}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 py-1">
                {testSeriesLetters.map((series) => {
                  const isCurrentSet = activeSetLetter === series.toUpperCase();
                  return (
                    <span
                      key={series}
                      className={`${FIXED_OMR_CIRCLE} border-[1.5px] ${
                        isCurrentSet
                          ? 'border-indigo-950 bg-indigo-950 text-white'
                          : 'border-indigo-950 bg-white text-indigo-950'
                      }`}
                    >
                      {series}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="w-full pt-1.5 border-t border-slate-200">
              <div className="w-full font-extrabold uppercase text-[8px] text-indigo-950 tracking-wide mb-1.5">
                {metadata.omrShiftLabel ?? '6. Shift / पाली'}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 py-0.5">
                {shiftOptions.map((shift) => (
                  <div key={shift} className="flex items-center gap-1">
                    <span
                      className={`${FIXED_OMR_CIRCLE} border-[1.5px] border-indigo-950 bg-white text-indigo-950`}
                    >
                      {shift}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full text-[8px] font-semibold text-slate-600 leading-tight pt-1 border-t border-slate-100">
              {metadata.omrSeriesFooterNote ?? 'Darken Correct Set & Shift Circle'}
            </div>
          </div>
        </div>

        {/* ========================================================
            3. EXPANDED MARKING INSTRUCTIONS BAR (FIXED 18PX DEMO CIRCLES)
        ======================================================== */}
        {showInstructionsBar && (
          <div className="shrink-0 border-[1.5px] border-indigo-950 rounded-xs px-3 py-2 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 text-[9.5px]">
            <div className="space-y-0.5 flex-1 min-w-[240px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-indigo-950 text-white font-black uppercase px-2 py-0.5 rounded-xs text-[8px] tracking-wider leading-none">
                  {metadata.omrInstructionBadge ?? 'महत्वपूर्ण निर्देश / MARKING INSTRUCTIONS'}
                </span>
                <span className="font-bold text-indigo-950">
                  {metadata.omrInstructionHeadline ??
                    'केवल काले या नीले बॉल पेन (Black/Blue Ball Point Pen) से गोले को पूर्णतः गहरा भरें।'}
                </span>
              </div>
              {(metadata.omrInstructionSubtext ??
                '• पहले स्तंभ (Column 1: Q.01–20) को पूरा भरने के बाद ही अगले स्तंभ पर जाएं। • एक से अधिक गोले भरने या काट-छांट करने पर उत्तर अमान्य होगा।') && (
                <div className="text-[8.5px] text-slate-700 font-medium pl-0.5">
                  {metadata.omrInstructionSubtext ??
                    '• पहले स्तंभ (Column 1: Q.01–20) को पूरा भरने के बाद ही अगले स्तंभ पर जाएं। • एक से अधिक गोले भरने या काट-छांट करने पर उत्तर अमान्य होगा।'}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3.5 ml-auto bg-white px-2.5 py-1.5 rounded-xs border border-indigo-200 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-rose-950 uppercase text-[8.5px]">
                  {metadata.omrWrongLabel ?? 'गलत / Wrong:'}
                </span>
                <span
                  className={`${FIXED_OMR_CIRCLE} border-[1.5px] border-rose-900 bg-white text-rose-900`}
                >
                  ✕
                </span>
                <span
                  className={`${FIXED_OMR_CIRCLE} border-[1.5px] border-rose-900 bg-white text-rose-900`}
                >
                  ✓
                </span>
                <span
                  className={`${FIXED_OMR_CIRCLE} border-[1.5px] border-rose-900 bg-white text-rose-900`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-900 inline-block" />
                </span>
              </div>

              <div className="flex items-center gap-1.5 pl-3 border-l border-slate-300">
                <span className="font-extrabold text-emerald-950 uppercase text-[8.5px]">
                  {metadata.omrCorrectLabel ?? 'सही / Correct:'}
                </span>
                <span
                  className={`${FIXED_OMR_CIRCLE} border-[1.5px] border-indigo-950 bg-indigo-950 text-white`}
                >
                  ●
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            4. COMPACT SEQUENTIAL OMR QUESTION RESPONSE MATRIX (SHRINK-0)
               Questions are NOT expanded (fixed 24px row height, fixed 18px circles)
        ======================================================== */}
        <div className="shrink-0">
          <div className="flex items-center justify-between mb-1 px-0.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-indigo-950">
              {metadata.omrResponseHeaderTitle ?? '▼ RESPONSE SHEET / उत्तर प्रभाग'} (Q. 01 TO{' '}
              {String(targetCapacity).padStart(2, '0')} • {rowsPerColumn} QUESTIONS PER COLUMN)
            </span>
            <span className="text-[8.5px] font-mono font-bold text-slate-700">
              Correct = +{metadata.marksPerQuestion || 1} Mark | Negative ={' '}
              {metadata.negativeMarking ? `-${metadata.negativeMarking}` : '0'}
            </span>
          </div>

          <div className="flex items-stretch gap-1.5">
            {/* Left Optical Scanner Timing Track */}
            <div
              className="hidden sm:flex flex-col justify-between pt-7 pb-1.5 px-0.5 select-none pointer-events-none shrink-0"
              aria-hidden="true"
            >
              {Array.from({ length: rowsPerColumn }).map((_, i) => (
                <div key={i} className="w-2.5 h-[3px] bg-indigo-950" />
              ))}
            </div>

            {/* 5-Column A4 Grid: Fixed 24px Question Rows (Never Expanded!) */}
            <div className="flex-1 grid grid-cols-5 gap-2 items-stretch">
              {activeColumns.map((colGroup, colIdx) => {
                const firstQ = colGroup[0]?.id ?? 1;
                const lastQ = colGroup[colGroup.length - 1]?.id ?? firstQ;
                const isPartialCol = colGroup.length < rowsPerColumn;

                return (
                  <div
                    key={colIdx}
                    className="border-[1.5px] border-indigo-950 rounded-xs overflow-hidden bg-white flex flex-col"
                  >
                    {/* Column Header */}
                    <div className="shrink-0 grid grid-cols-[30px_1fr_1fr_1fr_1fr] items-center justify-items-center text-center font-black text-[9px] py-1 border-b-2 border-indigo-950 bg-indigo-950 text-white tracking-wider">
                      <span className="w-full border-r border-indigo-700 inline-flex items-center justify-center leading-none">
                        Q.N
                      </span>
                      {optionLetters.map((hdrLetter, hIdx) => (
                        <span
                          key={hIdx}
                          className="inline-flex items-center justify-center leading-none"
                        >
                          {hdrLetter}
                        </span>
                      ))}
                    </div>

                    {/* Fixed 24px Consecutive Question Rows (Compact, Never Expanded!) */}
                    <div className="divide-y divide-indigo-100 shrink-0">
                      {colGroup.map((slot, rowIdx) => {
                        const blockIndex = Math.floor(rowIdx / 5);
                        const isEvenFiveBlock = blockIndex % 2 === 1;
                        const selected = userAnswers[slot.id];
                        const isFiveGroupEnd =
                          slot.id % 5 === 0 && rowIdx !== colGroup.length - 1;

                        return (
                          <div
                            key={slot.id}
                            className={`grid grid-cols-[30px_1fr_1fr_1fr_1fr] items-center justify-items-center text-center h-[24px] px-0.5 transition-colors ${
                              isEvenFiveBlock ? 'bg-indigo-50/35' : 'bg-white'
                            } ${
                              isFiveGroupEnd ? 'border-b-[1.5px] border-indigo-900' : ''
                            } hover:bg-blue-50/50`}
                          >
                            {/* Question Number Cell */}
                            <span className="w-full h-full border-r border-indigo-200 bg-slate-50/70 inline-flex items-center justify-center font-black font-mono tabular-nums text-[9.5px] text-indigo-950 leading-none">
                              {String(slot.id).padStart(2, '0')}
                            </span>

                            {/* Fixed-Size 18px × 18px Circles for Options */}
                            {optionLetters.map((letter, optIdx) => {
                              const isFilled = selected === optIdx;

                              return (
                                <div
                                  key={optIdx}
                                  className="w-full h-full flex items-center justify-center"
                                >
                                  <button
                                    type="button"
                                    disabled={!isInteractive}
                                    onClick={() => onAnswerSelect?.(slot.id, optIdx)}
                                    title={`Question ${slot.id}: Option ${letter}`}
                                    className={`
                                      ${FIXED_OMR_CIRCLE}
                                      border-[1.4px] transition-transform
                                      ${
                                        isFilled
                                          ? 'border-indigo-950 bg-indigo-950 text-white shadow-inner'
                                          : 'border-rose-900/85 text-rose-950/90 bg-white hover:border-indigo-950'
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

                    {/* End-of-Questions Filler for Partial Column */}
                    {isPartialCol && (
                      <div className="flex-1 border-t-2 border-indigo-950 bg-slate-50/50 p-2 flex flex-col items-center justify-center text-center select-none">
                        <span className="font-mono font-black text-[8.5px] uppercase tracking-wider text-indigo-950 border border-indigo-900 bg-white px-2 py-0.5 rounded-xs">
                          END • Q.{String(firstQ).padStart(2, '0')}–{String(lastQ).padStart(2, '0')}
                        </span>
                        <span className="text-[8px] text-slate-500 font-semibold mt-1 leading-tight">
                          कुल {targetCapacity} प्रश्न समाप्त
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Right-Side Optical Roll No. (0-9) & Rough Work Panel when < 5 columns are used */}
              {unusedColumnCount > 0 && (
                <div
                  className="border-[1.5px] border-indigo-950 rounded-xs overflow-hidden bg-white flex flex-col justify-between"
                  style={{ gridColumn: `span ${unusedColumnCount} / span ${unusedColumnCount}` }}
                >
                  <div className="shrink-0 font-black text-[9px] py-1 px-2.5 border-b-2 border-indigo-950 bg-indigo-950 text-white tracking-wider uppercase flex items-center justify-between">
                    <span>
                      {unusedColumnCount >= 2
                        ? 'OPTICAL ROLL NO. MATRIX & ROUGH WORK / अनुक्रमांक एवं रफ कार्य'
                        : 'ROUGH WORK / रफ कार्य'}
                    </span>
                    <span className="font-mono text-[8px] text-indigo-200">
                      COL {activeColumns.length + 1}–5
                    </span>
                  </div>

                  <div className="flex-1 p-2.5 flex flex-col justify-between gap-2.5">
                    {unusedColumnCount >= 2 && (
                      <div
                        className={`grid ${
                          unusedColumnCount >= 3 ? 'grid-cols-12' : 'grid-cols-1'
                        } gap-2.5 border-b border-indigo-200 pb-2.5`}
                      >
                        <div
                          className={`${
                            unusedColumnCount >= 3 ? 'col-span-7' : ''
                          } border border-indigo-900 rounded-xs p-2 bg-slate-50/40 flex flex-col justify-between`}
                        >
                          <div className="text-[8.5px] font-black uppercase text-indigo-950 text-center mb-1 tracking-wide">
                            Optical Roll Number / अनुक्रमांक (0–9)
                          </div>
                          <div
                            className="grid gap-1 mb-1"
                            style={{
                              gridTemplateColumns: `repeat(${rollNoDigits}, minmax(0, 1fr))`,
                            }}
                          >
                            {Array.from({ length: rollNoDigits }).map((_, idx) => (
                              <div
                                key={idx}
                                className="h-4.5 border border-indigo-950 bg-white rounded-xs"
                              />
                            ))}
                          </div>
                          <div className="space-y-0.5">
                            {digitsZeroToNine.map((digit) => (
                              <div
                                key={digit}
                                className="grid gap-1 justify-items-center"
                                style={{
                                  gridTemplateColumns: `repeat(${rollNoDigits}, minmax(0, 1fr))`,
                                }}
                              >
                                {Array.from({ length: rollNoDigits }).map((_, idx) => (
                                  <span
                                    key={idx}
                                    className="w-4 h-4 rounded-full border border-rose-900/75 bg-white text-rose-950 font-mono font-bold text-[8px] inline-flex items-center justify-center leading-none"
                                  >
                                    {digit}
                                  </span>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>

                        {unusedColumnCount >= 3 && (
                          <div className="col-span-5 border border-indigo-900 rounded-xs p-2 bg-slate-50/40 flex flex-col justify-between">
                            <div>
                              <div className="text-[8.5px] font-black uppercase text-indigo-950 text-center mb-1 tracking-wide">
                                Booklet Code / पुस्तिका कोड
                              </div>
                              <div className="grid grid-cols-5 gap-1 mb-1">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                  <div
                                    key={idx}
                                    className="h-4.5 border border-indigo-950 bg-white rounded-xs"
                                  />
                                ))}
                              </div>
                              <div className="space-y-0.5">
                                {digitsZeroToNine.map((digit) => (
                                  <div
                                    key={digit}
                                    className="grid grid-cols-5 gap-1 justify-items-center"
                                  >
                                    {Array.from({ length: 5 }).map((_, idx) => (
                                      <span
                                        key={idx}
                                        className="w-4 h-4 rounded-full border border-rose-900/75 bg-white text-rose-950 font-mono font-bold text-[8px] inline-flex items-center justify-center leading-none"
                                      >
                                        {digit}
                                      </span>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex-1 border border-dashed border-indigo-900/50 rounded-xs bg-slate-50/30 p-2 flex flex-col justify-between">
                      <div className="flex items-center justify-between border-b border-indigo-200/60 pb-1">
                        <span className="text-[8.5px] font-black uppercase tracking-wider text-indigo-950">
                          {metadata.omrRoughWorkTitle ??
                            '✎ SPACE FOR ROUGH WORK / रफ कार्य हेतु स्थान'}
                        </span>
                      </div>
                      <div className="my-auto text-center text-[9.5px] font-serif italic text-slate-400 select-none">
                        {metadata.omrRoughWorkSubtitle ??
                          'Candidate Calculation & Scratchpad Area • अभ्यर्थी गणना एवं रफ कार्य क्षेत्र'}
                      </div>
                      <div className="text-[7.5px] text-slate-500 text-center font-mono border-t border-indigo-100 pt-1">
                        {metadata.omrRoughWorkFooterNote ??
                          'Do not make any stray marks on the OMR response circles.'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Optical Scanner Timing Track */}
            <div
              className="hidden sm:flex flex-col justify-between pt-7 pb-1.5 px-0.5 select-none pointer-events-none shrink-0"
              aria-hidden="true"
            >
              {Array.from({ length: rowsPerColumn }).map((_, i) => (
                <div key={i} className="w-2.5 h-[3px] bg-indigo-950" />
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================
            5. EXPANDED BOTTOM EVALUATION SUMMARY & SIGNATURES FOOTER
               Grows comfortably (flex-1) to eliminate any bottom empty space!
        ======================================================== */}
        <div className="flex-1 flex flex-col justify-between gap-2 pt-2 border-t-2 border-indigo-950 text-[9.5px]">
          {/* Official Evaluation Summary Table */}
          {showEvaluationTable && (
            <div className="grid grid-cols-6 border-[1.5px] border-indigo-950 rounded-xs overflow-hidden bg-white text-center font-mono">
              <div className="border-r border-indigo-300 py-1.5 px-2 bg-slate-50 flex flex-col justify-center">
                <span className="block text-[8px] font-bold uppercase text-slate-600 mb-0.5">
                  {metadata.omrEvalTotalLabel ?? 'Total Questions'}
                </span>
                <span className="font-black text-xs text-indigo-950">{targetCapacity}</span>
              </div>
              <div className="border-r border-indigo-300 py-1.5 px-2 flex flex-col justify-center">
                <span className="block text-[8px] font-bold uppercase text-slate-600 mb-0.5">
                  {metadata.omrEvalAttemptedLabel ?? 'Attempted / हल किए'}
                </span>
                <span className="font-bold text-[10px] text-slate-400">________</span>
              </div>
              <div className="border-r border-indigo-300 py-1.5 px-2 flex flex-col justify-center">
                <span className="block text-[8px] font-bold uppercase text-slate-600 mb-0.5">
                  {metadata.omrEvalBlankLabel ?? 'Left Blank / छोड़े गए'}
                </span>
                <span className="font-bold text-[10px] text-slate-400">________</span>
              </div>
              <div className="border-r border-indigo-300 py-1.5 px-2 flex flex-col justify-center">
                <span className="block text-[8px] font-bold uppercase text-emerald-900 mb-0.5">
                  {metadata.omrEvalCorrectLabel ?? 'Correct (+)'}
                </span>
                <span className="font-bold text-[10px] text-slate-400">________</span>
              </div>
              <div className="border-r border-indigo-300 py-1.5 px-2 flex flex-col justify-center">
                <span className="block text-[8px] font-bold uppercase text-rose-900 mb-0.5">
                  {metadata.omrEvalWrongLabel ?? 'Wrong (-)'}
                </span>
                <span className="font-bold text-[10px] text-slate-400">________</span>
              </div>
              <div className="py-1.5 px-2 bg-indigo-50/40 flex flex-col justify-center">
                <span className="block text-[8px] font-black uppercase text-indigo-950 mb-0.5">
                  {metadata.omrEvalNetScoreLabel ?? 'Net Score / प्राप्तांक'}
                </span>
                <span className="font-bold text-[10px] text-slate-400">________</span>
              </div>
            </div>
          )}

          {/* Spacious Candidate Declaration, Invigilator Signature & Official Seal Boxes */}
          <div className="flex-1 grid grid-cols-12 gap-2.5 items-stretch min-h-[64px]">
            <div className="col-span-5 border-[1.5px] border-indigo-950 rounded-xs px-3 py-2 bg-white flex flex-col justify-between">
              <div className="text-[8px] font-semibold text-slate-700 leading-snug">
                <strong className="text-indigo-950 uppercase">
                  {metadata.omrDeclarationTitle ?? 'घोषणा / Declaration:'}
                </strong>{' '}
                {metadata.omrDeclarationText ??
                  'मैं प्रमाणित करता/करती हूँ कि मैंने ऊपर अपना अनुक्रमांक एवं प्रश्न पुस्तिका श्रृंखला सही-सही अंकित की है।'}
              </div>
              <div className="flex items-end justify-between mt-3 pt-1.5 border-t border-dotted border-indigo-300">
                <span className="font-extrabold text-indigo-950 uppercase text-[9px]">
                  {metadata.omrCandidateSignLabel ??
                    "Candidate's Signature / अभ्यर्थी के हस्ताक्षर"}
                </span>
                <span className="text-[8px] text-slate-500 font-mono">
                  {metadata.omrCandidateSignSubtext ?? '(In Running Hand)'}
                </span>
              </div>
            </div>

            <div className="col-span-4 border-[1.5px] border-indigo-950 rounded-xs px-3 py-2 bg-white flex flex-col justify-between">
              <div className="text-[8px] font-semibold text-slate-700 leading-snug">
                <strong className="text-indigo-950 uppercase">
                  {metadata.omrVerificationTitle ?? 'सत्यापन / Verification:'}
                </strong>{' '}
                {metadata.omrVerificationText ??
                  'अभ्यर्थी के अनुक्रमांक, नाम एवं पुस्तिका कोड का मिलान कर सत्यापित किया गया।'}
              </div>
              <div className="flex items-end justify-between mt-3 pt-1.5 border-t border-dotted border-indigo-300">
                <span className="font-extrabold text-indigo-950 uppercase text-[9px]">
                  {metadata.omrInvigilatorSignLabel ??
                    "Invigilator's Signature / कक्ष निरीक्षक"}
                </span>
                <span className="text-[8px] text-slate-500 font-mono">
                  {metadata.omrInvigilatorSignSubtext ?? '(With Date)'}
                </span>
              </div>
            </div>

            <div className="col-span-3 border-[1.5px] border-indigo-950 rounded-xs px-3 py-2 bg-slate-50 flex flex-col justify-between text-center">
              <span className="text-[8px] font-bold uppercase text-slate-600">
                {metadata.omrSuperintendentLabel ?? 'Center Superintendent / केंद्राधीक्षक'}
              </span>
              <div className="my-auto text-[8px] text-slate-400 font-mono uppercase">
                {metadata.omrStampSpaceLabel ?? '[ Stamp & Seal Space ]'}
              </div>
              <div className="pt-1.5 border-t border-dotted border-indigo-300 font-extrabold text-indigo-950 uppercase text-[9px]">
                {metadata.omrOfficialSealLabel ?? 'Official Seal / आधिकारिक मुहर'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageBoundaryFrame>
  );
};
