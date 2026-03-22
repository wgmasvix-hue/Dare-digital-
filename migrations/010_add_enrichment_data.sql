-- Add enrichment_data column to books table to store DARA AI metadata
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS enrichment_data JSONB DEFAULT '{}'::jsonb;

-- Add index for faster JSONB queries
CREATE INDEX IF NOT EXISTS books_enrichment_data_idx ON public.books USING GIN (enrichment_data);
