import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('Fixing schema for books table...');

  // 1. Change institution_id to uuid and add foreign key
  // 2. Add foreign key for creator_id to profiles
  // 3. Ensure search_publications RPC exists or fix it if it uses wrong column names

  const sql = `
    -- Fix institution_id type and add foreign key
    ALTER TABLE public.books 
    ALTER COLUMN institution_id TYPE uuid USING (institution_id::uuid);

    ALTER TABLE public.books
    DROP CONSTRAINT IF EXISTS books_institution_id_fkey,
    ADD CONSTRAINT books_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id);

    -- Add foreign key for creator_id to profiles
    ALTER TABLE public.books
    DROP CONSTRAINT IF EXISTS books_creator_id_fkey,
    ADD CONSTRAINT books_creator_id_fkey 
    FOREIGN KEY (creator_id) REFERENCES public.profiles(id);

    -- Re-enable RLS just in case
    ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
  `;

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('Error executing SQL via RPC:', error);
    console.log('Attempting to run individual commands if exec_sql is not available...');
    
    // Fallback: This is just a hint for the user if RPC fails
    console.log('Please run the following SQL in your Supabase SQL Editor:');
    console.log(sql);
  } else {
    console.log('Schema fixed successfully.');
  }
}

run();
