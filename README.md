# Raman MCQ & OMR Studio

**Raman MCQ & OMR Studio** is a complete browser-based **Exam Paper, Optical Mark Recognition (OMR) Answer Sheet, Official Answer Key, and Interactive Practice Studio** built for educators, schools, coaching institutes, and universities.

It transforms raw MCQ text or AI-generated quiz objects into print-ready **A4 University Examination Booklets**, **Full-Page Optical OMR Sheets**, and **Official Answer Keys** with full **LaTeX mathematics (`$...$`)** and **Bilingual (Hindi / Devanagari, Hinglish, and English)** support.

---

## ✨ Key Features

### 1. Complete 3-in-1 Printable A4 Exam Suite
- **Page 1 — Full-A4 Optical OMR Answer Sheet**:
  - Symmetrical university header with customizable left/right crests, slogan (`॥ विद्या ददाति विनयम् ॥`), barcode, and form code.
  - 5-cell metadata ribbon displaying **Time**, **Date**, **Total Questions**, **Max Marks**, and **Negative Marking**.
  - Candidate write-in character boxes for **Candidate Name**, **Father's / Guardian's Name**, **Roll Number**, **Question Booklet No.**, **Center Code**, and **Room No.**
  - **Booklet Series** (`A, B, C, D`) and **Shift** (`I, II`) bubbles with automatic active-set highlighting.
  - **Sequential 5-Column Response Matrix**: Fixed 18px × 18px optical circles (20 questions per column for up to 100 questions, scaling dynamically for any question count) with optical timing tracks and corner fiducial scanner markers.
  - Smart **Optical Roll Number (0–9) Matrix & Rough Work Scratchpad** when fewer than 5 columns are used.
  - **Official Evaluation Summary Table**, Candidate Declaration, Invigilator Verification, and Center Superintendent Seal blocks.
- **Middle Pages — Multi-Page A4 Question Paper**:
  - Greedy A4 pagination that fills earlier pages completely before spilling over to continuation pages.
  - Toggleable **2-Column** (with center divider rule) and **1-Column** question layouts.
  - On the final page in 2-column mode, questions fill Column 1 first before overflowing into Column 2.
  - Institutional running headers and `PAGE XX OF YY` boundary badges on continuation pages.
  - Three typography density modes: **Compact**, **Normal**, and **Relaxed**.
  - Optional diagonal **Watermark** across exam pages.
- **Final Page — Official Answer Key & Distribution Matrix**:
  - Color-coded high-contrast answer matrix grouped into 5-row blocks for fast manual or optical verification.
  - Live **Option Distribution Bar** (`A`, `B`, `C`, `D` counts) and scoring rules (`+Marks` / `-Negative`).
  - Independent Answer Key font size control (**Compact**, **Normal**, and **Large** by default).

---

### 2. Resilient Quiz Parser & Multi-Format Input
- **Supports 100+ Questions Seamlessly**: Isolates every question block independently so unescaped quotes, apostrophes, comments/headers between batches, or complex LaTeX braces never interrupt parsing.
- **Flexible Input Formats**:
  - Standard object syntax: `{ q: "...", o: ["...", "...", "...", "..."], a: 0 }`
  - Alternative keys (`question`, `options`, `answer`, `ans`) and object-style options (`o: { A: "...", B: "...", C: "...", D: "..." }`).
  - Square brackets `[...]` inside options (e.g., Physics dimensions `$[M^1 L^1 T^{-2}]$`, Chemistry `$[H^+]$`, LaTeX `\sqrt[3]{x}`, `\left[...\right]`).
  - Unquoted numeric options (`o: [1913, 1930, 1942, 1954]`), smart/curly quotes (`“ ”`), and letter answers (`a: "B"`, `a: "ब"`).
  - Plain-text numbered MCQs (`1. Question... (A) ... (B) ... (C) ... (D) ... Answer: B`).
