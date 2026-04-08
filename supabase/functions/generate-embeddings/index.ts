import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const { text, book_id } = await req.json();

  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2-preview:embedContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "models/gemini-embedding-2-preview",
      content: {
        parts: [{ text: text }]
      }
    })
  });

  const data = await response.json();
  if (!data.embedding || !data.embedding.values) {
    throw new Error("Failed to generate embedding");
  }
  const embedding = data.embedding.values;

  // Insert into Supabase
  await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/book_embeddings`, {
    method: "POST",
    headers: {
      "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
      "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      book_id,
      embedding,
      content: text
    })
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
