import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_table_info', { table_name: 'books' });
  if (error) {
    // If RPC doesn't exist, try a simple query
    console.log('RPC get_table_info not found, trying direct query...');
    const { data: books, error: queryError } = await supabase.from('books').select('*').limit(1);
    if (queryError) {
      console.error('Error querying books:', queryError.message);
    } else {
      console.log('Books sample:', books);
    }
  } else {
    console.log('Table info:', data);
  }
}

checkSchema();