- **Drag-and-Drop File Upload**: Drop any `.txt` or `.json` file directly onto the Quiz Input Box or upload via the toolbar.

---

### 3. Live LaTeX Math & Science Rendering (KaTeX)
- Renders inline (`$...$`) and display (`$$...$$`) LaTeX mathematical expressions, fractions (`\frac{a}{b}`), integrals (`\int`), limits (`\lim`), matrices (`\begin{pmatrix}...\end{pmatrix}`), vectors (`\vec{a}`), Greek letters, and chemical equations (`\text{H}_2\text{SO}_4`) with crisp print typography.

---

### 4. Visual Question Editor & Live LaTeX Fixer
- Click **Edit** on any question directly from the Question Paper preview or open the **Visual Question Editor** from the top navigation bar.
- Search questions by number or Hindi/English/LaTeX text.
- Quick-insert toolbar for common LaTeX symbols (`\frac{a}{b}`, `\sqrt{x}`, `x^{2}`, `x_{1}`, `\theta`, `\pi`, `\int`, `\sum`, `\rightarrow`, `^\circ`, `\times`, `\leq`) into either the question statement or any option (`A, B, C, D`).
- Add, delete, reorder (Move Up / Move Down), and change the correct answer option with instant side-by-side KaTeX preview.

---

### 5. Pure Randomization & Answer Balancing
- **One-Click Shuffle (`Shuffle` Button)**: Purely shuffles the order of all questions **and** independently shuffles all 4 options (`A, B, C, D`) within every question while automatically tracking and updating the correct answer index `a`.
- **Live Answer Distribution Pill**: Real-time `A`, `B`, `C`, `D` answer counts displayed right in the Quiz Input Box header.

---

### 6. Built-In AI MCQ Prompt Generator
- Generate ready-to-copy prompts tailored for ChatGPT, Gemini, Claude, or any LLM:
  - Custom **Topic / Chapter / Study Notes**.
  - Configurable **Questions Count** (1 to 500 questions, with anti-truncation instructions).
  - **Language Modes**: *Hinglish (Technical words in English, text in Hindi)*, *Hindi (हिंदी)*, *English*, and *Bilingual (Hindi + English)*.
  - **Difficulty Levels**: *Easy*, *Medium*, *Hard*, and *Advanced (JEE / NEET Level)*.
  - Enforces strict single-line `{ q, o, a }` output with pure LaTeX math and randomized answer indices.

---

### 7. Interactive Practice OMR Mode & Play Integration
- **Interactive Student Practice Mode**:
  - Switch to Practice Mode from the Pages menu to click bubbles (`A, B, C, D`) directly on the OMR sheet.
  - Real-time scoreboard calculating **Correct (+)**, **Wrong (-)**, **Net Score** (with negative marking support), and one-click reset.
