import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumnTypes() {
  const { data, error } = await supabase.rpc('get_column_types', { table_name: 'books' });
  if (error) {
    // Try querying information_schema if RPC fails
    console.log('RPC get_column_types not found, trying information_schema...');
    // We can't query information_schema directly via PostgREST usually.
    // But we can try to insert a dummy and see the error more clearly.
    const { error: insertError } = await supabase.from('books').insert({ id: 'test-id', institution_id: 'not-a-uuid' });
    console.log('Insert error:', insertError?.message);
  } else {
    console.log('Column types:', data);
  }
}

checkColumnTypes();
