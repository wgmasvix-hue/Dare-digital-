import express from 'express';
import path from 'path';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        const { url } = body;
        const response = await fetch(url);
        const text = await response.text();
        let parsed = null;
        try { parsed = JSON.parse(text); } catch (e) {}
        return res.json(parsed || text);
      }

      if (['dara-ai', 'ai-chat', 'gemini'].includes(functionName)) {
        const rawMessage = body.message || body.contents;
        const message = typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage || body);
        const context = body.context || '';
        const systemInstruction = context ? `${context}\nAnswer the user.` : (body.config?.systemInstruction || "You are DARA, a helpful AI tutor.");
        
        let reply = "";
        try {
          const response = await ai.models.generateContent({
            model: body.model || 'gemini-1.5-flash',
            contents: message,
            config: {
              systemInstruction: systemInstruction
            }
          });
          reply = response.text || "";
        } catch (e) {
          console.error("Gemini API Error details:", e);
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
         const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: message,
            config: {
                systemInstruction: `You are DARA. Extract keywords, faculty, and level from the user's request. 
          Return JSON: { "keywords": [], "faculty": "All", "level": "All" }. 
          Faculties: STEM, Agriculture, Health, Business, Education, Engineering, Law, Humanities, AI & Future Tech.
          Levels: Certificate, Diploma, HND, Degree, Masters, PhD.`
            }
         });
         return res.json({ reply: response.text });
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
