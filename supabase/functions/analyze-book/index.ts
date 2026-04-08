import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const { book } = await req.json();

  const prompt = `
  Analyze this academic book and return JSON:

  Title: ${book.title}
  Category: ${book.subject}
  Author: ${book.author_names}

  Return:
  {
    "summary": "...",
    "keywords": ["..."],
    "topics": ["..."],
    "difficulty": "beginner | intermediate | advanced"
  }
  `;

  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json"
      }
    })
  });

  const data = await response.json();
  const result = JSON.parse(data.candidates[0].content.parts[0].text);

  await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/books?id=eq.${book.id}`, {
    method: "PATCH",
    headers: {
      "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
      "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ai_summary: result.summary,
      ai_keywords: result.keywords,
      ai_topics: result.topics,
      ai_difficulty: result.difficulty
    })
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
