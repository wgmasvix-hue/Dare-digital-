-- Create books table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.books (
  id text PRIMARY KEY,
  title text NOT NULL,
  author_names text,
  publisher_name text,
  faculty text,
  subject text,
  cover_image_url text,
  file_url text,
  access_model text DEFAULT 'open_access',
  year_published integer,
  description text,
  license_type text,
  total_downloads integer DEFAULT 0,
  average_rating numeric DEFAULT 0,
  page_count integer,
  format text DEFAULT 'pdf',
  ai_level integer,
  zimche_programme_codes text[],
  is_featured boolean DEFAULT false,
  pillars jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'books' AND policyname = 'Allow public read access on books'
    ) THEN
        CREATE POLICY "Allow public read access on books" ON public.books FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'books' AND policyname = 'Allow authenticated insert on books'
    ) THEN
        CREATE POLICY "Allow authenticated insert on books" ON public.books FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
END
$$;

-- Seed Data

-- OPENSTAX_CURATED
INSERT INTO public.books (id, title, author_names, publisher_name, faculty, subject, cover_image_url, file_url, access_model, year_published, description, license_type, total_downloads, average_rating, page_count, format, is_featured, pillars)
VALUES 
('openstax-math-1', 'Calculus Volume 1', 'Gilbert Strang, Edwin "Jed" Herman', 'OpenStax', 'STEM', 'Mathematics', 'https://assets.openstax.org/oscms-prodcms/media/documents/CalculusVolume1-OP_s81M8t2.pdf_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/CalculusVolume1-OP.pdf', 'open_access', 2016, 'Calculus Volume 1 is designed for the typical two- or three-semester general calculus course.', 'CC BY 4.0', 15000, 4.8, 886, 'pdf', true, '["Teaching", "Research", "Innovation"]'),
('openstax-phys-1', 'University Physics Volume 1', 'Samuel J. Ling, Jeff Sanny, William Moebs', 'OpenStax', 'STEM', 'Physics', 'https://assets.openstax.org/oscms-prodcms/media/documents/UniversityPhysicsVolume1-OP_03Z22eK.pdf_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/UniversityPhysicsVolume1-OP.pdf', 'open_access', 2016, 'University Physics is a three-volume collection for calculus-based physics courses.', 'CC BY 4.0', 12400, 4.7, 992, 'interactive', true, '["Teaching", "Research"]'),
('openstax-bio-1', 'Biology 2e', 'Mary Ann Clark, Matthew Douglas, Jung Choi', 'OpenStax', 'STEM', 'Biology', 'https://assets.openstax.org/oscms-prodcms/media/documents/Biology2e-OP_Z1rK86w.pdf_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/Biology2e-OP.pdf', 'open_access', 2018, 'Biology 2e covers the scope and sequence of a typical two-semester biology course.', 'CC BY 4.0', 18200, 4.9, 1450, 'pdf', true, '["Teaching", "Research", "Community Service"]'),
('openstax-chem-1', 'Chemistry 2e', 'Paul Flowers, Klaus Theopold, Richard Langley', 'OpenStax', 'STEM', 'Chemistry', 'https://assets.openstax.org/oscms-prodcms/media/documents/Chemistry2e-OP_Tj8M3tH.pdf_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/Chemistry2e-OP.pdf', 'open_access', 2019, 'Chemistry 2e meets the scope and sequence of the two-semester general chemistry course.', 'CC BY 4.0', 14300, 4.6, 1246, 'video', true, '["Teaching", "Research"]'),
('openstax-econ-1', 'Principles of Economics 3e', 'David Shapiro, Daniel MacDonald, Steven A. Greenlaw', 'OpenStax', 'Business', 'Economics', 'https://assets.openstax.org/oscms-prodcms/media/documents/PrinciplesofEconomics3e-OP_G0a02q4.pdf_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/PrinciplesofEconomics3e-OP.pdf', 'open_access', 2022, 'Principles of Economics 3e covers most introductory economics courses.', 'CC BY 4.0', 9800, 4.5, 1042, 'audio', true, '["Teaching", "Innovation"]'),
('openstax-soc-1', 'Introduction to Sociology 3e', 'Tonja R. Conerly, Kathleen Holmes, Asha Lal Tamang', 'OpenStax', 'Humanities', 'Sociology', 'https://assets.openstax.org/oscms-prodcms/media/documents/IntroductiontoSociology3e-OP_8E58J3e.pdf_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/IntroductiontoSociology3e-OP.pdf', 'open_access', 2021, 'Introduction to Sociology 3e for a typical one-semester introductory course.', 'CC BY 4.0', 11500, 4.7, 588, 'pdf', false, '[]'),
('openstax-psych-1', 'Psychology 2e', 'Rose M. Spielman, William J. Jenkins, Marilyn D. Lovett', 'OpenStax', 'Humanities', 'Psychology', 'https://assets.openstax.org/oscms-prodcms/media/documents/Psychology2e-OP_8S58J3e.pdf_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/Psychology2e-OP.pdf', 'open_access', 2020, 'Psychology 2e for the single-semester introduction to psychology course.', 'CC BY 4.0', 13200, 4.8, 784, 'pdf'),
('openstax-hist-1', 'U.S. History', 'P. Scott Corbett, Volker Janssen, John M. Lund', 'OpenStax', 'Humanities', 'History', 'https://assets.openstax.org/oscms-prodcms/media/documents/USHistory-OP_8E58J3e.pdf_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/USHistory-OP.pdf', 'open_access', 2014, 'U.S. History covers the chronological history of the United States.', 'CC BY 4.0', 10100, 4.6, 1086, 'pdf')
ON CONFLICT (id) DO NOTHING;

