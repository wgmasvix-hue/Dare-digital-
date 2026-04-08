import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAgrisData() {
  console.log('Checking for AGRIS data in "books" table...');
  
  const { data, count, error } = await supabase
    .from('books')
    .select('id, title, source, institution_id', { count: 'exact' })
    .eq('source', 'AGRIS')
    .limit(10);

  if (error) {
    console.error('Error querying books:', error.message);
    return;
  }

  console.log(`Found ${count} books with source "AGRIS".`);
  if (data.length > 0) {
    console.log('Sample data:');
    console.table(data);
  } else {
    console.log('No AGRIS data found.');
  }

  const { data: inst, error: instError } = await supabase
    .from('institutions')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000001');

  if (instError) {
    console.error('Error querying institutions:', instError.message);
  } else {
    console.log('AGRIS Institution:', inst);
  }
}

checkAgrisData();
