import React from 'react';
import { QuizMetadata } from '../types/quiz';
import { X, Sliders, FileText, CheckSquare, Eye } from 'lucide-react';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: QuizMetadata;
  onChange: (updated: QuizMetadata) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  metadata,
  onChange,
}) => {
  if (!isOpen) return null;

  const updateField = <K extends keyof QuizMetadata>(field: K, value: QuizMetadata[K]) => {
    onChange({
      ...metadata,
      [field]: value,
    });
  };

  const handleInstructionChange = (index: number, value: string) => {
    const updated = [...metadata.instructions];
    updated[index] = value;
    updateField('instructions', updated);
  };

  const addInstruction = () => {
    updateField('instructions', [...metadata.instructions, 'प्रत्येक प्रश्न का 1 अंक निर्धारित है।']);
  };

  const removeInstruction = (index: number) => {
    const updated = metadata.instructions.filter((_, i) => i !== index);
    updateField('instructions', updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs no-print">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              Exam Paper &amp; OMR Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-700">
          {/* Institutional Information */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">
              Header &amp; Institution
            </h4>

            <div>
              <label className="block font-semibold mb-1">Institute / School Name</label>
              <input
                type="text"
                value={metadata.instituteName}
                onChange={(e) => updateField('instituteName', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Examination Title</label>
              <input
                type="text"
                value={metadata.examTitle}
                onChange={(e) => updateField('examTitle', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  value={metadata.subject}
                  onChange={(e) => updateField('subject', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Class / Grade</label>
                <input
                  type="text"
                  value={metadata.classGrade}
                  onChange={(e) => updateField('classGrade', e.target.value)}
                  placeholder="e.g. Class 12 / General"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold mb-1">Test Code</label>
                <input
                  type="text"
                  value={metadata.testCode}
                  onChange={(e) => updateField('testCode', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Exam Date</label>
                <input
                  type="text"
                  value={metadata.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Time Limit</label>
                <input
                  type="text"
                  value={metadata.timeLimit}
                  onChange={(e) => updateField('timeLimit', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Marking Scheme */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">
              Marking Scheme
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold mb-1">Marks per Question</label>
                <input
                  type="number"
                  min={1}
                  value={metadata.marksPerQuestion}
                  onChange={(e) => updateField('marksPerQuestion', Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Negative Marking</label>
                <select
                  value={metadata.negativeMarking}
                  onChange={(e) => updateField('negativeMarking', Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value={0}>0 (No Negative Marking)</option>
                  <option value={0.25}>-0.25 (1/4th penalty)</option>
                  <option value={0.33}>-0.33 (1/3rd penalty)</option>
                  <option value={0.5}>-0.50 (1/2 penalty)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Layout & Typography */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">
              Page Layout &amp; Formatting
            </h4>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
              <div>
                <div className="font-bold text-slate-800">2-Column Layout</div>
                <div className="text-[10px] text-slate-500">Newspaper / standard exam column layout (saves paper)</div>
              </div>
              <input
                type="checkbox"
                checked={metadata.twoColumnLayout}
                onChange={(e) => updateField('twoColumnLayout', e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">OMR Sheet Bubble Capacity</label>
              <select
                value={metadata.omrCapacity || 100}
                onChange={(e) => updateField('omrCapacity', Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
              >
                <option value={100}>100 Questions (5 Columns of 20 - Standard Format)</option>
                <option value={50}>50 Questions (3 Columns)</option>
                <option value={20}>20 Questions (2 Columns)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Font Size</label>
              <select
                value={metadata.fontSize}
                onChange={(e) => updateField('fontSize', e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="compact">Compact (Saves pages, ideal for print)</option>
                <option value="normal">Normal (Standard balanced sizing)</option>
                <option value="relaxed">Relaxed (Large &amp; spacious text)</option>
              </select>
            </div>

            {/* Watermark */}
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Watermark</div>
                  <div className="text-[10px] text-slate-500">Light background diagonal watermark on questions</div>
                </div>
                <input
                  type="checkbox"
                  checked={metadata.showWatermark}
                  onChange={(e) => updateField('showWatermark', e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>
              {metadata.showWatermark && (
                <input
                  type="text"
                  value={metadata.watermarkText}
                  onChange={(e) => updateField('watermarkText', e.target.value)}
                  placeholder="Watermark text (e.g. SAMPLE or CONFIDENTIAL)"
                  className="w-full px-3 py-1 text-xs border border-slate-300 rounded bg-white"
                />
              )}
            </div>
          </div>

          {/* Page Inclusions */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">
              Included PDF Pages
            </h4>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={metadata.includeOmr}
                  onChange={(e) => updateField('includeOmr', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Page 1: OMR Answer Sheet</span>
              </label>

              <label className="flex items-center gap-2 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={metadata.includeQuestions}
                  onChange={(e) => updateField('includeQuestions', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Middle Pages: MCQ Question Paper</span>
              </label>

              <label className="flex items-center gap-2 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={metadata.includeAnswerKey}
                  onChange={(e) => updateField('includeAnswerKey', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Last Page: Answer Key &amp; Solution Matrix</span>
              </label>
            </div>
          </div>

          {/* Exam Instructions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Exam Instructions (निर्देश)
              </h4>
              <button
                type="button"
                onClick={addInstruction}
                className="text-[10px] text-blue-600 font-bold hover:underline"
              >
                + Add Rule
              </button>
            </div>

            <div className="space-y-1.5">
              {metadata.instructions.map((inst, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="font-mono text-slate-400 text-[10px]">{idx + 1}.</span>
                  <input
                    type="text"
                    value={inst}
                    onChange={(e) => handleInstructionChange(idx, e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeInstruction(idx)}
                    className="text-slate-400 hover:text-rose-600 px-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Apply &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
