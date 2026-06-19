import { Book } from '../types';

export interface OpenAlexResponse {
  books: Book[];
  totalResults: number;
}

export const openAlexService = {
  async searchResearch(query: string, page = 1): Promise<OpenAlexResponse> {
    try {
      const limit = 20;
      const targetUrl = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&page=${page}&per-page=${limit}`;
      
      const response = await fetch(targetUrl);
      if (!response.ok) {
         throw new Error(`OpenAlex API error: ${response.status}`);
      }
      const data = await response.json();
      
      interface OpenAlexWork {
        id: string;
        title?: string;
        abstract_inverted_index?: Record<string, number[]>;
        authorships?: { author?: { display_name?: string } }[];
        open_access?: { oa_url?: string; is_oa?: boolean };
        language?: string;
      }

      const books: Book[] = data.results.map((work: OpenAlexWork, idx: number) => {
        const id = work.id.split('/').pop() || `openalex-${idx}`;
        const title = work.title || 'Unknown Title';
        const abstract = work.abstract_inverted_index ? 'Abstract available.' : 'No abstract available.';
        const authors = work.authorships?.map((a) => a.author?.display_name).join(', ') || 'Unknown Author';
        const pdfUrl = work.open_access?.oa_url || work.id;
        
        return {
          id: `openalex-${id}`,
          title,
          author_names: authors,
          description: abstract,
          cover_image_url: `https://picsum.photos/seed/openalex-${id}/400/600`,
          file_url: pdfUrl,
          url: work.id,
          language: work.language || 'English',
          source: 'OpenAlex',
          access_model: work.open_access?.is_oa ? 'open_access' : 'restricted'
        };
      });

      return {
        books,
        totalResults: data.meta?.count || 0
      };
    } catch (error) {
      console.error('OpenAlex Service Error:', error);
      throw error;
    }
  }
};
