import { createClient } from '@supabase/supabase-js';

// Supabase config
const supabaseUrl = 'https://odklvauuiitaoenzhlda.supabase.co';
// Use Service Role Key if available in environment, otherwise fallback to Anon Key
// Note: Anon key will likely fail due to Row Level Security (RLS) policies unless you've enabled anonymous inserts.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ka2x2YXV1aWl0YW9lbnpobGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTczMzIsImV4cCI6MjA4ODE3MzMzMn0.ZTiLAjhbN867KYVQENh1ZQ7MD91faj3GqY-8FbHl1VY';
const supabase = createClient(supabaseUrl, supabaseKey);

const LIBRIVOX_API = "https://librivox.org/api/feed/audiobooks";
const BATCH_SIZE = 50;
const SLEEP_MS = 1200;

const SUBJECT_MAP = [
    {
        librivox_subject: "education",
        subject: "Education",
        subject_category: "Education & Teaching",
        faculty: "Faculty of Education",
        pillars: ["Teaching and Learning", "Community Engagement"],
        difficulty_level: "intermediate",
        target_audience: ["undergraduate", "postgraduate", "lecturer"],
        zimche_nqf_level: "L6",
        data_quality_score: 7,
    },
    {
        librivox_subject: "psychology",
        subject: "Psychology",
        subject_category: "Social Sciences",
        faculty: "Faculty of Social Sciences",
        pillars: ["Research and Innovation", "Teaching and Learning"],
        difficulty_level: "intermediate",
        target_audience: ["undergraduate", "postgraduate"],
        zimche_nqf_level: "L6",
        data_quality_score: 7,
    },
    {
        librivox_subject: "history",
        subject: "History",
        subject_category: "Humanities",
        faculty: "Faculty of Arts",
        pillars: ["Community Engagement"],
        difficulty_level: "introductory",
        target_audience: ["undergraduate", "general"],
        zimche_nqf_level: "L5",
        data_quality_score: 7,
    },
    {
        librivox_subject: "science",
        subject: "Natural Sciences",
        subject_category: "Science & Technology",
        faculty: "Faculty of Science",
        pillars: ["Research and Innovation", "Industrialisation"],
        difficulty_level: "intermediate",
        target_audience: ["undergraduate", "postgraduate"],
        zimche_nqf_level: "L6",
        data_quality_score: 7,
    },
    {
        librivox_subject: "philosophy",
        subject: "Philosophy",
        subject_category: "Humanities",
        faculty: "Faculty of Arts",
        pillars: ["Research and Innovation"],
        difficulty_level: "intermediate",
        target_audience: ["undergraduate", "postgraduate"],
        zimche_nqf_level: "L6",
        data_quality_score: 7,
    },
    {
        librivox_subject: "law",
        subject: "Law & Jurisprudence",
        subject_category: "Law",
        faculty: "Faculty of Law",
        pillars: ["Community Engagement"],
        difficulty_level: "intermediate",
        target_audience: ["undergraduate", "postgraduate"],
        zimche_nqf_level: "L6",
        data_quality_score: 6,
    }
];

