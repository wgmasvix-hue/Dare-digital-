import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  try {
    const { resource_id } = await req.json();

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!resource_id) {
      return new Response(JSON.stringify({ error: "resource_id is required" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 1️⃣ Get DDC of current resource (using 'books' table)
    const res1 = await fetch(
      `${SUPABASE_URL}/rest/v1/books?id=eq.${resource_id}&select=ddc_code`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const data1 = await res1.json();
    const ddc = data1[0]?.ddc_code;

    if (!ddc) {
      return new Response(JSON.stringify({ error: "No DDC found for this resource" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2️⃣ Get similar resources (using 'books' table)
    const res2 = await fetch(
      `${SUPABASE_URL}/rest/v1/books?ddc_code=eq.${ddc}&id=neq.${resource_id}&limit=10&select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const recommendations = await res2.json();

    return new Response(JSON.stringify({ recommendations }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
