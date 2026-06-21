/// <reference types="vite/client" />
import { callDeepSeek } from './deepseek';
import { DARA_SYSTEM_PROMPT } from './daraSystemPrompt';

export interface AIResponse {
  text: string;
  language: 'English' | 'Shona' | 'Ndebele';
}

export async function explainTopic(
  text: string,
  level: string,
  language = 'English'
): Promise<AIResponse> {
  const prompt = `You are BAKO, an AI Tutor for the DARE Digital Library in Zimbabwe.

TASK: Explain the following topic: "${text}"
LEVEL: ${level}
LANGUAGE: ${language}

- For Form 1-6: explain like a Zimbabwean student preparing for ZIMSEC exams.
- For University: provide an academic and analytical explanation.
- Use local Zimbabwean examples where relevant.
- If the language is Shona or Ndebele, respond in that language.`;

  const result = await callDeepSeek([{ role: 'user', content: prompt }], {
    systemPrompt: DARA_SYSTEM_PROMPT,
  });

  return { text: result, language: language as 'English' | 'Shona' | 'Ndebele' };
}

export async function generateQuiz(text: string): Promise<string> {
  const prompt = `Generate a 5-question multiple-choice quiz based on the following content:
"${text}"

Format:
1. Question
   A) Option
   B) Option
   C) Option
   D) Option
   Answer: [Correct Option]

Ensure questions are relevant to the Zimbabwean curriculum.`;

  return callDeepSeek([{ role: 'user', content: prompt }], {
    systemPrompt: DARA_SYSTEM_PROMPT,
  });
}

export async function summarize(text: string): Promise<string> {
  const prompt = `Summarize the following academic content concisely and clearly:
"${text}"

Focus on key concepts, main arguments, and important facts. Use bullet points for clarity.`;

  return callDeepSeek([{ role: 'user', content: prompt }], {
    systemPrompt: DARA_SYSTEM_PROMPT,
  });
}
