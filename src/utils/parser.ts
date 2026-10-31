import { QuizQuestion } from '../types/quiz';

export interface ParseResult {
  questions: QuizQuestion[];
  error: string | null;
  rawCount: number;
}

/**
 * Resilient parser that extracts quiz objects from AI-generated raw text,
 * handling LaTeX backslashes, relaxed JS object formats, single/double quotes,
 * markdown code blocks, and JSON variations.
 */
export function parseQuizInput(rawInput: string): ParseResult {
  if (!rawInput || !rawInput.trim()) {
    return { questions: [], error: null, rawCount: 0 };
  }

  let text = rawInput.trim();

  // Strip markdown code fences if present
  text = text.replace(/^```(?:text|json|javascript|js)?\s*/i, '');
  text = text.replace(/\s*```$/i, '');

  const questions: QuizQuestion[] = [];
  let idCounter = 1;

  // Approach 1: Try splitting into distinct object blocks
  // Matches { q: ... o: [...] a: ... } or { "q": ... }
  // We scan for top-level balanced curly braces
  const objectBlocks: string[] = [];
  let depth = 0;
  let inString: string | null = null;
  let escape = false;
  let startIndex = -1;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (char === '\\') {
      escape = true;
      continue;
    }

    if (inString) {
      if (char === inString) {
        inString = null;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = char;
      continue;
    }

    if (char === '{') {
      if (depth === 0) {
        startIndex = i;
      }
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0 && startIndex !== -1) {
        objectBlocks.push(text.slice(startIndex, i + 1));
        startIndex = -1;
      }
    }
  }

  // Parse each extracted block
  for (const block of objectBlocks) {
    const qObj = parseSingleObjectBlock(block, idCounter);
    if (qObj) {
      questions.push(qObj);
      idCounter++;
    }
  }

  // If balanced curly brace scan yielded no results, fallback to regex-based line scanning
  if (questions.length === 0) {
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        !trimmed ||
        (!trimmed.includes('q:') && !trimmed.includes('"q":') && !trimmed.includes("'q':"))
      ) {
        continue;
      }
      const qObj = parseSingleObjectBlock(trimmed, idCounter);
      if (qObj) {
        questions.push(qObj);
        idCounter++;
      }
    }
  }

  if (questions.length === 0) {
    return {
      questions: [],
      error: 'No valid questions could be detected. Please check that the format matches: { q: "...", o: ["...", ...], a: 0 }',
      rawCount: 0,
    };
  }

  return {
    questions,
    error: null,
    rawCount: questions.length,
  };
}

/**
 * Extracts { q, o, a } from a single object chunk
 */