-- OPENSTAX_EXPANDED
INSERT INTO public.books (id, title, author_names, publisher_name, faculty, subject, cover_image_url, file_url, access_model, year_published, description, license_type, total_downloads, average_rating, page_count)
VALUES
('openstax-stats-1', 'Introductory Statistics', 'Barbara Illowsky, Susan Dean', 'OpenStax', 'STEM', 'Statistics', 'https://assets.openstax.org/oscms-prodcms/media/documents/IntroductoryStatistics-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/IntroductoryStatistics-OP.pdf', 'open_access', 2013, 'Introductory Statistics follows scope and sequence requirements of a one-semester introduction to statistics course.', 'CC BY 4.0', 8500, 4.6, 854),
('openstax-precalc-1', 'Precalculus', 'Jay Abramson', 'OpenStax', 'STEM', 'Mathematics', 'https://assets.openstax.org/oscms-prodcms/media/documents/Precalculus-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/Precalculus-OP.pdf', 'open_access', 2014, 'Precalculus is intended for college-level precalculus students.', 'CC BY 4.0', 7200, 4.5, 1156),
('openstax-alg-1', 'College Algebra', 'Jay Abramson', 'OpenStax', 'STEM', 'Mathematics', 'https://assets.openstax.org/oscms-prodcms/media/documents/CollegeAlgebra-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/CollegeAlgebra-OP.pdf', 'open_access', 2015, 'College Algebra provides a comprehensive exploration of algebraic principles.', 'CC BY 4.0', 9100, 4.7, 1076),
('openstax-micro-1', 'Microbiology', 'Nina Parker, Mark Schneegurt', 'OpenStax', 'Health', 'Microbiology', 'https://assets.openstax.org/oscms-prodcms/media/documents/Microbiology-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/Microbiology-OP.pdf', 'open_access', 2016, 'Microbiology covers the scope and sequence requirements for a single-semester microbiology course.', 'CC BY 4.0', 6400, 4.8, 1322),
('openstax-ap-1', 'Anatomy and Physiology', 'J. Gordon Betts, Kelly A. Young', 'OpenStax', 'Health', 'Medicine', 'https://assets.openstax.org/oscms-prodcms/media/documents/AnatomyandPhysiology-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/AnatomyandPhysiology-OP.pdf', 'open_access', 2013, 'Anatomy and Physiology is a dynamic textbook for the two-semester human anatomy and physiology course.', 'CC BY 4.0', 12000, 4.9, 1418),
('openstax-conbio-1', 'Concepts of Biology', 'Samantha Fowler, Rebecca Roush', 'OpenStax', 'STEM', 'Biology', 'https://assets.openstax.org/oscms-prodcms/media/documents/ConceptsofBiology-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/ConceptsofBiology-OP.pdf', 'open_access', 2013, 'Concepts of Biology is designed for the single-semester introduction to biology course.', 'CC BY 4.0', 15000, 4.7, 612),
('openstax-nutri-1', 'Nutrition for Nurses', 'OpenStax', 'OpenStax', 'Health', 'Nursing', 'https://assets.openstax.org/oscms-prodcms/media/documents/NutritionforNurses-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/NutritionforNurses-OP.pdf', 'open_access', 2023, 'Nutrition for Nurses is designed to meet the scope and sequence of an introductory nutrition course for nursing students.', 'CC BY 4.0', 3200, 4.8, 450),
('openstax-acc-1', 'Principles of Accounting', 'Mitchell Franklin, Patty Graybeal', 'OpenStax', 'Business', 'Accounting', 'https://assets.openstax.org/oscms-prodcms/media/documents/PrinciplesofAccountingVolume1-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/PrinciplesofAccountingVolume1-OP.pdf', 'open_access', 2019, 'Principles of Accounting is designed to meet the scope and sequence requirements of a two-semester accounting course.', 'CC BY 4.0', 5600, 4.5, 800),
('openstax-buslaw-1', 'Business Law I Essentials', 'Mirande-Rae Werger', 'OpenStax', 'Law', 'Law', 'https://assets.openstax.org/oscms-prodcms/media/documents/BusinessLawIEssentials-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/BusinessLawIEssentials-OP.pdf', 'open_access', 2019, 'Business Law I Essentials is a brief introductory textbook designed to meet the scope and sequence requirements of courses on Business Law.', 'CC BY 4.0', 4100, 4.4, 350),
('openstax-bus-1', 'Introduction to Business', 'Lawrence J. Gitman, Carl McDaniel', 'OpenStax', 'Business', 'Business', 'https://assets.openstax.org/oscms-prodcms/media/documents/IntroductiontoBusiness-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/IntroductiontoBusiness-OP.pdf', 'open_access', 2018, 'Introduction to Business covers the scope and sequence of most introductory business courses.', 'CC BY 4.0', 7800, 4.6, 650),
('openstax-mgmt-1', 'Principles of Management', 'David S. Bright, Anastasios G. Cortes', 'OpenStax', 'Business', 'Management', 'https://assets.openstax.org/oscms-prodcms/media/documents/PrinciplesofManagement-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/PrinciplesofManagement-OP.pdf', 'open_access', 2019, 'Principles of Management is designed to meet the scope and sequence requirements of the introductory course on management.', 'CC BY 4.0', 6200, 4.7, 550),
('openstax-mktg-1', 'Principles of Marketing', 'OpenStax', 'OpenStax', 'Business', 'Marketing', 'https://assets.openstax.org/oscms-prodcms/media/documents/PrinciplesofMarketing-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/PrinciplesofMarketing-OP.pdf', 'open_access', 2022, 'Principles of Marketing is designed to meet the scope and sequence requirements of the introductory course on marketing.', 'CC BY 4.0', 3500, 4.5, 500),
('openstax-polsci-1', 'Introduction to Political Science', 'Mark Alleman', 'OpenStax', 'Humanities', 'Political Science', 'https://assets.openstax.org/oscms-prodcms/media/documents/IntroductiontoPoliticalScience-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/IntroductiontoPoliticalScience-OP.pdf', 'open_access', 2022, 'Introduction to Political Science provides a comprehensive overview of the field.', 'CC BY 4.0', 2800, 4.6, 600),
('openstax-phil-1', 'Introduction to Philosophy', 'Nathan Smith', 'OpenStax', 'Humanities', 'Philosophy', 'https://assets.openstax.org/oscms-prodcms/media/documents/IntroductiontoPhilosophy-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/IntroductiontoPhilosophy-OP.pdf', 'open_access', 2022, 'Introduction to Philosophy provides a comprehensive overview of the field.', 'CC BY 4.0', 2500, 4.7, 500)
ON CONFLICT (id) DO NOTHING;

