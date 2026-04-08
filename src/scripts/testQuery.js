import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { BOOK_SELECT } from '../lib/transformBook.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Testing query with BOOK_SELECT:', BOOK_SELECT);

  const { data, error, count } = await supabase
    .from('books')
    .select(BOOK_SELECT, { count: 'exact' })
    .limit(5);

  if (error) {
    console.error('Error fetching books with BOOK_SELECT:', error);
  } else {
    console.log('Successfully fetched books. Count:', count);
    console.log('Sample data:', data);
  }
}

run();
