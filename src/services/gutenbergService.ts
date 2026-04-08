import { Book } from '../types';

export interface GutenbergResponse {
  books: Book[];
  count: number;
  next: string | null;
  previous: string | null;
}

interface GutendexAuthor {
  name: string;
  birth_year: number | null;
  death_year: number | null;
}

interface GutendexBook {
  id: number;
  title: string;
  authors: GutendexAuthor[];
  translators: GutendexAuthor[];
  subjects: string[];
  bookshelves: string[];
  languages: string[];
  copyright: boolean | null;
  media_type: string;
  formats: Record<string, string>;
  download_count: number;
}

interface GutendexResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GutendexBook[];
}

export const gutenbergService = {
  async searchBooks(query = '', page = 1): Promise<GutenbergResponse> {
    try {
      const { supabase } = await import('../lib/supabase');
      let targetUrl = `https://gutendex.com/books/?page=${page}`;
      if (query) {
        targetUrl += `&search=${encodeURIComponent(query)}`;
      }
      
      const { data: proxyResponse, error } = await supabase.functions.invoke('external-proxy', {
        body: { url: targetUrl }
      });

      if (error) throw error;
      
      const responseData: GutendexResponse = proxyResponse.data;
      return {
        books: responseData.results.map((book: GutendexBook): Book => ({
          id: `gutenberg-${book.id}`,
          gutenbergId: book.id,
          title: book.title,
          author_names: book.authors.map((a: GutendexAuthor) => a.name).join(', ') || 'Unknown Author',
          description: `Digitized by Project Gutenberg. Subjects: ${book.subjects.join(', ')}`,
          cover_image_url: book.formats['image/jpeg'] || 'https://picsum.photos/seed/book/400/600',
          file_url: book.formats['application/epub+zip'] || book.formats['text/html'] || book.formats['application/pdf'],
          url: book.formats['application/epub+zip'] || book.formats['text/html'] || book.formats['application/pdf'],
          language: book.languages[0] || 'English',
          total_downloads: book.download_count,
          subjects: book.subjects,
          source: 'Project Gutenberg',
          access_model: 'public_domain'
        })),
        count: responseData.count,
        next: responseData.next,
        previous: responseData.previous
      };
    } catch (error) {
      console.error('Gutenberg Service Error:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Network error: Unable to connect to the library service. Please check your internet connection.');
      }
      throw error;
    }
  },

  async ingestBooks(page = 1, addLog: (msg: string, type?: 'info' | 'success' | 'error') => void): Promise<GutenbergResponse> {
    const { supabase } = await import('../lib/supabase');
    
    try {
      addLog(`Fetching Gutenberg books from page ${page}...`, 'info');
      const data = await this.searchBooks('', page);
      
      addLog(`Found ${data.books.length} books. Starting ingestion...`, 'info');
      
      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;

      for (const book of data.books) {
        try {
          // Check if already exists
          const { data: existing } = await supabase
            .from('books')
            .select('id')
            .eq('id', book.id)
            .maybeSingle();

          if (existing) {
            skipCount++;
            continue;
          }

          const { error } = await supabase.from('books').insert({
            id: book.id,
            title: book.title,
            author_names: book.author_names,
            description: book.description,
            cover_image_url: book.cover_image_url,
            file_url: book.file_url,
            url: book.url,
            language: book.language,
            source: 'Project Gutenberg',
            access_model: 'public_domain',
            subject: book.subjects?.[0] || 'General',
            total_downloads: book.total_downloads
          });

          if (error) throw error;
          successCount++;
        } catch (err) {
          console.error(`Error ingesting book ${book.title}:`, err);
          errorCount++;
        }
      }

      addLog(`Ingestion complete: ${successCount} added, ${skipCount} skipped, ${errorCount} errors.`, 'success');
      return data;
    } catch (error) {
      addLog(`Ingestion failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
      throw error;
    }
  }
};
