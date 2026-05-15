import { createClient } from "@supabase/supabase-js";

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
};

// Initialize the Supabase client conditionally to avoid crashing the deployed app
// if setup on Vercel is incomplete (e.g. missing environment variables).
export const supabase = isSupabaseConfigured() 
  ? createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    )
  : (null as unknown as ReturnType<typeof createClient>); // Casting to appease TS, but guarded by isSupabaseConfigured in components

if (supabase) {
  // Monkey patch functions.invoke to use our local Express API Server
  supabase.functions.invoke = async (functionName: string, options?: any) => {
    try {
      let url = `/api/edge-function/${functionName}`;
      if (options?.method === 'GET' && options?.queryParams) {
         const qs = new URLSearchParams(options.queryParams as Record<string, string>).toString();
         url += '?' + qs;
      }
      const resp = await fetch(url, {
        method: options?.method || 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: options?.method === 'GET' ? undefined : JSON.stringify(options?.body || {})
      });
      const data = await resp.json();
      if (!resp.ok) {
         return { data: null, error: new Error(data.error || 'Request failed') };
      }
      return { data, error: null };
    } catch (e) {
      console.error('Edge function network error:', e);
      return { data: null, error: e as Error };
    }
  };
}

if (!isSupabaseConfigured()) {
  console.warn(
    "Supabase is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your Vercel Environment Variables."
  );
}
