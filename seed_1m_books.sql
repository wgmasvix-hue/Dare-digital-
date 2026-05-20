-- Seeding 1,000,000 mock books into the public.books table
-- This script uses generate_series for maximum efficiency.
-- Note: Running this via the Supabase SQL Editor should take only a few seconds.

DO $$
BEGIN
    INSERT INTO public.books (title, author, description, subject, level, source)
    SELECT 
        'Mock Book: ' || i,
        'Author ' || (i % 1000),
        'This is a comprehensive mock description for book ' || i || '. It covers all the necessary topics in ' || 
        CASE (i % 5)
            WHEN 0 THEN 'Science'
            WHEN 1 THEN 'Mathematics'
            WHEN 2 THEN 'History'
            WHEN 3 THEN 'Literature'
            ELSE 'Technology'
        END || ' and is designed for students at the ' || 
        CASE (i % 4)
            WHEN 0 THEN 'University'
            WHEN 1 THEN 'Diploma'
            WHEN 2 THEN 'High School'
            ELSE 'Primary'
        END || ' level.',
        CASE (i % 5)
            WHEN 0 THEN 'Science'
            WHEN 1 THEN 'Mathematics'
            WHEN 2 THEN 'History'
            WHEN 3 THEN 'Literature'
            ELSE 'Technology'
        END,
        CASE (i % 4)
            WHEN 0 THEN 'University'
            WHEN 1 THEN 'Diploma'
            WHEN 2 THEN 'High School'
            ELSE 'Primary'
        END,
        'DARE'
    FROM generate_series(1, 1000000) AS s(i);
END $$;
