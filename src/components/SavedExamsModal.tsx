import React, { useState, useRef } from 'react';
import {
  X,
  Save,
  FolderOpen,
  Download,
  Upload,
  Trash2,
  FileJson,
  FileText,
  Check,
  Clock,
  CopyPlus,
} from 'lucide-react';
import { QuizMetadata, SavedExam } from '../types/quiz';
import { parseQuizInput } from '../utils/parser';

interface SavedExamsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInputText: string;
  currentMetadata: QuizMetadata;
  currentQuestionCount: number;
  savedExams: SavedExam[];
  onSaveExam: (title: string) => void;
  onLoadExam: (exam: SavedExam) => void;
  onDeleteExam: (id: string) => void;
  onImportExamData: (inputText: string, metadata?: QuizMetadata) => void;
}

export const SavedExamsModal: React.FC<SavedExamsModalProps> = ({
  isOpen,
  onClose,
  currentInputText,
  currentMetadata,
  currentQuestionCount,
  savedExams,
  onSaveExam,
  onLoadExam,
  onDeleteExam,
  onImportExamData,
}) => {
  const [saveTitle, setSaveTitle] = useState(
    `${currentMetadata.examTitle || 'Exam Paper'} (${currentMetadata.testCode || 'SET-A'})`
  );
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = saveTitle.trim() || 'राम रमन विश्वविद्यालय परीक्षा पत्र';
    onSaveExam(trimmed);
    showToast(`Saved "${trimmed}" to browser storage!`);
  };

  // Export full exam pack (.json) with metadata + questions
  const handleExportJson = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      metadata: currentMetadata,
      inputText: currentInputText,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (currentMetadata.testCode || 'exam-paper')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase();
    a.href = url;
    a.download = `${safeName}_full_exam.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported Full Exam (.json) file!');
  };

  // Export raw question text (.txt)
  const handleExportTxt = () => {
    const blob = new Blob([currentInputText], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (currentMetadata.testCode || 'questions')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase();
    a.href = url;
    a.download = `${safeName}_questions.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported Questions (.txt) file!');
  };

  // Import from .json or .txt file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = String(event.target?.result || '');
      if (!content.trim()) return;

      // Check if it's a JSON exam pack with metadata + inputText
      try {
        const parsedJson = JSON.parse(content);
        if (parsedJson && typeof parsedJson.inputText === 'string') {
          onImportExamData(parsedJson.inputText, parsedJson.metadata);
          showToast(`Imported exam pack from "${file.name}"!`);
          return;
        }
      } catch {
        // Not a wrapper JSON, treat as raw quiz input text
      }

      const check = parseQuizInput(content);
      if (check.questions.length > 0) {
        onImportExamData(content);
        showToast(`Imported ${check.questions.length} questions from "${file.name}"!`);
      } else {
        showToast('Could not find valid quiz questions in the selected file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="no-print fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 text-slate-900 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-2xs">
              <FolderOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900">
                Save, Load &amp; Export Exam Papers
              </h2>
              <p className="text-[11px] text-slate-500">
                Save multiple exam papers in your browser or export/import .json and .txt files
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMsg && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 flex items-center justify-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* 1. Save Current Exam Snapshot */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5 text-blue-600" />
              Save Current Exam Paper ({currentQuestionCount} Questions)
            </h3>
            <form onSubmit={handleSave} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="Enter exam paper title (e.g., B.Sc. Math Set-A 2026)..."
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shrink-0"
              >
                <CopyPlus className="w-3.5 h-3.5" />
                <span>Save Exam Snapshot</span>
              </button>
            </form>
          </div>

          {/* 2. Export & Import Files (.JSON / .TXT) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={handleExportJson}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition flex flex-col items-center text-center gap-1.5 cursor-pointer"
            >
              <FileJson className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-bold text-slate-800">Export Full Pack (.json)</span>
              <span className="text-[10px] text-slate-500">
                Saves questions + university header &amp; OMR settings
              </span>
            </button>

            <button
              type="button"
              onClick={handleExportTxt}
              className="p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition flex flex-col items-center text-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-6 h-6 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">Export Raw Text (.txt)</span>
              <span className="text-[10px] text-slate-500">
                Saves raw &#123; q, o, a &#125; lines for AI or backup
              </span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-xl border border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/30 hover:bg-indigo-50/60 transition flex flex-col items-center text-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-6 h-6 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-950">Import File (.json / .txt)</span>
              <span className="text-[10px] text-slate-500">
                Load saved exam file from your computer
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </button>
          </div>

          {/* 3. Saved Exam Papers List */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                Saved Exam Papers in Browser ({savedExams.length})
              </h3>
              <span className="text-[11px] text-slate-400">
                Active work is also auto-saved automatically
              </span>
            </div>

            {savedExams.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                No saved exam snapshots yet. Click &quot;Save Exam Snapshot&quot; above to store multiple papers.
              </div>
            ) : (
              <div className="space-y-2">
                {savedExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        {exam.title}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-indigo-700">
                          {exam.questionCount} Questions
                        </span>
                        <span>•</span>
                        <span>{exam.metadata.instituteName}</span>
                        <span>•</span>
                        <span className="font-mono">{exam.metadata.testCode}</span>
                        <span>•</span>
                        <span>{exam.updatedAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadExam(exam);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Load Paper</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteExam(exam.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete saved exam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
