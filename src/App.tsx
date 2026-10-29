import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText,
  Copy,
  ClipboardPaste,
  Printer,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  BookOpen,
  LayoutGrid,
  Check,
  ChevronDown,
  Layers,
  GraduationCap,
  RefreshCw,
  Edit3,
  FolderOpen,
  ZoomIn,
  ZoomOut,
  Palette,
  Contrast,
  Upload,
  Shuffle,
} from 'lucide-react';
import { QuizMetadata, QuizQuestion, PrintTarget, SavedExam } from './types/quiz';
import {
  parseQuizInput,
  formatQuestionsToPromptText,
  balanceQuestionOptions,
  randomizeQuestionsAndOptions,
  getAnswerDistribution,
} from './utils/parser';
import {
  SAMPLE_MATH_TRIGONOMETRY,
  SAMPLE_BHIMBETKA,
  SAMPLE_PHYSICS_CHEM,
  generateRamRaman100QuestionsText,
} from './utils/sampleData';
import { OMRSheet } from './components/OMRSheet';
import { QuestionPaper } from './components/QuestionPaper';
import { AnswerKey } from './components/AnswerKey';
import { PromptModal } from './components/PromptModal';
import { SettingsDrawer } from './components/SettingsDrawer';
import { QuestionEditorModal } from './components/QuestionEditorModal';
import { SavedExamsModal } from './components/SavedExamsModal';

const STORAGE_KEYS = {
  ACTIVE_INPUT: 'rrvv_mcq_active_input_v5',
  ACTIVE_METADATA: 'rrvv_mcq_active_metadata_v2',
  SAVED_EXAMS: 'rrvv_mcq_saved_exams_v1',
};

const DEFAULT_METADATA: QuizMetadata = {
  instituteName: 'राम रमन विज्ञान विश्वविद्यालय',
  examTitle: 'वार्षिक बहुविकल्पीय परीक्षा (Annual 100 Questions Assessment)',
  subject: 'विज्ञान एवं गणित (Science & Mathematics)',
  classGrade: 'विश्वविद्यालय स्नातक / प्रवेश परीक्षा',
  testCode: 'RRVV-100/SET-A',
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
  fontSize: 'normal',
  includeOmr: true,
  includeQuestions: true,
  includeAnswerKey: true,
  omrCapacity: 100,
};