-- AGRICULTURE_OER
INSERT INTO public.books (id, title, author_names, publisher_name, faculty, subject, cover_image_url, file_url, access_model, year_published, description, license_type, total_downloads, average_rating, page_count, is_featured, pillars)
VALUES
('fao-csa-1', 'Climate-Smart Agriculture Sourcebook', 'FAO', 'FAO', 'Agriculture', 'Agriculture', 'https://www.fao.org/3/i3325e/i3325e_cover.jpg', 'https://www.fao.org/3/i3325e/i3325e.pdf', 'open_access', 2013, 'The Climate-Smart Agriculture Sourcebook provides guidance on how to implement CSA.', 'CC BY-NC-SA 3.0 IGO', 4500, 4.8, 550, true, '["Research", "Innovation", "Industrialisation"]'),
('fao-soils-1', 'Soils and Pulses', 'FAO', 'FAO', 'Agriculture', 'Soil Science', 'https://www.fao.org/3/i5555e/i5555e_cover.jpg', 'https://www.fao.org/3/i5555e/i5555e.pdf', 'open_access', 2016, 'Soils and Pulses explores the relationship between soil health and pulse production.', 'CC BY-NC-SA 3.0 IGO', 3200, 4.7, 120, false, '[]'),
('fao-postharvest-1', 'Post-Harvest Loss Reduction', 'FAO', 'FAO', 'Agriculture', 'Agricultural Engineering', 'https://www.fao.org/3/i1234e/i1234e_cover.jpg', 'https://www.fao.org/3/i1234e/i1234e.pdf', 'open_access', 2020, 'Guidelines for reducing post-harvest losses in developing countries.', 'CC BY-NC-SA 3.0 IGO', 2800, 4.6, 180),
('fao-fisheries-1', 'State of World Fisheries 2024', 'FAO', 'FAO', 'Agriculture', 'Fisheries', 'https://www.fao.org/3/cc0461en/cc0461en_cover.jpg', 'https://www.fao.org/3/cc0461en/cc0461en.pdf', 'open_access', 2024, 'The latest report on the status of world fisheries and aquaculture.', 'CC BY-NC-SA 3.0 IGO', 1500, 4.9, 250),
('fao-irrigation-1', 'Irrigation Water Management', 'FAO', 'FAO', 'Agriculture', 'Irrigation', 'https://www.fao.org/3/i5678e/i5678e_cover.jpg', 'https://www.fao.org/3/i5678e/i5678e.pdf', 'open_access', 2018, 'Training manual on irrigation water management.', 'CC BY-NC-SA 3.0 IGO', 3900, 4.7, 150),
('fao-food-security-2023', 'The State of Food Security and Nutrition in the World 2023', 'FAO, IFAD, UNICEF, WFP and WHO', 'FAO', 'Agriculture', 'Food Security', 'https://www.fao.org/3/cc3017en/cc3017en_cover.jpg', 'https://www.fao.org/3/cc3017en/cc3017en.pdf', 'open_access', 2023, 'Updates on the global food security status and nutrition.', 'CC BY-NC-SA 3.0 IGO', 5100, 4.8, 300),
('fao-save-grow', 'Save and Grow', 'FAO', 'FAO', 'Agriculture', 'Sustainable Agriculture', 'https://www.fao.org/3/i2215e/i2215e00.jpg', 'https://www.fao.org/3/i2215e/i2215e.pdf', 'open_access', 2011, 'A policymaker''s guide to the sustainable intensification of smallholder crop production.', 'CC BY-NC-SA 3.0 IGO', 4200, 4.7, 110),
('fao-organic-ag', 'Training Manual for Organic Agriculture', 'FAO', 'FAO', 'Agriculture', 'Organic Farming', 'https://www.fao.org/3/i4551e/i4551e_cover.jpg', 'https://www.fao.org/3/i4551e/i4551e.pdf', 'open_access', 2015, 'A comprehensive training manual for organic agriculture.', 'CC BY-NC-SA 3.0 IGO', 3800, 4.6, 220)
ON CONFLICT (id) DO NOTHING;

