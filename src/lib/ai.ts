/**
 * AI Tutor Module for DARE
 * Powered by Google Gemini API.
 * Provides educational explanations, quizzes, and summaries for Zimbabwean students.
 */

/// <reference types="vite/client" />
/**
 * AI Tutor Module for DARE
 * Powered by Google Gemini API.
 * Provides educational explanations, quizzes, and summaries for Zimbabwean students.
 */

import { supabase } from './supabase';
import { DARA_SYSTEM_PROMPT } from './daraSystemPrompt';

export interface AIResponse {
  text: string;
  language: 'English' | 'Shona' | 'Ndebele';
}

const callGemini = async (contents: unknown, config: Record<string, unknown> = {}) => {
  const { data, error } = await supabase.functions.invoke('gemini', {
    body: { contents, config: { ...config, systemInstruction: (config.systemInstruction as string) || DARA_SYSTEM_PROMPT } }
  });
  if (error) throw error;
  return data;
};

/**
 * Explain a topic adapted for specific educational levels in Zimbabwe.
 */
export async function explainTopic(text: string, level: string, language: string = 'English'): Promise<AIResponse> {
  const prompt = `
    You are DARA, an AI Tutor for the DARE (Digital Academic Resource Engine) platform in Zimbabwe.
    
    TASK: Explain the following topic: "${text}"
    LEVEL: ${level} (e.g., Form 1-6, University)
    LANGUAGE: ${language}
    
    INSTRUCTIONS:
    - If level is "Form 1-6", explain like a Zimbabwean student preparing for ZIMSEC exams.
    - If level is "University", provide a more academic and analytical explanation.
    - Use local Zimbabwean examples where relevant (e.g., local history, geography, or culture).
    - Maintain a supportive and educational tone.
    - If the language is Shona or Ndebele, provide the explanation in that language.
  `;

  try {
    const data = await callGemini(prompt);
    
    return {
      text: data.text || '',
      language: language as 'English' | 'Shona' | 'Ndebele'
    };
  } catch (error) {
    console.error('AI Explanation Error:', error);
    throw new Error('Failed to generate AI explanation.');
  }
}

/**
 * Generate a quiz based on educational content.
 */
export async function generateQuiz(text: string): Promise<string> {
  const prompt = `
    Generate a 5-question multiple-choice quiz based on the following content:
    "${text}"
    
    Format:
    1. Question
       A) Option
       B) Option
       C) Option
       D) Option
       Answer: [Correct Option]
    
    Ensure the questions are challenging and relevant to the Zimbabwean curriculum.
  `;

  try {
    const data = await callGemini(prompt);
    return data.text || '';
  } catch (error) {
    console.error('AI Quiz Error:', error);
    throw new Error('Failed to generate AI quiz.');
  }
}

/**
 * Summarize academic content.
 */
export async function summarize(text: string): Promise<string> {
  const prompt = `
    Summarize the following academic content in a concise and clear manner:
    "${text}"
    
    Focus on the key concepts, main arguments, and important facts.
    Use bullet points for clarity.
  `;

  try {
    const data = await callGemini(prompt);
    return data.text || '';
  } catch (error) {
    console.error('AI Summary Error:', error);
    throw new Error('Failed to generate AI summary.');
  }
}
