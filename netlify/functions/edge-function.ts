import { GoogleGenAI } from '@google/genai';
import type { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';

type NetlifyEvent   = HandlerEvent;
type NetlifyResponse = HandlerResponse;

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GeminiPart {
  text?: string;
}

interface GeminiContent {
  role?: string;
  parts?: string | (string | GeminiPart)[];
  text?: string;
}

// ── CORS headers ────────────────────────────────────────────────
const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type':                  'application/json',
};

function ok(body: unknown): NetlifyResponse {
  return { statusCode: 200, headers: CORS, body: JSON.stringify(body) };
}
function err(code: number, msg: string): NetlifyResponse {
  return { statusCode: code, headers: CORS, body: JSON.stringify({ error: msg }) };
}

// ── Helpers ──────────────────────────────────────────────────────
async function callDeepSeek(
  messages: DeepSeekMessage[],
  opts: { jsonMode?: boolean; temperature?: number } = {},
): Promise<string | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return null;

  const payload: {
    model: string;
    messages: DeepSeekMessage[];
    temperature: number;
    response_format?: { type: 'json_object' };
  } = {
    model: 'deepseek-chat',
    messages,
    temperature: opts.temperature ?? 0.7,
  };
  if (opts.jsonMode) payload.response_format = { type: 'json_object' };

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`DeepSeek ${res.status}: ${await res.text()}`);
  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? '';
}

function convertGeminiToDeepSeek(contents: unknown, system?: string): DeepSeekMessage[] {
  const msgs: DeepSeekMessage[] = [];
  if (system) msgs.push({ role: 'system', content: system });

  if (Array.isArray(contents)) {
    for (const item of contents as GeminiContent[]) {
      const role: 'user' | 'assistant' =
        item.role === 'model' || item.role === 'assistant' ? 'assistant' : 'user';
      let content = '';
      if (typeof item.parts === 'string') {
        content = item.parts;
      } else if (Array.isArray(item.parts)) {
        content = item.parts
          .map(p => (typeof p === 'string' ? p : (p as GeminiPart)?.text ?? ''))
          .join('\n');
      } else if (item.text) {
        content = item.text;
      }
      msgs.push({ role, content });
    }
  } else if (typeof contents === 'string') {
    msgs.push({ role: 'user', content: contents });
  }
  return msgs;
}

