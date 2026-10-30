export interface QuizQuestion {
  id: number;
  q: string;
  o: string[];
  a: number; // 0, 1, 2, or 3
  explanation?: string;
}

export type LogoPresetStyle =
  | 'science'
  | 'book_lotus'
  | 'torch_shield'
  | 'chakra'
  | 'monogram'
  | 'custom';

export type OmrOptionStyle = 'ABCD' | '1234' | 'HINDI_A' | 'HINDI_KA' | 'abcd';

export interface QuizMetadata {
  instituteName: string;
  examTitle: string;
  subject: string;
  classGrade: string;
  testCode: string;
  date: string;
  timeLimit: string;
  maxMarks: number;
  marksPerQuestion: number;
  negativeMarking: number;
  instructions: string[];
  watermarkText: string;
  showWatermark: boolean;
  twoColumnLayout: boolean;
  fontSize: 'compact' | 'normal' | 'relaxed';
  answerKeyFontSize?: 'compact' | 'normal' | 'large';
  includeOmr: boolean;
  includeQuestions: boolean;
  includeAnswerKey: boolean;
  omrCapacity: number; // e.g. 100 or dynamic

  // --- OMR Sheet & Branding Full Customization ---
  logoStyle?: LogoPresetStyle;
  customLogoUrl?: string; // Base64 Data URL or external URL for custom logo
  logoMonogramText?: string; // e.g. 'RRVV' when logoStyle === 'monogram'
  omrShowLeftLogo?: boolean;
  omrShowRightLogo?: boolean;
  omrRightLogoSameAsLeft?: boolean;
  omrRightCustomLogoUrl?: string;

  // Tier 1: Top Crown Bar
  omrBadgePrefix?: string; // default 'OMR' -> renders OMR-100
  omrTopBarTitle?: string; // default 'OPTICAL MARK RECOGNITION ANSWER SHEET • ओएमआर उत्तर पत्रक'
  omrSlogan?: string; // default '॥ विद्या ददाति विनयम् ॥'
  omrShowBarcode?: boolean; // default true
  omrFormCode?: string; // default 'FORM: A4-STD'

  // Tier 3: 5-Cell Metadata Ribbon Labels & Custom Overrides
  omrTimeLabel?: string; // default 'TIME / समय'
  omrDateLabel?: string; // default 'DATE / तारीख'
  omrQuestionsLabel?: string; // default 'QUESTIONS / कुल प्रश्न'
  omrMaxMarksLabel?: string; // default 'MAX MARKS / पूर्णांक'
  omrNegativeLabel?: string; // default 'NEGATIVE / ऋणात्मक'
  omrNegativeCustomText?: string; // optional override for negative marking cell text

  // Section 2: Candidate Particulars, Roll No, Booklet & Series
  omrCandidateNameLabel?: string;
  omrCandidateNameBoxes?: number;
  omrShowFatherName?: boolean;
  omrFatherNameLabel?: string;
  omrFatherNameBoxes?: number;
  omrSubjectClassLabel?: string;
  omrExamCenterLabel?: string;
  omrExamCenterDefaultValue?: string;

  omrRollNoLabel?: string;
  omrRollNoDigits?: number;
  omrBookletNoLabel?: string;
  omrBookletNoDigits?: number;
  omrCenterCodeLabel?: string;
  omrCenterCodeDigits?: number;
  omrRoomNoLabel?: string;
  omrRoomNoDigits?: number;

  omrBookletSeriesLabel?: string;
  omrBookletSeriesOptions?: string; // e.g. 'A,B,C,D'
  omrShiftLabel?: string;
  omrShiftOptions?: string; // e.g. 'I,II'
  omrSeriesFooterNote?: string;

  // Section 3: Marking Instructions Bar
  omrShowInstructionsBar?: boolean;
  omrInstructionBadge?: string;
  omrInstructionHeadline?: string;
  omrInstructionSubtext?: string;
  omrWrongLabel?: string;
  omrCorrectLabel?: string;

  // Section 4: Response Sheet Matrix & Rough Work
  omrResponseHeaderTitle?: string;
  omrOptionStyle?: OmrOptionStyle;
  omrRoughWorkTitle?: string;
  omrRoughWorkSubtitle?: string;
  omrRoughWorkFooterNote?: string;

  // Section 5: Bottom Evaluation Summary & Signatures Footer
  omrShowEvaluationTable?: boolean;
  omrEvalTotalLabel?: string;
  omrEvalAttemptedLabel?: string;
  omrEvalBlankLabel?: string;
  omrEvalCorrectLabel?: string;
  omrEvalWrongLabel?: string;
  omrEvalNetScoreLabel?: string;

  omrDeclarationTitle?: string;
  omrDeclarationText?: string;
  omrCandidateSignLabel?: string;
  omrCandidateSignSubtext?: string;

  omrVerificationTitle?: string;
  omrVerificationText?: string;
  omrInvigilatorSignLabel?: string;
  omrInvigilatorSignSubtext?: string;

  omrSuperintendentLabel?: string;
  omrStampSpaceLabel?: string;
  omrOfficialSealLabel?: string;
  omrPageFooterText?: string;
}

export interface PromptConfig {
  topic: string;
  questionCount: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Advanced (JEE/NEET)';
  language: 'Hindi' | 'Hinglish' | 'English' | 'Bilingual (Hindi + English)';
  subject: string;
  additionalNotes: string;
}

export type PrintTarget = 'full' | 'student_pack' | 'omr_only' | 'paper_only' | 'key_only';

export interface SavedExam {
  id: string;
  title: string;
  updatedAt: string;
  questionCount: number;
  inputText: string;
  metadata: QuizMetadata;
}
