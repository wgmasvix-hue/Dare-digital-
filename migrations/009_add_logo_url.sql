-- Add logo_url column to institutions table
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS logo_url TEXT;
