import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { contents, config, model = "gemini-3-flash-preview" } = await req.json()
    
    const apiKey = Deno.env.get("GEMINI_API_KEY")
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not set in Edge Function' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const generativeModel = genAI.getGenerativeModel({ 
      model,
      systemInstruction: config?.systemInstruction,
    })

    const result = await generativeModel.generateContent({
      contents: Array.isArray(contents) ? contents : [{ role: 'user', parts: [{ text: contents }] }],
      generationConfig: {
        temperature: config?.temperature,
        topP: config?.topP,
        topK: config?.topK,
        responseMimeType: config?.responseMimeType,
        responseSchema: config?.responseSchema,
      }
    })

    const response = await result.response
    const text = response.text()

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Gemini error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
