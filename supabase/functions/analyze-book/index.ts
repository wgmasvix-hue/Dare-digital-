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

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    })
  });

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);

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
