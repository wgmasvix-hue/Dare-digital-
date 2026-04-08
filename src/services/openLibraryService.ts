import { Book } from '../types';

export interface OpenLibraryResponse {
  books: Book[];
  numFound: number;
  start: number;
}

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  subject?: string[];
  isbn?: string[];
  cover_i?: number;
  language?: string[];
  seed?: string[];
}

interface OpenLibraryRawResponse {
  numFound: number;
  start: number;
  docs: OpenLibraryDoc[];
}

export const openLibraryService = {
  async searchBooks(query: string, page = 1): Promise<OpenLibraryResponse> {
    try {
      const { supabase } = await import('../lib/supabase');
      const limit = 20;
      const targetUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
      
      const { data: proxyResponse, error } = await supabase.functions.invoke('external-proxy', {
        body: { url: targetUrl }
      });

      if (error) throw error;
      
      const responseData: OpenLibraryRawResponse = proxyResponse.data;
      
      return {
        books: (responseData.docs || []).map((doc: OpenLibraryDoc): Book => {
          const id = doc.key.replace('/works/', 'ol-').replace('/books/', 'olb-');
          const coverUrl = doc.cover_i 
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
            : `https://picsum.photos/seed/${id}/400/600`;
            
          return {
            id,
            title: doc.title,
            author_names: doc.author_name?.join(', ') || 'Unknown Author',
            description: `Open Library resource. Published: ${doc.first_publish_year || 'Unknown'}. Subjects: ${doc.subject?.slice(0, 5).join(', ') || 'General'}`,
            cover_image_url: coverUrl,
            file_url: `https://openlibrary.org${doc.key}`,
            url: `https://openlibrary.org${doc.key}`,
            language: doc.language?.[0] || 'English',
            subjects: doc.subject || [],
            source: 'Open Library',
            access_model: 'open_access'
          };
        }),
        numFound: responseData.numFound,
        start: responseData.start
      };
    } catch (error) {
      console.error('Open Library Service Error:', error);
      throw error;
    }
  }
};
