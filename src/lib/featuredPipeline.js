import { 
  OPENSTAX_EXPANDED, 
  AGRICULTURE_OER, 
  HEALTH_OER, 
  ENGINEERING_OER, 
  EDUCATION_OER,
  AI_OER,
  AI_PRIORITY_OER
} from './oerCatalog';
import { transformBooks, OPENSTAX_CURATED } from './transformBook';

/**
 * Featured Pipeline Utility
 * Selects and prioritizes items from the static OER catalog to be featured across the app.
 */

// 1. High Priority Items (AI, STEM, Agriculture)
const PRIORITY_ITEMS = [
  ...AI_PRIORITY_OER,
  ...OPENSTAX_CURATED,
  ...AGRICULTURE_OER.slice(0, 3),
  ...AI_OER.slice(0, 2)
];

// 2. Trending Items (Based on mock downloads/ratings)
const TRENDING_ITEMS = [
  ...OPENSTAX_EXPANDED.filter(b => b.total_downloads > 10000),
  ...HEALTH_OER.filter(b => b.average_rating >= 4.8),
  ...ENGINEERING_OER.slice(0, 3)
];

// 3. New & Notable
const NEW_ITEMS = [
  ...EDUCATION_OER.slice(0, 3),
  ...OPENSTAX_EXPANDED.filter(b => b.year_published >= 2022).slice(0, 3)
];

/**
 * Get a selection of featured books
 * @param {number} limit - Number of items to return
 * @returns {Array} Transformed book objects
 */
export function getFeaturedPipeline(limit = 6) {
  // Combine and remove duplicates by ID
  const allFeatured = [...PRIORITY_ITEMS, ...TRENDING_ITEMS, ...NEW_ITEMS];
  const uniqueFeatured = Array.from(new Map(allFeatured.map(item => [item.id, item])).values());
  
  // Shuffle or sort by priority
  const shuffled = uniqueFeatured.sort(() => 0.5 - Math.random());
  
  return transformBooks(shuffled.slice(0, limit));
}

/**
 * Get recommended books for a specific faculty
 * @param {string} faculty - Faculty name
 * @param {number} limit - Number of items to return
 * @returns {Array} Transformed book objects
 */
export function getRecommendedByFaculty(faculty, limit = 4) {
  if (!faculty) return getFeaturedPipeline(limit);
  
  const allResources = [
    ...OPENSTAX_EXPANDED,
    ...AGRICULTURE_OER,
    ...HEALTH_OER,
    ...ENGINEERING_OER,
    ...EDUCATION_OER,
    ...AI_OER,
    ...AI_PRIORITY_OER
  ];
  
  const filtered = allResources.filter(b => 
    (b.faculty && b.faculty.toLowerCase().includes(faculty.toLowerCase())) ||
    (b.subject && b.subject.toLowerCase().includes(faculty.toLowerCase()))
  );
  
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  return transformBooks(shuffled.slice(0, limit));
}

/**
 * Get recently added items from the pipeline
 */
export function getRecentlyAddedPipeline(limit = 4) {
  const allResources = [
    ...OPENSTAX_EXPANDED,
    ...AGRICULTURE_OER,
    ...HEALTH_OER,
    ...ENGINEERING_OER,
    ...EDUCATION_OER,
    ...AI_OER,
    ...AI_PRIORITY_OER
  ];
  
  const sorted = allResources.sort((a, b) => (b.year_published || 0) - (a.year_published || 0));
  return transformBooks(sorted.slice(0, limit));
}
