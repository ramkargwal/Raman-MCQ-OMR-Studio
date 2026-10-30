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
  GraduationCap,
  Play,
  Edit3,
  FolderOpen,
  Palette,
  Contrast,
  Upload,
  Shuffle,
} from 'lucide-react';
import { QuizMetadata, QuizQuestion, PrintTarget, SavedExam } from './types/quiz';
import {
  parseQuizInput,
  formatQuestionsToPromptText,
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
  ACTIVE_METADATA: 'rrvv_mcq_active_metadata_v4',
  SAVED_EXAMS: 'rrvv_mcq_saved_exams_v1',
};

const DEFAULT_METADATA: QuizMetadata = {
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
};

export default function App() {
  // Default input box is clean/empty when the page opens
  const [inputText, setInputText] = useState<string>('');

  // Load initial metadata from localStorage or default
  const [metadata, setMetadata] = useState<QuizMetadata>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_METADATA);
      if (saved) {
        return { ...DEFAULT_METADATA, ...JSON.parse(saved) };
      }
      const legacySaved = localStorage.getItem('rrvv_mcq_active_metadata_v3');
      if (legacySaved) {
        const parsedLegacy = JSON.parse(legacySaved);
        return {
          ...DEFAULT_METADATA,
          ...parsedLegacy,
          fontSize: 'relaxed',
          answerKeyFontSize: 'large',
        };
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

  // Top navbar dropdown state & hover grace timer so menu never disappears while moving pointer
  const [openDropdown, setOpenDropdown] = useState<'presets' | 'print' | null>(null);
  const dropdownTimerRef = useRef<number | null>(null);
  const navDropdownAreaRef = useRef<HTMLDivElement | null>(null);

  const handleDropdownEnter = (menu: 'presets' | 'print') => {
    if (dropdownTimerRef.current) {
      window.clearTimeout(dropdownTimerRef.current);
      dropdownTimerRef.current = null;
    }
    setOpenDropdown(menu);
  };

  const handleDropdownLeave = () => {
    if (dropdownTimerRef.current) {
      window.clearTimeout(dropdownTimerRef.current);
    }
    dropdownTimerRef.current = window.setTimeout(() => {
      setOpenDropdown(null);
    }, 220);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        navDropdownAreaRef.current &&
        !navDropdownAreaRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Reset all webpage & exam settings back to original defaults
  const handleResetAllSettings = () => {
    const freshMetadata: QuizMetadata = {
      ...DEFAULT_METADATA,
      date: new Date().toLocaleDateString('hi-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      maxMarks:
        questions.length > 0
          ? questions.length * (DEFAULT_METADATA.marksPerQuestion || 1)
          : DEFAULT_METADATA.maxMarks,
    };
    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_METADATA);
    } catch {
      // ignore storage errors
    }
    setMetadata(freshMetadata);
    setInkMode('color');
    setViewMode('split');
    setActiveTab('preview');
    setPrintTarget('full');
    setUserAnswers({});
    showToast('All webpage & OMR settings reset to default!');
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

  // Copy current quiz input text to clipboard
  const handleCopyInputToClipboard = async () => {
    if (!inputText.trim()) {
      showToast('Input box is empty.');
      return;
    }
    try {
      await navigator.clipboard.writeText(inputText);
      showToast('Copied quiz data to clipboard!');
    } catch {
      const textarea = document.getElementById('quiz-input-textarea') as HTMLTextAreaElement | null;
      if (textarea) {
        textarea.select();
        document.execCommand('copy');
        showToast('Copied quiz data to clipboard!');
      }
    }
  };

  // Copy all quiz data to clipboard and open Raman Quiz Challenge in a new tab
  const handlePlayQuiz = () => {
    const dataToCopy = inputText.trim();
    if (dataToCopy) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(inputText).catch(() => {
          const textarea = document.getElementById('quiz-input-textarea') as HTMLTextAreaElement | null;
          if (textarea) {
            textarea.select();
            document.execCommand('copy');
          }
        });
      } else {
        const textarea = document.getElementById('quiz-input-textarea') as HTMLTextAreaElement | null;
        if (textarea) {
          textarea.select();
          document.execCommand('copy');
        }
      }
      showToast('Quiz data copied to clipboard! Opening Raman Quiz Challenge...');
    } else {
      showToast('Opening Raman Quiz Challenge...');
    }
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
        omrCapacity: 0,
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
        omrCapacity: 0,
        twoColumnLayout: true,
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
        omrCapacity: 0,
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
        omrCapacity: 0,
        twoColumnLayout: true,
      }));
    }
    setUserAnswers({});
    setOpenDropdown(null);
    showToast('Sample Loaded & Randomized!');
  };

  // Select which pages to view on screen
  const handleSelectPageMode = (
    target: PrintTarget,
    tab: 'preview' | 'omr' | 'paper' | 'answers' = 'preview'
  ) => {
    setPrintTarget(target);
    setActiveTab(tab);
    setOpenDropdown(null);
  };

  // Trigger selective or full print
  const handlePrintWithMode = (mode?: PrintTarget) => {
    setOpenDropdown(null);
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

  const printTargetShortLabels: Record<PrintTarget, string> = {
    full: 'All Pages',
    student_pack: 'OMR + Paper',
    omr_only: 'Only OMR',
    paper_only: 'Only Paper',
    key_only: 'Only Key',
  };

  return (
    <div className="min-h-screen print:min-h-0 bg-[#F8FAFC] print:bg-white flex flex-col text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      {/* ========================================================
          SINGLE MINIMAL TOP NAVIGATION BAR (NO-PRINT)
      ======================================================== */}
      <nav className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md text-slate-900 border-b border-slate-200/90 shadow-2xs">
        <div
          ref={navDropdownAreaRef}
          className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2"
        >
          {/* Brand + Compact Status Pill */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xs shrink-0">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold tracking-tight text-slate-900 text-sm sm:text-base truncate">
              MCQ &amp; OMR Studio
            </span>
            {parseResult.error ? (
              <span
                className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px] font-semibold shrink-0"
                title={parseResult.error}
              >
                <AlertCircle className="w-3 h-3 text-amber-600" />
                <span>Warning</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 text-[11px] font-semibold shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{questions.length} Qs</span>
              </span>
            )}
          </div>

          {/* Minimal Icon Toolbar + Consolidated Print PDF Dropdown */}
          <div className="flex items-center gap-1.5">
            {/* Show / Hide Top Quiz Input Box */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'split' ? 'document' : 'split')}
              className={`p-2 rounded-lg border text-xs transition cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title={viewMode === 'split' ? 'Hide Quiz Input Box' : 'Show Quiz Input Box'}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            {/* Presets Dropdown (Hover Bridge + Click Toggle) */}
            <div
              className="relative"
              onMouseEnter={() => handleDropdownEnter('presets')}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown((prev) => (prev === 'presets' ? null : 'presets'))
                }
                className={`p-2 rounded-lg border transition cursor-pointer ${
                  openDropdown === 'presets'
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
                title="Load Preset Sample Papers"
              >
                <BookOpen className="w-4 h-4 text-amber-500" />
              </button>

              {openDropdown === 'presets' && (
                <div className="absolute right-0 top-full pt-2 w-64 z-50">
                  <div className="bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 overflow-hidden">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      Preset Sample Papers
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLoadSample('ramraman100')}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50/60 flex flex-col border-b border-slate-100 cursor-pointer"
                    >
                      <span className="font-bold text-amber-700">⚡ राम रमन 100 प्रश्न OMR टेस्ट</span>
                      <span className="text-[10px] text-slate-500">100 Questions Full Paper &amp; OMR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSample('bhimbetka')}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex flex-col cursor-pointer"
                    >
                      <span className="font-bold text-slate-800">भीमबेटका की गुफाएँ</span>
                      <span className="text-[10px] text-slate-500">20 History Questions in Hindi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSample('math')}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex flex-col border-t border-slate-100 cursor-pointer"
                    >
                      <span className="font-bold text-blue-700">Mathematics &amp; Trigonometry</span>
                      <span className="text-[10px] text-slate-500">20 LaTeX Formula Questions</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSample('physics')}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex flex-col border-t border-slate-100 cursor-pointer"
                    >
                      <span className="font-bold text-emerald-700">Physics &amp; Chemistry</span>
                      <span className="text-[10px] text-slate-500">Kinematics &amp; Equations</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Visual Question Editor (Icon Button) */}
            <button
              type="button"
              onClick={() => handleOpenQuestionEditor(null)}
              disabled={questions.length === 0}
              className="p-2 rounded-lg bg-white hover:bg-indigo-50 text-indigo-600 border border-slate-200 transition cursor-pointer disabled:opacity-40"
              title="Visual Question Editor & Live LaTeX Fixer"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* Save / Load / Export Files (Icon Button) */}
            <button
              type="button"
              onClick={() => setIsSavedExamsOpen(true)}
              className="p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition cursor-pointer"
              title="Save, Load & Export Exam Files (.json / .txt)"
            >
              <FolderOpen className="w-4 h-4 text-amber-500" />
            </button>

            {/* 2-Column vs 1-Column Toggle */}
            <button
              type="button"
              onClick={() =>
                setMetadata((prev) => ({
                  ...prev,
                  twoColumnLayout: !prev.twoColumnLayout,
                }))
              }
              className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                metadata.twoColumnLayout
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Toggle 2-Column or 1-Column Question Paper Layout"
            >
              {metadata.twoColumnLayout ? '2-Col' : '1-Col'}
            </button>

            {/* Color vs B&W Laser Ink Toggle (Icon Button) */}
            <button
              type="button"
              onClick={() => setInkMode((m) => (m === 'color' ? 'bw' : 'color'))}
              className={`p-2 rounded-lg border transition cursor-pointer ${
                inkMode === 'bw'
                  ? 'bg-slate-800 border-slate-800 text-white'
                  : 'bg-white border-slate-200 text-blue-600 hover:bg-slate-50'
              }`}
              title={inkMode === 'bw' ? 'B&W Laser Ink Active (Click for Color)' : 'Color Ink Active (Click for B&W Laser)'}
            >
              {inkMode === 'bw' ? <Contrast className="w-4 h-4" /> : <Palette className="w-4 h-4" />}
            </button>

            {/* Settings Drawer (Icon Button) */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition cursor-pointer"
              title="Exam Paper & OMR Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Consolidated Print PDF & All Pages Selector Dropdown (Hover Bridge + Click Toggle) */}
            <div
              className="relative"
              onMouseEnter={() => handleDropdownEnter('print')}
              onMouseLeave={handleDropdownLeave}
            >
              <div className="inline-flex rounded-lg shadow-2xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => handlePrintWithMode()}
                  disabled={questions.length === 0 && printTarget !== 'omr_only' && activeTab !== 'omr'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
                  title="Print currently selected pages"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PDF</span>
                  <span className="hidden md:inline text-[10px] font-medium bg-emerald-700/80 px-1.5 py-0.2 rounded">
                    {activeTab === 'practice' ? 'Practice' : printTargetShortLabels[printTarget]}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown((prev) => (prev === 'print' ? null : 'print'))
                  }
                  className="px-2 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white border-l border-emerald-500 text-xs font-bold transition cursor-pointer"
                  title="Select pages to view or print"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* All Page View & Print Options Shifted Under Print PDF Dropdown */}
              {openDropdown === 'print' && (
                <div className="absolute right-0 top-full pt-2 w-72 z-50">
                  <div className="bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 overflow-hidden">
                    <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                      <span>Select Pages (View &amp; Print)</span>
                      <span>Click 🖨️ to Print</span>
                    </div>

                    {(
                      [
                        {
                          id: 'full',
                          tab: 'preview',
                          title: 'Full Pack (All Pages)',
                          desc: 'Page 1 OMR + Question Paper + Answer Key',
                        },
                        {
                          id: 'student_pack',
                          tab: 'preview',
                          title: 'Student Copy (OMR + Paper)',
                          desc: 'OMR Sheet + Question Paper (No Key)',
                        },
                        {
                          id: 'omr_only',
                          tab: 'omr',
                          title: 'Only OMR Sheet',
                          desc: 'Page 1 Full-A4 OMR Response Sheet Only',
                        },
                        {
                          id: 'paper_only',
                          tab: 'paper',
                          title: 'Only Question Paper',
                          desc: 'MCQ Question Booklet Pages Only',
                        },
                        {
                          id: 'key_only',
                          tab: 'answers',
                          title: 'Only Answer Key',
                          desc: 'Last Page Official Answer Key Only',
                        },
                      ] as Array<{
                        id: PrintTarget;
                        tab: 'preview' | 'omr' | 'paper' | 'answers';
                        title: string;
                        desc: string;
                      }>
                    ).map((item) => {
                      const isCurrent =
                        activeTab !== 'practice' && printTarget === item.id;
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between px-3 py-2 border-b border-slate-100 last:border-none transition ${
                            isCurrent ? 'bg-emerald-50/70' : 'hover:bg-slate-50'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSelectPageMode(item.id, item.tab)}
                            className="flex-1 text-left pr-2 cursor-pointer"
                          >
                            <div
                              className={`text-xs font-bold flex items-center gap-1.5 ${
                                isCurrent ? 'text-emerald-800' : 'text-slate-700'
                              }`}
                            >
                              <span>{item.title}</span>
                              {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                            </div>
                            <div className="text-[10px] text-slate-500">{item.desc}</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePrintWithMode(item.id)}
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition cursor-pointer shrink-0"
                            title={`Print ${item.title} Now`}
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}

                    {/* Interactive Practice OMR Option inside Pages Dropdown */}
                    <div className="border-t border-slate-200 mt-1 pt-1 px-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab(activeTab === 'practice' ? 'preview' : 'practice');
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition ${
                          activeTab === 'practice'
                            ? 'bg-purple-600 text-white font-bold'
                            : 'text-purple-700 hover:bg-purple-50 font-semibold'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4" />
                          <span>Interactive Practice OMR Mode</span>
                        </span>
                        {activeTab === 'practice' && <Check className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status notification toast */}
        {copiedStatus && (
          <div className="bg-emerald-600 text-white text-center text-xs py-1 font-semibold flex items-center justify-center gap-1.5 shadow-inner">
            <Check className="w-3.5 h-3.5" />
            {copiedStatus}
          </div>
        )}
      </nav>

      {/* ========================================================
          MAIN WORKSPACE (TOP INPUT BOX + BOTTOM DOCUMENT PREVIEW)
          Both share the exact same max-w-5xl w-full width!
      ======================================================== */}
      <div className="max-w-5xl print:max-w-none w-full mx-auto p-4 sm:p-6 print:p-0 print:m-0 flex-1 flex flex-col">
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

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="bg-purple-950/60 border border-purple-700/50 px-3 py-1 rounded-lg text-center">
                <span className="block text-[10px] text-purple-300 uppercase">Correct</span>
                <span className="text-sm font-bold text-emerald-400">+{practiceScore.correct}</span>
              </div>
              <div className="bg-purple-950/60 border border-purple-700/50 px-3 py-1 rounded-lg text-center">
                <span className="block text-[10px] text-purple-300 uppercase">Wrong</span>
                <span className="text-sm font-bold text-rose-400">-{practiceScore.incorrect}</span>
              </div>
              <div className="bg-white text-purple-950 px-3 py-1 rounded-lg text-center shadow">
                <span className="block text-[10px] font-bold uppercase text-purple-700">Score</span>
                <span className="text-sm font-black text-purple-900">
                  {practiceScore.totalScore} / {practiceScore.maxScore}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setUserAnswers({})}
                className="p-1.5 text-purple-200 hover:text-white hover:bg-purple-800/50 rounded-lg cursor-pointer"
                title="Reset Practice Answers"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-5 print:gap-0 w-full">
          {/* ----------------------------------------------------
              TOP PANEL: MINIMAL QUIZ INPUT DATA BOX (NO-PRINT)
              (Icon-only actions + White background textarea)
          ---------------------------------------------------- */}
          {viewMode === 'split' && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`no-print w-full flex flex-col bg-white rounded-xl border transition-all shadow-2xs overflow-hidden relative ${
                isDraggingFile
                  ? 'border-blue-600 ring-4 ring-blue-500/20 bg-blue-50/20'
                  : 'border-slate-300'
              }`}
            >
              {/* Drag-and-Drop Visual Overlay */}
              {isDraggingFile && (
                <div className="absolute inset-0 z-30 bg-blue-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 text-center pointer-events-none">
                  <Upload className="w-8 h-8 text-white animate-bounce mb-2" />
                  <p className="text-sm font-extrabold tracking-wide">
                    Drop your .txt or .json file here
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

              {/* Compact Minimal Input Header with Icon Toolbar */}
              <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Quiz Input Box</span>
                  </h3>

                  {questions.length > 0 && (
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-600"
                      title="Live answer distribution across options A, B, C, and D"
                    >
                      <span className="text-blue-700">A:{answerDistribution.A}</span>
                      <span className="text-emerald-700">B:{answerDistribution.B}</span>
                      <span className="text-amber-700">C:{answerDistribution.C}</span>
                      <span className="text-purple-700">D:{answerDistribution.D}</span>
                    </span>
                  )}
                </div>

                {/* Minimal Icon Action Buttons */}
                <div className="flex items-center gap-1">
                  {/* Play Quiz Icon Button (Copies all data & opens Raman Quiz Challenge in new tab) */}
                  <a
                    href="https://ramkargwal.github.io/apps/game/raman_quiz_challenge.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handlePlayQuiz}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition cursor-pointer inline-flex items-center justify-center"
                    title="Copy Quiz Data & Play on Raman Quiz Challenge"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </a>

                  {/* AI Prompt Modal Icon Button */}
                  <button
                    type="button"
                    onClick={() => setIsPromptModalOpen(true)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                    title="AI Prompt Generator"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>

                  {/* Upload .txt / .json Icon Button */}
                  <button
                    type="button"
                    onClick={() => txtFileInputRef.current?.click()}
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-200/70 rounded-md transition cursor-pointer"
                    title="Upload .txt or .json file"
                  >
                    <Upload className="w-4 h-4" />
                  </button>

                  {/* Copy Quiz Input Data Icon Button */}
                  <button
                    type="button"
                    onClick={handleCopyInputToClipboard}
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-200/70 rounded-md transition cursor-pointer"
                    title="Copy quiz input text"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {/* Paste from Clipboard Icon Button */}
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-200/70 rounded-md transition cursor-pointer"
                    title="Paste from clipboard"
                  >
                    <ClipboardPaste className="w-4 h-4" />
                  </button>

                  {/* Single Shuffle & Randomize Icon Button */}
                  <button
                    type="button"
                    onClick={handleRandomizeAllQuestions}
                    disabled={questions.length === 0}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition cursor-pointer disabled:opacity-40"
                    title="Shuffle & Randomize Questions and Options (A, B, C, D)"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>

                  {/* Clear Input Box Icon Button */}
                  <button
                    type="button"
                    onClick={() => setInputText('')}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                    title="Clear input box"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* White Background Textarea */}
              <div className="p-2.5 bg-white">
                <textarea
                  id="quiz-input-textarea"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Paste quiz objects here or drag & drop a .txt file:\n{ q: "यदि $z = \\cos\\theta + i\\sin\\theta$ है, तो $z^n + z^{-n}$ किसके बराबर है?", o: ["$2\\sin(n\\theta)$", "$2i\\sin(n\\theta)$", "$2\\cos(n\\theta)$", "$2i\\cos(n\\theta)$"], a: 2 },`}
                  className="w-full h-36 sm:h-40 p-3 text-xs font-mono bg-white text-slate-900 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-y leading-relaxed overflow-y-auto"
                  spellCheck={false}
                />
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              BOTTOM PANEL: DOCUMENT PREVIEW (SAME WIDTH AS INPUT BOX)
          ---------------------------------------------------- */}
          <div className="w-full flex flex-col">
            {questions.length === 0 && printTarget !== 'omr_only' && activeTab !== 'omr' ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 shadow-2xs w-full">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 text-sm mb-1">
                  Input Box is Clean — Ready for Quiz Data
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                  Paste quiz objects in the input box above, upload a .txt file, or preview a blank OMR sheet.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadSample('ramraman100')}
                    className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                  >
                    Load 100 Qs Exam Paper
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPageMode('omr_only', 'omr')}
                    className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition cursor-pointer"
                  >
                    Blank OMR Sheet
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPromptModalOpen(true)}
                    className="px-3.5 py-1.5 bg-white text-slate-700 border border-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                  >
                    AI Prompt
                  </button>
                </div>
              </div>
            ) : (
              /* ====================================================
                  PRINTABLE A4 DESK CONTAINER (WIDTH = 100% OF BOX)
              ==================================================== */
              <div
                className={`print-container w-full space-y-6 print:space-y-0 transition-all origin-top ${
                  inkMode === 'bw' ? 'bw-ink-mode' : ''
                }`}
              >
                {/* PAGE 1: OMR ANSWER SHEET */}
                {showOmrSection && (
                  <div className="print-page w-full">
                    <OMRSheet
                      metadata={metadata}
                      questions={questions}
                      userAnswers={userAnswers}
                      onAnswerSelect={handleAnswerSelect}
                      isInteractive={activeTab === 'practice'}
                      pageBreakAfter={
                        (showPaperSection && questions.length > 0) ||
                        (showKeySection && questions.length > 0)
                      }
                    />
                  </div>
                )}

                {/* MIDDLE PAGES: MCQ QUESTION PAPER */}
                {showPaperSection && questions.length > 0 && (
                  <div className="print-page w-full">
                    <QuestionPaper
                      metadata={metadata}
                      questions={questions}
                      onEditQuestion={(qId) => handleOpenQuestionEditor(qId)}
                      pageBreakAfterLast={showKeySection && questions.length > 0}
                    />
                  </div>
                )}

                {/* LAST PAGE: ANSWER KEY & SOLUTION MATRIX */}
                {showKeySection && questions.length > 0 && (
                  <div className="print-page w-full">
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
        onResetAllSettings={handleResetAllSettings}
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
