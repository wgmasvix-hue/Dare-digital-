import { createClient } from '@supabase/supabase-js';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase config (from src/lib/supabase.js)
const supabaseUrl = 'https://odklvauuiitaoenzhlda.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ka2x2YXV1aWl0YW9lbnpobGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTczMzIsImV4cCI6MjA4ODE3MzMzMn0.ZTiLAjhbN867KYVQENh1ZQ7MD91faj3GqY-8FbHl1VY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ROOT_CATALOG_URL = "https://agris.fao.org/ods/AGRIS.ODS.xml";
const DOWNLOAD_DIR = path.join(__dirname, "../agris_downloads");
const BATCH_SIZE = 50; // Supabase batch size

if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    removeNSPrefix: true,
});

async function downloadFile(url) {
    const filename = path.join(DOWNLOAD_DIR, path.basename(url));
    if (fs.existsSync(filename)) {
        console.log(`File already exists: ${filename}`);
        return filename;
    }

    console.log(`Downloading ${url}`);
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(filename, Buffer.from(buffer));
        return filename;
    } catch (error) {
        console.error(`Error downloading ${url}:`, error.message);
        return null;
    }
}

function extractYear(record) {
    const dates = [record.date, record.issued].filter(Boolean);
    for (const date of dates) {
        const dateStr = typeof date === 'string' ? date : (date['#text'] || '');
        const match = dateStr.match(/\b(19|20)\d{2}\b/);
        if (match) return parseInt(match[0]);
    }
    return null;
}

function mapResourceType(resType) {
    if (!resType) return 'article';
    const typeLower = String(resType).toLowerCase();
    if (typeLower.includes('article') || typeLower.includes('journal')) return 'journal_article';
    if (typeLower.includes('book')) return 'textbook';
    if (typeLower.includes('thesis') || typeLower.includes('dissertation')) return 'thesis';
    if (typeLower.includes('conference') || typeLower.includes('paper')) return 'conference_paper';
    if (typeLower.includes('report')) return 'report';
    return 'article';
}

function checkAfricanOrigin(publisher, subjects) {
    const africanKeywords = ['africa', 'african', 'zimbabwe', 'kenya', 'nigeria', 'ghana', 'south africa', 'tanzania', 'uganda', 'ethiopia', 'harare', 'bulawayo', 'mutare', 'gweru', 'kwekwe'];
    const pubLower = String(publisher || '').toLowerCase();
    if (africanKeywords.some(kw => pubLower.includes(kw))) return true;
    
    const subjectsArray = Array.isArray(subjects) ? subjects : [subjects].filter(Boolean);
    return subjectsArray.some(s => {
        const sStr = typeof s === 'string' ? s : (s['#text'] || '');
        return africanKeywords.some(kw => sStr.toLowerCase().includes(kw));
    });
}

function checkZimbabweanOrigin(publisher, subjects) {
    const zimKeywords = [
        'zimbabwe', 'harare', 'bulawayo', 'mutare', 'gweru', 'kwekwe', 'masvingo', 'chinhoyi', 'bindura', 'lupane', 'gwanda',
        'uz', 'nust', 'msu', 'cut', 'gzu', 'buse', 'hit', 'lsu', 'zou', 'muast', 'msuas', 'gsu', 'zintec',
        'africa university', 'solusi', 'womens university', 'catholic university in zimbabwe',
        'scientific and industrial research and development centre', 'sirdc',
        'agricultural research council', 'arc zimbabwe'
    ];
    const pubLower = String(publisher || '').toLowerCase();
    if (zimKeywords.some(kw => pubLower.includes(kw))) return true;
    
    const subjectsArray = Array.isArray(subjects) ? subjects : [subjects].filter(Boolean);
    return subjectsArray.some(s => {
        const sStr = typeof s === 'string' ? s : (s['#text'] || '');
        return zimKeywords.some(kw => sStr.toLowerCase().includes(kw));
    });
}

