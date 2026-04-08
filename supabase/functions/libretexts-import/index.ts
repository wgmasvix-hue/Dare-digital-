import { serve } from "https://deno.land/std/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const sources = [
      { url: "https://chem.libretexts.org/@api/deki/pages?limit=20", subject: "Chemistry", category: "STEM", ddc: "540" },
      { url: "https://math.libretexts.org/@api/deki/pages?limit=20", subject: "Mathematics", category: "STEM", ddc: "510" },
      { url: "https://phys.libretexts.org/@api/deki/pages?limit=20", subject: "Physics", category: "STEM", ddc: "530" },
      { url: "https://bio.libretexts.org/@api/deki/pages?limit=20", subject: "Biology", category: "STEM", ddc: "570" }
    ];

    const allBooks = [];

    for (const source of sources) {
      console.log(`Fetching from ${source.url}...`);
      const res = await fetch(source.url);
      const data = await res.json();

      const books = data.page?.map((p: { title: string; uri?: { ui: string } }) => ({
        title: p.title,
        description: p.title,
        resource_type: "book",
        faculty: source.category,
        subject: source.subject,
        ddc_code: source.ddc,
        format: "web",
        file_url: p.uri?.ui || "",
        access_model: "free",
        level: "A-Level",
        publisher_name: "LibreTexts",
        ai_keywords: ["libretexts", source.subject.toLowerCase()],
        is_zimbabwean: false,
        source: "LibreTexts",
        status: "published"
      })) || [];

      allBooks.push(...books);
    }

    console.log(`Inserting ${allBooks.length} books into Supabase...`);

    // Insert into Supabase 'books' table
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables not configured");
    }

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/books`, {
      method: "POST",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
      },
      body: JSON.stringify(allBooks)
    });

    if (!insertRes.ok) {
      const errorText = await insertRes.text();
      throw new Error(`Failed to insert books: ${errorText}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      count: allBooks.length,
      message: `Successfully imported ${allBooks.length} books from LibreTexts.`
    }), { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (error) {
    console.error("Error in libretexts-import:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
