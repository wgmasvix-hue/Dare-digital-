/**
 * Shared book transformation utility.
 * Normalizes raw Supabase `books` rows into the shape expected by BookCard.
 * This is the SINGLE SOURCE OF TRUTH for the mapping.
 */

export function transformBook(book) {
  if (!book) return null;

  return {
    ...book,
    id: book.id,
    title: book.title,
    author_names:
      book.author_names ||
      book.creator?.full_name ||
      'Unknown Author',
    // Handle array or string for authors if needed, but keeping as string or array based on usage
    authors: book.author_names ? String(book.author_names).split(',').map(a => a.trim()) : ["Unknown"], 
    publisher_name:
      book.publisher_name ||
      book.institution?.institution_name ||
      'Dare Digital Library',
    cover_path: book.cover_image_url || book.cover_path || null,
    cover_image_url: book.cover_image_url || book.cover_path || null,
    access_model: (book.access_model === 'public_domain' || book.id?.startsWith('gutenberg-') || book.id?.startsWith('openstax-')) 
      ? 'open_access' 
      : (book.access_model || (book.institution_id ? 'licensed' : 'dare_access')),
    isOpenAccess: (book.access_model === 'public_domain' || book.id?.startsWith('gutenberg-') || book.id?.startsWith('openstax-')) || (book.access_model || (book.institution_id ? 'licensed' : 'dare_access')) === 'dare_access',
    year: 
      book.year_published ||
      (book.publication_year) ||
      (book.created_at ? new Date(book.created_at).getFullYear() : null) || 2023,
    year_published:
      book.year_published ||
      (book.publication_year) ||
      (book.created_at ? new Date(book.created_at).getFullYear() : null),
    total_downloads: book.total_downloads || book.total_reads || 0,
    citations: book.total_reads || 0,
    average_rating: book.average_rating || 0,
    page_count: book.page_count || null,
    is_featured: book.is_featured || book.featured || false,
    faculty: book.faculty || book.subject || 'General',
    domain: mapFacultyToDomain(book.faculty, book.subject), // Ensure domain is mapped
    subject: book.subject || 'General',
    format: book.format || 'pdf', // Default to PDF
    learning_objectives: book.learning_objectives || [],
    description: book.description || book.abstract || "No description available.",
    abstract: book.description || book.abstract || "No description available.",
    isbn: book.isbn || null,
    isZimbabwe: book.is_zimbabwean || false,
    isAfrican: book.is_african || false,
    isPeerReviewed: true, // Defaulting to true for now as per previous mock data logic, or add column if needed
    source: book.publisher_name || "External",
    skills: ["Critical Thinking"], // Default skills if not in DB
    file_url: book.file_url,
    ai_level: book.ai_level || null,
    zimche_programme_codes: book.zimche_programme_codes || [],
    pillars: book.pillars || [],
    dara_summary: book.dara_summary || null,
    ai_summary: book.ai_summary || null,
    ai_keywords: book.ai_keywords || [],
    ai_topics: book.ai_topics || [],
    ai_difficulty: book.ai_difficulty || null
  };
}

// Helper to map OER faculty/subject to Domains (moved from DareLibrary.jsx to be shared)
const mapFacultyToDomain = (faculty, subject) => {
  const f = (faculty || "").toLowerCase();
  const s = (subject || "").toLowerCase();
  
  if (f.includes("education")) return "D1";
  if (f.includes("agriculture") || s.includes("agriculture")) return "D4";
  if (f.includes("health") || f.includes("medicine") || s.includes("nursing")) return "D9";
  if (f.includes("business") || f.includes("law") || s.includes("economics")) return "D7";
  if (f.includes("engineering") || s.includes("physics") || s.includes("chemistry")) return "D6"; // Or D8 for ICT
  if (s.includes("computer") || s.includes("ai") || s.includes("data") || s.includes("technology")) return "D8";
  if (f.includes("stem")) return "D10"; // General STEM -> Research/Academic
  return "D10"; // Default
};

export function transformBooks(books) {
  if (!Array.isArray(books)) return [];
  return books.map(transformBook).filter(Boolean);
}

export const BOOK_SELECT = '*';

