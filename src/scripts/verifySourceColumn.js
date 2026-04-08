import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addSourceColumn() {
  console.log('Attempting to add source column...');
  // Since we can't run arbitrary SQL easily without a specific RPC or being the owner,
  // we usually expect the user to run the supabase_setup.sql.
  // But I can try to use the 'query' RPC if it exists, or just inform the user.
  
  // Let's try to check if we can at least see the columns more clearly
  const { data, error } = await supabase.from('books').select('*').limit(1);
  if (data && data.length > 0) {
    console.log('Columns in books table:', Object.keys(data[0]));
    if (!Object.keys(data[0]).includes('source')) {
      console.error('CRITICAL: "source" column is missing from the "books" table.');
      console.log('Please run the following SQL in your Supabase SQL Editor:');
      console.log('ALTER TABLE public.books ADD COLUMN IF NOT EXISTS source text DEFAULT \'Dare Library\';');
    } else {
      console.log('"source" column exists.');
    }
  }
}

addSourceColumn();
