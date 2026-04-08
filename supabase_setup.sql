-- Supabase Setup Script for Dare Digital Library AI Section

-- 1. Storage Bucket Setup
insert into storage.buckets (id, name, public) 
values ('books', 'books', true)
on conflict (id) do nothing;

-- 2. Storage Policies
-- Allow anyone to view book files (PDFs and Covers)
create policy "Public Access" 
on storage.objects for select 
using ( bucket_id = 'books' );

-- Allow authenticated users to upload to the books bucket
create policy "Authenticated Upload" 
on storage.objects for insert 
with check ( bucket_id = 'books' AND auth.role() = 'authenticated' );

-- 3. Database Schema Updates
-- Ensure the books table supports all library features
alter table public.books 
add column if not exists title text,
add column if not exists author_names text,
add column if not exists publisher_name text,
add column if not exists year_published integer,
add column if not exists description text,
add column if not exists subject text,
add column if not exists faculty text,
add column if not exists level text, -- e.g., 'Diploma', 'Degree'
add column if not exists file_url text,
add column if not exists cover_image_url text,
add column if not exists format text default 'pdf', -- 'pdf', 'video', 'audio', 'interactive'
add column if not exists access_model text default 'dare_access', -- 'dare_access', 'licensed', 'free'
add column if not exists isbn text,
add column if not exists is_zimbabwean boolean default false,
add column if not exists is_african boolean default false,
add column if not exists total_reads integer default 0,
add column if not exists average_rating numeric(3, 2) default 0.0,
add column if not exists page_count integer,
add column if not exists learning_objectives jsonb default '[]'::jsonb,
add column if not exists status text default 'published',
add column if not exists creator_id uuid references auth.users(id),
add column if not exists created_at timestamptz default now(),
add column if not exists updated_at timestamptz default now(),
add column if not exists is_featured boolean default false,
add column if not exists pillars jsonb default '[]'::jsonb,
add column if not exists zimche_programme_codes text[] default '{}'::text[],
add column if not exists dara_summary text,
add column if not exists ai_summary text,
add column if not exists ai_keywords text[],
add column if not exists ai_topics text[],
add column if not exists ai_difficulty text,
add column if not exists featured_priority integer default 0,
add column if not exists difficulty_level text default 'undergraduate',
add column if not exists resource_type text default 'book',
add column if not exists language text default 'English',
add column if not exists source text default 'Dare Library',
add column if not exists institution_id text,
add column if not exists ddc_code text;

-- 4. Full Text Search Setup
-- Add a generated column for full text search
alter table public.books 
add column if not exists search_vector tsvector 
generated always as (
  to_tsvector('english', coalesce(title, '') || ' ' || 
                         coalesce(author_names, '') || ' ' || 
                         coalesce(subject, '') || ' ' || 
                         coalesce(description, '') || ' ' ||
                         coalesce(source, '') || ' ' ||
                         coalesce(dara_summary, ''))
) stored;

-- Create an index for fast search
create index if not exists books_search_vector_idx on public.books using gin (search_vector);

-- 5. Enable RLS on books table if not already enabled
alter table public.books enable row level security;

-- 6. Policies for books table
-- Drop existing policies to ensure clean slate or update them
drop policy if exists "Allow public read access on books" on public.books;
drop policy if exists "Allow authenticated insert on books" on public.books;
drop policy if exists "Allow creators to update their own books" on public.books;
drop policy if exists "Allow anon insert on books" on public.books;

create policy "Allow public read access on books"
on public.books for select
using (true);

-- Allow authenticated users to insert
create policy "Allow authenticated insert on books"
on public.books for insert
with check (auth.role() = 'authenticated');

-- Allow anon to insert (for ingestion scripts - disable in production)
create policy "Allow anon insert on books"
on public.books for insert
with check (true);

-- Allow authenticated users to update
create policy "Allow authenticated update on books"
on public.books for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Allow creators to update their own books"
on public.books for update
using (auth.uid() = creator_id)
with check (auth.uid() = creator_id);

-- 7. Triggers
-- Auto-update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

drop trigger if exists update_books_updated_at on public.books;
create trigger update_books_updated_at
before update on public.books
for each row
execute procedure update_updated_at_column();

-- 8. DARA Chat Schema
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

CREATE TABLE IF NOT EXISTS public.dara_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.dara_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    input_tokens INTEGER,
    output_tokens INTEGER,
    books_referenced TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dara_book_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.dara_sessions(id) ON DELETE SET NULL,
    user_id UUID,
    book_id TEXT,
    interaction TEXT NOT NULL,
    context_query TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dara_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dara_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dara_book_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own sessions" ON public.dara_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own messages" ON public.dara_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can see their own interactions" ON public.dara_book_interactions FOR SELECT USING (auth.uid() = user_id);

-- 9. Reading Sessions Table
CREATE TABLE IF NOT EXISTS public.reading_sessions (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id TEXT NOT NULL,
    last_read_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, book_id)
);

