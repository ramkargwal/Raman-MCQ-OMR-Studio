import React, { useState } from 'react';
import { Copy, Check, Sparkles, X, FileText, Settings2, Sliders } from 'lucide-react';
import { buildPromptText } from '../utils/sampleData';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateAI?: (topic: string, count: number, lang: string, diff: string) => void;
  isGeneratingAI?: boolean;
}

export const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  onClose,
  onGenerateAI,
  isGeneratingAI = false,
}) => {
  const [topic, setTopic] = useState('भीमबेटका की गुफाएँ');
  const [questionCount, setQuestionCount] = useState(20);
  const [language, setLanguage] = useState<
    'Hindi' | 'Hinglish' | 'English' | 'Bilingual (Hindi + English)'
  >('Hindi');
  const [difficulty, setDifficulty] = useState('Medium');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentPrompt = buildPromptText(
    topic,
    questionCount,
    language,
    difficulty,
    additionalNotes
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = currentPrompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                AI MCQ Prompt Generator
              </h3>
              <p className="text-xs text-slate-500">
                Copy this prompt into ChatGPT, Gemini, Claude, or generate directly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-slate-700">
          {/* Controls to Customize Prompt */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wide">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              Customize Prompt Parameters
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Topic / Chapter / Study Notes
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. भीमबेटका की गुफाएँ or Trigonometry"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Questions Count
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  >
                    <option value={10}>10 Questions</option>
                    <option value={20}>20 Questions</option>
                    <option value={50}>50 Questions</option>
                    <option value={100}>100 Questions (Full Paper)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  >
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Hinglish">Hinglish (Tech Words in English)</option>
                    <option value="English">English</option>
                    <option value="Bilingual (Hindi + English)">Bilingual (Hindi + English)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="Easy">Easy (Conceptual basics)</option>
                  <option value="Medium">Medium (School/Board exams)</option>
                  <option value="Hard">Hard (Competitive & Olympiad)</option>
                  <option value="Advanced (JEE/NEET)">Advanced (JEE / NEET Level)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Notes / Formulas (Optional)
                </label>
                <input
                  type="text"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="e.g. Focus on archaeological periods and rock art"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                />
              </div>
            </div>
          </div>

          {/* Prompt Display Box */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                Ready-to-Copy AI Prompt:
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {currentPrompt.length} characters
              </span>
            </div>

            <div className="relative bg-slate-50/70 p-2 rounded-xl border border-slate-200">
              <pre className="bg-white text-slate-800 p-4 rounded-lg text-xs font-mono overflow-x-auto max-h-56 select-all whitespace-pre-wrap leading-relaxed border border-slate-300 shadow-2xs">
                {currentPrompt}
              </pre>
            </div>
          </div>
        </div>

        {/* Action Buttons in Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Click <strong>Copy Prompt</strong>, paste it into any AI, then copy the result and hit <strong>Paste</strong>!
          </div>

          <div className="flex items-center gap-2">
            {onGenerateAI && (
              <button
                type="button"
                onClick={() => onGenerateAI(topic, questionCount, language, difficulty)}
                disabled={isGeneratingAI}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-xs font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isGeneratingAI ? 'Generating with Gemini...' : 'Generate with Gemini AI'}
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className={`
                inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-xs cursor-pointer
                ${
                  copied
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                }
              `}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied Prompt!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Prompt
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
