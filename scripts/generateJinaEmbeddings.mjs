/**
 * Generate Jina AI embeddings for all books in Supabase.
 *
 * Usage:
 *   node scripts/generateJinaEmbeddings.mjs
 *
 * Required env vars in .env:
 *   VITE_JINA_API_KEY=jina_...
 *   VITE_SUPABASE_URL=https://xxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY=...   (or SUPABASE_SERVICE_KEY for write access)
 *
 * Run AFTER applying supabase_jina_migration.sql in the Supabase SQL Editor.
 */

import { createClient } from '@supabase/supabase-js';
import { config }       from 'dotenv';
config();

const JINA_API_KEY   = process.env.VITE_JINA_API_KEY;
const SUPABASE_URL   = process.env.VITE_SUPABASE_URL;
// Prefer a service-role key for writes; fall back to anon (needs policy allow)
const SUPABASE_KEY   = process.env.SUPABASE_SERVICE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

const JINA_MODEL     = 'jina-embeddings-v3';
const JINA_DIMS      = 1024;
const BATCH_SIZE     = 20;   // Jina supports up to 100 per request; 20 is safe
const RATE_LIMIT_MS  = 1000; // 1 s pause between batches (free-tier friendly)

// ── Guards ────────────────────────────────────────────────────────
if (!JINA_API_KEY)   { console.error('❌  VITE_JINA_API_KEY not set in .env'); process.exit(1); }
if (!SUPABASE_URL)   { console.error('❌  VITE_SUPABASE_URL not set in .env'); process.exit(1); }
if (!SUPABASE_KEY)   { console.error('❌  No Supabase key found in .env');      process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Build rich text representation of a book ─────────────────────
function bookToText(book) {
  return [
    book.title,
    book.author_names,
    book.subject,
    book.faculty,
    book.description?.slice(0, 500),
    book.dara_summary?.slice(0, 300),
    Array.isArray(book.ai_keywords) ? book.ai_keywords.join(', ') : null,
  ]
    .filter(Boolean)
    .join(' | ');
}

// ── Jina batch embed ──────────────────────────────────────────────
async function embedBatch(texts) {
  const res = await fetch('https://api.jina.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${JINA_API_KEY}`,
    },
    body: JSON.stringify({
      model: JINA_MODEL,
      task: 'retrieval.passage',
      dimensions: JINA_DIMS,
      embedding_type: 'float',
      input: texts,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`Jina API ${res.status}: ${body}`);
  }

  const json = await res.json();
  return json.data
    .sort((a, b) => a.index - b.index)
    .map(d => d.embedding);
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log('📚  Fetching all books from Supabase…');
  const { data: books, error } = await supabase.from('books').select('*');
  if (error) { console.error('Supabase fetch error:', error); process.exit(1); }
  if (!books?.length) { console.log('No books found. Nothing to embed.'); return; }

  console.log(`🔢  ${books.length} books to embed (batch size ${BATCH_SIZE})\n`);

  let embedded = 0;
  let failed   = 0;

  for (let i = 0; i < books.length; i += BATCH_SIZE) {
    const batch  = books.slice(i, i + BATCH_SIZE);
    const texts  = batch.map(bookToText);
    const batchN = Math.floor(i / BATCH_SIZE) + 1;
    const total  = Math.ceil(books.length / BATCH_SIZE);

    try {
      const embeddings = await embedBatch(texts);

      const rows = batch.map((book, j) => ({
        book_id:   String(book.id),
        embedding: embeddings[j],
        content:   texts[j],
        model:     JINA_MODEL,
      }));

      const { error: upsertErr } = await supabase
        .from('book_embeddings')
        .upsert(rows, { onConflict: 'book_id' });

      if (upsertErr) {
        console.error(`  ✗ Batch ${batchN} upsert error:`, upsertErr.message);
        failed += batch.length;
      } else {
        embedded += batch.length;
        const done = Math.min(i + BATCH_SIZE, books.length);
        const pct  = Math.round((done / books.length) * 100);
        process.stdout.write(`  ✓ Batch ${batchN}/${total}  [${done}/${books.length}  ${pct}%]\r`);
      }
    } catch (err) {
      console.error(`\n  ✗ Batch ${batchN} embedding error:`, err.message);
      failed += batch.length;
    }

    // Respect Jina rate limits on free tier
    if (i + BATCH_SIZE < books.length) {
      await new Promise(r => setTimeout(r, RATE_LIMIT_MS));
    }
  }

  console.log(`\n\n✅  Done!  Embedded: ${embedded}  |  Failed: ${failed}`);
  if (failed > 0) console.log('   Re-run the script to retry failed batches (upsert is idempotent).');
}

main().catch(err => { console.error(err); process.exit(1); });