-- 10. Highlights and Notes
CREATE TABLE IF NOT EXISTS public.book_highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id TEXT NOT NULL,
    content TEXT NOT NULL,
    page_number INTEGER,
    color TEXT DEFAULT 'yellow',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.book_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id TEXT NOT NULL,
    content TEXT NOT NULL,
    page_number INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reading sessions" ON public.reading_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own highlights" ON public.book_highlights FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own notes" ON public.book_notes FOR ALL USING (auth.uid() = user_id);

-- 11. Profiles and Institutions
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Vector Search Setup
-- Enable vector extension
create extension if not exists vector;

-- Create book_embeddings table
create table if not exists public.book_embeddings (
  id uuid primary key default gen_random_uuid(),
  book_id text, -- Using text to match existing book_id usage in other tables
  embedding vector(1536), -- Dimension for text-embedding-3-small
  content text, -- Store the text that was embedded for context
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.book_embeddings enable row level security;

-- Policies
create policy "Allow public read access on book_embeddings"
on public.book_embeddings for select
using (true);

-- Create a function for vector search
create or replace function match_books (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id text,
  title text,
  author_names text,
  description text,
  cover_image_url text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    b.id,
    b.title,
    b.author_names,
    b.description,
    b.cover_image_url,
    1 - (be.embedding <=> query_embedding) as similarity
  from public.book_embeddings be
  join public.books b on be.book_id = b.id
  where 1 - (be.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
end;
$$;

-- 13. Author Portal Tables
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    items_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    book_id TEXT NOT NULL,
    added_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(collection_id, book_id)
);

CREATE TABLE IF NOT EXISTS public.royalties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- e.g., 'October 2023'
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing')),
    currency TEXT DEFAULT 'USD',
    payout_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.author_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon_name TEXT, -- Lucide icon name
    url TEXT,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.royalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.author_resources ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own collections" ON public.collections FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "Users can manage their own collection items" ON public.collection_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND creator_id = auth.uid())
);
CREATE POLICY "Users can see their own royalties" ON public.royalties FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Author resources are viewable by everyone" ON public.author_resources FOR SELECT USING (true);

-- Seed Author Resources
INSERT INTO public.author_resources (title, description, icon_name, url) VALUES
('Guide to Open Licensing', 'Understanding CC BY, NC, and ND licenses for your work.', 'ShieldCheck', '/help/licensing'),
('Writing for Digital Accessibility', 'Best practices for screen readers and low-bandwidth users.', 'FileText', '/help/accessibility'),
('ZIMCHE Curriculum Alignment', 'How to map your content to local degree requirements.', 'GraduationCap', '/help/curriculum')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    faculty TEXT,
    programme TEXT,
    role TEXT DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public institutions are viewable by everyone" ON public.institutions FOR SELECT USING (true);
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger for profile creation on signup
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

-- Function to increment publication views
CREATE OR REPLACE FUNCTION increment_publication_views(pub_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.books
  SET total_reads = coalesce(total_reads, 0) + 1
  WHERE id::text = pub_id;
END;
$$;

-- Function for advanced search with full-text search
CREATE OR REPLACE FUNCTION search_publications(
  p_query TEXT DEFAULT NULL,
  p_faculty TEXT DEFAULT NULL,
  p_level TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 24,
  p_offset INTEGER DEFAULT 0,
  p_sort TEXT DEFAULT 'title'
)
RETURNS SETOF public.books
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.books
  WHERE status = 'published'
    AND (p_query IS NULL OR p_query = '' OR search_vector @@ plainto_tsquery('english', p_query))
    AND (
    p_faculty IS NULL OR 
    p_faculty = 'All' OR 
    faculty ILIKE '%' || p_faculty || '%' OR 
    p_faculty ILIKE '%' || faculty || '%' OR
    subject ILIKE '%' || p_faculty || '%' OR
    p_faculty ILIKE '%' || subject || '%' OR
    -- Also check against the first word of the faculty (e.g., "Agriculture" matches "Agriculture & Environmental")
    faculty ILIKE '%' || split_part(p_faculty, ' ', 1) || '%' OR
    subject ILIKE '%' || split_part(p_faculty, ' ', 1) || '%'
  )
    AND (p_level IS NULL OR p_level = 'All' OR level = p_level)
  ORDER BY 
    CASE 
      WHEN p_sort = 'relevance' AND p_query IS NOT NULL AND p_query != '' 
      THEN ts_rank(search_vector, plainto_tsquery('english', p_query)) 
      ELSE 0 
    END DESC,
    CASE WHEN p_sort = 'newest' THEN created_at END DESC,
    CASE WHEN p_sort = 'oldest' THEN created_at END ASC,
    CASE WHEN p_sort = 'title' THEN title END ASC,
    CASE WHEN p_sort = 'rating' THEN average_rating END DESC,
    CASE WHEN p_sort = 'reads' THEN total_reads END DESC,
    title ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
