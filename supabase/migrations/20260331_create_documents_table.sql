-- Create documents table for DSpace integration
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY,
    dspace_handle TEXT,
    title TEXT NOT NULL,
    creator TEXT,
    description TEXT,
    document_type TEXT,
    zimche_nqf_level TEXT,
    institution TEXT,
    synced_from_dspace_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add full-text search vector
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS title_description_fts tsvector 
GENERATED ALWAYS AS (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
) STORED;

-- Create index for full-text search
CREATE INDEX IF NOT EXISTS documents_fts_idx ON public.documents USING GIN (title_description_fts);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access on documents"
ON public.documents FOR SELECT
USING (true);

CREATE POLICY "Allow service role to manage documents"
ON public.documents FOR ALL
USING (true)
WITH CHECK (true);
