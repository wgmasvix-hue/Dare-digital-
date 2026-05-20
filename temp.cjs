"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_genai = require("@google/genai");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use((0, import_cors.default)());
  app.use(import_express.default.json({ limit: "50mb" }));
  const ai = new import_genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy_key_if_not_set" });
  app.all("/api/edge-function/:functionName", async (req, res) => {
    const { functionName } = req.params;
    const body = req.method === "GET" ? req.query : req.body || {};
    try {
      if (functionName === "external-proxy") {
        const { url } = body;
        const response = await fetch(url);
        const text = await response.text();
        let parsed = null;
        try {
          parsed = JSON.parse(text);
        } catch {
        }
        return res.json(parsed || text);
      }
      if (["dara-ai", "ai-chat", "gemini"].includes(functionName)) {
        const rawMessage = body.message || body.contents;
        const message = typeof rawMessage === "string" ? rawMessage : JSON.stringify(rawMessage || body);
        const context = body.context || "";
        const systemInstruction = context ? `${context}
Answer the user.` : body.config?.systemInstruction || "You are DARA, a helpful AI tutor.";
        let reply = "";
        try {
          if (process.env.DEEPSEEK_API_KEY) {
            const dsRes = await fetch("https://api.deepseek.com/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
              },
              body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                  { role: "system", content: systemInstruction },
                  { role: "user", content: message }
                ]
              })
            });
            if (!dsRes.ok) {
              const errText = await dsRes.text();
              throw new Error(`DeepSeek API error: ${errText}`);
            }
            const dsData = await dsRes.json();
            reply = dsData.choices?.[0]?.message?.content || "";
          } else {
            const response = await ai.models.generateContent({
              model: body.model || "gemini-1.5-flash",
              contents: message,
              config: {
                systemInstruction
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
      if (functionName === "search-books") {
        const message = typeof body.message === "string" ? body.message : JSON.stringify(body);
        const systemInstruction = `You are DARA. Extract keywords, faculty, and level from the user's request. 
          Return JSON: { "keywords": [], "faculty": "All", "level": "All" }. 
          Faculties: STEM, Agriculture, Health, Business, Education, Engineering, Law, Humanities, AI & Future Tech.
          Levels: Certificate, Diploma, HND, Degree, Masters, PhD.`;
        let reply = "";
        try {
          if (process.env.DEEPSEEK_API_KEY) {
            const dsRes = await fetch("https://api.deepseek.com/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
              },
              body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                  { role: "system", content: systemInstruction },
                  { role: "user", content: message }
                ],
                response_format: { type: "json_object" }
              })
            });
            if (!dsRes.ok) {
              const errText = await dsRes.text();
              throw new Error(`DeepSeek API error: ${errText}`);
            }
            const dsData = await dsRes.json();
            reply = dsData.choices?.[0]?.message?.content || "{}";
          } else {
            const response = await ai.models.generateContent({
              model: "gemini-1.5-flash",
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
      return res.json({ success: true, message: `Mocked ${functionName}` });
    } catch (error) {
      console.error(`Edge function error [${functionName}]:`, error);
      return res.status(500).json({ error: String(error) });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
