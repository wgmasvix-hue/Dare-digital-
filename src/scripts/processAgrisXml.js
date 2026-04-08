import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://odklvauuiitaoenzhlda.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('Supabase key is missing. Please set SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY.');
  process.exit(1);
}

if (supabaseKey === process.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('WARNING: Using ANON_KEY. If RLS is enabled on "books", ingestion may fail. Please use SUPABASE_SERVICE_ROLE_KEY for ingestion scripts.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const AGRIS_DIR = './agris_downloads';
const XML_FILES = ['AGRIS.ODS.BRY.xml', 'AGRIS.ODS.TR6.xml'];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

async function processFile(filename) {
  const filePath = path.join(AGRIS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return;
  }

  console.log(`Processing ${filename}...`);
  const xmlData = fs.readFileSync(filePath, 'utf-8');
  
  // Use a more robust parser config for large files
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    stopNodes: ["*.dc:description"] // Don't parse description as nested if it's just text
  });

  const jsonObj = parser.parse(xmlData);

  const resources = jsonObj['dctypes:Dataset']?.['dctypes:BibliographicResource'];
  if (!resources) {
    console.warn(`No resources found in ${filename}`);
    return;
  }

  const booksToInsert = [];
  const resourceArray = Array.isArray(resources) ? resources : [resources];

  // Get table columns to avoid "column not found" errors
  const { data: sampleData } = await supabase.from('books').select('*').limit(1);
  const columns = sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : [];
  const hasSource = columns.includes('source');
  const hasInstitutionId = columns.includes('institution_id');

  for (const res of resourceArray) {
    // Extract title (prefer English if available)
    let title = '';
    if (Array.isArray(res['dc:title'])) {
      const engTitle = res['dc:title'].find(t => t['@_xml:lang'] === 'eng' || t['@_xml:lang'] === 'en');
      title = engTitle ? engTitle['#text'] : res['dc:title'][0]['#text'];
    } else if (typeof res['dc:title'] === 'object') {
      title = res['dc:title']['#text'];
    } else {
      title = res['dc:title'];
    }

    if (!title) continue;

    // Extract authors
    let authors = '';
    if (Array.isArray(res['dc:creator'])) {
      authors = res['dc:creator'].join(', ');
    } else {
      authors = res['dc:creator'] || '';
    }

    // Extract description
    let description = '';
    if (Array.isArray(res['dc:description'])) {
      const engDesc = res['dc:description'].find(d => d['@_xml:lang'] === 'eng' || d['@_xml:lang'] === 'en');
      description = engDesc ? engDesc['#text'] : res['dc:description'][0]['#text'];
    } else if (typeof res['dc:description'] === 'object') {
      description = res['dc:description']['#text'];
    } else {
      description = res['dc:description'] || '';
    }

    // Extract year
    const yearStr = res['dc:date'];
    const year = yearStr ? parseInt(yearStr.toString().substring(0, 4)) : null;

    // Extract identifiers
    let isbn = '';
    let pdf_url = '';
    const identifiers = Array.isArray(res['dc:identifier']) ? res['dc:identifier'] : [res['dc:identifier']];
    for (const id of identifiers) {
      if (id?.['@_type'] === 'url') pdf_url = id['#text'];
      // Simple ISBN detection if present in text
      if (typeof id === 'string' && id.includes('ISBN')) isbn = id;
    }

    const id = `agris-${res['@_xml:id'] || Math.random().toString(36).substring(2, 15)}`;
    
    const book = {
      id,
      title,
      author_names: authors,
      description,
      year_published: year,
      publisher_name: res['dc:publisher'] || 'AGRIS',
      faculty: 'Agriculture', // Default for AGRIS
      subject: 'Agriculture',
      status: 'published',
      file_url: pdf_url || null,
      isbn: isbn || null,
    };

    if (hasSource) book.source = 'AGRIS';
    else if (columns.includes('source_repository')) book.source_repository = 'AGRIS';

    if (hasInstitutionId) {
      // Use the hardcoded AGRIS institution UUID
      book.institution_id = '00000000-0000-0000-0000-000000000001';
    }

    booksToInsert.push(book);

    // Batch insert every 100 records
    if (booksToInsert.length >= 100) {
      const { error } = await supabase.from('books').upsert(booksToInsert, { onConflict: 'id' });
      if (error) {
        console.error('Error inserting batch:', error.message);
        if (error.message.includes('row-level security')) {
          console.error('RLS ERROR: Please ensure you are using the SERVICE_ROLE_KEY or have an RLS policy allowing inserts.');
        }
      } else {
        console.log(`Inserted/Updated ${booksToInsert.length} books from ${filename}`);
      }
      booksToInsert.length = 0;
    }
  }

  // Insert remaining
  if (booksToInsert.length > 0) {
    const { error } = await supabase.from('books').upsert(booksToInsert, { onConflict: 'id' });
    if (error) {
      console.error('Error inserting final batch:', error.message);
      if (error.message.includes('row-level security')) {
        console.error('RLS ERROR: Please ensure you are using the SERVICE_ROLE_KEY or have an RLS policy allowing inserts.');
      }
    } else {
      console.log(`Inserted/Updated ${booksToInsert.length} books from ${filename}`);
    }
  }
}

async function ensureAgrisInstitution() {
  const agrisId = '00000000-0000-0000-0000-000000000001';
  const { data, error } = await supabase.from('institutions').upsert({
    id: agrisId,
    name: 'AGRIS FAO',
    institution_type: 'ngo',
    is_active: true
  }, { onConflict: 'id' }).select();

  if (error) {
    console.error('Error ensuring AGRIS institution:', error.message);
    return null;
  } else {
    console.log('AGRIS institution ensured:', data[0].id);
    return data[0].id;
  }
}

async function run() {
  await ensureAgrisInstitution();
  for (const file of XML_FILES) {
    await processFile(file);
  }
  console.log('Finished processing all XML files.');
}

run().catch(console.error);
