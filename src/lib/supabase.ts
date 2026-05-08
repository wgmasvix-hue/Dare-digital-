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

if (!isSupabaseConfigured()) {
  console.warn(
    "Supabase is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your Vercel Environment Variables."
  );
}
