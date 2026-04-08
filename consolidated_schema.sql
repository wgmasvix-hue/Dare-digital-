-- DARE Consolidated Schema
-- Unified Knowledge Platform for Zimbabwe

-- 1. Books Table (Core Digital Library)
-- This table is already partially defined in supabase_setup.sql, 
-- here we ensure it matches the unified requirements.
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT,
    description TEXT,
    subject TEXT,
    level TEXT, -- e.g., 'Form 1', 'University', 'Diploma'
    source TEXT DEFAULT 'DARE' CHECK (source IN ('DARE', 'KOHA', 'OPEN')),
    url TEXT,
    cover_image_url TEXT,
    isbn TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Open Resources Table (DOAJ, DOAB, LibreTexts)
CREATE TABLE IF NOT EXISTS public.open_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    category TEXT, -- e.g., 'Journal', 'Textbook', 'Article'
    provider TEXT, -- e.g., 'DOAJ', 'LibreTexts'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Koha Books Cache Layer (Physical Library)
CREATE TABLE IF NOT EXISTS public.koha_books (
    id TEXT PRIMARY KEY, -- Koha biblionumber
    title TEXT NOT NULL,
    author TEXT,
    isbn TEXT,
    availability JSONB, -- Detailed availability info
    raw_json JSONB, -- Full response from Koha API
    last_synced TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Profiles Table (User Metadata)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    institution_id UUID, -- References institutions if available
    faculty TEXT,
    programme TEXT,
    role TEXT DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Learning Activity (User Progress & AI Usage)
CREATE TABLE IF NOT EXISTS public.learning_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic TEXT,
    score INTEGER,
    progress INTEGER DEFAULT 0, -- 0 to 100
    activity_type TEXT, -- 'quiz', 'reading', 'ai_explanation'
    metadata JSONB, -- Additional context
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- 6. Security: Row Level Security (RLS)
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.koha_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public Read Access
CREATE POLICY "Public Read Access for Books" ON public.books FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Open Resources" ON public.open_resources FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Koha Cache" ON public.koha_books FOR SELECT USING (true);
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

-- Authenticated Access
CREATE POLICY "Users can manage their own learning activity" 
ON public.learning_activity FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 7. Triggers & Functions
-- Profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Unified Search Function
CREATE OR REPLACE FUNCTION search_publications(
  p_query TEXT DEFAULT NULL,
  p_faculty TEXT DEFAULT NULL,
  p_level TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 24,
  p_offset INTEGER DEFAULT 0
)
RETURNS SETOF public.books
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.books
  WHERE (p_query IS NULL OR p_query = '' OR to_tsvector('english', title || ' ' || coalesce(author, '')) @@ plainto_tsquery('english', p_query))
    AND (p_faculty IS NULL OR p_faculty = 'All' OR subject ILIKE '%' || p_faculty || '%')
    AND (p_level IS NULL OR p_level = 'All' OR level = p_level)
  ORDER BY created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- 8. Search Optimization
-- Full-text search index for books
CREATE INDEX IF NOT EXISTS books_search_idx ON public.books USING GIN (to_tsvector('english', title || ' ' || coalesce(author, '') || ' ' || coalesce(description, '')));
CREATE INDEX IF NOT EXISTS open_resources_search_idx ON public.open_resources USING GIN (to_tsvector('english', name || ' ' || coalesce(description, '')));
CREATE INDEX IF NOT EXISTS koha_books_search_idx ON public.koha_books USING GIN (to_tsvector('english', title || ' ' || coalesce(author, '')));