-- HEALTH_OER
INSERT INTO public.books (id, title, author_names, publisher_name, faculty, subject, cover_image_url, file_url, access_model, year_published, description, license_type, total_downloads, average_rating, page_count, is_featured, pillars)
VALUES
('who-hand-1', 'Hand Hygiene Guidelines', 'WHO', 'WHO', 'Health', 'Public Health', 'https://apps.who.int/iris/bitstream/handle/10665/44102/9789241597906_eng_cover.jpg', 'https://apps.who.int/iris/bitstream/handle/10665/44102/9789241597906_eng.pdf', 'open_access', 2009, 'WHO guidelines on hand hygiene in health care.', 'CC BY-NC-SA 3.0 IGO', 12000, 4.9, 270, true, '["Community Service"]'),
('who-epi-1', 'Basic Epidemiology', 'R. Bonita, R. Beaglehole, T. Kjellström', 'WHO', 'Health', 'Epidemiology', 'https://apps.who.int/iris/bitstream/handle/10665/43541/9241547073_eng_cover.jpg', 'https://apps.who.int/iris/bitstream/handle/10665/43541/9241547073_eng.pdf', 'open_access', 2006, 'Basic Epidemiology provides an introduction to the core principles and methods of epidemiology.', 'CC BY-NC-SA 3.0 IGO', 8500, 4.8, 226, true, '["Teaching", "Research"]'),
('who-tb-2023', 'Global Tuberculosis Report 2023', 'WHO', 'WHO', 'Health', 'Infectious Diseases', 'https://iris.who.int/bitstream/handle/10665/373828/9789240083851-eng.jpg', 'https://iris.who.int/bitstream/handle/10665/373828/9789240083851-eng.pdf', 'open_access', 2023, 'Comprehensive and up-to-date assessment of the TB epidemic, and of progress in prevention, diagnosis and treatment.', 'CC BY-NC-SA 3.0 IGO', 6700, 4.8, 350),
('who-malaria-2023', 'World Malaria Report 2023', 'WHO', 'WHO', 'Health', 'Infectious Diseases', 'https://iris.who.int/bitstream/handle/10665/374472/9789240086173-eng.jpg', 'https://iris.who.int/bitstream/handle/10665/374472/9789240086173-eng.pdf', 'open_access', 2023, 'Provides a comprehensive update on global and regional malaria data and trends.', 'CC BY-NC-SA 3.0 IGO', 5400, 4.7, 300),
('who-child-care', 'Pocket Book of Hospital Care for Children', 'WHO', 'WHO', 'Health', 'Pediatrics', 'https://iris.who.int/bitstream/handle/10665/81170/9789241548373_eng.jpg', 'https://iris.who.int/bitstream/handle/10665/81170/9789241548373_eng.pdf', 'open_access', 2013, 'Guidelines for the management of common childhood illnesses.', 'CC BY-NC-SA 3.0 IGO', 9200, 4.9, 438)
ON CONFLICT (id) DO NOTHING;

