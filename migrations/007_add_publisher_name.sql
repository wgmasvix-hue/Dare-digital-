-- Add publisher_name column to books table
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS publisher_name TEXT;

-- Update search_publications function to prioritize publisher_name
CREATE OR REPLACE FUNCTION public.search_publications(
  search_query text,
  p_faculty text,
  p_level text,
  p_limit int,
  p_offset int
)
RETURNS TABLE (
  id uuid,
  title text,
  author_names text,
  publisher_name text,
  faculty text,
  cover_path text,
  access_model text,
  year_published int,
  average_rating numeric,
  total_downloads int,
  page_count int,
  description text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.title,
    COALESCE(p.full_name, 'Unknown Author') as author_names,
    -- Prioritize explicit publisher_name, then institution name, then default
    COALESCE(b.publisher_name, i.institution_name, 'Dare Digital Library') as publisher_name,
    COALESCE(b.subject, 'General') as faculty,
    b.cover_image_url as cover_path,
    CASE
      WHEN b.institution_id IS NULL THEN 'dare_access'
      ELSE 'licensed'
    END as access_model,
    EXTRACT(YEAR FROM b.created_at)::int as year_published,
    0.0::numeric as average_rating,
    b.total_reads as total_downloads,
    b.page_count,
    b.description
  FROM public.books b
  LEFT JOIN public.profiles p ON b.creator_id = p.id
  LEFT JOIN public.institutions i ON b.institution_id = i.id
  WHERE
    (search_query IS NULL OR b.title ILIKE '%' || search_query || '%')
    AND (p_faculty IS NULL OR b.subject ILIKE '%' || p_faculty || '%')
    AND (b.status = 'published')
  ORDER BY b.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
