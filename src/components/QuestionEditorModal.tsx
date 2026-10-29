import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Search,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Calculator,
} from 'lucide-react';
import { QuizQuestion } from '../types/quiz';
import { MathRenderer } from './MathRenderer';

interface QuestionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
  initialQuestionId?: number | null;
  onSaveQuestions: (updatedQuestions: QuizQuestion[]) => void;
}

const LATEX_SNIPPETS = [
  { label: 'a/b', code: '$\\frac{a}{b}$', title: 'Fraction' },
  { label: '√x', code: '$\\sqrt{x}$', title: 'Square Root' },
  { label: 'xⁿ', code: '$x^{2}$', title: 'Superscript / Power' },
  { label: 'xₙ', code: '$x_{1}$', title: 'Subscript' },
  { label: 'θ', code: '$\\theta$', title: 'Theta' },
  { label: 'π', code: '$\\pi$', title: 'Pi' },
  { label: '∫', code: '$\\int_{a}^{b}$', title: 'Integral' },
  { label: '∑', code: '$\\sum_{i=1}^{n}$', title: 'Summation' },
  { label: '→', code: '$\\rightarrow$', title: 'Arrow' },
  { label: '°', code: '$^\\circ$', title: 'Degree' },
  { label: '×', code: '$\\times$', title: 'Multiply' },
  { label: '≤', code: '$\\leq$', title: 'Less than or equal' },
];