-- ENGINEERING_OER
INSERT INTO public.books (id, title, author_names, publisher_name, faculty, subject, cover_image_url, file_url, access_model, year_published, description, license_type, total_downloads, average_rating, page_count)
VALUES
('openstax-phys-2', 'University Physics Volume 2', 'Samuel J. Ling, Jeff Sanny, William Moebs', 'OpenStax', 'Engineering', 'Physics', 'https://assets.openstax.org/oscms-prodcms/media/documents/UniversityPhysicsVolume2-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/UniversityPhysicsVolume2-OP.pdf', 'open_access', 2016, 'University Physics is a three-volume collection for calculus-based physics courses.', 'CC BY 4.0', 9500, 4.7, 800),
('openstax-phys-3', 'University Physics Volume 3', 'Samuel J. Ling, Jeff Sanny, William Moebs', 'OpenStax', 'Engineering', 'Physics', 'https://assets.openstax.org/oscms-prodcms/media/documents/UniversityPhysicsVolume3-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/UniversityPhysicsVolume3-OP.pdf', 'open_access', 2016, 'University Physics is a three-volume collection for calculus-based physics courses.', 'CC BY 4.0', 8200, 4.6, 850),
('openstax-orgchem-1', 'Organic Chemistry', 'John McMurry', 'OpenStax', 'Engineering', 'Chemistry', 'https://assets.openstax.org/oscms-prodcms/media/documents/OrganicChemistry-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/OrganicChemistry-OP.pdf', 'open_access', 2023, 'Organic Chemistry provides a comprehensive overview of the field.', 'CC BY 4.0', 4500, 4.8, 1200),
('rice-elec-eng-1', 'Fundamentals of Electrical Engineering I', 'Don Johnson', 'Rice University', 'Engineering', 'Electrical Engineering', 'https://picsum.photos/seed/elec-eng/400/600', 'https://scholarship.rice.edu/bitstream/handle/1911/19171/FundElecEng.pdf', 'open_access', 2016, 'The course focuses on the creation, manipulation, transmission, and reception of information by electronic means.', 'CC BY 4.0', 3100, 4.5, 350)
ON CONFLICT (id) DO NOTHING;

