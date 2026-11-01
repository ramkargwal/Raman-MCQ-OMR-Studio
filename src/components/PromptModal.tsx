import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check, Sparkles, X, FileText, Sliders } from 'lucide-react';
import { buildPromptText } from '../utils/sampleData';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [topic, setTopic] = useState('');
  const [questionCountInput, setQuestionCountInput] = useState('50');
  const questionCount = Math.max(1, Math.min(500, parseInt(questionCountInput, 10) || 50));
  const [language, setLanguage] = useState<
    'Hindi' | 'Hinglish' | 'English' | 'Bilingual (Hindi + English)'
  >('Hinglish');
  const [difficulty, setDifficulty] = useState('Medium');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const currentPrompt = topic.trim()
    ? buildPromptText(
        topic.trim(),
        questionCount,
        language,
        difficulty,
        additionalNotes
      )
    : customPrompt;

  const markCopied = () => {
    setCopied(true);
    if (copyTimerRef.current) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => setCopied(false), 2500);
  };

  const handleCopy = async () => {
    if (!currentPrompt.trim()) return;
    try {
      await navigator.clipboard.writeText(currentPrompt);
      markCopied();
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = currentPrompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      markCopied();
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
                Enter your topic below to generate a ready-to-copy prompt
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-slate-700">
          {/* Controls to Customize Prompt */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wide">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                Customize Prompt Parameters
              </div>
              {(topic || customPrompt || additionalNotes) && (
                <button
                  type="button"
                  onClick={() => {
                    setTopic('');
                    setCustomPrompt('');
                    setAdditionalNotes('');
                  }}
                  className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 cursor-pointer"
                >
                  Clear All
                </button>
              )}
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
                  placeholder="Enter topic here..."
                  autoFocus
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Questions Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={questionCountInput}
                    onChange={(e) => setQuestionCountInput(e.target.value)}
                    onBlur={() => setQuestionCountInput(String(questionCount))}
                    className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  />
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
                    <option value="Hinglish">Hinglish (Tech Words in English)</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
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
                  placeholder="Optional focus area..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                />
              </div>
            </div>
          </div>

          {/* Prompt Display Box (Clean by default) */}
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
              <textarea
                value={currentPrompt}
                onChange={(e) => {
                  if (!topic.trim()) {
                    setCustomPrompt(e.target.value);
                  }
                }}
                readOnly={Boolean(topic.trim())}
                placeholder="Type a topic above to generate your prompt here..."
                className="w-full h-48 bg-white text-slate-800 p-4 rounded-lg text-xs font-mono leading-relaxed border border-slate-300 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-y"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons in Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Enter a topic, click <strong>Copy Prompt</strong>, paste into any AI, then paste the result in the Input Box!
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!currentPrompt.trim()}
              className={`
                inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-xs cursor-pointer disabled:opacity-40
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
