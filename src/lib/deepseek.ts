import { DARA_SYSTEM_PROMPT } from './daraSystemPrompt';

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY as string;
const BASE_URL = 'https://api.deepseek.com/chat/completions';

export interface DSMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CallOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export async function callDeepSeek(
  messages: DSMessage[],
  opts: CallOptions = {}
): Promise<string> {
  const {
    systemPrompt = DARA_SYSTEM_PROMPT,
    temperature = 0.7,
    maxTokens = 2048,
    jsonMode = false,
  } = opts;

  if (!API_KEY) {
    throw new Error('BAKO AI: DeepSeek API key not configured (VITE_DEEPSEEK_API_KEY).');
  }

  const body: Record<string, unknown> = {
    model: 'deepseek-chat',
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    temperature,
    max_tokens: maxTokens,
    stream: false,
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`DeepSeek ${res.status}: ${detail}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

export function toDS(
  geminiContents: unknown,
  fallbackText?: string
): DSMessage[] {
  if (typeof geminiContents === 'string') {
    return [{ role: 'user', content: geminiContents }];
  }
  if (!Array.isArray(geminiContents)) {
    return [{ role: 'user', content: fallbackText ?? '' }];
  }
  return geminiContents.map((m: { role: string; parts?: { text: string }[] }) => ({
    role: m.role === 'model' ? 'assistant' : m.role === 'user' ? 'user' : 'assistant',
    content: Array.isArray(m.parts) ? m.parts.map((p) => p.text).join('') : '',
  })) as DSMessage[];
}