function parseSingleObjectBlock(block: string, id: number): QuizQuestion | null {
  try {
    // 1. Extract 'q' (question)
    // Match q: "..." or "q": "..." or q: '...'
    const qMatch = block.match(/(?:["']?q["']?)\s*:\s*(["'])([\s\S]*?)\1\s*,\s*(?:["']?o["']?)/);
    let questionText = '';

    if (qMatch) {
      questionText = qMatch[2];
    } else {
      // Fallback regex if 'o' is not immediately following
      const altQ = block.match(/(?:["']?q["']?)\s*:\s*(["'])([\s\S]*?)\1/);
      if (altQ) questionText = altQ[2];
    }

    if (!questionText) return null;

    // 2. Extract 'o' (options array)
    // Match o: [ ... ] or "o": [ ... ]
    const oMatch = block.match(/(?:["']?o["']?)\s*:\s*\[([\s\S]*?)\]/);
    if (!oMatch) return null;

    const rawOptionsInside = oMatch[1];
    const options: string[] = [];

    // Extract strings inside options array: either "..." or '...'
    let currentOpt = '';
    let inQuote: string | null = null;
    let optEscape = false;

    for (let j = 0; j < rawOptionsInside.length; j++) {
      const c = rawOptionsInside[j];

      if (optEscape) {
        currentOpt += c;
        optEscape = false;
        continue;
      }

      if (c === '\\') {
        currentOpt += c;
        optEscape = true;
        continue;
      }

      if (inQuote) {
        if (c === inQuote) {
          options.push(currentOpt);
          currentOpt = '';
          inQuote = null;
        } else {
          currentOpt += c;
        }
      } else if (c === '"' || c === "'") {
        inQuote = c;
        currentOpt = '';
      }
    }

    if (options.length < 2) return null;

    // 3. Extract 'a' (answer index: 0, 1, 2, or 3)
    const aMatch = block.match(/(?:["']?a["']?)\s*:\s*([0-3]|\d+)/);
    let answerIndex = 0;
    if (aMatch) {
      answerIndex = parseInt(aMatch[1], 10);
      if (answerIndex < 0 || answerIndex >= options.length) {
        answerIndex = 0;
      }
    }

    // 4. Optional explanation
    const expMatch = block.match(/(?:["']?(?:exp|explanation)["']?)\s*:\s*(["'])([\s\S]*?)\1/);
    const explanation = expMatch ? expMatch[2] : undefined;

    return {
      id,
      q: questionText.trim(),
      o: options.map((opt) => opt.trim()),
      a: answerIndex,
      explanation: explanation?.trim(),
    };
  } catch {
    return null;
  }
}

/**
 * Formats a list of questions back to the user prompt's exact raw format
 */
export function formatQuestionsToPromptText(questions: QuizQuestion[]): string {
  return questions
    .map((q) => {
      const escapedQ = q.q.replace(/"/g, "'");
      const optionsStr = q.o.map((opt) => `"${opt.replace(/"/g, "'")}"`).join(', ');
      return `{ q: "${escapedQ}", o: [${optionsStr}], a: ${q.a} },`;
    })
    .join('\n');
}

/**
 * Cryptographically strong random float in [0, 1) (with Math.random fallback)
 */
function randomFloat(): number {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    window.crypto.getRandomValues(buf);
    return buf[0] / 4294967296;
  }
  return Math.random();
}

/**
 * Pure random Fisher-Yates shuffle with zero artificial logic
 */
function shuffleArrayRandom<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(randomFloat() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

/**
 * Purely randomizes all 4 options of every question independently (no artificial logic).
 * Tracks the exact correct option and updates `a` to its new random position (0, 1, 2, or 3).
 */
export function balanceQuestionOptions(questions: QuizQuestion[]): QuizQuestion[] {
  if (questions.length === 0) return [];

  return questions.map((q, idx) => {
    const optCount = q.o.length;
    if (optCount < 2) return { ...q };

    const safeCurrentA = q.a >= 0 && q.a < optCount ? q.a : 0;

    // Pair each option with whether it is the correct answer, then shuffle purely at random
    const taggedOptions = q.o.map((text, i) => ({
      text,
      isCorrect: i === safeCurrentA,
    }));

    shuffleArrayRandom(taggedOptions);

    const newOptions = taggedOptions.map((item) => item.text);
    const newAnswerIndex = taggedOptions.findIndex((item) => item.isCorrect);

    return {
      ...q,
      id: idx + 1,
      o: newOptions,
      a: newAnswerIndex >= 0 ? newAnswerIndex : 0,
    };
  });
}

/**
 * Purely randomizes the order of all questions AND purely shuffles all 4 options of each question.
 */
export function randomizeQuestionsAndOptions(questions: QuizQuestion[]): QuizQuestion[] {
  if (questions.length === 0) return [];

  const cloned = questions.map((q) => ({ ...q, o: [...q.o] }));
  shuffleArrayRandom(cloned);

  return balanceQuestionOptions(cloned);
}

/**
 * Computes the count of A, B, C, D answers across the question list
 */
export function getAnswerDistribution(questions: QuizQuestion[]): {
  A: number;
  B: number;
  C: number;
  D: number;
} {
  const counts = { A: 0, B: 0, C: 0, D: 0 };
  for (const q of questions) {
    if (q.a === 0) counts.A++;
    else if (q.a === 1) counts.B++;
    else if (q.a === 2) counts.C++;
    else if (q.a === 3) counts.D++;
  }
  return counts;
}


