import { GoogleGenAI } from '@google/genai';
import { buildPromptText } from './sampleData';

/**
 * Direct generation helper using Gemini API if key is available
 */
export async function generateQuizWithGemini(
  topic: string,
  questionCount: number,
  language: string,
  difficulty: string
): Promise<string> {
  // Check for client-accessible key or runtime environment
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (window as any).__GEMINI_API_KEY__;

  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildPromptText(topic, questionCount, language, difficulty);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text || '';
}
