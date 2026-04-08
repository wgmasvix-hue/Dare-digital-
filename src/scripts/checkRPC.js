import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Checking for search_publications RPC...');

  const rpcParams = {
    p_query: null,
    p_faculty: null,
    p_level: null,
    p_limit: 1,
    p_offset: 0,
    p_sort: 'title'
  };

  const { data, error } = await supabase.rpc('search_publications', rpcParams);

  if (error) {
    console.error('Error calling search_publications RPC:', error);
  } else {
    console.log('search_publications RPC exists and returned data:', data);
  }
}

run();
