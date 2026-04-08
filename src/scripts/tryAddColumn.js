import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function tryAddColumn() {
  const sql = "ALTER TABLE public.books ADD COLUMN IF NOT EXISTS source text DEFAULT 'Dare Library';";
  
  console.log('Trying exec_sql...');
  const { error: err1 } = await supabase.rpc('exec_sql', { sql });
  if (!err1) {
    console.log('Successfully added source column via exec_sql');
    return;
  }
  console.log('exec_sql failed:', err1.message);

  console.log('Trying run_sql...');
  const { error: err2 } = await supabase.rpc('run_sql', { sql });
  if (!err2) {
    console.log('Successfully added source column via run_sql');
    return;
  }
  console.log('run_sql failed:', err2.message);

  console.log('Could not add column via RPC. Please add it manually.');
}

tryAddColumn();
