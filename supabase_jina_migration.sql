-- ================================================================
-- DARE Digital Library — Jina AI Vector Search Migration
-- Run this in the Supabase SQL Editor ONCE.
-- Switches book_embeddings from vector(1536) → vector(1024)
-- and updates match_books() to match Jina's output dimensions.
-- ================================================================

-- 1. Enable pgvector (safe no-op if already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Drop and recreate book_embeddings with 1024 dims
--    (Any existing OpenAI-dimension rows are incompatible — truncate first)
DROP TABLE IF EXISTS public.book_embeddings;

CREATE TABLE public.book_embeddings (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id     TEXT        NOT NULL UNIQUE,   -- matches books.id
  embedding   vector(1024) NOT NULL,
  content     TEXT,                          -- the text that was embedded
  model       TEXT        DEFAULT 'jina-embeddings-v3',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. Row-level security
ALTER TABLE public.book_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
  ON public.book_embeddings FOR SELECT USING (true);

-- Allow service-role inserts (used by seed script with service key)
CREATE POLICY "Service role insert"
  ON public.book_embeddings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role update"
  ON public.book_embeddings FOR UPDATE
  USING (true);

-- 4. IVFFLAT index for fast cosine similarity search
--    lists = sqrt(expected_row_count).  Start with 10, tune after seeding.
CREATE INDEX IF NOT EXISTS book_embeddings_embedding_idx
  ON public.book_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);

-- 5. Recreate match_books() RPC for vector(1024)
DROP FUNCTION IF EXISTS match_books(vector, float, int);

CREATE OR REPLACE FUNCTION match_books(
  query_embedding vector(1024),
  match_threshold float DEFAULT 0.25,
  match_count     int   DEFAULT 20
)
RETURNS TABLE (
  id              TEXT,
  title           TEXT,
  author_names    TEXT,
  description     TEXT,
  cover_image_url TEXT,
  similarity      FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id::TEXT,
    b.title,
    b.author_names,
    b.description,
    b.cover_image_url,
    1 - (be.embedding <=> query_embedding) AS similarity
  FROM public.book_embeddings be
  JOIN public.books b ON be.book_id = b.id::TEXT
  WHERE 1 - (be.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- 6. Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION update_book_embeddings_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER book_embeddings_updated_at
  BEFORE UPDATE ON public.book_embeddings
  FOR EACH ROW EXECUTE FUNCTION update_book_embeddings_timestamp();

-- Done!
-- Next: run `node scripts/generateJinaEmbeddings.mjs` to seed embeddings.
