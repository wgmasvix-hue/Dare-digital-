#!/usr/bin/env python3
"""
LibriVox → Dare Assist Ingestion Script
=======================================
Fetches audiobooks from the LibriVox API, maps them to the locked
Dare Assist books table schema, and emits production-ready SQL.

Usage:
    python3 librivox_ingest.py                    # all configured subjects
    python3 librivox_ingest.py --subject education # single subject
    python3 librivox_ingest.py --limit 200         # cap total records
    python3 librivox_ingest.py --lang en           # English only (default)
    python3 librivox_ingest.py --chapters          # also seed audiobook_chapters table

Output:
    seed_librivox_<timestamp>.sql
    seed_librivox_chapters_<timestamp>.sql  (if --chapters)

Requirements:
    pip install requests beautifulsoup4
"""

import argparse
import json
import re
import sys
import time
import textwrap
from datetime import date, datetime
from typing import Optional

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Missing deps — run: pip install requests beautifulsoup4")
    sys.exit(1)

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────

LIBRIVOX_API = "https://librivox.org/api/feed/audiobooks"
BATCH_SIZE   = 50      # LibriVox max per request
SLEEP_SECS   = 1.2    # Polite crawl rate — LibriVox is volunteer-run
TODAY        = date.today().isoformat()

# ZIMCHE faculty → LibriVox subject → Education 5.0 pillars mapping
SUBJECT_MAP = [
    {
        "librivox_subject":  "education",
        "subject":           "Education",
        "subject_category":  "Education & Teaching",
        "faculty":           "Faculty of Education",
        "pillars":           ["Teaching and Learning", "Community Engagement"],
        "difficulty_level":  "intermediate",
        "target_audience":   ["undergraduate", "postgraduate", "lecturer"],
        "zimche_nqf_level":  "L6",
        "data_quality_score": 7,
    },
    {
        "librivox_subject":  "psychology",
        "subject":           "Psychology",
        "subject_category":  "Social Sciences",
        "faculty":           "Faculty of Social Sciences",
        "pillars":           ["Research and Innovation", "Teaching and Learning"],
        "difficulty_level":  "intermediate",
        "target_audience":   ["undergraduate", "postgraduate"],
        "zimche_nqf_level":  "L6",
        "data_quality_score": 7,
    },
    {
        "librivox_subject":  "economics",
        "subject":           "Economics",
        "subject_category":  "Commerce & Business",
        "faculty":           "Faculty of Commerce",
        "pillars":           ["Industrialisation", "Community Engagement"],
        "difficulty_level":  "intermediate",
        "target_audience":   ["undergraduate", "postgraduate"],
        "zimche_nqf_level":  "L6",
        "data_quality_score": 7,
    },
    {
        "librivox_subject":  "political science",
        "subject":           "Political Science",
        "subject_category":  "Social Sciences",
        "faculty":           "Faculty of Social Sciences",
        "pillars":           ["Community Engagement"],
        "difficulty_level":  "intermediate",
        "target_audience":   ["undergraduate", "postgraduate"],
        "zimche_nqf_level":  "L6",
        "data_quality_score": 7,
    },
    {
        "librivox_subject":  "sociology",
        "subject":           "Sociology",
        "subject_category":  "Social Sciences",
        "faculty":           "Faculty of Social Sciences",
        "pillars":           ["Community Engagement", "Teaching and Learning"],
        "difficulty_level":  "intermediate",
        "target_audience":   ["undergraduate", "postgraduate"],
        "zimche_nqf_level":  "L6",
        "data_quality_score": 7,
    },
    {
        "librivox_subject":  "agriculture",
        "subject":           "Agriculture",
        "subject_category":  "Agriculture & Natural Resources",
        "faculty":           "Faculty of Agriculture",
        "pillars":           ["Industrialisation", "Research and Innovation"],
        "difficulty_level":  "intermediate",
        "target_audience":   ["undergraduate", "postgraduate", "practitioner"],
        "zimche_nqf_level":  "L6",
        "data_quality_score": 6,
    },
    {
        "librivox_subject":  "medicine",
        "subject":           "Medicine & Health",
        "subject_category":  "Health Sciences",
        "faculty":           "Faculty of Health Sciences",
        "pillars":           ["Research and Innovation", "Teaching and Learning"],
        "difficulty_level":  "intermediate",
        "target_audience":   ["undergraduate", "postgraduate", "practitioner"],
        "zimche_nqf_level":  "L6",
        "data_quality_score": 7,
    },
    {
        "librivox_subject":  "history",
        "subject":           "History",
        "subject_category":  "Humanities",
        "faculty":           "Faculty of Arts",
        "pillars":           ["Community Engagement"],
        "difficulty_level":  "introductory",
        "target_audience":   ["undergraduate", "general"],
        "zimche_nqf_level":  "L5",
        "data_quality_score": 7,
    },
    {
        "librivox_subject":  "philosophy",
        "subject":           "Philosophy",
        "subject_category":  "Humanities",
        "faculty":           "Faculty of Arts",
        "pillars":           ["Research and Innovation"],
        "difficulty_level":  "intermediate",
        "target_audience":   ["undergraduate", "postgraduate"],
        "zimche_nqf_level":  "L6",
        "data_quality_score": 7,
    },
    {
        "librivox_subject":  "law",
        "subject":           "Law & Jurisprudence",
        "subject_category":  "Law",
        "faculty":           "Faculty of Law",
        "pillars":           ["Community Engagement"],
        "difficulty_level":  "intermediate",
        "target_audience":   ["undergraduate", "postgraduate"],
        "zimche_nqf_level":  "L6",
        "data_quality_score": 6,
    },
    {
        "librivox_subject":  "science",
        "subject":           "Natural Sciences",
        "subject_category":  "Science & Technology",
        "faculty":           "Faculty of Science",
        "pillars":           ["Research and Innovation", "Industrialisation"],
        "difficulty_level":  "intermediate",
        "target_audience":   ["undergraduate", "postgraduate"],
        "zimche_nqf_level":  "L6",
        "data_quality_score": 7,
    },
    {
        "librivox_subject":  "business",
        "subject":           "Business & Management",
        "subject_category":  "Commerce & Business",
        "faculty":           "Faculty of Commerce",
        "pillars":           ["Industrialisation"],
        "difficulty_level":  "intermediate",
        "target_audience":   ["undergraduate", "postgraduate", "practitioner"],
        "zimche_nqf_level":  "L6",
        "data_quality_score": 7,
    },
]

# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def pg_escape(s: str) -> str:
    """Escape single quotes for PostgreSQL string literals."""
    if s is None:
        return ""
    return str(s).replace("'", "''")


def pg_str(v: Optional[str]) -> str:
    if v is None or v == "":
        return "NULL"
    return f"'{pg_escape(v)}'"


def pg_int(v) -> str:
    try:
        return str(int(v))
    except (TypeError, ValueError):
        return "NULL"


def pg_bool(v: bool) -> str:
    return "TRUE" if v else "FALSE"


def pg_array(arr: list[str]) -> str:
    items = ", ".join(f"'{pg_escape(i)}'" for i in arr)
    return f"ARRAY[{items}]"


def pg_jsonb(obj) -> str:
    return f"'{pg_escape(json.dumps(obj))}'::jsonb"


def strip_html(raw: str) -> str:
    soup = BeautifulSoup(raw or "", "html.parser")
    text = soup.get_text(separator=" ")
    return re.sub(r"\s+", " ", text).strip()


def build_keywords(book: dict, meta: dict) -> str:
    parts = [
        book.get("title", ""),
        meta["subject"],
        meta["faculty"],
        "audiobook",
        "librivox",
        "public domain",
        "open access",
        book.get("language", ""),
    ]
    # add author surnames
    for a in book.get("authors", []):
        surname = a.get("last_name", "")
        if surname and surname != "(wrong author)":
            parts.append(surname)
    return ", ".join(p for p in parts if p)


def infer_african(book: dict) -> bool:
    desc = (book.get("description") or "").lower()
    title = (book.get("title") or "").lower()
    keywords = ["africa", "african", "nigeria", "kenya", "ghana", "ethiopia",
                "zimbabwe", "zambia", "tanzania", "south africa"]
    return any(k in desc or k in title for k in keywords)


def fetch_subject(subject_query: str, lang: str, max_per_subject: int) -> list[dict]:
    """
    Paginate through LibriVox API for a given subject.
    Returns raw API book dicts.
    """
    results = []
    offset = 0
    while len(results) < max_per_subject:
        params = {
            "subject": subject_query,
            "language": lang,
            "format": "json",
            "limit": BATCH_SIZE,
            "offset": offset,
            "fields": (
                "id,title,description,url_librivox,url_zip_file,"
                "language,num_sections,authors,subjects,"
                "copyright_year,totaltimesecs"
            ),
        }
        try:
            resp = requests.get(LIBRIVOX_API, params=params, timeout=20)
            resp.raise_for_status()
            data = resp.json()
        except requests.exceptions.RequestException as e:
            print(f"    ⚠  API error for subject '{subject_query}' offset {offset}: {e}")
            break
        except json.JSONDecodeError:
            print(f"    ⚠  JSON decode error for subject '{subject_query}'")
            break

        books = data.get("books", [])
        if not books:
            break

        results.extend(books)
        if len(books) < BATCH_SIZE:
            break  # last page
        offset += BATCH_SIZE
        time.sleep(SLEEP_SECS)

    return results[:max_per_subject]


