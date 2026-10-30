import React, { useState, useRef } from 'react';
import { QuizMetadata, LogoPresetStyle, OmrOptionStyle } from '../types/quiz';
import { UniversityCrest } from './UniversityCrest';
import {
  X,
  Sliders,
  Upload,
  Trash2,
  RotateCcw,
  Building2,
  UserCheck,
  CircleDot,
  FileSignature,
  FileText,
} from 'lucide-react';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: QuizMetadata;
  onChange: (updated: QuizMetadata) => void;
}

type SettingsTab = 'header_logo' | 'candidate_boxes' | 'bubbles_rules' | 'footer_signs' | 'paper_print';

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  metadata,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('header_logo');
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const rightLogoFileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const updateField = <K extends keyof QuizMetadata>(field: K, value: QuizMetadata[K]) => {
    onChange({
      ...metadata,
      [field]: value,
    });
  };

  const handleLogoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isRightLogo: boolean = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = String(ev.target?.result || '');
      if (dataUrl) {
        if (isRightLogo) {
          onChange({
            ...metadata,
            omrRightLogoSameAsLeft: false,
            omrRightCustomLogoUrl: dataUrl,
          });
        } else {
          onChange({
            ...metadata,
            logoStyle: 'custom',
            customLogoUrl: dataUrl,
          });
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleInstructionChange = (index: number, value: string) => {
    const updated = [...metadata.instructions];
    updated[index] = value;
    updateField('instructions', updated);
  };

  const addInstruction = () => {
    updateField('instructions', [
      ...metadata.instructions,
      'प्रत्येक प्रश्न का 1 अंक निर्धारित है।',
    ]);
  };

  const removeInstruction = (index: number) => {
    const updated = metadata.instructions.filter((_, i) => i !== index);
    updateField('instructions', updated);
  };

  const handleResetOmrCustomizations = () => {
    onChange({
      ...metadata,
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
    });
  };

  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ReactNode }> = [
    { id: 'header_logo', label: 'Header & Logo', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'candidate_boxes', label: 'Boxes & Roll No', icon: <UserCheck className="w-3.5 h-3.5" /> },
    { id: 'bubbles_rules', label: 'OMR & Rules', icon: <CircleDot className="w-3.5 h-3.5" /> },
    { id: 'footer_signs', label: 'Footer & Signs', icon: <FileSignature className="w-3.5 h-3.5" /> },
    { id: 'paper_print', label: 'Paper & Print', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  const logoPresets: Array<{ id: LogoPresetStyle; name: string; desc: string }> = [
    { id: 'science', name: 'Science Crest', desc: 'Atomic Orbits & Book' },
    { id: 'book_lotus', name: 'Lotus & Book', desc: 'Saraswati Lotus & Sun' },
    { id: 'torch_shield', name: 'Torch Shield', desc: 'Knowledge Flame Shield' },
    { id: 'chakra', name: 'Dharma Chakra', desc: '12-Spoke Academic Wheel' },
    { id: 'monogram', name: 'Text Monogram', desc: 'Custom Letters (e.g. RRVV)' },
    { id: 'custom', name: 'Custom Image', desc: 'Upload PNG/JPG/SVG' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs no-print">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Top Drawer Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-600/30 border border-blue-400/30">
              <Sliders className="w-4 h-4 text-blue-300" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm leading-tight">
                Complete OMR Sheet &amp; Exam Customizer
              </h3>
              <p className="text-[10.5px] text-slate-300">
                Edit Logo, Slogan, Header, Candidate Boxes, Bubbles, Instructions &amp; Signatures
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-3 pt-2 flex items-center gap-1 overflow-x-auto shrink-0">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer border-b-2 ${
                  isActive
                    ? 'bg-white text-blue-700 border-blue-600 shadow-2xs'
                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-700">
          {/* ============================================================
              TAB 1: HEADER, LOGO, SLOGAN & METADATA RIBBON
          ============================================================ */}
          {activeTab === 'header_logo' && (
            <>
              {/* Logo Selection & Upload Section */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                      1. OMR Logo &amp; Emblem (प्रतीक चिन्ह / लोगो)
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Choose a crisp vector emblem or upload your school/coaching logo
                    </p>
                  </div>
                  <div className="p-1.5 bg-white rounded-full border border-slate-300 shadow-2xs">
                    <UniversityCrest
                      className="w-10 h-10"
                      logoStyle={metadata.logoStyle || 'science'}
                      customLogoUrl={metadata.customLogoUrl}
                      monogramText={metadata.logoMonogramText}
                    />
                  </div>
                </div>

                {/* Left & Right Logo Visibility Checkboxes */}
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={metadata.omrShowLeftLogo !== false}
                      onChange={(e) => updateField('omrShowLeftLogo', e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span>Show Left Logo (बायां लोगो)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={metadata.omrShowRightLogo !== false}
                      onChange={(e) => updateField('omrShowRightLogo', e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span>Show Right Logo (दायां लोगो)</span>
                  </label>
                </div>

                {/* Preset Logo Style Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {logoPresets.map((preset) => {
                    const selected = (metadata.logoStyle || 'science') === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => updateField('logoStyle', preset.id)}
                        className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                          selected
                            ? 'bg-blue-50/90 border-blue-600 ring-1 ring-blue-600 text-blue-950'
                            : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="font-bold text-[11px]">{preset.name}</div>
                        <div className="text-[9.5px] text-slate-500 leading-tight mt-0.5">
                          {preset.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* If Monogram is chosen */}
                {metadata.logoStyle === 'monogram' && (
                  <div className="bg-white p-2.5 rounded-lg border border-blue-200">
                    <label className="block font-bold text-slate-800 mb-1">
                      Monogram Letters (1 to 5 Letters inside Seal)
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={metadata.logoMonogramText ?? 'RRVV'}
                      onChange={(e) => updateField('logoMonogramText', e.target.value.toUpperCase())}
                      placeholder="e.g. RRVV, DPS, KV, BHU"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono uppercase font-bold"
                    />
                  </div>
                )}

                {/* Custom Logo Upload or Image URL */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">
                      Upload Custom School Logo (PNG / JPG / SVG)
                    </span>
                    <input
                      ref={logoFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, false)}
                      className="hidden"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10.5px] cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload Image</span>
                      </button>
                      {metadata.customLogoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            onChange({
                              ...metadata,
                              logoStyle: 'science',
                              customLogoUrl: '',
                            });
                          }}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                          title="Remove Custom Logo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={metadata.customLogoUrl || ''}
                    onChange={(e) => {
                      onChange({
                        ...metadata,
                        logoStyle: e.target.value.trim() ? 'custom' : 'science',
                        customLogoUrl: e.target.value,
                      });
                    }}
                    placeholder="Or paste direct image URL (https://.../logo.png)"
                    className="w-full px-2.5 py-1 border border-slate-300 rounded text-[11px]"
                  />

                  {/* Option for different Right Logo */}
                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-[11px] font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={metadata.omrRightLogoSameAsLeft !== false}
                        onChange={(e) =>
                          updateField('omrRightLogoSameAsLeft', e.target.checked)
                        }
                        className="w-3.5 h-3.5 rounded text-blue-600"
                      />
                      <span>Use exact same logo on Right side (दाईं तरफ भी समान लोगो रखें)</span>
                    </label>
                    {metadata.omrRightLogoSameAsLeft === false && (
                      <>
                        <input
                          ref={rightLogoFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e, true)}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => rightLogoFileInputRef.current?.click()}
                          className="px-2 py-0.5 bg-slate-800 text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          Upload Right Logo
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Slogan & Top Crown Bar Settings */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5">
                  2. Top Crown Bar &amp; Slogan (शीर्ष पट्टी एवं आदर्श वाक्य)
                </h4>

                <div>
                  <label className="block font-semibold mb-1">
                    Top Slogan / Motto (आदर्श वाक्य / स्लोगन - खाली छोड़ने पर हट जाएगा)
                  </label>
                  <input
                    type="text"
                    value={metadata.omrSlogan ?? '॥ विद्या ददाति विनयम् ॥'}
                    onChange={(e) => updateField('omrSlogan', e.target.value)}
                    placeholder="e.g. ॥ विद्या ददाति विनयम् ॥"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {[
                      '॥ विद्या ददाति विनयम् ॥',
                      '॥ तमसो मा ज्योतिर्गमय ॥',
                      '॥ सा विद्या या विमुक्तये ॥',
                      '॥ सत्यमेव जयते ॥',
                      '',
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => updateField('omrSlogan', preset)}
                        className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-slate-300 rounded hover:bg-blue-50 cursor-pointer"
                      >
                        {preset || '✕ Clear Slogan'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Badge Prefix</label>
                    <input
                      type="text"
                      value={metadata.omrBadgePrefix ?? 'OMR'}
                      onChange={(e) => updateField('omrBadgePrefix', e.target.value)}
                      placeholder="OMR"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-semibold mb-1">Form Code (Right Badge)</label>
                    <input
                      type="text"
                      value={metadata.omrFormCode ?? 'FORM: A4-STD'}
                      onChange={(e) => updateField('omrFormCode', e.target.value)}
                      placeholder="FORM: A4-STD"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    Top Bar Document Subtitle (ओएमआर शीर्षक)
                  </label>
                  <input
                    type="text"
                    value={
                      metadata.omrTopBarTitle ??
                      'OPTICAL MARK RECOGNITION ANSWER SHEET • ओएमआर उत्तर पत्रक'
                    }
                    onChange={(e) => updateField('omrTopBarTitle', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>

                <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={metadata.omrShowBarcode !== false}
                    onChange={(e) => updateField('omrShowBarcode', e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Show Optical Barcode in Top Bar (बारकोड दिखाएं)</span>
                </label>
              </div>

              {/* School Name, Exam Title & Metadata Ribbon */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5">
                  3. School Name, Exam Info &amp; 5-Cell Ribbon
                </h4>

                <div>
                  <label className="block font-semibold mb-1">
                    Institute / School Name (संस्थान / विद्यालय का नाम)
                  </label>
                  <input
                    type="text"
                    value={metadata.instituteName}
                    onChange={(e) => updateField('instituteName', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    Examination Title (परीक्षा का नाम)
                  </label>
                  <input
                    type="text"
                    value={metadata.examTitle}
                    onChange={(e) => updateField('examTitle', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Subject (विषय)</label>
                    <input
                      type="text"
                      value={metadata.subject}
                      onChange={(e) => updateField('subject', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Class / Grade (कक्षा)</label>
                    <input
                      type="text"
                      value={metadata.classGrade}
                      onChange={(e) => updateField('classGrade', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Time Limit (समय)</label>
                    <input
                      type="text"
                      value={metadata.timeLimit}
                      onChange={(e) => updateField('timeLimit', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Exam Date (तारीख)</label>
                    <input
                      type="text"
                      value={metadata.date}
                      onChange={(e) => updateField('date', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Test Set Code</label>
                    <input
                      type="text"
                      value={metadata.testCode}
                      onChange={(e) => updateField('testCode', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Marks / Question</label>
                    <input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={metadata.marksPerQuestion}
                      onChange={(e) => updateField('marksPerQuestion', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Negative Marking</label>
                    <select
                      value={metadata.negativeMarking}
                      onChange={(e) => updateField('negativeMarking', Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white"
                    >
                      <option value={0}>0 (NIL / कोई नहीं)</option>
                      <option value={0.25}>-0.25 (1/4)</option>
                      <option value={0.33}>-0.33 (1/3)</option>
                      <option value={0.5}>-0.50 (1/2)</option>
                      <option value={1}>-1.00 (1 Mark)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Custom Negative Text</label>
                    <input
                      type="text"
                      value={metadata.omrNegativeCustomText ?? ''}
                      onChange={(e) => updateField('omrNegativeCustomText', e.target.value)}
                      placeholder="Auto (e.g. NIL)"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>

                {/* 5-Cell Ribbon Header Labels */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="font-bold text-[10.5px] text-slate-700 mb-1.5">
                    Customize 5-Cell Metadata Ribbon Headings:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500">Cell 1 Heading</label>
                      <input
                        type="text"
                        value={metadata.omrTimeLabel ?? 'TIME / समय'}
                        onChange={(e) => updateField('omrTimeLabel', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">Cell 2 Heading</label>
                      <input
                        type="text"
                        value={metadata.omrDateLabel ?? 'DATE / तारीख'}
                        onChange={(e) => updateField('omrDateLabel', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">Cell 3 Heading</label>
                      <input
                        type="text"
                        value={metadata.omrQuestionsLabel ?? 'QUESTIONS / कुल प्रश्न'}
                        onChange={(e) => updateField('omrQuestionsLabel', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">Cell 4 Heading</label>
                      <input
                        type="text"
                        value={metadata.omrMaxMarksLabel ?? 'MAX MARKS / पूर्णांक'}
                        onChange={(e) => updateField('omrMaxMarksLabel', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">Cell 5 Heading</label>
                      <input
                        type="text"
                        value={metadata.omrNegativeLabel ?? 'NEGATIVE / ऋणात्मक'}
                        onChange={(e) => updateField('omrNegativeLabel', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ============================================================
              TAB 2: CANDIDATE PARTICULARS, ROLL NO, BOOKLET & SERIES BOXES
          ============================================================ */}
          {activeTab === 'candidate_boxes' && (
            <>
              {/* Panel A: Candidate & Father Name */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5">
                  1. Candidate Name &amp; Exam Center Panel (बायां बॉक्स)
                </h4>

                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-3">
                    <label className="block font-semibold mb-1">Field 1 Label (Candidate Name)</label>
                    <input
                      type="text"
                      value={
                        metadata.omrCandidateNameLabel ??
                        '1. Candidate Name / अभ्यर्थी का नाम (In Block Letters)'
                      }
                      onChange={(e) => updateField('omrCandidateNameLabel', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Letter Boxes</label>
                    <input
                      type="number"
                      min={6}
                      max={24}
                      value={metadata.omrCandidateNameBoxes ?? 16}
                      onChange={(e) => updateField('omrCandidateNameBoxes', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={metadata.omrShowFatherName !== false}
                    onChange={(e) => updateField('omrShowFatherName', e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Show Field 2 (Father&apos;s / Guardian&apos;s Name Row)</span>
                </label>

                {metadata.omrShowFatherName !== false && (
                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-3">
                      <label className="block font-semibold mb-1">Field 2 Label (Father&apos;s Name)</label>
                      <input
                        type="text"
                        value={
                          metadata.omrFatherNameLabel ??
                          "2. Father's / Guardian's Name / पिता या अभिभावक का नाम"
                        }
                        onChange={(e) => updateField('omrFatherNameLabel', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Letter Boxes</label>
                      <input
                        type="number"
                        min={6}
                        max={24}
                        value={metadata.omrFatherNameBoxes ?? 16}
                        onChange={(e) => updateField('omrFatherNameBoxes', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                  <div>
                    <label className="block font-semibold mb-1">Subject/Class Sub-label</label>
                    <input
                      type="text"
                      value={metadata.omrSubjectClassLabel ?? 'Subject & Class / विषय एवं कक्षा:'}
                      onChange={(e) => updateField('omrSubjectClassLabel', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Exam Center Sub-label</label>
                    <input
                      type="text"
                      value={metadata.omrExamCenterLabel ?? 'Exam Center / परीक्षा केंद्र:'}
                      onChange={(e) => updateField('omrExamCenterLabel', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    Pre-filled Exam Center Name (Optional - खाली छोड़ने पर लिखने की जगह रहेगी)
                  </label>
                  <input
                    type="text"
                    value={metadata.omrExamCenterDefaultValue ?? ''}
                    onChange={(e) => updateField('omrExamCenterDefaultValue', e.target.value)}
                    placeholder="e.g. मुख्य परिसर, राम रमन विज्ञान विश्वविद्यालय"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>

              {/* Panel B: Roll Number, Booklet Number, Center & Room Code */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5">
                  2. Roll No., Booklet No. &amp; Center Code Boxes (मध्य बॉक्स)
                </h4>

                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-3">
                    <label className="block font-semibold mb-1">Field 3 Label (Roll Number)</label>
                    <input
                      type="text"
                      value={
                        metadata.omrRollNoLabel ??
                        `3. Roll Number / अनुक्रमांक (${metadata.omrRollNoDigits || 8} Digits)`
                      }
                      onChange={(e) => updateField('omrRollNoLabel', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Digits (4-12)</label>
                    <input
                      type="number"
                      min={4}
                      max={12}
                      value={metadata.omrRollNoDigits ?? 8}
                      onChange={(e) => updateField('omrRollNoDigits', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-3">
                    <label className="block font-semibold mb-1">Field 4 Label (Booklet No.)</label>
                    <input
                      type="text"
                      value={
                        metadata.omrBookletNoLabel ??
                        '4. Question Booklet No. / प्रश्न पुस्तिका संख्या'
                      }
                      onChange={(e) => updateField('omrBookletNoLabel', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Digits (3-10)</label>
                    <input
                      type="number"
                      min={3}
                      max={10}
                      value={metadata.omrBookletNoDigits ?? 6}
                      onChange={(e) => updateField('omrBookletNoDigits', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                  <div className="space-y-1.5">
                    <label className="block font-semibold">Center Code Label &amp; Digits</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={metadata.omrCenterCodeLabel ?? 'Center Code / केंद्र कोड:'}
                        onChange={(e) => updateField('omrCenterCodeLabel', e.target.value)}
                        className="flex-1 px-2 py-1 border border-slate-300 rounded bg-white"
                      />
                      <input
                        type="number"
                        min={2}
                        max={8}
                        value={metadata.omrCenterCodeDigits ?? 4}
                        onChange={(e) => updateField('omrCenterCodeDigits', Number(e.target.value))}
                        className="w-14 px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-semibold">Room No. Label &amp; Digits</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={metadata.omrRoomNoLabel ?? 'Room No. / कक्ष सं.:'}
                        onChange={(e) => updateField('omrRoomNoLabel', e.target.value)}
                        className="flex-1 px-2 py-1 border border-slate-300 rounded bg-white"
                      />
                      <input
                        type="number"
                        min={2}
                        max={6}
                        value={metadata.omrRoomNoDigits ?? 3}
                        onChange={(e) => updateField('omrRoomNoDigits', Number(e.target.value))}
                        className="w-14 px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel C: Booklet Series & Shift Circles */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5">
                  3. Booklet Series &amp; Shift Circles (दायां बॉक्स)
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Field 5 Label (Booklet Series)</label>
                    <input
                      type="text"
                      value={metadata.omrBookletSeriesLabel ?? '5. Booklet Series / श्रृंखला'}
                      onChange={(e) => updateField('omrBookletSeriesLabel', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">
                      Series Circles (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={metadata.omrBookletSeriesOptions ?? 'A, B, C, D'}
                      onChange={(e) => updateField('omrBookletSeriesOptions', e.target.value)}
                      placeholder="A, B, C, D"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Field 6 Label (Shift / पाली)</label>
                    <input
                      type="text"
                      value={metadata.omrShiftLabel ?? '6. Shift / पाली'}
                      onChange={(e) => updateField('omrShiftLabel', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">
                      Shift Circles (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={metadata.omrShiftOptions ?? 'I, II'}
                      onChange={(e) => updateField('omrShiftOptions', e.target.value)}
                      placeholder="I, II"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Bottom Note inside Series Box</label>
                  <input
                    type="text"
                    value={metadata.omrSeriesFooterNote ?? 'Darken Correct Set & Shift Circle'}
                    onChange={(e) => updateField('omrSeriesFooterNote', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>
            </>
          )}

          {/* ============================================================
              TAB 3: OMR BUBBLES, CAPACITY, INSTRUCTIONS & ROUGH WORK
          ============================================================ */}
          {activeTab === 'bubbles_rules' && (
            <>
              {/* Question Capacity & Option Bubble Letters */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5">
                  1. OMR Question Capacity &amp; Bubble Letters
                </h4>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-slate-800">
                      OMR Sheet Question Capacity (प्रश्नों की संख्या)
                    </label>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                      {metadata.omrCapacity === 0
                        ? 'Auto (Matches Questions)'
                        : `${metadata.omrCapacity} Questions`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={250}
                      value={metadata.omrCapacity || 0}
                      onChange={(e) =>
                        updateField('omrCapacity', Math.max(0, Number(e.target.value) || 0))
                      }
                      placeholder="0 = Auto"
                      className="w-24 px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-mono"
                    />
                    <div className="flex flex-wrap gap-1 flex-1">
                      {[
                        { label: 'Auto', val: 0 },
                        { label: '20', val: 20 },
                        { label: '40', val: 40 },
                        { label: '50', val: 50 },
                        { label: '80', val: 80 },
                        { label: '100', val: 100 },
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => updateField('omrCapacity', preset.val)}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition cursor-pointer ${
                            (metadata.omrCapacity || 0) === preset.val
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1.5">
                    OMR Circle Option Labels (गोलों के अंदर के अक्षर)
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(
                      [
                        { id: 'ABCD', label: 'A, B, C, D' },
                        { id: '1234', label: '1, 2, 3, 4' },
                        { id: 'HINDI_A', label: 'अ, ब, स, द' },
                        { id: 'HINDI_KA', label: 'क, ख, ग, घ' },
                        { id: 'abcd', label: 'a, b, c, d' },
                      ] as Array<{ id: OmrOptionStyle; label: string }>
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateField('omrOptionStyle', opt.id)}
                        className={`py-1.5 px-2 rounded-lg border font-bold text-[11px] cursor-pointer transition ${
                          (metadata.omrOptionStyle || 'ABCD') === opt.id
                            ? 'bg-indigo-950 text-white border-indigo-950'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    Response Matrix Section Heading
                  </label>
                  <input
                    type="text"
                    value={metadata.omrResponseHeaderTitle ?? '▼ RESPONSE SHEET / उत्तर प्रभाग'}
                    onChange={(e) => updateField('omrResponseHeaderTitle', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>

              {/* Marking Instructions Bar */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                    2. OMR Marking Instructions Bar (महत्वपूर्ण निर्देश पट्टी)
                  </h4>
                  <label className="flex items-center gap-1.5 font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={metadata.omrShowInstructionsBar !== false}
                      onChange={(e) => updateField('omrShowInstructionsBar', e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span>Show Bar</span>
                  </label>
                </div>

                {metadata.omrShowInstructionsBar !== false && (
                  <>
                    <div>
                      <label className="block font-semibold mb-1">Instruction Badge Title</label>
                      <input
                        type="text"
                        value={
                          metadata.omrInstructionBadge ??
                          'महत्वपूर्ण निर्देश / MARKING INSTRUCTIONS'
                        }
                        onChange={(e) => updateField('omrInstructionBadge', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Primary Pen Instruction</label>
                      <input
                        type="text"
                        value={
                          metadata.omrInstructionHeadline ??
                          'केवल काले या नीले बॉल पेन (Black/Blue Ball Point Pen) से गोले को पूर्णतः गहरा भरें।'
                        }
                        onChange={(e) => updateField('omrInstructionHeadline', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Secondary Bullet Note</label>
                      <textarea
                        rows={2}
                        value={
                          metadata.omrInstructionSubtext ??
                          '• पहले स्तंभ (Column 1: Q.01–20) को पूरा भरने के बाद ही अगले स्तंभ पर जाएं। • एक से अधिक गोले भरने या काट-छांट करने पर उत्तर अमान्य होगा।'
                        }
                        onChange={(e) => updateField('omrInstructionSubtext', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold mb-1">Wrong Method Label</label>
                        <input
                          type="text"
                          value={metadata.omrWrongLabel ?? 'गलत / Wrong:'}
                          onChange={(e) => updateField('omrWrongLabel', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Correct Method Label</label>
                        <input
                          type="text"
                          value={metadata.omrCorrectLabel ?? 'सही / Correct:'}
                          onChange={(e) => updateField('omrCorrectLabel', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Rough Work Box Customization (Shown when < 5 columns are used) */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5">
                  3. Rough Work Box Texts (रफ कार्य क्षेत्र - 80 से कम प्रश्नों पर)
                </h4>

                <div>
                  <label className="block font-semibold mb-1">Rough Work Heading</label>
                  <input
                    type="text"
                    value={
                      metadata.omrRoughWorkTitle ??
                      '✎ SPACE FOR ROUGH WORK / रफ कार्य हेतु स्थान'
                    }
                    onChange={(e) => updateField('omrRoughWorkTitle', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Rough Work Center Watermark Text</label>
                  <input
                    type="text"
                    value={
                      metadata.omrRoughWorkSubtitle ??
                      'Candidate Calculation & Scratchpad Area • अभ्यर्थी गणना एवं रफ कार्य क्षेत्र'
                    }
                    onChange={(e) => updateField('omrRoughWorkSubtitle', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Rough Work Bottom Warning</label>
                  <input
                    type="text"
                    value={
                      metadata.omrRoughWorkFooterNote ??
                      'Do not make any stray marks on the OMR response circles.'
                    }
                    onChange={(e) => updateField('omrRoughWorkFooterNote', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>
            </>
          )}

          {/* ============================================================
              TAB 4: FOOTER EVALUATION TABLE, DECLARATIONS & SIGNATURES
          ============================================================ */}
          {activeTab === 'footer_signs' && (
            <>
              {/* Evaluation Table */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                    1. Evaluation Summary Table (मूल्यांकन तालिका)
                  </h4>
                  <label className="flex items-center gap-1.5 font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={metadata.omrShowEvaluationTable !== false}
                      onChange={(e) => updateField('omrShowEvaluationTable', e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span>Show Table</span>
                  </label>
                </div>

                {metadata.omrShowEvaluationTable !== false && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500">Column 1</label>
                      <input
                        type="text"
                        value={metadata.omrEvalTotalLabel ?? 'Total Questions'}
                        onChange={(e) => updateField('omrEvalTotalLabel', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">Column 2</label>
                      <input
                        type="text"
                        value={metadata.omrEvalAttemptedLabel ?? 'Attempted / हल किए'}
                        onChange={(e) => updateField('omrEvalAttemptedLabel', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">Column 3</label>
                      <input
                        type="text"
                        value={metadata.omrEvalBlankLabel ?? 'Left Blank / छोड़े गए'}
                        onChange={(e) => updateField('omrEvalBlankLabel', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">Column 4</label>
                      <input
                        type="text"
                        value={metadata.omrEvalCorrectLabel ?? 'Correct (+)'}
                        onChange={(e) => updateField('omrEvalCorrectLabel', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">Column 5</label>
                      <input
                        type="text"
                        value={metadata.omrEvalWrongLabel ?? 'Wrong (-)'}
                        onChange={(e) => updateField('omrEvalWrongLabel', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">Column 6</label>
                      <input
                        type="text"
                        value={metadata.omrEvalNetScoreLabel ?? 'Net Score / प्राप्तांक'}
                        onChange={(e) => updateField('omrEvalNetScoreLabel', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Candidate Declaration & Signature Box */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5">
                  2. Candidate Declaration &amp; Signature Box (अभ्यर्थी घोषणा)
                </h4>

                <div>
                  <label className="block font-semibold mb-1">Declaration Heading</label>
                  <input
                    type="text"
                    value={metadata.omrDeclarationTitle ?? 'घोषणा / Declaration:'}
                    onChange={(e) => updateField('omrDeclarationTitle', e.target.value)}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Declaration Statement</label>
                  <textarea
                    rows={2}
                    value={
                      metadata.omrDeclarationText ??
                      'मैं प्रमाणित करता/करती हूँ कि मैंने ऊपर अपना अनुक्रमांक एवं प्रश्न पुस्तिका श्रृंखला सही-सही अंकित की है।'
                    }
                    onChange={(e) => updateField('omrDeclarationText', e.target.value)}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block font-semibold mb-1">Signature Line Label</label>
                    <input
                      type="text"
                      value={
                        metadata.omrCandidateSignLabel ??
                        "Candidate's Signature / अभ्यर्थी के हस्ताक्षर"
                      }
                      onChange={(e) => updateField('omrCandidateSignLabel', e.target.value)}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Right Subtext</label>
                    <input
                      type="text"
                      value={metadata.omrCandidateSignSubtext ?? '(In Running Hand)'}
                      onChange={(e) => updateField('omrCandidateSignSubtext', e.target.value)}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Invigilator Verification Box */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5">
                  3. Invigilator Verification Box (कक्ष निरीक्षक सत्यापन)
                </h4>

                <div>
                  <label className="block font-semibold mb-1">Verification Heading</label>
                  <input
                    type="text"
                    value={metadata.omrVerificationTitle ?? 'सत्यापन / Verification:'}
                    onChange={(e) => updateField('omrVerificationTitle', e.target.value)}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Verification Statement</label>
                  <textarea
                    rows={2}
                    value={
                      metadata.omrVerificationText ??
                      'अभ्यर्थी के अनुक्रमांक, नाम एवं पुस्तिका कोड का मिलान कर सत्यापित किया गया।'
                    }
                    onChange={(e) => updateField('omrVerificationText', e.target.value)}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block font-semibold mb-1">Invigilator Sign Label</label>
                    <input
                      type="text"
                      value={
                        metadata.omrInvigilatorSignLabel ??
                        "Invigilator's Signature / कक्ष निरीक्षक"
                      }
                      onChange={(e) => updateField('omrInvigilatorSignLabel', e.target.value)}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Right Subtext</label>
                    <input
                      type="text"
                      value={metadata.omrInvigilatorSignSubtext ?? '(With Date)'}
                      onChange={(e) => updateField('omrInvigilatorSignSubtext', e.target.value)}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Official Seal & Page Footer */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5">
                  4. Official Seal Box &amp; Page Footer (मुहर एवं फुटर)
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Top Title</label>
                    <input
                      type="text"
                      value={
                        metadata.omrSuperintendentLabel ??
                        'Center Superintendent / केंद्राधीक्षक'
                      }
                      onChange={(e) => updateField('omrSuperintendentLabel', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Middle Placeholder</label>
                    <input
                      type="text"
                      value={metadata.omrStampSpaceLabel ?? '[ Stamp & Seal Space ]'}
                      onChange={(e) => updateField('omrStampSpaceLabel', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Bottom Seal Text</label>
                    <input
                      type="text"
                      value={metadata.omrOfficialSealLabel ?? 'Official Seal / आधिकारिक मुहर'}
                      onChange={(e) => updateField('omrOfficialSealLabel', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">OMR Page Bottom Margin Text</label>
                  <input
                    type="text"
                    value={metadata.omrPageFooterText ?? 'PAGE 01 • OMR ANSWER SHEET'}
                    onChange={(e) => updateField('omrPageFooterText', e.target.value)}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded bg-white font-mono"
                  />
                </div>
              </div>
            </>
          )}

          {/* ============================================================
              TAB 5: QUESTION PAPER LAYOUT, WATERMARK & PRINT PAGES
          ============================================================ */}
          {activeTab === 'paper_print' && (
            <>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5">
                  1. Question Paper Layout &amp; Typography
                </h4>

                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                  <div>
                    <div className="font-bold text-slate-800">2-Column Question Paper Layout</div>
                    <div className="text-[10px] text-slate-500">
                      Standard competitive exam double-column layout (saves paper)
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={metadata.twoColumnLayout}
                    onChange={(e) => updateField('twoColumnLayout', e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Question Paper Font Size</label>
                  <select
                    value={metadata.fontSize}
                    onChange={(e) =>
                      updateField(
                        'fontSize',
                        e.target.value as 'compact' | 'normal' | 'relaxed'
                      )
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="compact">Compact (Saves pages, ideal for print)</option>
                    <option value="normal">Normal (Standard balanced sizing)</option>
                    <option value="relaxed">Relaxed (Large &amp; spacious text)</option>
                  </select>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">Diagonal Watermark</div>
                      <div className="text-[10px] text-slate-500">
                        Light background diagonal watermark on question pages
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={metadata.showWatermark}
                      onChange={(e) => updateField('showWatermark', e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                  </div>
                  {metadata.showWatermark && (
                    <input
                      type="text"
                      value={metadata.watermarkText}
                      onChange={(e) => updateField('watermarkText', e.target.value)}
                      placeholder="Watermark text (e.g. SAMPLE or CONFIDENTIAL)"
                      className="w-full px-3 py-1 text-xs border border-slate-300 rounded bg-slate-50"
                    />
                  )}
                </div>
              </div>

              {/* Included PDF Pages */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5">
                  2. Included PDF Pages
                </h4>

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

              {/* Question Paper General Instructions */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                    3. Question Paper Instructions (प्रश्न-पत्र निर्देश)
                  </h4>
                  <button
                    type="button"
                    onClick={addInstruction}
                    className="text-[10.5px] text-blue-600 font-bold hover:underline cursor-pointer"
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
                        className="text-slate-400 hover:text-rose-600 px-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom Drawer Footer with Reset & Apply */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleResetOmrCustomizations}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
            title="Reset all OMR labels, logos, and boxes back to standard defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset OMR Defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Apply &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
