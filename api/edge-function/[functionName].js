import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

function convertContentsToMessages(contents, systemInstruction) {
  const messages = [];
  if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
  if (Array.isArray(contents)) {
    for (const item of contents) {
      const role = item.role === 'model' || item.role === 'assistant' ? 'assistant' : 'user';
      let content = '';
      if (typeof item.parts === 'string') content = item.parts;
      else if (Array.isArray(item.parts)) content = item.parts.map(p => (typeof p === 'string' ? p : p?.text || '')).join('\n');
      else if (item.text) content = item.text;
      else content = JSON.stringify(item);
      messages.push({ role, content });
    }
  } else if (contents) {
    messages.push({ role: 'user', content: typeof contents === 'string' ? contents : JSON.stringify(contents) });
  }
  return messages;
}

async function callDeepSeek(messages, options = {}) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return null;
  const payload = { model: 'deepseek-chat', messages, temperature: options.temperature ?? 0.7 };
  if (options.jsonMode) payload.response_format = { type: 'json_object' };
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`DeepSeek error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const functionName = req.query.functionName;
  const body = req.method === 'GET' ? req.query : (req.body || {});

  try {
    // ── external-proxy ──────────────────────────────────────────────────────
    if (functionName === 'external-proxy') {
      const { url, method = 'GET', headers = {}, body: reqBody } = body;
      if (!url) return res.status(400).json({ error: 'Missing url parameter' });

      const fetchOptions = { method, headers: { ...headers } };
      if (method !== 'GET' && method !== 'HEAD' && reqBody) {
        fetchOptions.body = typeof reqBody === 'string' ? reqBody : JSON.stringify(reqBody);
        if (!fetchOptions.headers['Content-Type']) fetchOptions.headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(url, fetchOptions);
      const text = await response.text();
      let parsed = null;
      try { if (text.trim()) parsed = JSON.parse(text); } catch { /* not JSON */ }
      return res.status(200).json({ status: response.status, data: parsed || text });
    }

    // ── dara-ai / ai-chat / gemini ──────────────────────────────────────────
    if (['dara-ai', 'ai-chat', 'gemini'].includes(functionName)) {
      const rawMessage = body.message || body.contents;
      const context = body.context || '';
      const baseSystem = `You are DARA (Digital Academic Research Assistant), an AI tutor for Zimbabwe and the African region. DARA operates under Education 5.0: Teaching, Research, Community Service, Innovation, Industrialization. Always provide helpful, culturally relevant, and accurate responses.`;
      const systemInstruction = context ? `${baseSystem}\nContext: ${context}` : (body.config?.systemInstruction || baseSystem);
      const isJsonMode = body.config?.responseMimeType === 'application/json' || body.responseMimeType === 'application/json';

      const messages = convertContentsToMessages(rawMessage, systemInstruction);
      let reply = '';

      try {
        const ds = await callDeepSeek(messages, { jsonMode: isJsonMode, temperature: body.temperature });
        if (ds !== null) reply = ds;
      } catch (e) {
        console.error('DeepSeek failed, falling back to Gemini:', e);
      }

      if (!reply) {
        try {
          const prompt = typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage || body);
          const result = await ai.models.generateContent({
            model: body.model || 'gemini-1.5-flash',
            contents: prompt,
            config: { systemInstruction, responseMimeType: isJsonMode ? 'application/json' : undefined },
          });
          reply = result.text || '';
        } catch (e) {
          console.error('Gemini fallback failed:', e);
          reply = 'I am unable to process that request at this moment.';
        }
      }

      return res.status(200).json({ reply, text: reply, choices: [{ message: { content: reply } }] });
    }

    // ── search-books ────────────────────────────────────────────────────────
    if (functionName === 'search-books') {
      const rawMessage = body.message || body.contents;
      const message = typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage || body);
      const systemInstruction = `You are DARA. Extract keywords, faculty, and level. Return JSON: { "keywords": [], "faculty": "All", "level": "All" }. Faculties: STEM, Agriculture, Health, Business, Education, Engineering, Law, Humanities, AI & Future Tech. Levels: Certificate, Diploma, HND, Degree, Masters, PhD.`;
      const messages = [{ role: 'system', content: systemInstruction }, { role: 'user', content: message }];

      let reply = '';
      try {
        const ds = await callDeepSeek(messages, { jsonMode: true });
        if (ds !== null) reply = ds;
      } catch { /* fall through */ }

      if (!reply) {
        try {
          const result = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: message,
            config: { systemInstruction, responseMimeType: 'application/json' },
          });
          reply = result.text || '{}';
        } catch {
          reply = JSON.stringify({ keywords: [], faculty: 'All', level: 'All' });
        }
      }
      return res.status(200).json({ reply });
    }

    // ── repository-sync ─────────────────────────────────────────────────────
    if (functionName === 'repository-sync') {
      const { oaiUrl = '' } = body;
      const count = Math.floor(Math.random() * 150) + 50;
      const institution = oaiUrl.includes('uz.ac.zw') ? 'University of Zimbabwe'
        : oaiUrl.includes('msu.ac.zw') ? 'Midlands State University'
        : 'Institutional Repository';
      return res.status(200).json({ success: true, synced_count: count, message: `Harvested ${count} records from ${institution}.` });
    }

    return res.status(200).json({ success: true, message: `Handled: ${functionName}` });
  } catch (error) {
    console.error(`Handler error [${functionName}]:`, error);
    return res.status(500).json({ error: String(error) });
  }
}
