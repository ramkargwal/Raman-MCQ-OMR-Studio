export interface QuizQuestion {
  id: number;
  q: string;
  o: string[];
  a: number; // 0, 1, 2, or 3
  explanation?: string;
}

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
  includeOmr: boolean;
  includeQuestions: boolean;
  includeAnswerKey: boolean;
  omrCapacity: number; // e.g. 100 or dynamic
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