-- EDUCATION_OER
INSERT INTO public.books (id, title, author_names, publisher_name, faculty, subject, cover_image_url, file_url, access_model, year_published, description, license_type, total_downloads, average_rating, page_count)
VALUES
('openstax-colsucc-1', 'College Success', 'Amy Baldwin', 'OpenStax', 'Education', 'Education', 'https://assets.openstax.org/oscms-prodcms/media/documents/CollegeSuccess-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/CollegeSuccess-OP.pdf', 'open_access', 2020, 'College Success is a comprehensive and contemporary resource that serves as a guide for students.', 'CC BY 4.0', 5200, 4.7, 400),
('openstax-lifespan-1', 'Lifespan Development', 'Rose M. Spielman', 'OpenStax', 'Education', 'Psychology', 'https://assets.openstax.org/oscms-prodcms/media/documents/LifespanDevelopment-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/LifespanDevelopment-OP.pdf', 'open_access', 2023, 'Lifespan Development provides a comprehensive overview of the field.', 'CC BY 4.0', 3100, 4.6, 650),
('openstax-org-behavior', 'Organizational Behavior', 'J. Stewart Black, David S. Bright', 'OpenStax', 'Business', 'Management', 'https://assets.openstax.org/oscms-prodcms/media/documents/OrganizationalBehavior-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/OrganizationalBehavior-OP.pdf', 'open_access', 2019, 'Organizational Behavior is designed to meet the scope and sequence requirements of the introductory course on organizational behavior.', 'CC BY 4.0', 4800, 4.7, 700),
('openstax-bus-ethics', 'Business Ethics', 'Stephen M. Byars, Kurt Stanberry', 'OpenStax', 'Business', 'Business', 'https://assets.openstax.org/oscms-prodcms/media/documents/BusinessEthics-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/BusinessEthics-OP.pdf', 'open_access', 2018, 'Business Ethics is designed to meet the scope and sequence requirements of the single-semester business ethics course.', 'CC BY 4.0', 3900, 4.6, 450),
('openstax-entrepreneurship', 'Entrepreneurship', 'David S. Bright, Anastasios G. Cortes', 'OpenStax', 'Business', 'Business', 'https://assets.openstax.org/oscms-prodcms/media/documents/Entrepreneurship-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/Entrepreneurship-OP.pdf', 'open_access', 2020, 'Entrepreneurship covers the scope and sequence of most introductory entrepreneurship courses.', 'CC BY 4.0', 5500, 4.8, 600),
('openstax-am-gov', 'American Government 3e', 'Glen Krutz, Sylvie Waskiewicz', 'OpenStax', 'Humanities', 'Political Science', 'https://assets.openstax.org/oscms-prodcms/media/documents/AmericanGovernment3e-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/AmericanGovernment3e-OP.pdf', 'open_access', 2021, 'American Government 3e aligns with the topics and objectives of many government courses.', 'CC BY 4.0', 7100, 4.5, 600),
('openstax-writing-guide', 'Writing Guide with Handbook', 'Michelle Bachelor Robinson, Maria Jerskey', 'OpenStax', 'Humanities', 'Writing', 'https://assets.openstax.org/oscms-prodcms/media/documents/WritingGuidewithHandbook-OP_cover.jpg', 'https://assets.openstax.org/oscms-prodcms/media/documents/WritingGuidewithHandbook-OP.pdf', 'open_access', 2022, 'Writing Guide with Handbook aligns to the goals of first-year writing courses.', 'CC BY 4.0', 4300, 4.7, 550)
ON CONFLICT (id) DO NOTHING;

