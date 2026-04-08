import OpenAI from "openai";

export async function handler(req) {
  const { message } = await req.json();

  const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: message }],
  });

  return new Response(JSON.stringify(response));
}
