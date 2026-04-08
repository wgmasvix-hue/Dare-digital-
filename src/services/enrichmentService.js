import { supabase } from "../lib/supabase";
import { DARA_ENRICHMENT_PROMPT } from "../lib/daraEnrichmentPrompt";

/**
 * Enriches book metadata using DARA AI.
 * @param {Object} metadata - Raw metadata (title, description, authors, etc.)
 * @returns {Promise<Object>} - Structured enrichment data
 */
export async function enrichMetadata(metadata) {
  try {
    const { data, error } = await supabase.functions.invoke('gemini', {
      body: {
        contents: `${DARA_ENRICHMENT_PROMPT}\n\nRAW METADATA:\n${JSON.stringify(metadata, null, 2)}`,
        config: {
          responseMimeType: "application/json"
        }
      }
    });

    if (error) throw error;

    const result = JSON.parse(data.text);
    return result;
  } catch (error) {
    console.error("DARA Enrichment Error:", error);
    throw new Error("Failed to enrich metadata with DARA AI.");
  }
}
