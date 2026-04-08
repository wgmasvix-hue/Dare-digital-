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
  console.log('Checking book sources...');

  const { data, error } = await supabase
    .from('books')
    .select('source')
    .limit(1000);

  if (error) {
    console.error('Error fetching sources:', error);
  } else {
    const sources = [...new Set(data.map(b => b.source))];
    console.log('Unique sources:', sources);
    
    const counts = {};
    data.forEach(b => {
      counts[b.source] = (counts[b.source] || 0) + 1;
    });
    console.log('Source counts (first 1000):', counts);
  }
}

run();
