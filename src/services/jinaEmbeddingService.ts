/**
 * Jina AI Embedding Service
 * Model: jina-embeddings-v3 — 1024-dim, multilingual, task-aware
 * Free tier: 1 M tokens / month → https://jina.ai
 *
 * Two task types give better accuracy than a single generic embedding:
 *   retrieval.query   — for user search queries
 *   retrieval.passage — for indexed book documents
 */

const JINA_API_KEY  = import.meta.env.VITE_JINA_API_KEY as string | undefined;
const JINA_MODEL    = 'jina-embeddings-v3';
const JINA_DIMS     = 1024;
const JINA_ENDPOINT = 'https://api.jina.ai/v1/embeddings';

type JinaTask = 'retrieval.query' | 'retrieval.passage' | 'text-matching';

interface JinaResponse {
  model: string;
  data: Array<{ index: number; embedding: number[]; object: string }>;
  usage: { total_tokens: number; prompt_tokens: number };
}

/* ── in-session cache so the same query isn't embedded twice ──── */
const queryCache = new Map<string, number[]>();

/* ── core API call ───────────────────────────────────────────── */
async function callJina(inputs: string[], task: JinaTask): Promise<number[][]> {
  if (!JINA_API_KEY) throw new Error('VITE_JINA_API_KEY is not configured.');

  const res = await fetch(JINA_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${JINA_API_KEY}`,
    },
    body: JSON.stringify({
      model: JINA_MODEL,
      task,
      dimensions: JINA_DIMS,
      embedding_type: 'float',
      input: inputs,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`Jina API ${res.status}: ${body}`);
  }

  const json: JinaResponse = await res.json();
  // Sort by index to ensure correct order
  return json.data
    .sort((a, b) => a.index - b.index)
    .map(d => d.embedding);
}

/* ── public API ──────────────────────────────────────────────── */

/**
 * Embed a user search query.
 * Uses the `retrieval.query` task which is optimised for asymmetric search.
 * Results are cached for the browser session.
 */
export async function embedQuery(query: string): Promise<number[]> {
  const key = query.trim().toLowerCase();
  if (queryCache.has(key)) return queryCache.get(key)!;
  const [embedding] = await callJina([key], 'retrieval.query');
  queryCache.set(key, embedding);
  return embedding;
}

/**
 * Embed a single document passage (e.g. one book).
 * Uses the `retrieval.passage` task for indexed content.
 */
export async function embedPassage(text: string): Promise<number[]> {
  const [embedding] = await callJina([text], 'retrieval.passage');
  return embedding;
}

/**
 * Batch embed up to 100 passages in a single API round-trip.
 * Used by the seed script to index all books.
 */
export async function embedPassageBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  return callJina(texts, 'retrieval.passage');
}

/** True when a Jina API key is present in the environment */
export const isVectorSearchAvailable = (): boolean => Boolean(JINA_API_KEY);

/** Expose model info for UI display */
export const VECTOR_MODEL_LABEL = `${JINA_MODEL} · ${JINA_DIMS}d`;
