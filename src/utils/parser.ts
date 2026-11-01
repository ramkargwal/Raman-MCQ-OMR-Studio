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

  // Strip markdown code fences anywhere in the pasted text (supports multiple pasted AI batches)
  let text = rawInput
    .replace(/```(?:text|json|javascript|js|ts)?/gi, '')
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
    .trim();

  const questions: QuizQuestion[] = [];
  let idCounter = 1;

  // Approach 1: Split by each question object start pattern `{ q: ...` or line-start `q: ...`
  // This isolates every question so an unescaped quote, apostrophe, or LaTeX brace in one question
  // or in a batch header/comment never corrupts subsequent questions.
  const questionStartRegex =
    /(?:^|\{|\n)\s*(?:(?:["']?(?:id|no|num|qno|sr|index)["']?\s*:\s*[^,{}\n]+,\s*)*)(?:["']?(?:q|question|ques|text|statement|prompt)["']?)\s*:/gi;

  const startIndices: number[] = [];
  let match: RegExpExecArray | null;
  while ((match = questionStartRegex.exec(text)) !== null) {
    // Advance past leading newline if matched via \n
    const rawIdx = match.index;
    const adjustedIdx = text[rawIdx] === '\n' ? rawIdx + 1 : rawIdx;
    startIndices.push(adjustedIdx);
  }

  if (startIndices.length > 0) {
    for (let i = 0; i < startIndices.length; i++) {
      const start = startIndices[i];
      const end = i + 1 < startIndices.length ? startIndices[i + 1] : text.length;
      const chunk = text.slice(start, end).trim();
      const qObj = parseSingleObjectBlock(chunk, idCounter);
      if (qObj) {
        questions.push(qObj);
        idCounter++;
      } else {
        // Fallback: if the chunk spans multiple lines, try parsing line-by-line within the chunk
        const subLines = chunk.split(/\r?\n/);
        for (const subLine of subLines) {
          const parsedLine = parseSingleObjectBlock(subLine.trim(), idCounter);
          if (parsedLine) {
            questions.push(parsedLine);
            idCounter++;
          }
        }
      }
    }
  }

  // Approach 2: Line-by-line scan if Approach 1 yielded fewer questions than valid question lines
  const lines = text.split(/\r?\n/);
  const lineQuestions: QuizQuestion[] = [];
  let lineIdCounter = 1;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const qObj = parseSingleObjectBlock(trimmed, lineIdCounter);
    if (qObj) {
      lineQuestions.push(qObj);
      lineIdCounter++;
    }
  }

  if (lineQuestions.length > questions.length) {
    questions.length = 0;
    questions.push(...lineQuestions);
    idCounter = questions.length + 1;
  }

  // Approach 3: Fallback for plain-text numbered MCQs (e.g. "1. Question... (A) ... (B) ... (C) ... (D) ...")
  if (questions.length === 0) {
    const plainTextQuestions = parseNumberedTextQuestions(text);
    if (plainTextQuestions.length > 0) {
      questions.push(...plainTextQuestions);
    }
  }

  if (questions.length === 0) {
    return {
      questions: [],
      error:
        'No valid questions could be detected. Please check that the format matches: { q: "...", o: ["...", ...], a: 0 }',
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
 * Splits the inside of an options array `["...", "...", "...", "..."]` into individual option strings,
 * accurately handling square brackets `[...]`, LaTeX commands, commas inside quotes/parentheses,
 * unescaped inner quotes, and unquoted numeric options.
 */
function parseOptionsArrayContent(rawOptionsInside: string): string[] {
  const options: string[] = [];
  let current = '';
  let inQuote: string | null = null;
  let startedWithQuote = false;
  let depth = 0;

  for (let i = 0; i < rawOptionsInside.length; i++) {
    const c = rawOptionsInside[i];

    if (inQuote) {
      if (c === '\\' && i + 1 < rawOptionsInside.length) {
        const nextChar = rawOptionsInside[i + 1];
        if (nextChar === inQuote) {
          current += nextChar;
          i++;
          continue;
        }
        if (nextChar === '\\') {
          current += '\\\\';
          i++;
          continue;
        }
        current += c;
        continue;
      }

      if (c === inQuote) {
        // Check if this quote is the actual closing quote of the option (followed by `,` or end of array)
        const afterQuote = rawOptionsInside.slice(i + 1);
        if (/^\s*(?:,|$)/.test(afterQuote)) {
          inQuote = null;
          continue;
        }
      }

      current += c;
      continue;
    }

    // Not currently inside a quoted option
    if (current.trim() === '' && (c === '"' || c === "'")) {
      inQuote = c;
      startedWithQuote = true;
      current = '';
      continue;
    }

    if (c === '(' || c === '{' || c === '[') {
      depth++;
      current += c;
      continue;
    }

    if (c === ')' || c === '}' || c === ']') {
      depth = Math.max(0, depth - 1);
      current += c;
      continue;
    }

    if (c === ',' && depth === 0) {
      const cleaned = startedWithQuote ? current.trim() : stripOuterQuotes(current.trim());
      if (cleaned !== '' || startedWithQuote) {
        options.push(cleaned);
      }
      current = '';
      startedWithQuote = false;
      continue;
    }

    current += c;
  }

  const finalCleaned = startedWithQuote ? current.trim() : stripOuterQuotes(current.trim());
  if (finalCleaned !== '' || startedWithQuote) {
    options.push(finalCleaned);
  }

  return options;
}

function stripOuterQuotes(str: string): string {
  if (
    str.length >= 2 &&
    ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'")))
  ) {
    return str.slice(1, -1).trim();
  }
  return str;
}

function parseAnswerToken(rawAns: string, options: string[]): number {
  const cleaned = stripOuterQuotes(rawAns.trim());
  if (!cleaned) return 0;

  // Direct numeric index (0, 1, 2, 3, or 4 for 1-based fourth option)
  if (/^\d+$/.test(cleaned)) {
    const num = parseInt(cleaned, 10);
    if (num >= 0 && num < options.length) return num;
    if (num === options.length && num > 0) return num - 1;
    return 0;
  }

  // Option letter (A, B, C, D / a, b, c, d / (A) / Hindi अ, ब, स, द / क, ख, ग, घ)
  const normLetter = cleaned.replace(/[().\s]/g, '').toUpperCase();
  const letterMap: Record<string, number> = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
    अ: 0,
    ब: 1,
    स: 2,
    द: 3,
    क: 0,
    ख: 1,
    ग: 2,
    घ: 3,
  };
  if (normLetter in letterMap) {
    const idx = letterMap[normLetter];
    return idx < options.length ? idx : 0;
  }

  // Exact match with one of the option strings
  const matchedIdx = options.findIndex(
    (opt) => opt.trim().toLowerCase() === cleaned.toLowerCase()
  );
  if (matchedIdx !== -1) {
    return matchedIdx;
  }

  return 0;
}

/**
 * Extracts { q, o, a } from a single object chunk
 */
function parseSingleObjectBlock(block: string, id: number): QuizQuestion | null {
  try {
    // 1. Locate question key (`q`, `question`, `ques`, `text`, `statement`, `prompt`)
    const qKeyMatch = /(?:["']?(?:q|question|ques|text|statement|prompt)["']?)\s*:\s*/i.exec(block);
    if (!qKeyMatch) return null;

    const afterQKeyIndex = qKeyMatch.index + qKeyMatch[0].length;
    const afterQKey = block.slice(afterQKeyIndex);

    // 2. Locate options key (`o`, `options`, `opts`, `choices`, `answers`)
    const oKeyMatch = /,\s*(?:["']?(?:o|options|opts|choices|answers)["']?)\s*:\s*(\[|\{)/i.exec(
      afterQKey
    );
    if (!oKeyMatch) return null;

    const rawQValue = afterQKey.slice(0, oKeyMatch.index).trim();
    const questionText = stripOuterQuotes(rawQValue);
    if (!questionText) return null;

    const openBracketChar = oKeyMatch[1];
    const closeBracketChar = openBracketChar === '{' ? '}' : ']';

    // 3. Extract options content and answer key after `o: [` or `o: {`
    const afterOBracket = afterQKey.slice(oKeyMatch.index + oKeyMatch[0].length);

    let rawOptionsInside = '';
    let rawAnswerToken = '0';

    const closePattern =
      closeBracketChar === '}'
        ? /\}\s*,\s*(?:["']?(?:a|ans|answer|correct|correctAnswer|correctIndex|correctOption)["']?)\s*:\s*(?:(["'])([\s\S]*?)\1|([^\s,}\]]+))/i
        : /\]\s*,\s*(?:["']?(?:a|ans|answer|correct|correctAnswer|correctIndex|correctOption)["']?)\s*:\s*(?:(["'])([\s\S]*?)\1|([^\s,}\]]+))/i;

    const closeAndAnsMatch = closePattern.exec(afterOBracket);

    if (closeAndAnsMatch) {
      rawOptionsInside = afterOBracket.slice(0, closeAndAnsMatch.index);
      rawAnswerToken = closeAndAnsMatch[2] ?? closeAndAnsMatch[3] ?? '0';
    } else {
      // Fallback if `a` is omitted or placed before `o`
      const lastBracketIdx = afterOBracket.lastIndexOf(closeBracketChar);
      if (lastBracketIdx === -1) return null;
      rawOptionsInside = afterOBracket.slice(0, lastBracketIdx);

      const fallbackAnsMatch =
        /(?:["']?(?:a|ans|answer|correct|correctAnswer|correctIndex|correctOption)["']?)\s*:\s*(?:(["'])([\s\S]*?)\1|([^\s,}\]]+))/i.exec(
          block
        );
      if (fallbackAnsMatch) {
        rawAnswerToken = fallbackAnsMatch[2] ?? fallbackAnsMatch[3] ?? '0';
      }
    }

    if (openBracketChar === '{') {
      // Convert `{ A: "...", B: "...", C: "...", D: "..." }` into array content
      rawOptionsInside = rawOptionsInside.replace(
        /(?:^|,)\s*(?:["']?[A-Da-d1-4अ-दक-घ]["']?)\s*:\s*/g,
        (m) => (m.trim().startsWith(',') ? ', ' : '')
      );
    }

    const options = parseOptionsArrayContent(rawOptionsInside);
    if (options.length < 2) return null;

    const answerIndex = parseAnswerToken(rawAnswerToken, options);

    // 4. Optional explanation
    const expMatch = block.match(/(?:["']?(?:exp|explanation)["']?)\s*:\s*(["'])([\s\S]*?)\1/i);
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
 * Fallback parser for plain-text numbered MCQs
 * e.g.:
 * 1. Question text
 * (A) Opt 1 (B) Opt 2 (C) Opt 3 (D) Opt 4
 * Answer: B
 */
function parseNumberedTextQuestions(text: string): QuizQuestion[] {
  const results: QuizQuestion[] = [];
  const questionBlocks = text
    .split(/(?:^|\n)\s*(?:(?:Q(?:uestion)?|प्र(?:श्न)?)\s*\.?\s*)?\d+\s*[.):-]\s+/i)
    .map((b) => b.trim())
    .filter(Boolean);

  if (questionBlocks.length === 0) return [];

  let idCounter = 1;
  for (const block of questionBlocks) {
    // Check for Answer line at the end of block
    let answerToken = '0';
    let cleanBlock = block;
    const ansMatch =
      /(?:^|\n|\s)(?:ans(?:wer)?|correct|उत्तर|सही\s*उत्तर)\s*[:=-]\s*\(?([A-Da-d1-4अ-दक-घ])\)?/i.exec(
        block
      );
    if (ansMatch) {
      answerToken = ansMatch[1];
      cleanBlock = block.slice(0, ansMatch.index).trim();
    }

    // Split question statement and options (A), (B), (C), (D) or A., B., C., D. or A), B), C), D)
    const optParts = cleanBlock.split(
      /(?:^|\n|\s+)\([A-Da-d1-4अ-दक-घ]\)\s+|(?:^|\n|\s{2,})[A-Da-dअ-दक-घ]\s*[.)]\s+/
    );
    if (optParts.length >= 3) {
      const qText = optParts[0].trim();
      const opts = optParts
        .slice(1, 5)
        .map((o) => o.trim())
        .filter(Boolean);
      if (qText && opts.length >= 2) {
        results.push({
          id: idCounter++,
          q: qText,
          o: opts,
          a: parseAnswerToken(answerToken, opts),
        });
      }
    }
  }

  return results;
}

/**
 * Formats a list of questions back to the user prompt's exact raw format
 */
export function formatQuestionsToPromptText(questions: QuizQuestion[]): string {
  return questions
    .map((q) => {
      const escapedQ = q.q.replace(/\r?\n/g, ' ').replace(/"/g, "'");
      const optionsStr = q.o
        .map((opt) => `"${opt.replace(/\r?\n/g, ' ').replace(/"/g, "'")}"`)
        .join(', ');
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


