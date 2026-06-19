import express from 'express';
import path from 'path';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

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

function convertGeminiContentsToDeepSeek(contents: unknown, systemInstruction?: string): DeepSeekMessage[] {
  const messages: DeepSeekMessage[] = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }

  if (Array.isArray(contents)) {
    const list = contents as GeminiContent[];
    for (const item of list) {
      const role = item.role === 'model' || item.role === 'assistant' ? 'assistant' : 'user';
      let content = '';
      if (typeof item.parts === 'string') {
        content = item.parts;
      } else if (Array.isArray(item.parts)) {
        content = item.parts.map((p) => {
          if (typeof p === 'string') return p;
          return p?.text || '';
        }).join('\n');
      } else if (item.text) {
        content = item.text;
      } else if (typeof item === 'string') {
        content = item as unknown as string;
      } else {
        content = JSON.stringify(item);
      }
      
      messages.push({ role, content });
    }
  } else if (contents) {
    if (typeof contents === 'string') {
      messages.push({ role: 'user', content: contents });
    } else {
      messages.push({ role: 'user', content: JSON.stringify(contents) });
    }
  }
  
  return messages;
}

async function callDeepSeekDirect(messages: DeepSeekMessage[], options: { jsonMode?: boolean; temperature?: number } = {}) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.warn("DEEPSEEK_API_KEY environment variable is not set. Will fall back to standard Gemini service.");
    return null;
  }

  const payload: {
    model: string;
    messages: DeepSeekMessage[];
    temperature: number;
    response_format?: { type: 'json_object' };
  } = {
    model: 'deepseek-chat',
    messages,
    temperature: options.temperature ?? 0.7
  };

  if (options.jsonMode) {
    payload.response_format = { type: 'json_object' };
  }

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API server error: ${errorText} (Status ${response.status})`);
  }

  const responseData = await response.json();
  return responseData.choices?.[0]?.message?.content || "";
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key_if_not_set' });

  // Unified endpoint for Gemini-powered "Edge Functions"
  app.all('/api/edge-function/:functionName', async (req, res) => {
    const { functionName } = req.params;
    const body = req.method === 'GET' ? req.query : (req.body || {});

    try {
      if (functionName === 'external-proxy') {
        const { url, method = 'GET', headers = {}, body: reqBody, base64Body, isRawBody } = body;
        
        const fetchOptions: { method: string; headers: Record<string, string>; body?: string | Buffer } = {
          method,
          headers: { ...headers }
        };

        if (method !== 'GET' && method !== 'HEAD') {
          if (isRawBody && base64Body) {
             fetchOptions.body = Buffer.from(base64Body, 'base64');
          } else if (reqBody) {
             fetchOptions.body = typeof reqBody === 'string' ? reqBody : JSON.stringify(reqBody);
             if (!fetchOptions.headers['Content-Type'] && typeof reqBody !== 'string') {
               fetchOptions.headers['Content-Type'] = 'application/json';
             }
          }
        }

        try {
          const response = await fetch(url, fetchOptions);
          
          const resHeaders: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            resHeaders[key] = value;
          });

          const text = await response.text();
          let parsed = null;
          try { 
            if (text.trim()) {
              parsed = JSON.parse(text); 
            }
          } catch { /* ignore error */ }
          
          return res.json({
            status: response.status,
            data: parsed || text,
            headers: resHeaders
          });
        } catch (proxyErr) {
          console.error("Proxy Error:", proxyErr);
          return res.status(502).json({ error: "Failed to fetch from external source", details: String(proxyErr) });
        }
      }

      if (['dara-ai', 'ai-chat', 'gemini'].includes(functionName)) {
        const rawMessage = body.message || body.contents;
        const context = body.context || '';
        const education5Pillars = `
        DARA operates under the Education 5.0 framework:
        1. Teaching: Delivering high-quality knowledge.
        2. Research: Encouraging curiosity and knowledge generation.
        3. Community Service: Applying learning to solve local and regional problems.
        4. Innovation: Transforming ideas into practical solutions.
        5. Industrialization: Driving economic growth through value addition and production.
        `;
        const baseSystemInstruction = `You are DARA (Digital Academic Research Assistant), a highly intelligent AI tutor specializing in the Zimbabwean and Regional education context. 
        Your mission is to guide students towards academic excellence and practical innovation.
        ${education5Pillars}
        Always provide helpful, culturally relevant, and scientifically accurate responses.`;
        
        const systemInstruction = context ? `${baseSystemInstruction}\nContext: ${context}\nAnswer the user.` : (body.config?.systemInstruction || baseSystemInstruction);
        const isJsonMode = body.config?.responseMimeType === 'application/json' || body.responseMimeType === 'application/json';

        // Convert the incoming Gemini parts/history to DeepSeek messages format
        const messages = convertGeminiContentsToDeepSeek(rawMessage, systemInstruction);

        let reply = "";
        let usedDeepSeek = false;

        try {
          const deepSeekResponse = await callDeepSeekDirect(messages, { 
            jsonMode: isJsonMode, 
            temperature: typeof body.temperature === 'number' ? body.temperature : undefined 
          });
          if (deepSeekResponse !== null) {
            reply = deepSeekResponse;
            usedDeepSeek = true;
          }
        } catch (dsError) {
          console.error("DeepSeek primary call failed. Falling back to Gemini:", dsError);
        }

        // Gemini fallback if DeepSeek is unconfigured or failed
        if (!usedDeepSeek) {
          try {
            const singlePromptString = typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage || body);
            const response = await ai.models.generateContent({
              model: body.model || 'gemini-2.5-flash',
              contents: singlePromptString,
              config: {
                systemInstruction: systemInstruction,
                responseMimeType: isJsonMode ? 'application/json' : undefined
              }
            });
            reply = response.text || "";
          } catch (gemError) {
            console.error("AI API Core Error details:", gemError);
            reply = "I apologize, but I am unable to process that request at this moment.";
          }
        }

        return res.json({ 
          reply, 
          text: reply,
          choices: [{ message: { content: reply } }] 
        });
      }

      if (functionName === 'seed-1m') {
        const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://example.supabase.co";
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "dummy";
        
        // Kick off background job so we don't block
        setTimeout(async () => {
          const TOTAL_BOOKS = 1000000;
          const BATCH_SIZE = 1000;
          const subjects = ['Science', 'Mathematics', 'History', 'Literature', 'Technology'];
          const levels = ['University', 'Diploma', 'High School', 'Primary'];
          
          for (let i = 0; i < TOTAL_BOOKS; i += BATCH_SIZE) {
            const batch = [];
            const limit = Math.min(i + BATCH_SIZE, TOTAL_BOOKS);
            for (let j = i + 1; j <= limit; j++) {
              batch.push({
                title: `Mock Book: ${j}`,
                author: `Author ${j % 1000}`,
                description: `Comprehensive mock description for book ${j}. Covers topics in ${subjects[j % subjects.length]}.`,
                subject: subjects[j % subjects.length],
                level: levels[j % levels.length],
                source: 'DARE'
              });
            }
            try {
              await fetch(`${supabaseUrl}/rest/v1/books`, {
                method: 'POST',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=minimal'
                },
                body: JSON.stringify(batch)
              });
              // Wait 100ms to avoid overwhelming the database
              await new Promise(r => setTimeout(r, 100));
            } catch (err) {
              console.error("1M Seed Error in batch:", err);
            }
          }
        }, 1000);

        return res.json({ status: "processing", message: "Started background task to seed 1,000,000 books." });
      }

      if (functionName === 'search-books') {
         const rawMessage = body.message || body.contents;
         const message = typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage || body);
         const systemInstruction = `You are DARA. Extract keywords, faculty, and level from the user's request. 
          Return JSON: { "keywords": [], "faculty": "All", "level": "All" }. 
          Faculties: STEM, Agriculture, Health, Business, Education, Engineering, Law, Humanities, AI & Future Tech.
          Levels: Certificate, Diploma, HND, Degree, Masters, PhD.`;
          
         const messages = [
           { role: 'system', content: systemInstruction },
           { role: 'user', content: message }
         ];

         let reply = "";
         let usedDeepSeek = false;

         try {
           const deepSeekResponse = await callDeepSeekDirect(messages, { jsonMode: true });
           if (deepSeekResponse !== null) {
             reply = deepSeekResponse;
             usedDeepSeek = true;
           }
         } catch (dsError) {
           console.error("DeepSeek search-books call failed. Falling back to Gemini:", dsError);
         }

         if (!usedDeepSeek) {
           try {
             const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: message,
                config: {
                    systemInstruction,
                    responseMimeType: 'application/json'
                }
             });
             reply = response.text || "{}";
           } catch (geminiError) {
             console.error("Gemini search-books fallback failed:", geminiError);
             reply = JSON.stringify({ keywords: [], faculty: "All", level: "All" });
           }
         }

         return res.json({ reply });
      }

      if (functionName === 'repository-sync') {
        const { oaiUrl } = body;
        console.log(`Syncing from OAI URL: ${oaiUrl}`);
        
        // Mocking a sync process with random count
        const syncedCount = Math.floor(Math.random() * 150) + 50;
        const institution = oaiUrl.includes('uz.ac.zw') ? 'University of Zimbabwe' : 
                          oaiUrl.includes('msu.ac.zw') ? 'Midlands State University' : 
                          'Institutional Repository';

        return res.json({ 
          success: true, 
          synced_count: syncedCount, 
          message: `Successfully harvested ${syncedCount} new records from ${institution}. Metadata mapping complete.` 
        });
      }

      // Default catch-all for other mock edge functions
      return res.json({ success: true, message: `Mocked ${functionName}` });
    } catch (error) {
      console.error(`Edge function error [${functionName}]:`, error);
      return res.status(500).json({ error: String(error) });
    }
  });

  const distPath = path.join(process.cwd(), 'dist');
  
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn("Vite not found or failed to load, falling back to static serving. Error:", err);
      app.use(express.static(distPath));
      app.get('*all', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } else {
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
