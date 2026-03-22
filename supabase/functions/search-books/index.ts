import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const { query, match_threshold = 0.5, match_count = 10 } = await req.json();

  // 1. Get embedding for the query
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: query
    })
  });

  const data = await response.json();
  if (!data.data || !data.data[0]) {
    return new Response(JSON.stringify({ error: "Failed to generate embedding" }), { status: 500 });
  }
  const query_embedding = data.data[0].embedding;

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
