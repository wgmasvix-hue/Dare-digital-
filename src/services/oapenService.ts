import { Book } from '../types';

export interface OapenResponse {
  books: Book[];
  totalResults: number;
}

interface OapenItem {
  handle?: string;
  name?: string;
  author?: string | string[];
  description?: string | string[];
  language?: string | string[];
  thumbnail?: string;
}

export const oapenService = {
  async searchBooks(query = '', page = 1): Promise<OapenResponse> {
    try {
      const effectiveQuery = query.trim() || 'education';
      const limit = 20;
      const offset = (page - 1) * limit;

      const targetUrl =
        `https://library.oapen.org/rest/search?query=${encodeURIComponent(effectiveQuery)}` +
        `&offset=${offset}&limit=${limit}&format=json`;

      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`OAPEN API error: ${response.status}`);
      }

      const items: OapenItem[] = await response.json();
      if (!Array.isArray(items)) {
        return { books: [], totalResults: 0 };
      }

      const books: Book[] = items.map((item: OapenItem, idx: number): Book => {
        const handle = item.handle || `oapen-${idx}`;

        const author = Array.isArray(item.author)
          ? item.author.join(', ')
          : item.author || 'Unknown Author';

        const rawDescription = Array.isArray(item.description)
          ? item.description[0]
          : item.description || '';

        const language = Array.isArray(item.language)
          ? item.language[0]
          : item.language || 'English';

        return {
          id: `oapen-${handle.replace(/\//g, '-')}`,
          title: item.name || 'Unknown Title',
          author_names: author,
          description: rawDescription.substring(0, 400),
          cover_image_url:
            item.thumbnail ||
            `https://picsum.photos/seed/oapen-${idx}/400/600`,
          file_url: `https://library.oapen.org/handle/${handle}`,
          url: `https://library.oapen.org/handle/${handle}`,
          language,
          source: 'OAPEN',
          access_model: 'open_access',
        };
      });

      return { books, totalResults: books.length };
    } catch (error) {
      console.error('OAPEN Service Error:', error);
      return { books: [], totalResults: 0 };
    }
  },
};
