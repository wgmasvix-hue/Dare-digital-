import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const { query, match_threshold = 0.5, match_count = 10 } = await req.json();

  // 1. Get embedding for the query
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
        parts: [{ text: query }]
      }
    })
  });

  const data = await response.json();
  if (!data.embedding || !data.embedding.values) {
    return new Response(JSON.stringify({ error: "Failed to generate embedding", details: data }), { status: 500 });
  }
  const query_embedding = data.embedding.values;

  // 2. Call Supabase RPC to match books
  const supabaseResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/rpc/match_books`, {
    method: "POST",
    headers: {
      "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
      "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query_embedding,
      match_threshold,
      match_count
    })
  });

  const results = await supabaseResponse.json();

  return new Response(JSON.stringify(results), { 
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
});