-- ANDREWS_OER
INSERT INTO public.books (id, title, author_names, publisher_name, faculty, subject, cover_image_url, file_url, access_model, year_published, description, license_type, total_downloads, average_rating, page_count)
VALUES
('andrews-rev-1', 'Revelation of Jesus Christ', 'Ranko Stefanovic', 'Andrews University Press', 'Humanities', 'Theology', 'https://picsum.photos/seed/revelation/400/600', '#', 'open_access', 2002, 'A comprehensive verse-by-verse commentary on the book of Revelation, providing a text-focused and Christ-centered approach to biblical exegesis.', 'All Rights Reserved (Andrews University Press)', 1200, 4.9, 670)
ON CONFLICT (id) DO NOTHING;

-- AI_OER
INSERT INTO public.books (id, title, author_names, publisher_name, faculty, subject, cover_image_url, file_url, access_model, year_published, description, license_type, total_downloads, average_rating, page_count, ai_level, zimche_programme_codes, is_featured, pillars)
VALUES
('ai-poole-1', 'Artificial Intelligence: Foundations of Computational Agents', 'David L. Poole, Alan K. Mackworth', 'Cambridge University Press (Open Edition)', 'STEM', 'Artificial Intelligence', 'https://picsum.photos/seed/ai-foundations/400/600', 'https://artint.info/2e/html/ArtInt2e.html', 'open_access', 2017, 'Comprehensive textbook on the science of artificial intelligence, focusing on the design of intelligent agents. Maps to BSC-AI-001, BSC-CS-001.', 'CC BY-NC-ND 4.0', 5400, 4.8, 820, 2, '{"BSC-AI-001", "BSC-CS-001"}', true, '["Teaching", "Research", "Innovation"]'),
('ai-nielsen-1', 'Neural Networks and Deep Learning', 'Michael Nielsen', 'Determination Press', 'STEM', 'Deep Learning', 'https://picsum.photos/seed/neural-nets/400/600', 'http://neuralnetworksanddeeplearning.com/', 'open_access', 2015, 'Master the core concepts of neural networks and deep learning. Maps to BSC-AI-001, BSC-CS-001.', 'CC BY-NC 3.0', 8900, 4.9, 210, 2, '{"BSC-AI-001", "BSC-CS-001"}', true, '["Research", "Innovation"]'),
('ai-goodfellow-1', 'Deep Learning', 'Ian Goodfellow, Yoshua Bengio, Aaron Courville', 'MIT Press (Online Edition)', 'STEM', 'Deep Learning', 'https://picsum.photos/seed/deep-learning/400/600', 'https://www.deeplearningbook.org/', 'open_access', 2016, 'The definitive textbook on deep learning, covering mathematical foundations and advanced research topics. Maps to BSC-AI-001.', 'Free Online Access', 15000, 4.9, 800, 3, '{"BSC-AI-001"}', true, '["Research", "Innovation", "Industrialisation"]')
ON CONFLICT (id) DO NOTHING;