export const OPENSTAX_CURATED = [
  {
    id: 'openstax-math-1',
    title: 'Calculus Volume 1',
    author_names: 'Gilbert Strang, Edwin "Jed" Herman',
    publisher_name: 'OpenStax',
    faculty: 'STEM',
    subject: 'Mathematics',
    cover_image_url: 'https://assets.openstax.org/oscms-prodcms/media/documents/CalculusVolume1-OP_s81M8t2.pdf_cover.jpg',
    file_url: 'https://openstax.org/download/pdf?book=calculus-volume-1',
    access_model: 'dare_access',
    year_published: 2016,
    description: 'Calculus Volume 1 is designed for the typical two- or three-semester general calculus course.',
    license_type: 'CC BY 4.0',
    total_downloads: 15000,
    average_rating: 4.8,
    page_count: 886,
    format: 'pdf',
    ai_level: 'Degree',
    zimche_programme_codes: ['MAT101', 'MAT102'],
    subject_tags: ['Calculus', 'Mathematics', 'STEM', 'Engineering'],
    pillars: ['Teaching', 'Research', 'Innovation'],
    dara_summary: 'This foundational calculus text is essential for Zimbabwean STEM students. It aligns with Education 5.0 by providing the mathematical rigor needed for innovation and industrialisation in Zimbabwe\'s growing tech and engineering sectors.'
  },
  {
    id: 'openstax-phys-1',
    title: 'University Physics Volume 1',
    author_names: 'Samuel J. Ling, Jeff Sanny, William Moebs',
    publisher_name: 'OpenStax',
    faculty: 'STEM',
    subject: 'Physics',
    cover_image_url: 'https://assets.openstax.org/oscms-prodcms/media/documents/UniversityPhysicsVolume1-OP_03Z22eK.pdf_cover.jpg',
    file_url: 'https://openstax.org/download/pdf?book=university-physics-volume-1',
    access_model: 'dare_access',
    year_published: 2016,
    description: 'University Physics is a three-volume collection for calculus-based physics courses.',
    license_type: 'CC BY 4.0',
    total_downloads: 12400,
    average_rating: 4.7,
    page_count: 992,
    format: 'interactive'
  },
  {
    id: 'openstax-bio-1',
    title: 'Biology 2e',
    author_names: 'Mary Ann Clark, Matthew Douglas, Jung Choi',
    publisher_name: 'OpenStax',
    faculty: 'STEM',
    subject: 'Biology',
    cover_image_url: 'https://assets.openstax.org/oscms-prodcms/media/documents/Biology2e-OP_Z1rK86w.pdf_cover.jpg',
    file_url: 'https://openstax.org/download/pdf?book=biology-2e',
    access_model: 'dare_access',
    year_published: 2018,
    description: 'Biology 2e covers the scope and sequence of a typical two-semester biology course.',
    license_type: 'CC BY 4.0',
    total_downloads: 18200,
    average_rating: 4.9,
    page_count: 1450,
    format: 'pdf'
  },
  {
    id: 'openstax-chem-1',
    title: 'Chemistry 2e',
    author_names: 'Paul Flowers, Klaus Theopold, Richard Langley',
    publisher_name: 'OpenStax',
    faculty: 'STEM',
    subject: 'Chemistry',
    cover_image_url: 'https://assets.openstax.org/oscms-prodcms/media/documents/Chemistry2e-OP_Tj8M3tH.pdf_cover.jpg',
    file_url: 'https://openstax.org/download/pdf?book=chemistry-2e',
    access_model: 'dare_access',
    year_published: 2019,
    description: 'Chemistry 2e meets the scope and sequence of the two-semester general chemistry course.',
    license_type: 'CC BY 4.0',
    total_downloads: 14300,
    average_rating: 4.6,
    page_count: 1246,
    format: 'video'
  },
  {
    id: 'openstax-econ-1',
    title: 'Principles of Economics 3e',
    author_names: 'David Shapiro, Daniel MacDonald, Steven A. Greenlaw',
    publisher_name: 'OpenStax',
    faculty: 'Business',
    subject: 'Economics',
    cover_image_url: 'https://assets.openstax.org/oscms-prodcms/media/documents/PrinciplesofEconomics3e-OP_G0a02q4.pdf_cover.jpg',
    file_url: 'https://openstax.org/download/pdf?book=principles-economics-3e',
    access_model: 'dare_access',
    year_published: 2022,
    description: 'Principles of Economics 3e covers most introductory economics courses.',
    license_type: 'CC BY 4.0',
    total_downloads: 9800,
    average_rating: 4.5,
    page_count: 1042,
    format: 'audio'
  },
  {
    id: 'openstax-soc-1',
    title: 'Introduction to Sociology 3e',
    author_names: 'Tonja R. Conerly, Kathleen Holmes, Asha Lal Tamang',
    publisher_name: 'OpenStax',
    faculty: 'Humanities',
    subject: 'Sociology',
    cover_image_url: 'https://assets.openstax.org/oscms-prodcms/media/documents/IntroductiontoSociology3e-OP_8E58J3e.pdf_cover.jpg',
    file_url: 'https://openstax.org/download/pdf?book=introduction-sociology-3e',
    access_model: 'dare_access',
    year_published: 2021,
    description: 'Introduction to Sociology 3e for a typical one-semester introductory course.',
    license_type: 'CC BY 4.0',
    total_downloads: 11500,
    average_rating: 4.7,
    page_count: 588
  },
  {
    id: 'openstax-psych-1',
    title: 'Psychology 2e',
    author_names: 'Rose M. Spielman, William J. Jenkins, Marilyn D. Lovett',
    publisher_name: 'OpenStax',
    faculty: 'Humanities',
    subject: 'Psychology',
    cover_image_url: 'https://assets.openstax.org/oscms-prodcms/media/documents/Psychology2e-OP_8S58J3e.pdf_cover.jpg',
    file_url: 'https://openstax.org/download/pdf?book=psychology-2e',
    access_model: 'dare_access',
    year_published: 2020,
    description: 'Psychology 2e for the single-semester introduction to psychology course.',
    license_type: 'CC BY 4.0',
    total_downloads: 13200,
    average_rating: 4.8,
    page_count: 784
  },
  {
    id: 'openstax-hist-1',
    title: 'U.S. History',
    author_names: 'P. Scott Corbett, Volker Janssen, John M. Lund',
    publisher_name: 'OpenStax',
    faculty: 'Humanities',
    subject: 'History',
    cover_image_url: 'https://assets.openstax.org/oscms-prodcms/media/documents/USHistory-OP_8E58J3e.pdf_cover.jpg',
    file_url: 'https://openstax.org/download/pdf?book=us-history',
    access_model: 'dare_access',
    year_published: 2014,
    description: 'U.S. History covers the chronological history of the United States.',
    license_type: 'CC BY 4.0',
    total_downloads: 10100,
    average_rating: 4.6,
    page_count: 1086
  },
  {
    id: 'openstax-fundamentals-nursing',
    title: 'Fundamentals of Nursing',
    author_names: 'Christy Bowen',
    publisher_name: 'OpenStax',
    faculty: 'Health',
    subject: 'Nursing',
    cover_image_url: 'https://assets.openstax.org/oscms-prodcms/media/documents/FundamentalsOfNursing_cover.jpg',
    file_url: 'https://openstax.org/download/pdf?book=fundamentals-nursing',
    access_model: 'dare_access',
    year_published: 2023,
    description: 'Fundamentals of Nursing is designed to meet the scope and sequence of an introductory nursing course, providing a solid foundation for nursing practice.',
    license_type: 'CC BY 4.0',
    total_downloads: 4500,
    average_rating: 4.9,
    page_count: 1100,
    format: 'pdf',
    ai_level: 'Degree',
    zimche_programme_codes: ['NSG101', 'NSG102'],
    subject_tags: ['Nursing', 'Health', 'Patient Care'],
    pillars: ['Teaching', 'Community Service'],
    dara_summary: 'This introductory nursing text is vital for Zimbabwean health sciences students. It supports the development of essential nursing skills and knowledge, contributing to the improvement of healthcare services in line with national health goals.'
  }
];
