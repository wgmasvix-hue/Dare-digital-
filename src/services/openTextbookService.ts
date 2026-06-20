import { Book } from '../types';

export interface OpenTextbookResponse {
  books: Book[];
  totalResults: number;
}

interface OTLAuthor {
  first_name?: string;
  last_name?: string;
}

interface OTLSubject {
  name?: string;
}

interface OTLLink {
  url?: string;
  type?: string;
}

interface OTLBook {
  id?: number | string;
  title?: string;
  authors?: OTLAuthor[];
  description?: string;
  cover_url?: string;
  subjects?: OTLSubject[];
  links?: OTLLink[];
}

interface OTLMeta {
  total_count?: number;
}

interface OTLResponse {
  data?: OTLBook[];
  meta?: OTLMeta;
}

export const openTextbookService = {
  async searchBooks(query = '', page = 1): Promise<OpenTextbookResponse> {
    try {
      let targetUrl = `https://open.umn.edu/opentextbooks/api/v2/books.json?page=${page}`;
      if (query.trim()) {
        targetUrl += `&q=${encodeURIComponent(query.trim())}`;
      }

      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`Open Textbook Library API error: ${response.status}`);
      }

      const responseData: OTLResponse = await response.json();
      const items = responseData?.data || [];

      const books: Book[] = items.map((item: OTLBook, idx: number): Book => {
        const authorNames = (item.authors || [])
          .map(
            (a: OTLAuthor) =>
              `${a.first_name || ''} ${a.last_name || ''}`.trim()
          )
          .filter(Boolean)
          .join(', ') || 'Unknown Author';

        const readLink = (item.links || []).find(
          (l: OTLLink) => l.type === 'read'
        )?.url;

        const subjectNames = (item.subjects || [])
          .map((s: OTLSubject) => s.name || '')
          .filter(Boolean);

        return {
          id: `otl-${item.id || idx}`,
          title: item.title || 'Unknown Title',
          author_names: authorNames,
          description: (item.description || '').substring(0, 400),
          cover_image_url:
            item.cover_url ||
            `https://picsum.photos/seed/otl-${item.id || idx}/400/600`,
          file_url: readLink || `https://open.umn.edu/opentextbooks/textbooks/${item.id}`,
          url: `https://open.umn.edu/opentextbooks/textbooks/${item.id}`,
          language: 'English',
          subjects: subjectNames,
          isPeerReviewed: true,
          source: 'Open Textbook Library',
          access_model: 'open_access',
        };
      });

      return {
        books,
        totalResults: responseData?.meta?.total_count || books.length,
      };
    } catch (error) {
      console.error('Open Textbook Library Service Error:', error);
      return { books: [], totalResults: 0 };
    }
  },
};
