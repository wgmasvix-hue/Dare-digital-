import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { apiUrl = 'https://demo.dspace.org/server/api', oaiUrl: providedOaiUrl } = await req.json()
    const oaiUrl = providedOaiUrl || apiUrl.replace('/server/api', '/oai')

    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    const supabase = createClient(supabaseUrl!, supabaseKey!)

    console.log(`Starting sync from ${oaiUrl}...`)

    const response = await fetch(`${oaiUrl}?verb=ListRecords&metadataPrefix=oai_dc`)
    if (!response.ok) throw new Error(`OAI-PMH request failed: ${response.statusText}`)
    
    const xmlData = await response.text()
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    })
    const jsonObj = parser.parse(xmlData)
    
    const records = jsonObj['OAI-PMH']?.ListRecords?.record || []
    const recordArray = Array.isArray(records) ? records : [records]
    
    const dspaceItems = recordArray.map((record: any) => {
      const metadata = record.metadata?.['oai_dc:dc'] || {}
      return {
        identifier: record.header?.identifier,
        title: metadata['dc:title'],
        creator: Array.isArray(metadata['dc:creator']) ? metadata['dc:creator'].join('; ') : metadata['dc:creator'],
        description: Array.isArray(metadata['dc:description']) ? metadata['dc:description'] : metadata['dc:description'],
        type: metadata['dc:type'],
        publisher: metadata['dc:publisher']
      }
    })

    const docsToUpsert = dspaceItems
      .filter((item: any) => !!item.identifier)
      .map((item: any) => {
        const identifier = item.identifier!
        return {
          id: `dspace-${identifier.split(':').pop() || identifier}`,
          dspace_handle: identifier,
          title: Array.isArray(item.title) ? item.title[0] : item.title || 'Untitled',
          creator: item.creator || 'Unknown Author',
          description: item.description || '',
          document_type: Array.isArray(item.type) ? item.type[0] : item.type || 'Research Paper',
          institution: Array.isArray(item.publisher) ? item.publisher[0] : item.publisher || 'DSpace Repository',
          synced_from_dspace_at: new Date().toISOString(),
          url: identifier.includes('hdl.handle.net') ? identifier : `https://hdl.handle.net/${identifier.split('/').slice(-2).join('/')}`
        }
      })

    const { error } = await supabase
      .from('documents')
      .upsert(docsToUpsert, { onConflict: 'id' })

    if (error) throw error

    return new Response(JSON.stringify({ 
      success: true, 
      synced_count: docsToUpsert.length,
      message: `Successfully synced ${docsToUpsert.length} items from ${oaiUrl}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Sync error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