function stripHtml(raw) {
    if (!raw) return "";
    return raw.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

function buildKeywords(book, meta) {
    const parts = [
        book.title || "",
        meta.subject,
        meta.faculty,
        "audiobook",
        "librivox",
        "public domain",
        "open access",
        book.language || "",
    ];
    
    const authors = book.authors || [];
    for (const a of authors) {
        const surname = a.last_name || "";
        if (surname && surname !== "(wrong author)") {
            parts.push(surname);
        }
    }
    return parts.filter(Boolean).join(", ");
}

function inferAfrican(book) {
    const desc = (book.description || "").toLowerCase();
    const title = (book.title || "").toLowerCase();
    const keywords = ["africa", "african", "nigeria", "kenya", "ghana", "ethiopia",
                "zimbabwe", "zambia", "tanzania", "south africa"];
    return keywords.some(k => desc.includes(k) || title.includes(k));
}

async function fetchSubject(subjectQuery, lang, maxPerSubject) {
    const results = [];
    let offset = 0;
    
    while (results.length < maxPerSubject) {
        const url = new URL(LIBRIVOX_API);
        url.searchParams.append("genre", subjectQuery); // Using genre as it works better for LibriVox API
        url.searchParams.append("language", lang);
        url.searchParams.append("format", "json");
        url.searchParams.append("limit", BATCH_SIZE);
        url.searchParams.append("offset", offset);
        url.searchParams.append("fields", "id,title,description,url_librivox,url_zip_file,language,num_sections,authors,subjects,copyright_year,totaltimesecs");

        try {
            const resp = await fetch(url.toString());
            if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
            const data = await resp.json();
            
            const books = data.books || [];
            if (books.length === 0) break;
            
            results.push(...books);
            if (books.length < BATCH_SIZE) break;
            
            offset += BATCH_SIZE;
            await new Promise(resolve => setTimeout(resolve, SLEEP_MS));
        } catch (e) {
            console.log(`    ⚠  API error for subject '${subjectQuery}' offset ${offset}: ${e.message}`);
            break;
        }
    }
    return results.slice(0, maxPerSubject);
}

async function run() {
    const args = process.argv.slice(2);
    let limit = 50; // Default limit per run to avoid overwhelming the DB
    let lang = "English";

    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--limit" && i + 1 < args.length) limit = parseInt(args[++i], 10);
    }

    console.log(`Starting Direct LibriVox Ingestion (Limit: ${limit} total books)`);
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log("⚠️ WARNING: SUPABASE_SERVICE_ROLE_KEY is not set. Using anon key. This may fail due to Row Level Security (RLS).");
    }

    const perSubjectLimit = Math.max(10, Math.floor(limit / SUBJECT_MAP.length));
    let totalInserted = 0;
    let totalErrors = 0;

    for (const meta of SUBJECT_MAP) {
        if (totalInserted >= limit) break;

        const subj = meta.librivox_subject;
        console.log(`\n[→] Fetching subject: '${subj}' (max ${perSubjectLimit})`);
        
        const rawBooks = await fetchSubject(subj, lang, perSubjectLimit);
        console.log(`    Received ${rawBooks.length} books from API`);

        for (const book of rawBooks) {
            if (totalInserted >= limit) break;

            const lv_id = String(book.id || "");
            const title = (book.title || "").trim();
            if (!lv_id || !title) continue;

            const dare_id = `librivox-${lv_id}`;
            
            const authors = book.authors || [];
            const authorParts = authors.map(a => `${(a.first_name || "").trim()} ${(a.last_name || "").trim()}`.trim()).filter(a => a && !a.includes("(wrong author)"));
            const author_names = authorParts.length > 0 ? authorParts.join("; ") : "Unknown";

            const description = stripHtml(book.description).substring(0, 2000);
            const is_african = inferAfrican(book);
            const keywords = buildKeywords(book, meta);

            const bookData = {
                id: dare_id,
                title: title,
                author_names: author_names,
                description: description,
                subject: meta.subject,
                subject_category: meta.subject_category,
                faculty: meta.faculty,
                open_access_url: book.url_librivox || "",
                file_url: book.url_zip_file || "",
                access_model: "open_access",
                license_type: "CC0",
                source_repository: "LibriVox",
                openlibrary_id: `librivox:${lv_id}`,
                publication_year: book.copyright_year ? parseInt(book.copyright_year, 10) : null,
                language: book.language || "English",
                keywords: keywords,
                status: "published",
                resource_type: "audiobook",
                content_type: "audio",
                format: "MP3",
                in_app_reader: false,
                is_african: is_african,
                is_african_authored: is_african,
                is_zimbabwean: false,
                is_featured: false,
                is_peer_reviewed: false,
                pillars: meta.pillars,
                difficulty_level: meta.difficulty_level,
                target_audience: meta.target_audience,
                data_quality_score: meta.data_quality_score,
                zimche_nqf_level: meta.zimche_nqf_level,
                publisher_name: "LibriVox"
            };

            // Insert into Supabase (using upsert to handle duplicates gracefully if RLS allows)
            const { error } = await supabase
                .from('books')
                .upsert(bookData, { onConflict: 'id' });

            if (error) {
                console.error(`    ❌ Error inserting "${title}":`, error.message);
                totalErrors++;
            } else {
                console.log(`    ✅ Inserted: "${title}"`);
                totalInserted++;
            }
        }
    }

    console.log(`\n🎉 Ingestion complete! Successfully inserted: ${totalInserted}. Errors: ${totalErrors}.`);
    if (totalErrors > 0) {
        console.log("💡 Tip: If all errors are 'new row violates row-level security policy', you need to run this script with the SUPABASE_SERVICE_ROLE_KEY environment variable, or temporarily disable RLS for inserts.");
    }
}

run();