- **Play on Raman Quiz Challenge**:
  - Click the **Play (`▶`)** button in the Quiz Input Box to automatically copy the quiz data to the clipboard and launch [Raman Quiz Challenge](https://ramkargwal.github.io/Raman-Quiz-Challenge/) in a new tab.

---

### 8. Comprehensive Settings & One-Step Import/Export
- **5-Tab Customization Drawer**:
  1. **Header & Logo**: Institute name, exam title, subject, class/grade, set code, date, time, slogan, 5 vector crest presets (*Science Atom, Lotus & Book, Torch Shield, Ashoka Chakra, Monogram*) + custom logo upload for left and right crests.
  2. **Candidate Boxes**: Customize every field label and box/digit count (Candidate Name boxes, Father's Name boxes, Roll No. digits, Booklet No. digits, Center Code digits, Room No. digits, Booklet Series letters, and Shift options).
  3. **Bubbles & Rules**: OMR capacity (Auto or Fixed), option bubble style (`A B C D`, `1 2 3 4`, `अ ब स द`, `क ख ग घ`, `a b c d`), marks per question, negative marking, and custom marking instruction texts.
  4. **Footer & Signs**: Toggle and customize the Evaluation Summary Table labels, Candidate Declaration, Invigilator Verification, and Official Seal text.
  5. **Paper & Print**: Question paper font size, Answer Key font size, 2-Column vs 1-Column layout, custom general instructions, diagonal watermark, and section visibility toggles.
- **Export & Import Settings (`.txt`)**:
  - **Export Setting (`↑`)**: Downloads all ~90 editable OMR, Exam Paper, and UI settings into a single `.txt` configuration file.
  - **Import Setting (`↓`)**: Restores and applies all settings in one step (also works by dragging & dropping the settings `.txt` file into the Quiz Input Box).
- **Reset Controls with Confirmation**:
  - **Reset OMR Defaults** (resets OMR design fields while keeping exam metadata) and **Reset All Settings** (restores the entire studio to factory defaults), both protected by confirmation prompts.

---

### 9. Selective Print Modes & Laser Ink Optimization
- **Selective View & Print Modes**:
  - **Full Pack (All Pages)**: OMR Sheet + Question Paper + Answer Key.
  - **Student Copy (OMR + Paper)**: OMR Sheet + Question Paper (excludes Answer Key).
  - **Only OMR Sheet**: Page 1 Full-A4 OMR Response Sheet only.
  - **Only Question Paper**: MCQ Question Booklet pages only.
  - **Only Answer Key**: Official Answer Key page only.
- **Color Ink vs. Monochrome B&W Laser Mode**:
  - Switch between **Deep Royal Indigo Color Ink** and **High-Contrast Monochrome B&W Laser** mode for crystal-clear photocopying and laser printing.

---

### 10. Local Browser Snapshots & Preset Sample Papers
- **Save & Load Exam Snapshots**: Store multiple complete exam papers (questions + metadata) in browser `localStorage`, or export/import full exam packs as `.json` or `.txt` files.
- **4 Ready-to-Use Preset Sample Papers**:
  - ⚡ **राम रमन 100 प्रश्न OMR टेस्ट** (100 Questions Full Science, Math & GK Paper)
  - 🏛️ **भीमबेटका की गुफाएँ** (20 History & Heritage Questions in Hindi)
  - 📐 **Mathematics & Trigonometry** (20 LaTeX Formula Questions)
  - ⚛️ **Physics & Chemistry** (20 Kinematics, Equations & Chemical Formula Questions)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher) or [Bun](https://bun.sh/)

### Installation & Local Development

```bash
# Install dependencies
npm install

# Start the development server on port 3000
npm run dev
```

### Build for Production

```bash
# Type-check with TypeScript
npm run lint

# Build production bundle
npm run build
```

---

## 📝 Quiz Input Format Example

Paste lines in the following format into the **Quiz Input Box** (or drag and drop a `.txt` file):

```text
{ q: "यदि $z = \cos\theta + i\sin\theta$ है, तो $z^n + z^{-n}$ किसके बराबर है?", o: ["$2\sin(n\theta)$", "$2i\sin(n\theta)$", "$2\cos(n\theta)$", "$2i\cos(n\theta)$"], a: 2 },
{ q: "भीमबेटका की गुफाएँ भारत के किस राज्य में स्थित हैं?", o: ["राजस्थान", "मध्य प्रदेश", "उत्तर प्रदेश", "महाराष्ट्र"], a: 1 },
{ q: "सल्फ्यूरिक अम्ल का सही रासायनिक सूत्र क्या है?", o: ["$\text{HCl}$", "$\text{HNO}_3$", "$\text{H}_2\text{SO}_4$", "$\text{H}_2\text{O}_2$"], a: 2 },
```

- `q`: Question text (supports Hindi, English, Hinglish, and inline LaTeX `$...$`)
- `o`: Array of 4 options `["Option A", "Option B", "Option C", "Option D"]`
- `a`: Correct option index (`0` = A, `1` = B, `2` = C, `3` = D)