export const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({
  isOpen,
  onClose,
  questions,
  initialQuestionId = null,
  onSaveQuestions,
}) => {
  const [localQuestions, setLocalQuestions] = useState<QuizQuestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeField, setActiveField] = useState<'q' | 0 | 1 | 2 | 3>('q');

  useEffect(() => {
    if (isOpen) {
      const cloned = questions.map((q, idx) => ({
        ...q,
        id: idx + 1,
        o: [...q.o],
      }));
      setLocalQuestions(cloned);

      if (initialQuestionId !== null && initialQuestionId !== undefined) {
        const foundIdx = cloned.findIndex((q) => q.id === initialQuestionId);
        setSelectedIndex(foundIdx >= 0 ? foundIdx : 0);
      } else {
        setSelectedIndex(0);
      }
    }
  }, [isOpen, questions, initialQuestionId]);

  if (!isOpen) return null;

  const currentQ = localQuestions[selectedIndex];
  const optionLetters = ['A', 'B', 'C', 'D'];

  const handleUpdateQuestionText = (value: string) => {
    setLocalQuestions((prev) =>
      prev.map((item, idx) => (idx === selectedIndex ? { ...item, q: value } : item))
    );
  };

  const handleUpdateOptionText = (optIdx: number, value: string) => {
    setLocalQuestions((prev) =>
      prev.map((item, idx) => {
        if (idx !== selectedIndex) return item;
        const updatedOpts = [...item.o];
        updatedOpts[optIdx] = value;
        return { ...item, o: updatedOpts };
      })
    );
  };

  const handleUpdateCorrectAnswer = (correctIdx: number) => {
    setLocalQuestions((prev) =>
      prev.map((item, idx) => (idx === selectedIndex ? { ...item, a: correctIdx } : item))
    );
  };

  const handleInsertLatex = (snippet: string) => {
    if (!currentQ) return;
    if (activeField === 'q') {
      handleUpdateQuestionText(`${currentQ.q} ${snippet}`.trim());
    } else {
      const currentOpt = currentQ.o[activeField] || '';
      handleUpdateOptionText(activeField, `${currentOpt} ${snippet}`.trim());
    }
  };

  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      id: localQuestions.length + 1,
      q: 'नया प्रश्न यहाँ लिखें (उदाहरण: यदि $x = 2$ हो तो $x^2$ का मान क्या है?)',
      o: ['$2$', '$4$', '$6$', '$8$'],
      a: 1,
    };
    const updated = [...localQuestions, newQ].map((q, i) => ({ ...q, id: i + 1 }));
    setLocalQuestions(updated);
    setSelectedIndex(updated.length - 1);
  };

  const handleDeleteQuestion = (idxToDelete: number) => {
    if (localQuestions.length <= 1) return;
    const updated = localQuestions
      .filter((_, idx) => idx !== idxToDelete)
      .map((q, i) => ({ ...q, id: i + 1 }));
    setLocalQuestions(updated);
    setSelectedIndex(Math.min(selectedIndex, updated.length - 1));
  };

  const handleMoveQuestion = (direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? selectedIndex - 1 : selectedIndex + 1;
    if (targetIdx < 0 || targetIdx >= localQuestions.length) return;
    const copy = [...localQuestions];
    const temp = copy[selectedIndex];
    copy[selectedIndex] = copy[targetIdx];
    copy[targetIdx] = temp;
    const reindexed = copy.map((q, i) => ({ ...q, id: i + 1 }));
    setLocalQuestions(reindexed);
    setSelectedIndex(targetIdx);
  };

  const handleSaveAndClose = () => {
    onSaveQuestions(localQuestions);
    onClose();
  };

  const filteredQuestions = localQuestions
    .map((q, originalIndex) => ({ q, originalIndex }))
    .filter(
      ({ q }) =>
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(q.id).includes(searchQuery.trim()) ||
        q.o.some((opt) => opt.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <div className="no-print fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden">
        {/* Top Modal Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
                Visual Question Editor &amp; Live LaTeX Fixer
              </h2>
              <p className="text-[11px] text-slate-400">
                Click any question to edit Hindi text, fix LaTeX math ($...$), or change the correct option
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Save All Changes ({localQuestions.length})</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close without saving"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body: Left Question List + Right Live Editor */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden">
          {/* Left Sidebar: Question Navigator */}
          <div className="md:col-span-4 border-r border-slate-200 bg-slate-50 flex flex-col min-h-0">
            <div className="p-3 border-b border-slate-200 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Q# or Hindi/Math text..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  {filteredQuestions.length} of {localQuestions.length} Questions
                </span>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Question</span>
                </button>
              </div>
            </div>

            {/* Scrollable List of Questions */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
              {filteredQuestions.map(({ q, originalIndex }) => {
                const isSelected = originalIndex === selectedIndex;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setSelectedIndex(originalIndex)}
                    className={`w-full text-left p-2.5 transition flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-l-4 border-blue-600'
                        : 'hover:bg-white'
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center min-w-6 h-6 px-1 rounded text-[11px] font-mono font-bold shrink-0 border ${
                        isSelected
                          ? 'border-blue-700 text-blue-900 bg-white'
                          : 'border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      {q.id}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-800 line-clamp-2 leading-snug">
                        {q.q}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span className="border border-emerald-600 text-emerald-800 bg-white px-1.5 py-0.2 rounded font-bold">
                          Ans: {optionLetters[q.a] || 'A'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Selected Question Editor + Live Preview */}
          <div className="md:col-span-8 flex flex-col min-h-0 bg-white overflow-y-auto p-4 sm:p-6">
            {currentQ ? (
              <div className="space-y-5">
                {/* Question Toolbar (Prev / Next / Reorder / Delete) */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md border-2 border-indigo-900 text-indigo-950 font-mono font-black text-xs bg-white">
                      QUESTION #{currentQ.id}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={selectedIndex === 0}
                        onClick={() => setSelectedIndex((i) => Math.max(0, i - 1))}
                        className="p-1.5 rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        title="Previous Question"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={selectedIndex === localQuestions.length - 1}
                        onClick={() =>
                          setSelectedIndex((i) => Math.min(localQuestions.length - 1, i + 1))
                        }
                        className="p-1.5 rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        title="Next Question"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={selectedIndex === 0}
                      onClick={() => handleMoveQuestion('up')}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                      title="Move Question Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                      <span>Move Up</span>
                    </button>
                    <button
                      type="button"
                      disabled={selectedIndex === localQuestions.length - 1}
                      onClick={() => handleMoveQuestion('down')}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                      title="Move Question Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                      <span>Move Down</span>
                    </button>
                    <button
                      type="button"
                      disabled={localQuestions.length <= 1}
                      onClick={() => handleDeleteQuestion(selectedIndex)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-300 bg-rose-50/50 rounded hover:bg-rose-100 disabled:opacity-40 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Quick LaTeX Math Insert Toolbar */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <Calculator className="w-3.5 h-3.5 text-blue-600" />
                      Quick Insert LaTeX Math into{' '}
                      <strong className="text-blue-700">
                        {activeField === 'q' ? 'Question Text' : `Option (${optionLetters[activeField]})`}
                      </strong>
                      :
                    </span>
                    <span className="text-[10px] text-slate-400">Wrap math inside $...$</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {LATEX_SNIPPETS.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleInsertLatex(item.code)}
                        title={`Insert ${item.title}: ${item.code}`}
                        className="px-2 py-1 text-xs font-mono font-bold bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-300 rounded shadow-2xs transition cursor-pointer"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Statement Input & Live Preview */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Question Statement (प्रश्न)
                  </label>
                  <textarea
                    rows={2}
                    value={currentQ.q}
                    onFocus={() => setActiveField('q')}
                    onChange={(e) => handleUpdateQuestionText(e.target.value)}
                    className="w-full p-2.5 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    placeholder="Type question in Hindi/English with $LaTeX$ math..."
                  />
                  {/* Live Rendered Preview */}
                  <div className="p-3 rounded-lg border border-indigo-200 bg-indigo-50/30 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center min-w-6 h-6 px-1 rounded-xs border-[1.5px] border-indigo-900 text-indigo-950 font-black text-xs font-mono bg-white shrink-0 leading-none">
                      {currentQ.id}
                    </span>
                    <div className="text-sm font-semibold text-slate-900 flex-1 flex items-center">
                      <MathRenderer text={currentQ.q} />
                    </div>
                  </div>
                </div>

                {/* 4 Options Editor + Correct Answer Selector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Options (A, B, C, D) &amp; Correct Answer Selection
                    </label>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      Click &quot;Correct&quot; button next to the right option
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[0, 1, 2, 3].map((optIdx) => {
                      const isCorrect = currentQ.a === optIdx;
                      const optValue = currentQ.o[optIdx] || '';

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border-2 transition ${
                            isCorrect
                              ? 'border-emerald-600 bg-emerald-50/20'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono font-black text-xs text-indigo-950">
                              OPTION ({optionLetters[optIdx]})
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateCorrectAnswer(optIdx)}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                                isCorrect
                                  ? 'border-emerald-700 bg-emerald-600 text-white'
                                  : 'border-slate-300 bg-white text-slate-600 hover:border-emerald-500'
                              }`}
                            >
                              {isCorrect ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Correct Answer</span>
                                </>
                              ) : (
                                <span>Mark as Correct</span>
                              )}
                            </button>
                          </div>

                          <input
                            type="text"
                            value={optValue}
                            onFocus={() => setActiveField(optIdx as 0 | 1 | 2 | 3)}
                            onChange={(e) => handleUpdateOptionText(optIdx, e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500 mb-2"
                            placeholder={`Option ${optionLetters[optIdx]}...`}
                          />

                          {/* Same-line Option + Answer Live Preview */}
                          <div className="px-2.5 py-1.5 rounded bg-slate-50 border border-slate-200 flex flex-row items-center gap-1.5 min-h-7">
                            <span className="inline-flex items-center justify-center font-bold font-mono text-indigo-900 text-xs shrink-0 leading-none">
                              ({optionLetters[optIdx]})
                            </span>
                            <div className="flex-1 min-w-0 flex items-center text-sm text-slate-900">
                              <MathRenderer text={optValue} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                No question selected.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Tip: All edits automatically format back into strict <code>&#123; q, o, a &#125;</code> syntax.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs cursor-pointer"
            >
              Apply &amp; Update Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
