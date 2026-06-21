/**
 * Pre-generates BAKO AI summaries + lesson plans for all local OER books.
 * Saves to src/data/generatedBookContent.json — bundled with the app.
 *
 * Usage: node scripts/generateBookContent.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// ── API config ──────────────────────────────────────────────────────────────
// Set VITE_DEEPSEEK_API_KEY in your .env file before running.
function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const m = line.match(/^([^=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
    }
  }
}
loadEnv();

const DEEPSEEK_KEY = process.env.VITE_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;
if (!DEEPSEEK_KEY) {
  console.error('Error: Set VITE_DEEPSEEK_API_KEY or DEEPSEEK_API_KEY in your environment or .env file.');
  process.exit(1);
}

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

const SYSTEM = `You are BAKO (Boundless African Knowledge Oracle), Zimbabwe's AI tutor.
Be concise, practical, and culturally rooted in the Zimbabwean educational context.`;

async function callDeepSeek(userPrompt, maxTokens = 600) {
  const res = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: maxTokens,
      stream: false,
    }),
  });
  if (!res.ok) throw new Error(`DeepSeek ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0]?.message?.content?.trim() ?? '';
}

// ── Load book catalogs (raw JS, strip export keywords) ──────────────────────
function loadCatalog(file) {
  let src = readFileSync(path.join(ROOT, file), 'utf8');
  // Remove ES module exports so we can eval
  src = src
    .replace(/^export const \w+ =/, 'globalThis.__catalog =')
    .replace(/^export default /, 'globalThis.__catalog = ');
  try {
    // eslint-disable-next-line no-new-func
    new Function(src)();
    return globalThis.__catalog ?? [];
  } catch {
    return [];
  }
}

function gatherBooks() {
  const books = [];
  const seen = new Set();

  const catalogs = [
    'src/lib/oerCatalog.js',
    'src/lib/transformBook.js',
  ];

  for (const file of catalogs) {
    const fp = path.join(ROOT, file);
    if (!existsSync(fp)) continue;

    let src = readFileSync(fp, 'utf8');
    // Pull every array literal assigned to an export
    const arrayMatches = src.matchAll(/export const \w+ = \[[\s\S]*?\];/g);
    for (const match of arrayMatches) {
      try {
        // Extract object literals
        const objMatches = match[0].matchAll(/\{[\s\S]*?\}/g);
        for (const obj of objMatches) {
          try {
            // Convert JS object to JSON-ish
            const json = obj[0]
              .replace(/(\w+):/g, '"$1":')          // quote keys
              .replace(/'/g, '"')                   // single → double quotes
              .replace(/,\s*\}/g, '}')              // trailing commas
              .replace(/\/\/.*$/gm, '')             // strip comments
              .replace(/<[^>]+>/g, '')              // strip JSX
              .replace(/"\s*\+\s*"/g, '')           // concat strings
              .replace(/undefined/g, 'null');
            const parsed = JSON.parse(json);
            if (parsed.id && parsed.title && !seen.has(parsed.id)) {
              seen.add(parsed.id);
              books.push(parsed);
            }
          } catch { /* skip malformed objects */ }
        }
      } catch { /* skip */ }
    }
  }
  return books;
}

// Fallback: manually list the catalogs via a simpler regex parse
function gatherBooksSimple() {
  const books = [];
  const seen = new Set();
  const files = [
    path.join(ROOT, 'src/lib/oerCatalog.js'),
    path.join(ROOT, 'src/lib/transformBook.js'),
  ];

  for (const fp of files) {
    if (!existsSync(fp)) continue;
    const src = readFileSync(fp, 'utf8');

    // Find title, author, subject, description per block starting with id:
    const blocks = src.split(/(?=\s*\{)/);
    for (const block of blocks) {
      const id = block.match(/id:\s*['"`]([^'"`]+)['"`]/)?.[1];
      const title = block.match(/title:\s*['"`]([^'"`]+)['"`]/)?.[1];
      const author = block.match(/author_names:\s*['"`]([^'"`]+)['"`]/)?.[1];
      const subject = block.match(/subject:\s*['"`]([^'"`]+)['"`]/)?.[1];
      const faculty = block.match(/faculty:\s*['"`]([^'"`]+)['"`]/)?.[1];
      const desc = block.match(/description:\s*['"`]([^'"`]{10,500})['"`]/)?.[1];

      if (id && title && !seen.has(id)) {
        seen.add(id);
        books.push({ id, title, author_names: author, subject, faculty, description: desc });
      }
    }
  }
  return books;
}

// ── Generators ───────────────────────────────────────────────────────────────
async function generateSummary(book) {
  return callDeepSeek(
    `Write a concise educational summary (150–200 words) for this book that will be shown to Zimbabwean students.
Include: what the book covers, why it matters for Zimbabwean learners, and key concepts.

Book: "${book.title}"
Author: ${book.author_names || 'Unknown'}
Subject: ${book.subject || book.faculty || 'General'}
Description: ${book.description || '(no description provided)'}

Write in clear, engaging prose. Do NOT use bullet points for the main summary.`,
    400
  );
}

async function generateLessonPlan(book) {
  return callDeepSeek(
    `Create a concise Heritage-Based Curriculum (HBC) lesson plan for a Zimbabwean teacher using this book.

Book: "${book.title}"
Author: ${book.author_names || 'Unknown'}
Subject: ${book.subject || book.faculty || 'General'}

Use this compact Markdown format:

## Lesson Plan — ${book.title}
**Subject:** | **Level:** Secondary/Tertiary | **Duration:** 60 min

### Objectives
- (2–3 bullet points)

### Heritage & Unhu/Ubuntu Link
(1–2 sentences connecting to Zimbabwean context)

### Lesson Steps
| Stage | Activity | Time |
|-------|----------|------|
| Introduction | ... | 10 min |
| Development | ... | 35 min |
| Conclusion | ... | 15 min |

### Assessment
(1–2 sentences)

### Innovation Task
(1 sentence practical challenge)`,
    700
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const outFile = path.join(ROOT, 'src/data/generatedBookContent.json');

  // Load existing cache to allow resume
  let existing = {};
  if (existsSync(outFile)) {
    try { existing = JSON.parse(readFileSync(outFile, 'utf8')); } catch { existing = {}; }
    console.log(`Loaded ${Object.keys(existing).length} existing entries.`);
  }

  const books = gatherBooksSimple();
  console.log(`Found ${books.length} books to process.\n`);

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const book of books) {
    if (!book.id || !book.title) continue;

    if (existing[book.id]?.summary && existing[book.id]?.lessonPlan) {
      skipped++;
      continue;
    }

    process.stdout.write(`[${processed + skipped + errors + 1}/${books.length}] "${book.title}"... `);

    try {
      const [summary, lessonPlan] = await Promise.all([
        generateSummary(book),
        generateLessonPlan(book),
      ]);

      existing[book.id] = {
        bookId: book.id,
        title: book.title,
        subject: book.subject || book.faculty,
        summary,
        lessonPlan,
        generatedAt: new Date().toISOString(),
      };

      // Save after each book (resume-safe)
      writeFileSync(outFile, JSON.stringify(existing, null, 2));
      processed++;
      console.log('✓');
    } catch (err) {
      errors++;
      console.log(`✗ ${err.message}`);
    }

    // Rate-limit: 1 book per second
    await new Promise(r => setTimeout(r, 1100));
  }

  console.log(`\nDone. Processed: ${processed}, Skipped (cached): ${skipped}, Errors: ${errors}`);
  console.log(`Saved to ${outFile}`);
}

main().catch(err => { console.error(err); process.exit(1); });
