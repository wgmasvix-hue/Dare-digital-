import { Book } from '../types';

export interface LibrivoxResponse {
  books: Book[];
  totalResults: number;
}

interface LibrivoxAuthor {
  first_name?: string;
  last_name?: string;
}

interface LibrivoxBook {
  id: string | number;
  title?: string;
  authors?: LibrivoxAuthor[];
  description?: string;
  url_librivox?: string;
  url_zip_file?: string;
  language?: string;
}

interface LibrivoxApiResponse {
  books?: LibrivoxBook[];
}

export const librivoxService = {
  async searchBooks(query = '', page = 1): Promise<LibrivoxResponse> {
    try {
      const { supabase } = await import('../lib/supabase');
      const limit = 20;
      const offset = (page - 1) * limit;

      let targetUrl = `https://librivox.org/api/feed/audiobooks/?format=json&extended=1&limit=${limit}&offset=${offset}`;
      if (query.trim()) {
        targetUrl += `&search=${encodeURIComponent(query.trim())}`;
      }

      const { data: proxyResponse, error } = await supabase.functions.invoke(
        'external-proxy',
        { body: { url: targetUrl } }
      );

      if (error) throw error;

      const responseData: LibrivoxApiResponse = proxyResponse?.data || {};
      const rawBooks = responseData.books || [];

      const books: Book[] = rawBooks.map((item: LibrivoxBook): Book => {
        const authorNames = (item.authors || [])
          .map(
            (a: LibrivoxAuthor) =>
              `${a.first_name || ''} ${a.last_name || ''}`.trim()
          )
          .filter(Boolean)
          .join(', ') || 'Unknown Author';

        const rawDescription = item.description || '';
        const description = rawDescription.replace(/<[^>]*>/g, '').substring(0, 400);

        return {
          id: `librivox-${item.id}`,
          title: item.title || 'Unknown Title',
          author_names: authorNames,
          description,
          cover_image_url: `https://picsum.photos/seed/librivox-${item.id}/400/600`,
          file_url: item.url_zip_file || item.url_librivox || '',
          url: item.url_librivox || '',
          language: item.language || 'English',
          source: 'LibriVox',
          access_model: 'public_domain',
        };
      });

      return { books, totalResults: books.length };
    } catch (error) {
      console.error('LibriVox Service Error:', error);
      return { books: [], totalResults: 0 };
    }
  },
};
