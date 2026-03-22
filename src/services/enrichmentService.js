import { GoogleGenAI } from "@google/genai";
import { DARA_ENRICHMENT_PROMPT } from "../lib/daraEnrichmentPrompt";

/**
 * Enriches book metadata using DARA AI.
 * @param {Object} metadata - Raw metadata (title, description, authors, etc.)
 * @returns {Promise<Object>} - Structured enrichment data
 */
export async function enrichMetadata(metadata) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API key must be set when using the Gemini API. Set GEMINI_API_KEY or API_KEY.');
  }
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        {
          text: `${DARA_ENRICHMENT_PROMPT}\n\nRAW METADATA:\n${JSON.stringify(metadata, null, 2)}`
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error("DARA Enrichment Error:", error);
    throw new Error("Failed to enrich metadata with DARA AI.");
  }
}
