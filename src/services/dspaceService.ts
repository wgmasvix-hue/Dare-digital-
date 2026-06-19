import { Book } from '../types';

export interface DSpaceResponse {
  books: Book[];
  totalResults: number;
}

export const dspaceService = {
  async searchRepository(repositoryUrl: string, query: string, page = 1): Promise<DSpaceResponse> {
    try {
      // DSpace 7+ REST API search endpoint approximation
      // Wait, due to CORS on external repositories, we'll use the external-proxy if needed, or direct fetch.
      // We will try direct fetch. If this is a real deployment, a server-side proxy is better.
      const { supabase } = await import('../lib/supabase');
      const limit = 20;
      
      // DSpace Discovery API: /server/api/discover/search/objects
      const targetUrl = `${repositoryUrl}/server/api/discover/search/objects?query=${encodeURIComponent(query)}&page=${page - 1}&size=${limit}`;
      
      const { data: proxyResponse, error } = await supabase.functions.invoke('external-proxy', {
        body: { url: targetUrl }
      });
      
      if (error) {
         // Fallback to direct fetch
         const res = await fetch(targetUrl);
         if (!res.ok) throw new Error("DSpace search failed");
         const data = await res.json();
         return this.mapDSpaceResponse(data);
      }
      
      const rawData = typeof proxyResponse.data === 'string' ? JSON.parse(proxyResponse.data) : proxyResponse.data;
      return this.mapDSpaceResponse(rawData);
      
    } catch (error) {
      console.error('DSpace Service Error:', error);
      throw error;
    }
  },
  
  mapDSpaceResponse(data: Record<string, unknown>): DSpaceResponse {
     const embedded = data?._embedded as Record<string, unknown> | undefined;
     const searchResult = embedded?.searchResult as Record<string, unknown> | undefined;
     const innerEmbedded = searchResult?._embedded as Record<string, unknown> | undefined;
     if (!innerEmbedded?.objects) {
         return { books: [], totalResults: 0 };
     }

     const objects = innerEmbedded.objects as Record<string, unknown>[];

     const books = objects.map((obj, idx: number) => {
        const objEmbedded = obj._embedded as Record<string, unknown> | undefined;
        const item = objEmbedded?.indexableObject as Record<string, unknown> | undefined;
        if (!item) return null;

        const metadata = (item.metadata || {}) as Record<string, { value: string }[]>;
        const title = metadata['dc.title']?.[0]?.value || 'Untitled';
        const authors = metadata['dc.contributor.author']?.map((a) => a.value).join(', ') || 'Unknown';
        const description = metadata['dc.description.abstract']?.[0]?.value || 'No abstract available';
        const uuid = (item.id as string) || `dspace-${idx}`;
        const links = item._links as Record<string, { href: string }> | undefined;

        return {
          id: `dspace-${uuid}`,
          title,
          author_names: authors,
          description: description.substring(0, 300) + (description.length > 300 ? '...' : ''),
          cover_image_url: `https://picsum.photos/seed/${uuid}/400/600`,
          file_url: links?.self?.href || '',
          url: links?.self?.href || '',
          language: 'English',
          source: 'DSpace Repository',
          access_model: 'open_access'
        };
     }).filter(b => b !== null) as Book[];

     const page = searchResult?.page as Record<string, number> | undefined;
     return {
        books,
        totalResults: page?.totalElements || books.length
     };
  }
};
