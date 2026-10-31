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

export type PrintTarget = 'full' | 'student_pack' | 'omr_only' | 'paper_only' | 'key_only';

export interface SavedExam {
  id: string;
  title: string;
  updatedAt: string;
  questionCount: number;
  inputText: string;
  metadata: QuizMetadata;
}

export const DEFAULT_OMR_CUSTOMIZATIONS: Partial<QuizMetadata> = {
  logoStyle: 'science',
  customLogoUrl: '',
  logoMonogramText: 'RRVV',
  omrShowLeftLogo: true,
  omrShowRightLogo: true,
  omrRightLogoSameAsLeft: true,
  omrRightCustomLogoUrl: '',
  omrBadgePrefix: 'OMR',
  omrTopBarTitle: 'OPTICAL MARK RECOGNITION ANSWER SHEET • ओएमआर उत्तर पत्रक',
  omrSlogan: '॥ विद्या ददाति विनयम् ॥',
  omrShowBarcode: true,
  omrFormCode: 'FORM: A4-STD',
  omrTimeLabel: 'TIME / समय',
  omrDateLabel: 'DATE / तारीख',
  omrQuestionsLabel: 'QUESTIONS / कुल प्रश्न',
  omrMaxMarksLabel: 'MAX MARKS / पूर्णांक',
  omrNegativeLabel: 'NEGATIVE / ऋणात्मक',
  omrNegativeCustomText: '',
  omrCandidateNameLabel: '1. Candidate Name / अभ्यर्थी का नाम (In Block Letters)',
  omrCandidateNameBoxes: 16,
  omrShowFatherName: true,
  omrFatherNameLabel: "2. Father's / Guardian's Name / पिता या अभिभावक का नाम",
  omrFatherNameBoxes: 16,
  omrSubjectClassLabel: 'Subject & Class / विषय एवं कक्षा:',
  omrExamCenterLabel: 'Exam Center / परीक्षा केंद्र:',
  omrExamCenterDefaultValue: '',
  omrRollNoLabel: '3. Roll Number / अनुक्रमांक (8 Digits)',
  omrRollNoDigits: 8,
  omrBookletNoLabel: '4. Question Booklet No. / प्रश्न पुस्तिका संख्या',
  omrBookletNoDigits: 6,
  omrCenterCodeLabel: 'Center Code / केंद्र कोड:',
  omrCenterCodeDigits: 4,
  omrRoomNoLabel: 'Room No. / कक्ष सं.:',
  omrRoomNoDigits: 3,
  omrBookletSeriesLabel: '5. Booklet Series / श्रृंखला',
  omrBookletSeriesOptions: 'A, B, C, D',
  omrShiftLabel: '6. Shift / पाली',
  omrShiftOptions: 'I, II',
  omrSeriesFooterNote: 'Darken Correct Set & Shift Circle',
  omrShowInstructionsBar: true,
  omrInstructionBadge: 'महत्वपूर्ण निर्देश / MARKING INSTRUCTIONS',
  omrInstructionHeadline:
    'केवल काले या नीले बॉल पेन (Black/Blue Ball Point Pen) से गोले को पूर्णतः गहरा भरें।',
  omrInstructionSubtext:
    '• पहले स्तंभ (Column 1: Q.01–20) को पूरा भरने के बाद ही अगले स्तंभ पर जाएं। • एक से अधिक गोले भरने या काट-छांट करने पर उत्तर अमान्य होगा।',
  omrWrongLabel: 'गलत / Wrong:',
  omrCorrectLabel: 'सही / Correct:',
  omrResponseHeaderTitle: '▼ RESPONSE SHEET / उत्तर प्रभाग',
  omrOptionStyle: 'ABCD',
  omrRoughWorkTitle: '✎ SPACE FOR ROUGH WORK / रफ कार्य हेतु स्थान',
  omrRoughWorkSubtitle:
    'Candidate Calculation & Scratchpad Area • अभ्यर्थी गणना एवं रफ कार्य क्षेत्र',
  omrRoughWorkFooterNote: 'Do not make any stray marks on the OMR response circles.',
  omrShowEvaluationTable: true,
  omrEvalTotalLabel: 'Total Questions',
  omrEvalAttemptedLabel: 'Attempted / हल किए',
  omrEvalBlankLabel: 'Left Blank / छोड़े गए',
  omrEvalCorrectLabel: 'Correct (+)',
  omrEvalWrongLabel: 'Wrong (-)',
  omrEvalNetScoreLabel: 'Net Score / प्राप्तांक',
  omrDeclarationTitle: 'घोषणा / Declaration:',
  omrDeclarationText:
    'मैं प्रमाणित करता/करती हूँ कि मैंने ऊपर अपना अनुक्रमांक एवं प्रश्न पुस्तिका श्रृंखला सही-सही अंकित की है।',
  omrCandidateSignLabel: "Candidate's Signature / अभ्यर्थी के हस्ताक्षर",
  omrCandidateSignSubtext: '(In Running Hand)',
  omrVerificationTitle: 'सत्यापन / Verification:',
  omrVerificationText:
    'अभ्यर्थी के अनुक्रमांक, नाम एवं पुस्तिका कोड का मिलान कर सत्यापित किया गया।',
  omrInvigilatorSignLabel: "Invigilator's Signature / कक्ष निरीक्षक",
  omrInvigilatorSignSubtext: '(With Date)',
  omrSuperintendentLabel: 'Center Superintendent / केंद्राधीक्षक',
  omrStampSpaceLabel: '[ Stamp & Seal Space ]',
  omrOfficialSealLabel: 'Official Seal / आधिकारिक मुहर',
  omrPageFooterText: 'PAGE 01 • OMR ANSWER SHEET',
};

export function createDefaultMetadata(): QuizMetadata {
  return {
    instituteName: 'राम रमन विज्ञान विश्वविद्यालय',
    examTitle: 'वार्षिक बहुविकल्पीय परीक्षा (MCQ Assessment)',
    subject: 'विज्ञान एवं गणित (Science & Mathematics)',
    classGrade: 'विश्वविद्यालय स्नातक / प्रवेश परीक्षा',
    testCode: 'RRVV/SET-A',
    date: new Date().toLocaleDateString('hi-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    timeLimit: '120 मिनट (2 Hours)',
    maxMarks: 100,
    marksPerQuestion: 1,
    negativeMarking: 0,
    instructions: [
      'सभी प्रश्न अनिवार्य हैं। प्रत्येक प्रश्न के 4 विकल्प (A, B, C, D) में से सही उत्तर चुनकर OMR शीट में नीले/काले बॉल पेन से गोला भरें।',
    ],
    watermarkText: 'राम रमन विज्ञान विश्वविद्यालय',
    showWatermark: false,
    twoColumnLayout: true,
    fontSize: 'relaxed',
    answerKeyFontSize: 'large',
    includeOmr: true,
    includeQuestions: true,
    includeAnswerKey: true,
    omrCapacity: 0,
    ...DEFAULT_OMR_CUSTOMIZATIONS,
  };
}
