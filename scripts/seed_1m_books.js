import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Please set VITE_SUPABASE_URL and either VITE_SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TOTAL_BOOKS = 1000000;
const BATCH_SIZE = 5000;

async function seedBooks() {
  console.log(`Starting to seed ${TOTAL_BOOKS} books in batches of ${BATCH_SIZE}...`);
  console.warn('Note: Generating 1,000,000 records via REST API will take a significant amount of time.');
  console.warn('For much faster performance (seconds instead of hours), please run the SQL script /seed_1m_books.sql in your Supabase SQL Editor.');

  const subjects = ['Science', 'Mathematics', 'History', 'Literature', 'Technology'];
  const levels = ['University', 'Diploma', 'High School', 'Primary'];

  for (let i = 0; i < TOTAL_BOOKS; i += BATCH_SIZE) {
    const batch = [];
    const limit = Math.min(i + BATCH_SIZE, TOTAL_BOOKS);
    
    for (let j = i + 1; j <= limit; j++) {
      const subject = subjects[j % subjects.length];
      const level = levels[j % levels.length];
      batch.push({
        title: `Mock Book: ${j}`,
        author: `Author ${j % 1000}`,
        description: `This is a comprehensive mock description for book ${j}. It covers all the necessary topics in ${subject} and is designed for students at the ${level} level.`,
        subject: subject,
        level: level,
        source: 'DARE'
      });
    }

    const { error } = await supabase
      .from('books')
      .insert(batch);

    if (error) {
      console.error(`Error inserting batch ${i + 1} to ${limit}:`, error.message);
      process.exit(1);
    }

    console.log(`Successfully inserted books ${i + 1} to ${limit}`);
  }

  console.log('Finished seeding 1,000,000 books successfully.');
}

seedBooks().catch(console.error);
