import { Book } from '../types';

export interface InternetArchiveResponse {
  books: Book[];
  totalResults: number;
}

interface ArchiveDoc {
  identifier: string;
  title?: string;
  creator?: string | string[];
  description?: string | string[];
  date?: string;
  downloads?: number;
  subject?: string | string[];
}

interface ArchiveSearchResponse {
  response: {
    numFound: number;
    docs: ArchiveDoc[];
  };
}

export const internetArchiveService = {
  async searchBooks(query = '', page = 1): Promise<InternetArchiveResponse> {
    try {
      const q = query.trim()
        ? `(${query}) AND mediatype:texts`
        : 'subject:(education OR textbook OR academic) AND mediatype:texts';

      const targetUrl =
        `https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}` +
        `&fl[]=identifier,title,creator,description,date,downloads,subject` +
        `&rows=20&page=${page}&output=json&sort[]=downloads+desc`;

      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`Internet Archive API error: ${response.status}`);
      }

      const data: ArchiveSearchResponse = await response.json();
      const docs = data?.response?.docs || [];

      const books: Book[] = docs.map((doc: ArchiveDoc): Book => {
        const author = Array.isArray(doc.creator)
          ? doc.creator.join(', ')
          : doc.creator || 'Unknown Author';

        const description = Array.isArray(doc.description)
          ? doc.description[0]
          : doc.description || '';

        return {
          id: `ia-${doc.identifier}`,
          title: doc.title || 'Unknown Title',
          author_names: author,
          description: description.substring(0, 400),
          cover_image_url: `https://archive.org/services/img/${doc.identifier}`,
          file_url: `https://archive.org/download/${doc.identifier}/${doc.identifier}.pdf`,
          url: `https://archive.org/details/${doc.identifier}`,
          language: 'English',
          total_downloads: doc.downloads || 0,
          subjects: Array.isArray(doc.subject)
            ? doc.subject
            : doc.subject
            ? [doc.subject]
            : [],
          source: 'Internet Archive',
          access_model: 'open_access',
        };
      });

      return {
        books,
        totalResults: data?.response?.numFound || 0,
      };
    } catch (error) {
      console.error('Internet Archive Service Error:', error);
      return { books: [], totalResults: 0 };
    }
  },
};
