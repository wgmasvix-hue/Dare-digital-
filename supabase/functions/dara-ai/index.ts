import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenAI } from "https://esm.sh/@google/genai@0.1.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, context, provider = 'gemini', model } = await req.json()

    if (provider === 'gemini') {
      const apiKey = Deno.env.get("GEMINI_API_KEY")
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY not set in Edge Function')
      }

      const ai = new GoogleGenAI({ apiKey })
      
      const response = await ai.models.generateContent({
        model: model || "gemini-3-flash-preview",
        contents: message,
        config: {
          systemInstruction: context || "You are DARA, a Zimbabwean AI tutor.",
        }
      })

      return new Response(JSON.stringify({ reply: response.text }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else if (provider === 'openai') {
      // If user wants OpenAI, they need to provide the key in Supabase secrets
      const apiKey = Deno.env.get("OPENAI_API_KEY")
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY not set in Edge Function')
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || "gpt-4o-mini",
          messages: [
            { role: "system", content: context || "You are DARA, a Zimbabwean AI tutor." },
            { role: "user", content: message }
          ],
        }),
      })

      const data = await response.json()
      return new Response(JSON.stringify({ reply: data.choices[0].message.content }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error(`Unsupported provider: ${provider}`)

  } catch (error) {
    console.error('AI Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
