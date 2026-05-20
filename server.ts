import express from 'express';
import path from 'path';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

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
        const message = typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage || body);
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
        
        let reply = "";
        try {
          let usedDeepSeek = false;
          if (process.env.DEEPSEEK_API_KEY) {
            usedDeepSeek = true;
            try {
              const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
                },
                body: JSON.stringify({
                  model: 'deepseek-chat',
                  messages: [
                    { role: 'system', content: systemInstruction },
                    { role: 'user', content: message }
                  ]
                })
              });
              
              if (!dsRes.ok) {
                const errText = await dsRes.text();
                throw new Error(`DeepSeek API error: ${errText}`);
              }

              const dsData = await dsRes.json();
              reply = dsData.choices?.[0]?.message?.content || "";
            } catch (fallbackError) {
              console.error("DeepSeek failed, falling back to Gemini", fallbackError);
              usedDeepSeek = false;
            }
          }
          
          if (!usedDeepSeek) {
            const response = await ai.models.generateContent({
              model: body.model || 'gemini-1.5-flash',
              contents: message,
              config: {
                systemInstruction: systemInstruction
              }
            });
            reply = response.text || "";
          }
        } catch (e) {
          console.error("AI API Error details:", e);
          reply = "I apologize, but I am unable to process that request at this moment.";
        }
        return res.json({ 
          reply, 
          text: reply,
          choices: [{ message: { content: reply } }] 
        });
      }

      if (functionName === 'search-books') {
         const message = typeof body.message === 'string' ? body.message : JSON.stringify(body);
         const systemInstruction = `You are DARA. Extract keywords, faculty, and level from the user's request. 
          Return JSON: { "keywords": [], "faculty": "All", "level": "All" }. 
          Faculties: STEM, Agriculture, Health, Business, Education, Engineering, Law, Humanities, AI & Future Tech.
          Levels: Certificate, Diploma, HND, Degree, Masters, PhD.`;
          
         let reply = "";
         try {
           let usedDeepSeek = false;
           if (process.env.DEEPSEEK_API_KEY) {
              usedDeepSeek = true;
              try {
                const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
                  },
                  body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                      { role: 'system', content: systemInstruction },
                      { role: 'user', content: message }
                    ],
                    response_format: { type: 'json_object' }
                  })
                });
                if (!dsRes.ok) {
                    const errText = await dsRes.text();
                    throw new Error(`DeepSeek API error: ${errText}`);
                }
                const dsData = await dsRes.json();
                reply = dsData.choices?.[0]?.message?.content || "{}";
              } catch (fallbackError) {
                console.error("DeepSeek failed, falling back to Gemini", fallbackError);
                usedDeepSeek = false;
              }
           }
           
           if (!usedDeepSeek) {
             const response = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: message,
                config: {
                    systemInstruction
                }
             });
             reply = response.text || "{}";
           }
         } catch (e) {
           console.error("API error", e);
           reply = JSON.stringify({ keywords: [], faculty: "All", level: "All" });
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
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
