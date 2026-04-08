import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPolicies() {
  const { data, error } = await supabase.rpc('get_policies', { table_name: 'books' });
  if (error) {
    console.log('RPC get_policies not found.');
    // Try to insert and see if it works
    const { error: insertError } = await supabase.from('books').insert({ id: 'test-policy', title: 'Test' });
    if (insertError) {
      console.log('Insert failed:', insertError.message);
    } else {
      console.log('Insert succeeded!');
    }
  } else {
    console.log('Policies:', data);
  }
}

checkPolicies();
