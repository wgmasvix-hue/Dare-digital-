import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixBooksRLS() {
  const sql = `
    -- 1. Ensure source column exists
    ALTER TABLE public.books ADD COLUMN IF NOT EXISTS source text DEFAULT 'Dare Library';
    
    -- 2. Ensure institution_id column exists
    ALTER TABLE public.books ADD COLUMN IF NOT EXISTS institution_id text;

    -- 3. Enable RLS
    ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

    -- 4. Drop and recreate policies to ensure they are correct
    DROP POLICY IF EXISTS "Allow public read access on books" ON public.books;
    CREATE POLICY "Allow public read access on books" ON public.books FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Allow authenticated insert on books" ON public.books;
    CREATE POLICY "Allow authenticated insert on books" ON public.books FOR INSERT WITH CHECK (auth.role() = 'authenticated');

    DROP POLICY IF EXISTS "Allow anon insert on books" ON public.books;
    CREATE POLICY "Allow anon insert on books" ON public.books FOR INSERT WITH CHECK (true);

    -- 5. Update search vector to include source
    ALTER TABLE public.books DROP COLUMN IF EXISTS search_vector;
    ALTER TABLE public.books ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
      to_tsvector('english', coalesce(title, '') || ' ' ||
                         coalesce(author_names, '') || ' ' ||
                         coalesce(subject, '') || ' ' ||
                         coalesce(description, '') || ' ' ||
                         coalesce(source, '') || ' ' ||
                         coalesce(dara_summary, ''))
    ) STORED;
    CREATE INDEX IF NOT EXISTS books_search_vector_idx ON public.books USING GIN (search_vector);
  `;

  console.log('Attempting to fix RLS and schema via RPC...');
  
  // Try exec_sql
  const { error: err1 } = await supabase.rpc('exec_sql', { sql });
  if (!err1) {
    console.log('Successfully fixed RLS and schema via exec_sql');
    return;
  }
  console.log('exec_sql failed:', err1.message);

  // Try run_sql
  const { error: err2 } = await supabase.rpc('run_sql', { sql });
  if (!err2) {
    console.log('Successfully fixed RLS and schema via run_sql');
    return;
  }
  console.log('run_sql failed:', err2.message);

  console.log('\n--- MANUAL ACTION REQUIRED ---');
  console.log('Could not run SQL via RPC. Please copy and run the following SQL in your Supabase SQL Editor:');
  console.log(sql);
}

fixBooksRLS();
