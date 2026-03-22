import { ALL_ADDITIONAL_OER } from './src/lib/oerCatalog.js';
import { OPENSTAX_CURATED } from './src/lib/transformBook.js';

console.log('ALL_ADDITIONAL_OER length:', ALL_ADDITIONAL_OER?.length);
console.log('OPENSTAX_CURATED length:', OPENSTAX_CURATED?.length);

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

const transformOER = (oer) => {
  try {
    return {
      id: oer.id,
      title: oer.title,
      authors: oer.author_names ? String(oer.author_names).split(',').map(a => a.trim()) : ["Unknown"],
      year: oer.year_published || 2023,
      journal: oer.publisher_name || "Open Resource",
      domain: mapFacultyToDomain(oer.faculty, oer.subject),
      type: "textbook",
      source: oer.publisher_name || "External",
      isAfrican: (oer.publisher_name || "").includes("FAO") || (oer.publisher_name || "").includes("WHO"), // Rough heuristic
      isZimbabwe: false,
      isOpenAccess: true,
      isPeerReviewed: true,
      abstract: oer.description || "No description available.",
      citations: Math.floor(Math.random() * 500),
      skills: ["Critical Thinking"],
      file_url: oer.file_url,
      cover_image_url: oer.cover_image_url
    };
  } catch (e) {
    console.error("Error transforming OER:", oer, e);
    return null;
  }
};

const IMPORTED_BOOKS = [
  ...(Array.isArray(OPENSTAX_CURATED) ? OPENSTAX_CURATED : []),
  ...(Array.isArray(ALL_ADDITIONAL_OER) ? ALL_ADDITIONAL_OER : [])
].map(transformOER).filter(Boolean);

console.log('IMPORTED_BOOKS length:', IMPORTED_BOOKS.length);
console.log('First book:', IMPORTED_BOOKS[0]);
