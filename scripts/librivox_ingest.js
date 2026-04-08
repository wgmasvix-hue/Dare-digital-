import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LIBRIVOX_API = "https://librivox.org/api/feed/audiobooks";
const BATCH_SIZE = 50;
const SLEEP_MS = 1200;
const TODAY = new Date().toISOString().split('T')[0];

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
        librivox_subject: "economics",
        subject: "Economics",
        subject_category: "Commerce & Business",
        faculty: "Faculty of Commerce",
        pillars: ["Industrialisation", "Community Engagement"],
        difficulty_level: "intermediate",
        target_audience: ["undergraduate", "postgraduate"],
        zimche_nqf_level: "L6",
        data_quality_score: 7,
    },
    {
        librivox_subject: "political science",
        subject: "Political Science",
        subject_category: "Social Sciences",
        faculty: "Faculty of Social Sciences",
        pillars: ["Community Engagement"],
        difficulty_level: "intermediate",
        target_audience: ["undergraduate", "postgraduate"],
        zimche_nqf_level: "L6",
        data_quality_score: 7,
    },
    {
        librivox_subject: "sociology",
        subject: "Sociology",
        subject_category: "Social Sciences",
        faculty: "Faculty of Social Sciences",
        pillars: ["Community Engagement", "Teaching and Learning"],
        difficulty_level: "intermediate",
        target_audience: ["undergraduate", "postgraduate"],
        zimche_nqf_level: "L6",
        data_quality_score: 7,
    },
    {
        librivox_subject: "agriculture",
        subject: "Agriculture",
        subject_category: "Agriculture & Natural Resources",
        faculty: "Faculty of Agriculture",
        pillars: ["Industrialisation", "Research and Innovation"],
        difficulty_level: "intermediate",
        target_audience: ["undergraduate", "postgraduate", "practitioner"],
        zimche_nqf_level: "L6",
        data_quality_score: 6,
    },
    {
        librivox_subject: "medicine",
        subject: "Medicine & Health",
        subject_category: "Health Sciences",
        faculty: "Faculty of Health Sciences",
        pillars: ["Research and Innovation", "Teaching and Learning"],
        difficulty_level: "intermediate",
        target_audience: ["undergraduate", "postgraduate", "practitioner"],
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
        librivox_subject: "business",
        subject: "Business & Management",
        subject_category: "Commerce & Business",
        faculty: "Faculty of Commerce",
        pillars: ["Industrialisation"],
        difficulty_level: "intermediate",
        target_audience: ["undergraduate", "postgraduate", "practitioner"],
        zimche_nqf_level: "L6",
        data_quality_score: 7,
    },
];

