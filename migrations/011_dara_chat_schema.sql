-- Migration 011: DARA Chat Schema and Book Table Enhancements

-- 1. Enhance books table for DARA search and recommendations
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS dara_summary TEXT,
ADD COLUMN IF NOT EXISTS featured_priority INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'undergraduate',
ADD COLUMN IF NOT EXISTS resource_type TEXT DEFAULT 'book';

-- Add search_vector if it doesn't exist (aliasing fts or creating new)
-- The edge function expects 'search_vector'
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'books' AND column_name = 'search_vector') THEN
        ALTER TABLE public.books ADD COLUMN search_vector tsvector 
        GENERATED ALWAYS AS (
            to_tsvector('english', coalesce(title, '') || ' ' || 
                                 coalesce(author_names, '') || ' ' || 
                                 coalesce(subject, '') || ' ' || 
                                 coalesce(description, '') || ' ' ||
                                 coalesce(dara_summary, ''))
        ) STORED;
        CREATE INDEX IF NOT EXISTS books_search_vector_idx ON public.books USING GIN (search_vector);
    END IF;
END
$$;

-- 2. DARA Chat Sessions
CREATE TABLE IF NOT EXISTS public.dara_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    institution_id TEXT,
    programme_code TEXT,
    faculty TEXT,
    session_title TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. DARA Chat Messages
CREATE TABLE IF NOT EXISTS public.dara_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.dara_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    input_tokens INTEGER,
    output_tokens INTEGER,
    books_referenced TEXT[], -- Array of book IDs (which are text in our schema)
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. DARA Book Interactions (for analytics and personalization)
CREATE TABLE IF NOT EXISTS public.dara_book_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.dara_sessions(id) ON DELETE SET NULL,
    user_id UUID,
    book_id TEXT, -- references books.id
    interaction TEXT NOT NULL, -- 'recommended', 'clicked', 'read'
    context_query TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable RLS
ALTER TABLE public.dara_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dara_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dara_book_interactions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Sessions: Users can only see and manage their own sessions
CREATE POLICY "Users can manage their own sessions" 
ON public.dara_sessions FOR ALL 
USING (auth.uid() = user_id);

-- Messages: Users can only see and manage messages in their own sessions
CREATE POLICY "Users can manage their own messages" 
ON public.dara_messages FOR ALL 
USING (auth.uid() = user_id);

-- Interactions: Users can see their own interactions
CREATE POLICY "Users can see their own interactions" 
ON public.dara_book_interactions FOR SELECT 
USING (auth.uid() = user_id);

-- Allow the service role (Edge Function) to manage everything
-- (This is usually default for service_role, but explicit is fine)
