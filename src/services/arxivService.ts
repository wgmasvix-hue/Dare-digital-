import { Book } from '../types';

export interface ArxivResponse {
  books: Book[];
  totalResults: number;
}

export const arxivService = {
  async searchResearch(query: string, page = 1): Promise<ArxivResponse> {
    try {
      const { supabase } = await import('../lib/supabase');
      const limit = 20;
      const start = (page - 1) * limit;
      const targetUrl = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=${start}&max_results=${limit}`;
      
      const { data: proxyResponse, error } = await supabase.functions.invoke('external-proxy', {
        body: { url: targetUrl }
      });

      if (error) throw error;
      
      const text = proxyResponse.data as string;
      
      // Simple XML parsing using regex (since it's a small feed)
      const entries = text.split('<entry>');
      entries.shift(); // Remove the header
      
      const books: Book[] = entries.map((entry, idx) => {
        const idMatch = entry.match(/<id>(.*?)<\/id>/);
        const titleMatch = entry.match(/<title>(.*?)<\/title>/);
        const summaryMatch = entry.match(/<summary>(.*?)<\/summary>/);
        const authorMatch = [...entry.matchAll(/<name>(.*?)<\/name>/g)];
        const pdfMatch = entry.match(/<link title="pdf" href="(.*?)"/);
        
        const id = idMatch ? idMatch[1].split('/').pop() || `arxiv-${idx}` : `arxiv-${idx}`;
        const title = titleMatch ? titleMatch[1].replace(/\n/g, ' ').trim() : 'Unknown Title';
        const summary = summaryMatch ? summaryMatch[1].replace(/\n/g, ' ').trim() : 'No summary available.';
        const authors = authorMatch.map(m => m[1]).join(', ') || 'Unknown Author';
        const pdfUrl = pdfMatch ? pdfMatch[1] : `https://arxiv.org/abs/${id}`;

        return {
          id: `arxiv-${id}`,
          title,
          author_names: authors,
          description: summary.substring(0, 300) + (summary.length > 300 ? '...' : ''),
          cover_image_url: `https://picsum.photos/seed/arxiv-${id}/400/600`,
          file_url: pdfUrl,
          url: `https://arxiv.org/abs/${id}`,
          language: 'English',
          source: 'arXiv Research',
          access_model: 'open_access'
        };
      });

      return {
        books,
        totalResults: 1000 // arXiv doesn't give total count easily in the feed without more parsing
      };
    } catch (error) {
      console.error('arXiv Service Error:', error);
      throw error;
    }
  }
};