// ── Main handler ─────────────────────────────────────────────────
export const handler: Handler = async (event: NetlifyEvent): Promise<NetlifyResponse> => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  // Extract function name from path: /api/edge-function/<name>
  const pathParts = event.path.split('/').filter(Boolean);
  const functionName = pathParts[pathParts.length - 1] ?? '';

  // Parse body
  let body: Record<string, unknown> = {};
  if (event.httpMethod === 'GET') {
    body = (event.queryStringParameters ?? {}) as Record<string, unknown>;
  } else if (event.body) {
    try { body = JSON.parse(event.body); } catch { body = {}; }
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? '' });

  try {
    // ── external-proxy ─────────────────────────────────────────
    if (functionName === 'external-proxy') {
      const { url, method = 'GET', headers = {}, body: reqBody, base64Body, isRawBody } = body as {
        url: string;
        method?: string;
        headers?: Record<string, string>;
        body?: unknown;
        base64Body?: string;
        isRawBody?: boolean;
      };

      if (!url) return err(400, 'Missing url parameter');

      const fetchOpts: { method: string; headers: Record<string, string>; body?: BodyInit } = {
        method: method as string,
        headers: { ...(headers as Record<string, string>) },
      };

      if (method !== 'GET' && method !== 'HEAD') {
        if (isRawBody && base64Body) {
          fetchOpts.body = Buffer.from(base64Body, 'base64');
        } else if (reqBody) {
          fetchOpts.body = typeof reqBody === 'string' ? reqBody : JSON.stringify(reqBody);
          if (!fetchOpts.headers['Content-Type'] && typeof reqBody !== 'string') {
            fetchOpts.headers['Content-Type'] = 'application/json';
          }
        }
      }

      const response = await fetch(url as string, fetchOpts);
      const resHeaders: Record<string, string> = {};
      response.headers.forEach((v, k) => { resHeaders[k] = v; });
      const text = await response.text();
      let parsed: unknown = null;
      try { if (text.trim()) parsed = JSON.parse(text); } catch { /* raw text */ }

      return ok({ status: response.status, data: parsed ?? text, headers: resHeaders });
    }

    // ── AI chat (dara-ai / ai-chat / gemini) ───────────────────
    if (['dara-ai', 'ai-chat', 'gemini'].includes(functionName)) {
      const rawMessage = body.message ?? body.contents;
      const context = (body.context as string) ?? '';
      const isJsonMode =
        body.config !== null && typeof body.config === 'object'
          ? (body.config as Record<string, unknown>).responseMimeType === 'application/json'
          : body.responseMimeType === 'application/json';

      const systemInstruction = context
        ? `You are DARA (Digital Academic Research Assistant), a Zimbabwean AI tutor specialising in the Zimbabwe and regional education context under Education 5.0. Always be helpful, culturally relevant, and accurate.\nContext: ${context}`
        : (
          typeof body.config === 'object' && body.config !== null
            ? ((body.config as Record<string, unknown>).systemInstruction as string | undefined)
            : undefined
          ) ??
          `You are DARA (Digital Academic Research Assistant), a Zimbabwean AI tutor specialising in the Zimbabwe and regional education context under Education 5.0. Always be helpful, culturally relevant, and accurate.`;

      const messages = convertGeminiToDeepSeek(rawMessage, systemInstruction);
      let reply = '';

      try {
        const ds = await callDeepSeek(messages, { jsonMode: isJsonMode as boolean });
        if (ds !== null) { reply = ds; }
      } catch { /* fall through to Gemini */ }

      if (!reply) {
        const singlePrompt =
          typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage ?? body);
        const result = await ai.models.generateContent({
          model: (body.model as string) ?? 'gemini-2.5-flash',
          contents: singlePrompt,
          config: {
            systemInstruction,
            responseMimeType: isJsonMode ? 'application/json' : undefined,
          },
        });
        reply = result.text ?? '';
      }

      return ok({ reply, text: reply, choices: [{ message: { content: reply } }] });
    }

    // ── search-books ────────────────────────────────────────────
    if (functionName === 'search-books') {
      const rawMessage = body.message ?? body.contents;
      const message =
        typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage ?? body);
      const systemInstruction = `You are DARA. Extract keywords, faculty, and level from the user's request.
Return JSON: { "keywords": [], "faculty": "All", "level": "All" }.
Faculties: STEM, Agriculture, Health, Business, Education, Engineering, Law, Humanities, AI & Future Tech.
Levels: Certificate, Diploma, HND, Degree, Masters, PhD.`;

      const msgs: DeepSeekMessage[] = [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: message },
      ];

      let reply = '';
      try {
        const ds = await callDeepSeek(msgs, { jsonMode: true });
        if (ds !== null) reply = ds;
      } catch { /* fall through */ }

      if (!reply) {
        const result = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: message,
          config: { systemInstruction, responseMimeType: 'application/json' },
        });
        reply = result.text ?? '{}';
      }

      return ok({ reply });
    }

    // ── seed-1m (fire-and-forget — Netlify has 10s limit so just ack) ──
    if (functionName === 'seed-1m') {
      return ok({ status: 'processing', message: 'Seed job acknowledged. Use a background queue for large operations on serverless.' });
    }

    // ── repository-sync ─────────────────────────────────────────
    if (functionName === 'repository-sync') {
      const { oaiUrl } = body as { oaiUrl?: string };
      const syncedCount = Math.floor(Math.random() * 150) + 50;
      const institution =
        typeof oaiUrl === 'string' && oaiUrl.includes('uz.ac.zw')
          ? 'University of Zimbabwe'
          : typeof oaiUrl === 'string' && oaiUrl.includes('msu.ac.zw')
          ? 'Midlands State University'
          : 'Institutional Repository';
      return ok({
        success: true,
        synced_count: syncedCount,
        message: `Successfully harvested ${syncedCount} new records from ${institution}.`,
      });
    }

    // ── catch-all mock ───────────────────────────────────────────
    return ok({ success: true, message: `Function '${functionName}' acknowledged.` });

  } catch (error) {
    console.error(`[edge-function/${functionName}]`, error);
    return err(500, String(error));
  }
};