def fetch_chapters(librivox_id: str) -> list[dict]:
    """
    Fetch individual chapter/section data for a given LibriVox book ID.
    Returns list of chapter dicts.
    """
    params = {
        "id": librivox_id,
        "format": "json",
        "fields": "id,section_number,title,listen_url,file_name,playtime,readers",
    }
    try:
        resp = requests.get(
            "https://librivox.org/api/feed/audiotracks",
            params=params,
            timeout=20,
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("sections", [])
    except Exception as e:
        print(f"    ⚠  Could not fetch chapters for book {librivox_id}: {e}")
        return []


# ─────────────────────────────────────────────────────────────────────────────
# SQL BUILDERS
# ─────────────────────────────────────────────────────────────────────────────

BOOKS_UPSERT_COLS = [
    "id", "title", "author_names", "description", "subject", "subject_category",
    "faculty", "open_access_url", "file_url", "access_model", "license_type",
    "source_repository", "openlibrary_id", "publication_year", "language",
    "keywords", "status", "resource_type", "content_type", "format",
    "in_app_reader", "reader_type", "is_african", "is_african_authored",
    "is_zimbabwean", "is_featured", "is_peer_reviewed", "pillars",
    "difficulty_level", "target_audience", "data_quality_score",
    "last_verified_date", "zimche_nqf_level", "cover_image_url",
    "publisher_name",
]

def build_book_sql(book: dict, meta: dict) -> Optional[str]:
    """Build a single book upsert SQL row."""
    lv_id   = book.get("id", "")
    title   = book.get("title", "").strip()
    if not lv_id or not title:
        return None

    dare_id = f"librivox-{lv_id}"
    lang    = book.get("language", "English")

    # Author names
    authors = book.get("authors", [])
    author_parts = []
    for a in authors:
        fn = a.get("first_name", "").strip()
        ln = a.get("last_name", "").strip()
        if ln and ln != "(wrong author)":
            author_parts.append(f"{fn} {ln}".strip())
    author_names = "; ".join(author_parts) if author_parts else "Unknown"

    raw_desc    = book.get("description") or ""
    description = strip_html(raw_desc)[:2000]  # cap at 2000 chars
    zip_url     = book.get("url_zip_file", "") or ""
    lv_url      = book.get("url_librivox", "") or ""
    pub_year    = book.get("copyright_year", None)
    is_african  = infer_african(book)
    keywords    = build_keywords(book, meta)

    # LibriVox ID as openlibrary_id using librivox: prefix
    openlibrary_id = f"librivox:{lv_id}"

    values = {
        "id":                 pg_str(dare_id),
        "title":              pg_str(title),
        "author_names":       pg_str(author_names),
        "description":        pg_str(description),
        "subject":            pg_str(meta["subject"]),
        "subject_category":   pg_str(meta["subject_category"]),
        "faculty":            pg_str(meta["faculty"]),
        "open_access_url":    pg_str(lv_url),
        "file_url":           pg_str(zip_url),
        "access_model":       pg_str("open_access"),
        "license_type":       pg_str("CC0"),
        "source_repository":  pg_str("LibriVox"),
        "openlibrary_id":     pg_str(openlibrary_id),
        "publication_year":   pg_int(pub_year),
        "language":           pg_str(lang),
        "keywords":           pg_str(keywords),
        "status":             pg_str("published"),
        "resource_type":      pg_str("audiobook"),
        "content_type":       pg_str("audio"),
        "format":             pg_str("MP3"),
        "in_app_reader":      pg_bool(False),
        "reader_type":        "NULL",
        "is_african":         pg_bool(is_african),
        "is_african_authored":pg_bool(is_african),
        "is_zimbabwean":      pg_bool(False),
        "is_featured":        pg_bool(False),
        "is_peer_reviewed":   pg_bool(False),
        "pillars":            pg_jsonb(meta["pillars"]),
        "difficulty_level":   pg_str(meta["difficulty_level"]),
        "target_audience":    pg_array(meta["target_audience"]),
        "data_quality_score": str(meta["data_quality_score"]),
        "last_verified_date": pg_str(TODAY),
        "zimche_nqf_level":   pg_str(meta["zimche_nqf_level"]),
        "cover_image_url":    "NULL",
        "publisher_name":     pg_str("LibriVox"),
    }

    col_list = ", ".join(BOOKS_UPSERT_COLS)
    val_list = ", ".join(values[c] for c in BOOKS_UPSERT_COLS)
    update_set = ",\n        ".join(
        f"{c} = EXCLUDED.{c}" for c in BOOKS_UPSERT_COLS if c != "id"
    )

    return textwrap.dedent(f"""\
        INSERT INTO books ({col_list})
        VALUES ({val_list})
        ON CONFLICT (id) DO UPDATE SET
            {update_set},
            updated_at = now();""")


def build_chapters_table_sql() -> str:
    return textwrap.dedent("""\
        -- Run once to create the audiobook_chapters table
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
    """)


def build_chapter_sql(dare_book_id: str, chapter: dict) -> str:
    sec_num     = chapter.get("section_number", 0)
    chapter_id  = f"{dare_book_id}-ch{str(sec_num).zfill(3)}"
    ch_title    = chapter.get("title", f"Chapter {sec_num}")
    listen_url  = chapter.get("listen_url", "")
    playtime    = chapter.get("playtime", "")
    readers     = chapter.get("readers", [])
    reader_name = readers[0].get("display_name", "") if readers else ""

    return textwrap.dedent(f"""\
        INSERT INTO audiobook_chapters (id, book_id, chapter_number, title, listen_url, playtime, reader_name)
        VALUES ({pg_str(chapter_id)}, {pg_str(dare_book_id)}, {pg_int(sec_num)},
                {pg_str(ch_title)}, {pg_str(listen_url)}, {pg_str(playtime)}, {pg_str(reader_name)})
        ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            listen_url = EXCLUDED.listen_url,
            playtime = EXCLUDED.playtime,
            reader_name = EXCLUDED.reader_name,
            updated_at = now();""")


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="LibriVox → Dare Assist seeder")
    parser.add_argument("--subject",  help="Limit to one subject keyword", default=None)
    parser.add_argument("--lang",     help="LibriVox language filter",      default="English")
    parser.add_argument("--limit",    help="Max total books",  type=int,    default=500)
    parser.add_argument("--chapters", help="Also seed chapters table",      action="store_true")
    args = parser.parse_args()

    subjects_to_run = SUBJECT_MAP
    if args.subject:
        subjects_to_run = [m for m in SUBJECT_MAP
                           if args.subject.lower() in m["librivox_subject"].lower()]
        if not subjects_to_run:
            print(f"No matching subject config for '{args.subject}'")
            sys.exit(1)

    per_subject_limit = max(20, args.limit // len(subjects_to_run))

    timestamp   = datetime.now().strftime("%Y%m%d_%H%M%S")
    books_file  = f"seed_librivox_{timestamp}.sql"
    chap_file   = f"seed_librivox_chapters_{timestamp}.sql"

    seen_ids    = set()
    book_lines  = []
    chap_lines  = []
    total_books = 0
    total_chapters = 0

    # Header
    header = textwrap.dedent(f"""\
        -- ============================================================
        -- Dare Assist — LibriVox Audiobook Seed
        -- Generated: {datetime.now().isoformat()}
        -- Source:    LibriVox.org (CC0 / Public Domain)
        -- Schema:    Locked Dare Assist v21 books table
        -- ============================================================
        BEGIN;
    """)
    book_lines.append(header)

    if args.chapters:
        chap_lines.append(build_chapters_table_sql())
        chap_lines.append("\nBEGIN;\n")

    for meta in subjects_to_run:
        subj = meta["librivox_subject"]
        print(f"\n[→] Fetching subject: '{subj}' (max {per_subject_limit})")
        raw_books = fetch_subject(subj, args.lang, per_subject_limit)
        print(f"    Received {len(raw_books)} books from API")

        subj_count = 0
        for book in raw_books:
            lv_id   = str(book.get("id", ""))
            dare_id = f"librivox-{lv_id}"

            if dare_id in seen_ids:
                continue
            seen_ids.add(dare_id)

            sql = build_book_sql(book, meta)
            if not sql:
                continue

            book_lines.append(sql + "\n")
            subj_count += 1
            total_books += 1

            if total_books >= args.limit:
                break

            # Optionally fetch chapters
            if args.chapters and lv_id:
                time.sleep(SLEEP_SECS)
                chapters = fetch_chapters(lv_id)
                for ch in chapters:
                    chap_sql = build_chapter_sql(dare_id, ch)
                    chap_lines.append(chap_sql + "\n")
                    total_chapters += 1

        print(f"    ✓  {subj_count} books added for '{subj}'")
        if total_books >= args.limit:
            print(f"\n[!] Reached total limit of {args.limit} books. Stopping.")
            break

    book_lines.append("\nCOMMIT;\n")
    book_lines.append(f"-- Total books seeded: {total_books}\n")

    with open(books_file, "w", encoding="utf-8") as f:
        f.write("\n".join(book_lines))

    print(f"\n✅ Books SQL written to: {books_file} ({total_books} records)")

    if args.chapters:
        chap_lines.append("\nCOMMIT;\n")
        chap_lines.append(f"-- Total chapters seeded: {total_chapters}\n")
        with open(chap_file, "w", encoding="utf-8") as f:
            f.write("\n".join(chap_lines))
        print(f"✅ Chapters SQL written to: {chap_file} ({total_chapters} records)")


if __name__ == "__main__":
    main()
