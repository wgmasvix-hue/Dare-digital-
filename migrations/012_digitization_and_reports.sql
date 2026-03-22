-- Migration 012: Digitization and Archival Reports
-- This migration adds tables for digitization requests and archival reports

-- 1. Digitization Requests
CREATE TABLE IF NOT EXISTS public.digitization_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    resource_title TEXT NOT NULL,
    author TEXT,
    resource_type TEXT NOT NULL,
    description TEXT,
    urgency TEXT DEFAULT 'Normal',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Archival Reports
CREATE TABLE IF NOT EXISTS public.archival_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Archival Report', 'Policy Report', 'Assignment', etc.
    description TEXT,
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.digitization_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archival_reports ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Digitization Requests: Users can only see and manage their own requests
CREATE POLICY "Users can manage their own digitization requests" 
ON public.digitization_requests FOR ALL 
USING (auth.uid() = user_id);

-- Archival Reports: Everyone can read reports
CREATE POLICY "Anyone can read archival reports" 
ON public.archival_reports FOR SELECT 
USING (true);

-- Allow admins to manage reports (using the logic from previous migrations if available, or simple check)
-- For now, we'll assume a 'role' column in profiles or similar
-- If no role exists, we can use a service role for management