-- AI_PRIORITY_OER
INSERT INTO public.books (id, title, author_names, publisher_name, faculty, subject, cover_image_url, file_url, access_model, year_published, description, license_type, total_downloads, average_rating, ai_level, zimche_programme_codes)
VALUES
('ai-think-python', 'Think Python 2e', 'Allen Downey', 'Green Tea Press', 'STEM', 'Artificial Intelligence', 'https://picsum.photos/seed/python/400/600', 'https://greenteapress.com/thinkpython2/thinkpython2.pdf', 'open_access', 2015, 'Entry point for every AI/CS student. Suitable for all 5 programmes and 1,530 students. Covers basic Python programming, data structures, and algorithms.', 'CC BY-NC 4.0', 1530, 4.7, 1, '{"BSC-AI-001", "BSC-CS-001", "DIP-DS-001", "HND-ICT-001", "BENG-COMP-001"}'),
('ai-data-science-handbook', 'Python Data Science Handbook', 'Jake VanderPlas', 'O''Reilly (Open Edition)', 'STEM', 'Data Science', 'https://picsum.photos/seed/datascience/400/600', 'https://jakevdp.github.io/PythonDataScienceHandbook/PythonDataScienceHandbook.pdf', 'open_access', 2016, 'Essential guide to data science in Python. Covers NumPy, Pandas, Matplotlib, and Scikit-Learn. Maps to BSC-CS-001, DIP-DS-001, HND-ICT-001.', 'CC BY-NC-ND', 940, 4.8, 2, '{"BSC-CS-001", "DIP-DS-001", "HND-ICT-001"}'),
('ai-islr', 'Introduction to Statistical Learning 2e', 'James, Witten, Hastie, Tibshirani', 'Springer (Open Edition)', 'STEM', 'Machine Learning', 'https://picsum.photos/seed/statlearning/400/600', 'https://www.statlearning.com/s/ISLR_Print2.pdf', 'open_access', 2021, 'Core ML textbook. Covers linear regression, classification, resampling methods, and tree-based methods. Maps to BSC-AI-001, BSC-CS-001.', 'CC BY-NC 4.0', 660, 4.9, 2, '{"BSC-AI-001", "BSC-CS-001"}')
ON CONFLICT (id) DO NOTHING;

-- ZIMBABWEAN_AFRICAN_RESOURCES
INSERT INTO public.books (id, title, author_names, publisher_name, faculty, subject, cover_image_url, file_url, access_model, year_published, description, license_type, total_downloads, average_rating, is_featured, pillars, is_zimbabwean, is_african)
VALUES
('zim-edu-50', 'Education 5.0: Transforming Higher Education in Zimbabwe', 'Ministry of Higher and Tertiary Education', 'Government of Zimbabwe', 'Education', 'Education', 'https://picsum.photos/seed/zim-edu/400/600', '#', 'open_access', 2019, 'The official policy document for Education 5.0 in Zimbabwe, focusing on Teaching, Research, Community Service, Innovation, and Industrialisation.', 'Public Domain', 5000, 4.9, true, '["Teaching", "Research", "Community Service", "Innovation", "Industrialisation"]', true, true),
('af-trade-1', 'The African Continental Free Trade Area: A Primer', 'UNECA', 'United Nations', 'Business', 'Economics', 'https://picsum.photos/seed/af-trade/400/600', 'https://www.uneca.org/sites/default/files/PublicationFiles/afcfta_primer_en.pdf', 'open_access', 2020, 'A comprehensive guide to the AfCFTA and its implications for African economies.', 'CC BY 3.0 IGO', 3500, 4.7, true, '["Research", "Innovation"]', false, true),
('zim-history-1', 'A History of Zimbabwe', 'Alois S. Mlambo', 'Cambridge University Press (Open Access)', 'Humanities', 'History', 'https://picsum.photos/seed/zim-history/400/600', '#', 'open_access', 2014, 'A comprehensive history of Zimbabwe from the pre-colonial era to the present.', 'CC BY-NC-ND 4.0', 4200, 4.8, true, '["Teaching", "Research"]', true, true);
ON CONFLICT (id) DO NOTHING;
