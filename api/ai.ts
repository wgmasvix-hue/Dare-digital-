import { GoogleGenerativeAI } from "@google/genai";
import OpenAI from "openai";

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, context, provider = 'gemini', model } = req.body as { message: string; context?: string; provider?: string; model?: string };

    if (provider === 'openai') {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: model || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are DARA, a Zimbabwean AI tutor helping Form 1–6 and University students on the DARE platform.",
          },
          { role: "user", content: context ? `Context: ${context}\n\nQuestion: ${message}` : message },
        ],
      });

      return res.status(200).json({
        reply: completion.choices[0].message.content,
      });
    } else {
      // Default to Gemini
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
      const geminiModel = genAI.getGenerativeModel({ 
        model: model || "gemini-1.5-flash" 
      });

      const prompt = context 
        ? `Context: ${context}\n\nAs DARA, the Zimbabwean AI Tutor, please answer: ${message}`
        : message;

      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      
      return res.status(200).json({
        reply: response.text(),
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("AI API Error:", error);
    res.status(500).json({ error: "AI request failed", details: errorMessage });
  }
}
