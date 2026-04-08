import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-dare-target',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url, method = 'GET', body, headers = {}, base64Body } = await req.json()
    
    if (!url) {
      return new Response(JSON.stringify({ error: 'Missing target URL' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Proxying ${method} request to: ${url}`)

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DARELibrary/1.0)',
        ...headers,
      },
    }

    if (base64Body) {
      const binaryString = atob(base64Body)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      fetchOptions.body = bytes
    } else if (['POST', 'PUT', 'PATCH'].includes(method)) {
      fetchOptions.body = typeof body === 'object' ? JSON.stringify(body) : body
    }

    const response = await fetch(url, fetchOptions)
    const contentType = response.headers.get('content-type')
    
    // Extract headers to return
    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    let responseData
    if (contentType?.includes('application/json')) {
      responseData = await response.json()
    } else {
      responseData = await response.text()
    }

    return new Response(JSON.stringify({
      data: responseData,
      headers: responseHeaders,
      status: response.status
    }), {
      status: 200, // Always return 200 for the proxy itself, let the body contain the actual status
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