function pgEscape(s) {
    if (s === null || s === undefined) return "";
    return String(s).replace(/'/g, "''");
}

function pgStr(v) {
    if (v === null || v === undefined || v === "") return "NULL";
    return `'${pgEscape(v)}'`;
}

function pgInt(v) {
    const parsed = parseInt(v, 10);
    if (isNaN(parsed)) return "NULL";
    return String(parsed);
}

function pgBool(v) {
    return v ? "TRUE" : "FALSE";
}

function pgArray(arr) {
    const items = arr.map(i => `'${pgEscape(i)}'`).join(", ");
    return `ARRAY[${items}]`;
}

function pgJsonb(obj) {
    return `'${pgEscape(JSON.stringify(obj))}'::jsonb`;
}

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
        url.searchParams.append("genre", subjectQuery);
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

async function fetchChapters(librivoxId) {
    const url = new URL("https://librivox.org/api/feed/audiotracks");
    url.searchParams.append("id", librivoxId);
    url.searchParams.append("format", "json");
    url.searchParams.append("fields", "id,section_number,title,listen_url,file_name,playtime,readers");

    try {
        const resp = await fetch(url.toString());
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        const data = await resp.json();
        return data.sections || [];
    } catch (e) {
        console.log(`    ⚠  Could not fetch chapters for book ${librivoxId}: ${e.message}`);
        return [];
    }
}

const BOOKS_UPSERT_COLS = [
    "id", "title", "author_names", "description", "subject", "subject_category",
    "faculty", "open_access_url", "file_url", "access_model", "license_type",
    "source_repository", "openlibrary_id", "publication_year", "language",
    "keywords", "status", "resource_type", "content_type", "format",
    "in_app_reader", "reader_type", "is_african", "is_african_authored",
    "is_zimbabwean", "is_featured", "is_peer_reviewed", "pillars",
    "difficulty_level", "target_audience", "data_quality_score",
    "last_verified_date", "zimche_nqf_level", "cover_image_url",
    "publisher_name",
];

function buildBookSql(book, meta) {
    const lv_id = book.id || "";
    const title = (book.title || "").trim();
    if (!lv_id || !title) return null;

    const dare_id = `librivox-${lv_id}`;
    const lang = book.language || "English";

    const authors = book.authors || [];
    const authorParts = [];
    for (const a of authors) {
        const fn = (a.first_name || "").trim();
        const ln = (a.last_name || "").trim();
        if (ln && ln !== "(wrong author)") {
            authorParts.push(`${fn} ${ln}`.trim());
        }
    }
    const author_names = authorParts.length > 0 ? authorParts.join("; ") : "Unknown";

    const raw_desc = book.description || "";
    const description = stripHtml(raw_desc).substring(0, 2000);
    const zip_url = book.url_zip_file || "";
    const lv_url = book.url_librivox || "";
    const pub_year = book.copyright_year || null;
    const is_african = inferAfrican(book);
    const keywords = buildKeywords(book, meta);
    const openlibrary_id = `librivox:${lv_id}`;

    const values = {
        "id":                 pgStr(dare_id),
        "title":              pgStr(title),
        "author_names":       pgStr(author_names),
        "description":        pgStr(description),
        "subject":            pgStr(meta.subject),
        "subject_category":   pgStr(meta.subject_category),
        "faculty":            pgStr(meta.faculty),
        "open_access_url":    pgStr(lv_url),
        "file_url":           pgStr(zip_url),
        "access_model":       pgStr("open_access"),
        "license_type":       pgStr("CC0"),
        "source_repository":  pgStr("LibriVox"),
        "openlibrary_id":     pgStr(openlibrary_id),
        "publication_year":   pgInt(pub_year),
        "language":           pgStr(lang),
        "keywords":           pgStr(keywords),
        "status":             pgStr("published"),
        "resource_type":      pgStr("audiobook"),
        "content_type":       pgStr("audio"),
        "format":             pgStr("MP3"),
        "in_app_reader":      pgBool(false),
        "reader_type":        "NULL",
        "is_african":         pgBool(is_african),
        "is_african_authored":pgBool(is_african),
        "is_zimbabwean":      pgBool(false),
        "is_featured":        pgBool(false),
        "is_peer_reviewed":   pgBool(false),
        "pillars":            pgJsonb(meta.pillars),
        "difficulty_level":   pgStr(meta.difficulty_level),
        "target_audience":    pgArray(meta.target_audience),
        "data_quality_score": String(meta.data_quality_score),
        "last_verified_date": pgStr(TODAY),
        "zimche_nqf_level":   pgStr(meta.zimche_nqf_level),
        "cover_image_url":    "NULL",
        "publisher_name":     pgStr("LibriVox"),
    };

    const colList = BOOKS_UPSERT_COLS.join(", ");
    const valList = BOOKS_UPSERT_COLS.map(c => values[c]).join(", ");
    const updateSet = BOOKS_UPSERT_COLS.filter(c => c !== "id").map(c => `${c} = EXCLUDED.${c}`).join(",\n        ");

    return `INSERT INTO books (${colList})\nVALUES (${valList})\nON CONFLICT (id) DO UPDATE SET\n        ${updateSet},\n        updated_at = now();`;
}

function buildChaptersTableSql() {
    return `-- Run once to create the audiobook_chapters table
CREATE TABLE IF NOT EXISTS audiobook_chapters (
    id              TEXT PRIMARY KEY,           -- e.g. 'librivox-1234-ch01'
    book_id         TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter_number  INTEGER NOT NULL,
    title           TEXT,
    listen_url      TEXT NOT NULL,              -- direct MP3 URL
    playtime        TEXT,                       -- e.g. '00:45:12'
    reader_name     TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ac_book_id ON audiobook_chapters(book_id);
`;
}

function buildChapterSql(dare_book_id, chapter) {
    const sec_num = chapter.section_number || 0;
    const chapter_id = `${dare_book_id}-ch${String(sec_num).padStart(3, '0')}`;
    const ch_title = chapter.title || `Chapter ${sec_num}`;
    const listen_url = chapter.listen_url || "";
    const playtime = chapter.playtime || "";
    const readers = chapter.readers || [];
    const reader_name = readers.length > 0 ? (readers[0].display_name || "") : "";

    return `INSERT INTO audiobook_chapters (id, book_id, chapter_number, title, listen_url, playtime, reader_name)
VALUES (${pgStr(chapter_id)}, ${pgStr(dare_book_id)}, ${pgInt(sec_num)},
        ${pgStr(ch_title)}, ${pgStr(listen_url)}, ${pgStr(playtime)}, ${pgStr(reader_name)})
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    listen_url = EXCLUDED.listen_url,
    playtime = EXCLUDED.playtime,
    reader_name = EXCLUDED.reader_name,
    updated_at = now();`;
}

async function main() {
    const args = process.argv.slice(2);
    let subjectFilter = null;
    let lang = "English";
    let limit = 500;
    let fetchChaps = false;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--subject" && i + 1 < args.length) subjectFilter = args[++i];
        if (args[i] === "--lang" && i + 1 < args.length) lang = args[++i];
        if (args[i] === "--limit" && i + 1 < args.length) limit = parseInt(args[++i], 10);
        if (args[i] === "--chapters") fetchChaps = true;
    }

    let subjectsToRun = SUBJECT_MAP;
    if (subjectFilter) {
        subjectsToRun = SUBJECT_MAP.filter(m => m.librivox_subject.toLowerCase().includes(subjectFilter.toLowerCase()));
        if (subjectsToRun.length === 0) {
            console.log(`No matching subject config for '${subjectFilter}'`);
            process.exit(1);
        }
    }

    const perSubjectLimit = Math.max(20, Math.floor(limit / subjectsToRun.length));
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15);
    const booksFile = path.join(__dirname, `../seed_librivox_${timestamp}.sql`);
    const chapFile = path.join(__dirname, `../seed_librivox_chapters_${timestamp}.sql`);

    const seenIds = new Set();
    const bookLines = [];
    const chapLines = [];
    let totalBooks = 0;
    let totalChapters = 0;

    const header = `-- ============================================================
-- Dare Assist — LibriVox Audiobook Seed
-- Generated: ${new Date().toISOString()}
-- Source:    LibriVox.org (CC0 / Public Domain)
-- Schema:    Locked Dare Assist v21 books table
-- ============================================================
BEGIN;
`;
    bookLines.push(header);

    if (fetchChaps) {
        chapLines.push(buildChaptersTableSql());
        chapLines.push("\nBEGIN;\n");
    }

    for (const meta of subjectsToRun) {
        const subj = meta.librivox_subject;
        console.log(`\n[→] Fetching subject: '${subj}' (max ${perSubjectLimit})`);
        const rawBooks = await fetchSubject(subj, lang, perSubjectLimit);
        console.log(`    Received ${rawBooks.length} books from API`);

        let subjCount = 0;
        for (const book of rawBooks) {
            const lv_id = String(book.id || "");
            const dare_id = `librivox-${lv_id}`;

            if (seenIds.has(dare_id)) continue;
            seenIds.add(dare_id);

            const sql = buildBookSql(book, meta);
            if (!sql) continue;

            bookLines.push(sql + "\n");
            subjCount++;
            totalBooks++;

            if (totalBooks >= limit) break;

            if (fetchChaps && lv_id) {
                await new Promise(resolve => setTimeout(resolve, SLEEP_MS));
                const chapters = await fetchChapters(lv_id);
                for (const ch of chapters) {
                    const chapSql = buildChapterSql(dare_id, ch);
                    chapLines.push(chapSql + "\n");
                    totalChapters++;
                }
            }
        }

        console.log(`    ✓  ${subjCount} books added for '${subj}'`);
        if (totalBooks >= limit) {
            console.log(`\n[!] Reached total limit of ${limit} books. Stopping.`);
            break;
        }
    }

    bookLines.push("\nCOMMIT;\n");
    bookLines.push(`-- Total books seeded: ${totalBooks}\n`);

    fs.writeFileSync(booksFile, bookLines.join('\n'), 'utf-8');
    console.log(`\n✅ Books SQL written to: ${booksFile} (${totalBooks} records)`);

    if (fetchChaps) {
        chapLines.push("\nCOMMIT;\n");
        chapLines.push(`-- Total chapters seeded: ${totalChapters}\n`);
        fs.writeFileSync(chapFile, chapLines.join('\n'), 'utf-8');
        console.log(`✅ Chapters SQL written to: ${chapFile} (${totalChapters} records)`);
    }
}

main().catch(console.error);
