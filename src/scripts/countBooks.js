import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function countBooks() {
  const { count, error } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error counting books:', error.message);
  } else {
    console.log('Total books in database:', count);
  }
}

countBooks();