export default function App() {
  // Load initial input text from localStorage or default 100 unique questions
  const [inputText, setInputText] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_INPUT);
      if (saved && saved.trim() && !saved.includes('राम रमन विज्ञान विश्वविद्यालय प्रश्न सं.')) {
        return saved;
      }
    } catch {
      // ignore storage errors
    }
    return generateRamRaman100QuestionsText();
  });

  // Load initial metadata from localStorage or default (with single default instruction)
  const [metadata, setMetadata] = useState<QuizMetadata>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_METADATA);
      if (saved) {
        return { ...DEFAULT_METADATA, ...JSON.parse(saved) };
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_METADATA;
  });

  // Saved exam snapshots in localStorage
  const [savedExams, setSavedExams] = useState<SavedExam[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SAVED_EXAMS);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<
    'preview' | 'omr' | 'paper' | 'answers' | 'practice'
  >('preview');
  const [printTarget, setPrintTarget] = useState<PrintTarget>('full');

  // Printer Ink Mode: 'color' (Deep Ink Color) or 'bw' (Pure Monochrome B&W Laser)
  const [inkMode, setInkMode] = useState<'color' | 'bw'>('color');
  // Preview Zoom Level (80% to 110%)
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Modals & Drawers
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuestionEditorOpen, setIsQuestionEditorOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [isSavedExamsOpen, setIsSavedExamsOpen] = useState(false);

  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [viewMode, setViewMode] = useState<'split' | 'document'>('split');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const txtFileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-save active inputText and metadata to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_INPUT, inputText);
    } catch {
      // ignore
    }
  }, [inputText]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_METADATA, JSON.stringify(metadata));
    } catch {
      // ignore
    }
  }, [metadata]);

  // Parse input questions
  const parseResult = useMemo(() => {
    return parseQuizInput(inputText);
  }, [inputText]);

  const questions = parseResult.questions;
  const answerDistribution = useMemo(() => getAnswerDistribution(questions), [questions]);

  // Update maxMarks whenever questions count changes
  useEffect(() => {
    if (questions.length > 0) {
      setMetadata((prev) => ({
        ...prev,
        maxMarks: questions.length * (prev.marksPerQuestion || 1),
      }));
    }
  }, [questions.length, metadata.marksPerQuestion]);

  const showToast = (msg: string) => {
    setCopiedStatus(msg);
    setTimeout(() => setCopiedStatus(null), 2600);
  };

  // Handle pasting directly from system clipboard into input
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setInputText(text);
        showToast('Pasted from clipboard!');
      } else {
        showToast('Clipboard is empty.');
      }
    } catch {
      const textarea = document.getElementById('quiz-input-textarea');
      if (textarea) {
        textarea.focus();
        showToast('Please press Ctrl+V to paste');
      }
    }
  };

  // Purely shuffle all 4 options of every question at random (no artificial logic)
  const handleBalanceOptions = () => {
    if (questions.length === 0) return;
    const shuffled = balanceQuestionOptions(questions);
    const formatted = formatQuestionsToPromptText(shuffled);
    setInputText(formatted);
    setUserAnswers({});
    showToast('Randomly shuffled all 4 options (A, B, C, D) for every question!');
  };

  // Purely shuffle question order AND purely shuffle all 4 options of every question
  const handleRandomizeAllQuestions = () => {
    if (questions.length === 0) return;
    const randomized = randomizeQuestionsAndOptions(questions);
    const formatted = formatQuestionsToPromptText(randomized);
    setInputText(formatted);
    setUserAnswers({});
    showToast(`Randomly shuffled all ${randomized.length} questions & options!`);
  };

  // Open Visual Editor for a specific question or all questions
  const handleOpenQuestionEditor = (questionId: number | null = null) => {
    setEditingQuestionId(questionId);
    setIsQuestionEditorOpen(true);
  };

  // Save edited questions from Visual Editor back to inputText
  const handleSaveEditedQuestions = (updatedQuestions: QuizQuestion[]) => {
    const formatted = formatQuestionsToPromptText(updatedQuestions);
    setInputText(formatted);
    showToast(`Updated ${updatedQuestions.length} questions from Visual Editor!`);
  };

  // Save an exam snapshot in browser storage
  const handleSaveExamSnapshot = (title: string) => {
    const newEntry: SavedExam = {
      id: `exam_${Date.now()}`,
      title,
      updatedAt: new Date().toLocaleString('hi-IN'),
      questionCount: questions.length,
      inputText,
      metadata,
    };
    const updated = [newEntry, ...savedExams];
    setSavedExams(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_EXAMS, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleLoadExamSnapshot = (exam: SavedExam) => {
    setInputText(exam.inputText);
    setMetadata(exam.metadata);
    showToast(`Loaded "${exam.title}"!`);
  };

  const handleDeleteExamSnapshot = (id: string) => {
    const updated = savedExams.filter((item) => item.id !== id);
    setSavedExams(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_EXAMS, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleImportExamData = (importedText: string, importedMeta?: QuizMetadata) => {
    setInputText(importedText);
    if (importedMeta) {
      setMetadata((prev) => ({ ...prev, ...importedMeta }));
    }
    showToast('Imported exam paper successfully!');
  };

  // Process an uploaded or dropped .txt / .json file directly into the Input Box
  const processUploadedFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = String(event.target?.result || '');
      if (!content.trim()) {
        showToast('Selected file is empty.');
        return;
      }

      // Check if it is a JSON pack containing { inputText, metadata }
      try {
        const parsedJson = JSON.parse(content);
        if (parsedJson && typeof parsedJson.inputText === 'string') {
          setInputText(parsedJson.inputText);
          if (parsedJson.metadata) {
            setMetadata((prev) => ({ ...prev, ...parsedJson.metadata }));
          }
          showToast(`Loaded exam pack from "${file.name}"!`);
          return;
        }
      } catch {
        // Regular .txt file
      }

      setInputText(content);
      const parsed = parseQuizInput(content);
      showToast(
        parsed.questions.length > 0
          ? `Loaded ${parsed.questions.length} questions from "${file.name}"!`
          : `Loaded text from "${file.name}"`
      );
    };
    reader.readAsText(file);
  };

  const handleDirectFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingFile) setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Load preset samples
  const handleLoadSample = (
    sampleType: 'ramraman100' | 'bhimbetka' | 'math' | 'physics'
  ) => {
    if (sampleType === 'ramraman100') {
      setInputText(generateRamRaman100QuestionsText());
      setMetadata((prev) => ({
        ...prev,
        instituteName: 'राम रमन विज्ञान विश्वविद्यालय',
        examTitle: 'वार्षिक बहुविकल्पीय परीक्षा (100 Questions Assessment)',
        subject: 'विज्ञान एवं गणित (Science & Mathematics)',
        classGrade: 'विश्वविद्यालय स्नातक / प्रवेश परीक्षा',
        testCode: 'RRVV-100/SET-A',
        timeLimit: '120 मिनट (2 Hours)',
        maxMarks: 100,
        omrCapacity: 100,
        twoColumnLayout: true,
        watermarkText: 'राम रमन विज्ञान विश्वविद्यालय',
      }));
    } else if (sampleType === 'bhimbetka') {
      const randomized = randomizeQuestionsAndOptions(parseQuizInput(SAMPLE_BHIMBETKA).questions);
      setInputText(formatQuestionsToPromptText(randomized));
      setMetadata((prev) => ({
        ...prev,
        instituteName: 'राम रमन विज्ञान विश्वविद्यालय',
        examTitle: 'ऐतिहासिक अध्ययन परीक्षा (भीमबेटका शैलचित्र)',
        subject: 'प्राचीन भारतीय इतिहास एवं पुरातत्व',
        testCode: 'BHIM-2026',
        twoColumnLayout: false,
      }));
    } else if (sampleType === 'math') {
      const randomized = randomizeQuestionsAndOptions(
        parseQuizInput(SAMPLE_MATH_TRIGONOMETRY).questions
      );
      setInputText(formatQuestionsToPromptText(randomized));
      setMetadata((prev) => ({
        ...prev,
        instituteName: 'राम रमन विज्ञान विश्वविद्यालय',
        examTitle: 'गणित एवं त्रिकोणमिति परीक्षा (Higher Mathematics)',
        subject: 'MATHEMATICS (त्रिकोणमिति, सम्मिश्र संख्या एवं कलन)',
        testCode: 'MATH-XII-A',
        twoColumnLayout: true,
      }));
    } else if (sampleType === 'physics') {
      const randomized = randomizeQuestionsAndOptions(
        parseQuizInput(SAMPLE_PHYSICS_CHEM).questions
      );
      setInputText(formatQuestionsToPromptText(randomized));
      setMetadata((prev) => ({
        ...prev,
        instituteName: 'राम रमन विज्ञान विश्वविद्यालय',
        examTitle: 'भौतिकी एवं रासायनिक विज्ञान परीक्षा (Science Assessment)',
        subject: 'PHYSICAL SCIENCES & CHEMISTRY (भौतिकी एवं रसायन)',
        testCode: 'SCI-2026',
        twoColumnLayout: true,
      }));
    }
    setUserAnswers({});
    showToast('Sample Loaded & Randomized!');
  };

  // Trigger selective or full print
  const handlePrintWithMode = (mode?: PrintTarget) => {
    if (mode) {
      setPrintTarget(mode);
      setActiveTab('preview');
      setTimeout(() => {
        window.print();
      }, 120);
    } else {
      window.print();
    }
  };

  // Interactive OMR bubble selection
  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: prev[questionId] === optionIndex ? -1 : optionIndex,
    }));
  };

  // Calculate score in interactive practice mode
  const practiceScore = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    questions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (ans === undefined || ans === -1) {
        unattempted++;
      } else if (ans === q.a) {
        correct++;
      } else {
        incorrect++;
      }
    });

    const marksPerQ = metadata.marksPerQuestion || 1;
    const penalty = metadata.negativeMarking || 0;
    const totalScore = correct * marksPerQ - incorrect * penalty;

    return {
      correct,
      incorrect,
      unattempted,
      totalScore: Math.max(0, totalScore),
      maxScore: questions.length * marksPerQ,
    };
  }, [questions, userAnswers, metadata.marksPerQuestion, metadata.negativeMarking]);

  // Determine which sections to render for screen & print
  const showOmrSection =
    activeTab === 'omr' ||
    activeTab === 'practice' ||
    (activeTab === 'preview' &&
      metadata.includeOmr &&
      (printTarget === 'full' || printTarget === 'student_pack' || printTarget === 'omr_only'));

  const showPaperSection =
    activeTab === 'paper' ||
    (activeTab === 'preview' &&
      metadata.includeQuestions &&
      (printTarget === 'full' || printTarget === 'student_pack' || printTarget === 'paper_only'));

  const showKeySection =
    activeTab === 'answers' ||
    (activeTab === 'preview' &&
      metadata.includeAnswerKey &&
      (printTarget === 'full' || printTarget === 'key_only'));

  const printTargetLabels: Record<PrintTarget, string> = {
    full: 'Full Exam Pack (OMR + Paper + Key)',
    student_pack: 'Student Copy (OMR + Question Paper Only)',
    omr_only: 'Only Page 1: OMR Sheet',
    paper_only: 'Only MCQ Question Paper',
    key_only: 'Only Last Page: Answer Key',
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      {/* ========================================================
          TOP NAVIGATION BAR (NO-PRINT)
      ======================================================== */}
      <nav className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md text-slate-900 border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xs ring-1 ring-blue-600/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-slate-900 text-base">
                  MCQ &amp; OMR Paper Studio
                </span>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-200/80">
                  LaTeX Math Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Page 1 OMR Sheet • Middle MCQ Paper • Last Page Answer Key
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Visual Question Editor Button */}
            <button
              type="button"
              onClick={() => handleOpenQuestionEditor(null)}
              disabled={questions.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
              title="Open Visual Question Editor & Live LaTeX Fixer"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Visual Editor</span>
            </button>

            {/* Save / Load / Export Files Button */}
            <button
              type="button"
              onClick={() => setIsSavedExamsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 text-xs font-bold transition shadow-2xs cursor-pointer"
              title="Save, Load, Export (.json/.txt) or Import Exam Papers"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>Save / Files</span>
            </button>

            {/* Copy Prompt Button */}
            <button
              type="button"
              onClick={() => setIsPromptModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy AI Prompt</span>
            </button>

            {/* Paste Button */}
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
              title="Paste quiz code from clipboard"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Paste</span>
            </button>

            {/* Sample Selector Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 text-xs font-semibold transition shadow-2xs cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden xl:inline">Presets</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 hidden group-hover:block hover:block">
                <button
                  type="button"
                  onClick={() => handleLoadSample('ramraman100')}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-blue-50/60 flex flex-col border-b border-slate-100 cursor-pointer"
                >
                  <span className="font-bold text-amber-700 flex items-center gap-1">
                    <span>⚡ राम रमन 100 प्रश्न OMR टेस्ट</span>
                  </span>
                  <span className="text-[10px] text-slate-500">100 Questions Full Paper &amp; OMR</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('bhimbetka')}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex flex-col cursor-pointer"
                >
                  <span className="font-bold text-slate-800">भीमबेटका की गुफाएँ</span>
                  <span className="text-[10px] text-slate-500">20 History Questions in Hindi</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('math')}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex flex-col border-t border-slate-100 cursor-pointer"
                >
                  <span className="font-bold text-blue-700">Mathematics &amp; Trigonometry</span>
                  <span className="text-[10px] text-slate-500">20 Rich LaTeX Formula Questions</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('physics')}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex flex-col border-t border-slate-100 cursor-pointer"
                >
                  <span className="font-bold text-emerald-700">Physics &amp; Chemistry</span>
                  <span className="text-[10px] text-slate-500">Kinematics, Formulas &amp; Equations</span>
                </button>
              </div>
            </div>

            {/* Settings Drawer Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 text-xs font-semibold transition shadow-2xs cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden lg:inline">Settings</span>
            </button>

            {/* Separate Print Mode Dropdown & Print Button */}
            <div className="relative group">
              <div className="inline-flex rounded-lg shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => handlePrintWithMode()}
                  disabled={questions.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print PDF</span>
                </button>
                <button
                  type="button"
                  disabled={questions.length === 0}
                  className="px-2 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white border-l border-emerald-500 text-xs font-bold transition cursor-pointer"
                  title="Select what to print"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dropdown Menu for Separate Print Modes */}
              <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 hidden group-hover:block hover:block">
                <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Selective Print Mode (One-Click)
                </div>
                {(
                  [
                    {
                      id: 'full',
                      title: 'Print Complete Exam Pack',
                      desc: 'Page 1 OMR + Question Paper + Answer Key',
                    },
                    {
                      id: 'student_pack',
                      title: 'Print Student Copy (No Key)',
                      desc: 'OMR Sheet + Question Paper Only',
                    },
                    {
                      id: 'omr_only',
                      title: 'Print Only OMR Sheet',
                      desc: 'Page 1 OMR Response Sheet (1-100)',
                    },
                    {
                      id: 'paper_only',
                      title: 'Print Only Question Paper',
                      desc: 'MCQ Question Booklet Pages Only',
                    },
                    {
                      id: 'key_only',
                      title: 'Print Only Answer Key',
                      desc: 'Last Page Evaluation Answer Key Only',
                    },
                  ] as Array<{ id: PrintTarget; title: string; desc: string }>
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handlePrintWithMode(item.id)}
                    className={`w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 flex flex-col border-b border-slate-100 last:border-none cursor-pointer ${
                      printTarget === item.id ? 'bg-emerald-50/70 text-emerald-800' : 'text-slate-700'
                    }`}
                  >
                    <span className="font-bold flex items-center justify-between">
                      <span>{item.title}</span>
                      {printTarget === item.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </span>
                    <span className="text-[10px] text-slate-500">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Status notification toast */}
        {copiedStatus && (
          <div className="bg-emerald-600 text-white text-center text-xs py-1.5 font-semibold flex items-center justify-center gap-1.5 shadow-inner">
            <Check className="w-3.5 h-3.5" />
            {copiedStatus}
          </div>
        )}
      </nav>

      {/* ========================================================
          SUB-HEADER: VIEW CONTROLS & PRINT FILTER (NO-PRINT)
      ======================================================== */}
      <div className="no-print bg-slate-50/90 border-b border-slate-200/80 px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Tabs for previewing specific parts */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-200/70 p-1 rounded-xl border border-slate-200/90">
            <button
              type="button"
              onClick={() => {
                setActiveTab('preview');
                setPrintTarget('full');
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'preview' && printTarget === 'full'
                  ? 'bg-white text-blue-700 shadow-2xs ring-1 ring-slate-900/5'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Pack (All Pages)
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('preview');
                setPrintTarget('student_pack');
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'preview' && printTarget === 'student_pack'
                  ? 'bg-white text-blue-700 shadow-2xs ring-1 ring-slate-900/5'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student Copy (OMR + Paper)
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('omr');
                setPrintTarget('omr_only');
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'omr'
                  ? 'bg-white text-blue-700 shadow-2xs ring-1 ring-slate-900/5'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Only OMR Sheet
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('paper');
                setPrintTarget('paper_only');
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'paper'
                  ? 'bg-white text-blue-700 shadow-2xs ring-1 ring-slate-900/5'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Only Question Paper
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('answers');
                setPrintTarget('key_only');
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'answers'
                  ? 'bg-white text-blue-700 shadow-2xs ring-1 ring-slate-900/5'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Only Answer Key
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('practice')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 cursor-pointer ${
                activeTab === 'practice'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-purple-700 hover:bg-purple-100/70'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Practice OMR</span>
            </button>
          </div>

          {/* Question Stats & Layout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-medium">
              {parseResult.error ? (
                <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Format Warning
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <strong>{questions.length}</strong> Questions Ready
                </span>
              )}
            </div>

            {/* Toggle Show/Hide Top Input Box */}
            <div className="hidden sm:flex items-center gap-1 text-slate-500 border-l border-slate-200 pl-3">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'split' ? 'document' : 'split')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition border ${
                  viewMode === 'split'
                    ? 'bg-white text-slate-800 border-slate-300 shadow-2xs'
                    : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                }`}
                title="Show or hide the top Quiz Input Data Box"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{viewMode === 'split' ? 'Hide Input Box' : 'Show Input Box'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          MAIN WORKSPACE (TOP INPUT BOX + BOTTOM DOCUMENT PREVIEW)
      ======================================================== */}
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 flex-1 flex flex-col">
        {/* Practice Mode Scoreboard Banner */}
        {activeTab === 'practice' && (
          <div className="no-print mb-4 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-300" />
                <h3 className="font-black text-sm uppercase tracking-wide">
                  Interactive Student Practice Mode
                </h3>
              </div>
              <p className="text-xs text-purple-200 mt-0.5">
                Click any bubble (A, B, C, D) on the OMR sheet to mark your answer in real time.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="bg-purple-950/60 border border-purple-700/50 px-3 py-1.5 rounded-lg text-center">
                <span className="block text-[10px] text-purple-300 uppercase">Correct</span>
                <span className="text-base font-bold text-emerald-400">+{practiceScore.correct}</span>
              </div>
              <div className="bg-purple-950/60 border border-purple-700/50 px-3 py-1.5 rounded-lg text-center">
                <span className="block text-[10px] text-purple-300 uppercase">Wrong</span>
                <span className="text-base font-bold text-rose-400">-{practiceScore.incorrect}</span>
              </div>
              <div className="bg-purple-950/60 border border-purple-700/50 px-3 py-1.5 rounded-lg text-center">
                <span className="block text-[10px] text-purple-300 uppercase">Unanswered</span>
                <span className="text-base font-bold text-slate-300">{practiceScore.unattempted}</span>
              </div>
              <div className="bg-white text-purple-950 px-4 py-1.5 rounded-lg text-center shadow">
                <span className="block text-[10px] font-bold uppercase text-purple-700">Total Marks</span>
                <span className="text-base font-black text-purple-900">
                  {practiceScore.totalScore} / {practiceScore.maxScore}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setUserAnswers({})}
                className="text-xs text-purple-200 hover:text-white underline cursor-pointer"
              >
                Reset Answers
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6 w-full">
          {/* ----------------------------------------------------
              TOP PANEL: QUIZ INPUT DATA BOX & CODE EDITOR (NO-PRINT)
              (Supports .txt / .json file Upload & Drag-and-Drop)
          ---------------------------------------------------- */}
          {viewMode === 'split' && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`no-print w-full flex flex-col bg-white rounded-2xl border transition-all shadow-xs overflow-hidden relative ${
                isDraggingFile
                  ? 'border-blue-600 ring-4 ring-blue-500/20 bg-blue-50/20'
                  : 'border-slate-200/90'
              }`}
            >
              {/* Drag-and-Drop Visual Overlay */}
              {isDraggingFile && (
                <div className="absolute inset-0 z-30 bg-blue-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 text-center pointer-events-none">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-3 shadow-lg border border-blue-400">
                    <Upload className="w-7 h-7 text-white animate-bounce" />
                  </div>
                  <p className="text-base font-extrabold tracking-wide">
                    Drop your .txt or .json file here
                  </p>
                  <p className="text-xs text-blue-200 mt-1">
                    Questions will automatically load into the editor
                  </p>
                </div>
              )}

              {/* Hidden File Input for .txt / .json Upload */}
              <input
                ref={txtFileInputRef}
                type="file"
                accept=".txt,.json,text/plain,application/json"
                onChange={handleDirectFileSelect}
                className="hidden"
              />

              {/* Input Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    Quiz Input Data Box
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Paste, upload, or drag &amp; drop a <code className="text-slate-700 font-semibold">.txt</code> file here
                  </p>
                </div>

                <div className="flex items-center flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => txtFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-md border border-blue-700 transition cursor-pointer shadow-2xs"
                    title="Upload a .txt or .json quiz file from your computer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload .txt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenQuestionEditor(null)}
                    disabled={questions.length === 0}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-md border border-indigo-200 transition cursor-pointer disabled:opacity-50"
                    title="Edit questions visually with live LaTeX preview"
                  >
                    <Edit3 className="w-3 h-3 text-indigo-600" />
                    <span>Visual Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRandomizeAllQuestions}
                    disabled={questions.length === 0}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md border border-emerald-700 transition cursor-pointer shadow-2xs disabled:opacity-50"
                    title="Purely randomize question order AND randomly shuffle all 4 options (A, B, C, D)"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>Randomize All</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleBalanceOptions}
                    disabled={questions.length === 0}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-slate-50 text-slate-800 rounded-md border border-slate-300 transition cursor-pointer shadow-2xs disabled:opacity-50"
                    title="Keep question order and purely shuffle all 4 options (A, B, C, D) at random"
                  >
                    <RefreshCw className="w-3 h-3 text-emerald-600" />
                    <span>Shuffle Options</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
                    title="Paste from clipboard"
                  >
                    <ClipboardPaste className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputText('')}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                    title="Clear input"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Textarea Code Box (White Background) */}
              <div className="relative p-3.5 bg-slate-50/50">
                <textarea
                  id="quiz-input-textarea"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Paste quiz objects here or drag & drop a .txt file:\n{ q: "यदि $z = \\cos\\theta + i\\sin\\theta$ है, तो $z^n + z^{-n}$ किसके बराबर है?", o: ["$2\\sin(n\\theta)$", "$2i\\sin(n\\theta)$", "$2\\cos(n\\theta)$", "$2i\\cos(n\\theta)$"], a: 2 },`}
                  className="w-full h-44 sm:h-52 p-3.5 text-xs font-mono bg-white text-slate-900 border border-slate-300 rounded-xl shadow-2xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-y leading-relaxed overflow-y-auto"
                  spellCheck={false}
                />
              </div>

              {/* Input Footer & Answer Distribution Helper */}
              <div className="px-4 py-2.5 bg-slate-50/90 border-t border-slate-200/90 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900">{questions.length} Qs</span>
                  {questions.length > 0 && (
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-mono font-bold text-slate-700 shadow-2xs"
                      title="Live distribution of correct answers across options A, B, C, and D"
                    >
                      <span className="text-blue-700">A:{answerDistribution.A}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-emerald-700">B:{answerDistribution.B}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-amber-700">C:{answerDistribution.C}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-purple-700">D:{answerDistribution.D}</span>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsPromptModalOpen(true)}
                  className="text-blue-600 hover:text-blue-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Need Questions? Copy AI Prompt
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              BOTTOM PANEL: DOCUMENT PREVIEW (PRINTABLE CONTAINER)
          ---------------------------------------------------- */}
          <div className="w-full flex flex-col">
            {/* Action Bar Above Preview (NO-PRINT) */}
            <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs text-xs">
              {/* Selective Print Target */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">Print Mode:</span>
                <select
                  value={printTarget}
                  onChange={(e) => {
                    const mode = e.target.value as PrintTarget;
                    setPrintTarget(mode);
                    setActiveTab('preview');
                  }}
                  className="font-bold text-indigo-950 bg-indigo-50/70 border border-indigo-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="full">{printTargetLabels.full}</option>
                  <option value="student_pack">{printTargetLabels.student_pack}</option>
                  <option value="omr_only">{printTargetLabels.omr_only}</option>
                  <option value="paper_only">{printTargetLabels.paper_only}</option>
                  <option value="key_only">{printTargetLabels.key_only}</option>
                </select>
              </div>

              {/* Printer Ink Toggle + Zoom + 2-Column Controls */}
              <div className="flex flex-wrap items-center gap-1.5">
                {/* 1-Click Color vs B&W Laser Printer Toggle */}
                <button
                  type="button"
                  onClick={() => setInkMode((m) => (m === 'color' ? 'bw' : 'color'))}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                    inkMode === 'bw'
                      ? 'bg-slate-800 border-slate-800 text-white'
                      : 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100'
                  }`}
                  title="Switch between Deep Color Ink and Pure B&W Laser Printer mode"
                >
                  {inkMode === 'bw' ? (
                    <>
                      <Contrast className="w-3.5 h-3.5" />
                      <span>B&amp;W Laser Ink</span>
                    </>
                  ) : (
                    <>
                      <Palette className="w-3.5 h-3.5 text-blue-600" />
                      <span>Color Ink</span>
                    </>
                  )}
                </button>

                {/* 2-Column Mode Toggle */}
                <button
                  type="button"
                  onClick={() =>
                    setMetadata((prev) => ({
                      ...prev,
                      twoColumnLayout: !prev.twoColumnLayout,
                    }))
                  }
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    metadata.twoColumnLayout
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                      : 'bg-slate-50 border-slate-300 text-slate-700'
                  }`}
                  title="Toggle 2-column or 1-column layout for question paper"
                >
                  {metadata.twoColumnLayout ? '2-Col' : '1-Col'}
                </button>

                {/* Zoom Controls */}
                <div className="hidden sm:inline-flex items-center border border-slate-200 rounded-lg bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(80, z - 10))}
                    className="p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-1.5 font-mono font-bold text-[11px] text-slate-700 tabular-nums">
                    {zoomLevel}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(115, z + 10))}
                    className="p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handlePrintWithMode()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Empty state warning if no questions */}
            {questions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 shadow-2xs">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 text-base mb-1">
                  No Questions Detected
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                  Please paste raw quiz objects in the input box, or click{' '}
                  <strong>Copy AI Prompt</strong> to generate them via ChatGPT or Gemini.
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadSample('ramraman100')}
                    className="px-3.5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition cursor-pointer shadow-2xs"
                  >
                    Load 100 Questions Exam Paper
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample('math')}
                    className="px-3.5 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                  >
                    Load Math &amp; Trigonometry (LaTeX)
                  </button>
                </div>
              </div>
            ) : (
              /* ====================================================
                  PRINTABLE A4 DESK CONTAINER
              ==================================================== */
              <div
                className={`print-container space-y-8 print:space-y-0 transition-all origin-top ${
                  inkMode === 'bw' ? 'bw-ink-mode' : ''
                }`}
                style={{
                  zoom: zoomLevel !== 100 ? `${zoomLevel}%` : undefined,
                }}
              >
                {/* ------------------------------------------------
                    PAGE 1: OMR ANSWER SHEET
                ------------------------------------------------ */}
                {showOmrSection && (
                  <div className="print-page">
                    <div className="no-print text-center mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      — PAGE 01 : OMR ANSWER SHEET (100 QUESTIONS) —
                    </div>
                    <OMRSheet
                      metadata={metadata}
                      questions={questions}
                      userAnswers={userAnswers}
                      onAnswerSelect={handleAnswerSelect}
                      isInteractive={activeTab === 'practice'}
                    />
                  </div>
                )}

                {/* ------------------------------------------------
                    MIDDLE PAGES: MCQ QUESTION PAPER
                ------------------------------------------------ */}
                {showPaperSection && (
                  <div className="print-page">
                    <div className="no-print text-center mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      — MCQ QUESTION PAPER (HOVER ANY QUESTION TO CLICK EDIT) —
                    </div>
                    <QuestionPaper
                      metadata={metadata}
                      questions={questions}
                      onEditQuestion={(qId) => handleOpenQuestionEditor(qId)}
                    />
                  </div>
                )}

                {/* ------------------------------------------------
                    LAST PAGE: ANSWER KEY & SOLUTION MATRIX
                ------------------------------------------------ */}
                {showKeySection && (
                  <div className="print-page">
                    <div className="no-print text-center mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      — LAST PAGE : OFFICIAL ANSWER KEY —
                    </div>
                    <AnswerKey metadata={metadata} questions={questions} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          MODALS & DRAWERS
      ======================================================== */}
      {/* AI Prompt Generator Modal */}
      <PromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
      />

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        metadata={metadata}
        onChange={setMetadata}
      />

      {/* Visual Question Editor & Live LaTeX Fixer Modal */}
      <QuestionEditorModal
        isOpen={isQuestionEditorOpen}
        onClose={() => setIsQuestionEditorOpen(false)}
        questions={questions}
        initialQuestionId={editingQuestionId}
        onSaveQuestions={handleSaveEditedQuestions}
      />

      {/* Save / Load / Export / Import Modal */}
      <SavedExamsModal
        isOpen={isSavedExamsOpen}
        onClose={() => setIsSavedExamsOpen(false)}
        currentInputText={inputText}
        currentMetadata={metadata}
        currentQuestionCount={questions.length}
        savedExams={savedExams}
        onSaveExam={handleSaveExamSnapshot}
        onLoadExam={handleLoadExamSnapshot}
        onDeleteExam={handleDeleteExamSnapshot}
        onImportExamData={handleImportExamData}
      />
    </div>
  );
}
