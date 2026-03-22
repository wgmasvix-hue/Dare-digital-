import { supabase } from '../lib/supabase';

const OPENSTAX_API_BASE = 'https://archive.org/advancedsearch.php';

export const openStaxService = {
  /**
   * Search OpenStax books via Internet Archive API
   * @param {Object} params - Search parameters
   * @param {string} params.query - Search query
   * @param {number} params.page - Page number
   * @param {number} params.limit - Results per page
   */
  async searchBooks({ query, page = 1, limit = 24 }) {
    try {
      // Construct advanced search query for OpenStax collection
      const q = query ? `(${query}) AND ` : '';
      const searchUrl = `${OPENSTAX_API_BASE}?q=${q}collection:(openstax)&fl[]=identifier,title,creator,description,date,subject,mediatype,licenseurl&sort[]=downloads desc&rows=${limit}&page=${page}&output=json`;

      const response = await fetch(searchUrl);
      if (!response.ok) throw new Error('OpenStax API request failed');
      
      const data = await response.json();
      const docs = data.response.docs;

      // Transform to match our internal book structure
      return {
        data: docs.map(doc => ({
          id: `openstax-${doc.identifier}`,
          title: doc.title,
          author_names: Array.isArray(doc.creator) ? doc.creator.join(', ') : doc.creator,
          publisher_name: 'OpenStax',
          faculty: this.mapSubjectToFaculty(doc.subject),
          cover_path: `https://archive.org/services/img/${doc.identifier}`,
          access_model: 'dare_access',
          year_published: doc.date ? new Date(doc.date).getFullYear() : null,
          description: doc.description,
          source: 'OpenStax',
          source_url: `https://archive.org/details/${doc.identifier}`,
          license_type: 'CC BY',
          total_downloads: 0, // Not available in this specific API view easily
          average_rating: 0
        })),
        total: data.response.numFound
      };
    } catch (error) {
      console.error('OpenStax search error:', error);
      return { data: [], total: 0 };
    }
  },

  mapSubjectToFaculty(subjects) {
    if (!subjects) return 'General';
    const subjectStr = Array.isArray(subjects) ? subjects.join(' ').toLowerCase() : subjects.toLowerCase();
    
    if (subjectStr.includes('math') || subjectStr.includes('physics') || subjectStr.includes('biology') || subjectStr.includes('chemistry')) return 'STEM';
    if (subjectStr.includes('history') || subjectStr.includes('sociology') || subjectStr.includes('psychology')) return 'Humanities';
    if (subjectStr.includes('business') || subjectStr.includes('economics')) return 'Business';
    
    return 'General';
  }
};
