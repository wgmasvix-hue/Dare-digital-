import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const { text, book_id } = await req.json();

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text
    })
  });

  const data = await response.json();
  const embedding = data.data[0].embedding;

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