async function writeSqlBatch(records, sqlFile) {
    if (records.length === 0) return;

    const sql = records.map(r => {
        const id = r.id.replace(/'/g, "''");
        const title = r.title.substring(0, 200).replace(/'/g, "''");
        const author_names = r.author_names.substring(0, 200).replace(/'/g, "''");
        const publisher_name = r.publisher.substring(0, 100).replace(/'/g, "''");
        const subject = r.subject.substring(0, 100).replace(/'/g, "''");
        const description = r.description.substring(0, 1000).replace(/'/g, "''");
        const file_url = r.file_url.replace(/'/g, "''");
        const language = r.language.substring(0, 20).replace(/'/g, "''");
        const year = r.year || 'NULL';

        return `INSERT INTO public.books (id, title, author_names, publisher_name, faculty, subject, description, file_url, year_published, language, status, is_african, is_zimbabwean, access_model, format)
VALUES ('${id}', '${title}', '${author_names}', '${publisher_name}', 'Agriculture', '${subject}', '${description}', '${file_url}', ${year}, '${language}', 'published', ${r.is_african}, ${r.is_zimbabwean}, 'open', 'pdf')
ON CONFLICT (id) DO NOTHING;`;
    }).join('\n');

    fs.appendFileSync(sqlFile, sql + '\n');
}

async function run(maxProviders = 5) {
    console.log("Starting AGRIS Import...");
    
    const sqlFile = path.join(__dirname, "../agris_seed.sql");
    fs.writeFileSync(sqlFile, "-- AGRIS Seed Data\n\n");

    const rootFile = await downloadFile(ROOT_CATALOG_URL);
    if (!rootFile) return;

    const xmlData = fs.readFileSync(rootFile, 'utf-8');
    const jsonObj = parser.parse(xmlData);
    
    const datasetsRaw = jsonObj.Catalog?.dataset || [];
    const datasets = Array.isArray(datasetsRaw) ? datasetsRaw.map(d => d.Dataset).filter(Boolean) : (datasetsRaw.Dataset ? [datasetsRaw.Dataset] : []);
    
    const providerUrls = datasets
        .map(d => {
            const dist = d.distribution?.Distribution;
            if (!dist) return null;
            return typeof dist.downloadURL === 'string' ? dist.downloadURL : dist.downloadURL?.['#text'];
        })
        .filter(Boolean);

    console.log(`Found ${providerUrls.length} providers. Processing ${maxProviders || providerUrls.length}...`);

    const activeUrls = maxProviders ? providerUrls.slice(0, maxProviders) : providerUrls;

    let totalExtracted = 0;

    for (let i = 0; i < activeUrls.length; i++) {
        const url = activeUrls[i];
        console.log(`Processing provider ${i + 1}/${activeUrls.length}: ${url}`);
        
        const providerFile = await downloadFile(url);
        if (!providerFile) continue;

        const providerXml = fs.readFileSync(providerFile, 'utf-8');
        const providerObj = parser.parse(providerXml);
        
        const resources = providerObj.RDF?.BibliographicResource || 
                          providerObj.rdf?.BibliographicResource || 
                          providerObj.Dataset?.BibliographicResource || 
                          providerObj.RDF?.Description || 
                          providerObj.rdf?.Description || 
                          providerObj.Dataset?.Description || 
                          [];
                          
        const records = (Array.isArray(resources) ? resources : [resources]).map(res => {
            const title = typeof res.title === 'string' ? res.title : (res.title?.['#text'] || '');
            if (!title) return null;

            const creators = Array.isArray(res.creator) ? res.creator : (res.creator ? [res.creator] : []);
            const author_names = creators.map(c => typeof c === 'string' ? c : (c['#text'] || '')).join('; ');

            const publisher = typeof res.publisher === 'string' ? res.publisher : (res.publisher?.['#text'] || 'FAO/AGRIS');
            const subjects = Array.isArray(res.subject) ? res.subject : (res.subject ? [res.subject] : []);
            const description = typeof res.description === 'string' ? res.description : (res.description?.['#text'] || '');
            
            // Identifier is often in dc:identifier or dct:isFormatOf or ags:citation
            let file_url = null;
            const identifiers = Array.isArray(res.identifier) ? res.identifier : (res.identifier ? [res.identifier] : []);
            for (const id of identifiers) {
                const idStr = String(typeof id === 'string' ? id : (id['#text'] || ''));
                if (idStr.startsWith('http')) {
                    file_url = idStr;
                    break;
                }
            }
            
            if (!file_url && res.isFormatOf) {
                const formatOf = typeof res.isFormatOf === 'string' ? res.isFormatOf : (res.isFormatOf['#text'] || res.isFormatOf['@_resource'] || '');
                if (formatOf.startsWith('http')) file_url = formatOf;
            }
            
            const agrisId = res['@_about'] || res['@_id'] || `agris-${Math.random().toString(36).substring(2, 9)}`;

            return {
                id: agrisId,
                title,
                author_names: author_names || 'Unknown',
                publisher,
                subject: subjects[0] || 'Agriculture',
                description,
                file_url: file_url || `https://agris.fao.org/search/en/records/${agrisId}`,
                year: extractYear(res),
                language: typeof res.language === 'string' ? res.language : 'English',
                resource_type: mapResourceType(res.type),
                is_african: checkAfricanOrigin(publisher, subjects),
                is_zimbabwean: checkZimbabweanOrigin(publisher, subjects)
            };
        }).filter(Boolean);

        console.log(`  Extracted ${records.length} records. Writing to SQL...`);

        await writeSqlBatch(records, sqlFile);
        totalExtracted += records.length;

        // Clean up
        if (fs.existsSync(providerFile)) {
            fs.unlinkSync(providerFile);
        }
    }

    console.log(`Import completed! SQL file generated at: ${sqlFile}`);
    console.log(`Total records extracted: ${totalExtracted}`);
}

const providersToProcess = process.argv[2] ? parseInt(process.argv[2]) : 2;
run(providersToProcess).catch(console.error);
