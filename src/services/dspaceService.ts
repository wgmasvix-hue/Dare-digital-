import { Book } from '../types';

export interface DSpaceResponse {
  books: Book[];
  totalResults: number;
}

export interface DSpaceCommunity {
  uuid: string;
  name: string;
  archivedItemsCount?: number;
  metadata: Record<string, Array<{ value: string; language: string | null }>>;
  _links: {
    self: { href: string };
    collections: { href: string };
    subcommunities: { href: string };
  };
}

export interface DSpaceCollection {
  uuid: string;
  name: string;
  archivedItemsCount?: number;
  metadata: Record<string, Array<{ value: string; language: string | null }>>;
  _links: {
    self: { href: string };
    items?: { href: string };
  };
}

export interface DSpaceItemFull {
  uuid: string;
  name: string;
  metadata: Record<string, Array<{ value: string; language: string | null }>>;
  _links: {
    self: { href: string };
    bundles: { href: string };
  };
}

export interface DSpaceFacetValue {
  label: string;
  count: number;
  filterValue: string;
}

async function proxyFetch(url: string): Promise<any> {
  try {
    const { supabase } = await import('../lib/supabase');
    const { data, error } = await supabase.functions.invoke('external-proxy', {
      body: { url, method: 'GET' }
    });
    if (error) throw error;
    return data?.data ?? data;
  } catch {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
}

export const dspaceService = {
  // ── Legacy search (used by DSpaceExplorer) ─────────────────────────
  async searchRepository(repositoryUrl: string, query: string, page = 1): Promise<DSpaceResponse> {
    try {
      const limit = 20;
      const targetUrl = `${repositoryUrl}/server/api/discover/search/objects?query=${encodeURIComponent(query)}&page=${page - 1}&size=${limit}`;
      const { supabase } = await import('../lib/supabase');
      const { data: proxyResponse, error } = await supabase.functions.invoke('external-proxy', {
        body: { url: targetUrl }
      });
      if (error) {
        const res = await fetch(targetUrl);
        if (!res.ok) throw new Error('DSpace search failed');
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

  mapDSpaceResponse(data: any): DSpaceResponse {
    if (!data?._embedded?.searchResult?._embedded?.objects) {
      return { books: [], totalResults: 0 };
    }
    const objects = data._embedded.searchResult._embedded.objects;
    const books: Book[] = objects.map((obj: any, idx: number) => {
      const item = obj._embedded?.indexableObject;
      if (!item) return null;
      const metadata = item.metadata || {};
      const title = metadata['dc.title']?.[0]?.value || 'Untitled';
      const authors = metadata['dc.contributor.author']?.map((a: any) => a.value).join(', ') || 'Unknown';
      const description = metadata['dc.description.abstract']?.[0]?.value || 'No abstract available';
      const uuid = item.id || `dspace-${idx}`;
      return {
        id: `dspace-${uuid}`,
        title,
        author_names: authors,
        description: description.substring(0, 300) + (description.length > 300 ? '...' : ''),
        cover_image_url: `https://picsum.photos/seed/${uuid}/400/600`,
        file_url: item._links?.self?.href || '',
        url: item._links?.self?.href || '',
        language: 'English',
        source: 'DSpace Repository',
        access_model: 'open_access'
      };
    }).filter(Boolean);
    return { books, totalResults: data._embedded?.searchResult?.page?.totalElements || books.length };
  },

  // ── Smart repository methods ────────────────────────────────────────

  async getCommunities(apiUrl: string): Promise<DSpaceCommunity[]> {
    const data = await proxyFetch(`${apiUrl}/core/communities?size=100&page=0&sort=dc.title,ASC`);
    return data?._embedded?.communities ?? [];
  },

  async getCollections(apiUrl: string, communityUuid: string): Promise<DSpaceCollection[]> {
    const data = await proxyFetch(`${apiUrl}/core/communities/${communityUuid}/collections?size=100&page=0`);
    return data?._embedded?.collections ?? [];
  },

  async getCollectionItems(
    apiUrl: string,
    collectionUuid: string,
    page = 0,
    size = 20
  ): Promise<{ items: DSpaceItemFull[]; total: number }> {
    const data = await proxyFetch(
      `${apiUrl}/discover/search/objects?query=*&scope=${collectionUuid}&dsoType=item&size=${size}&page=${page}&sort=dc.date.accessioned,DESC`
    );
    const objects = data?._embedded?.searchResult?._embedded?.objects ?? [];
    return {
      items: objects.map((o: any) => o._embedded?.indexableObject).filter(Boolean),
      total: data?._embedded?.searchResult?.page?.totalElements ?? 0,
    };
  },

  async getRecentSubmissions(apiUrl: string, limit = 12): Promise<DSpaceItemFull[]> {
    const data = await proxyFetch(
      `${apiUrl}/discover/search/objects?query=*&dsoType=item&sort=dc.date.accessioned,DESC&size=${limit}&page=0`
    );
    const objects = data?._embedded?.searchResult?._embedded?.objects ?? [];
    return objects.map((o: any) => o._embedded?.indexableObject).filter(Boolean);
  },

  async getSubjectFacets(apiUrl: string, size = 50): Promise<DSpaceFacetValue[]> {
    const data = await proxyFetch(`${apiUrl}/discover/facets/subject?query=*&size=${size}`);
    return (data?._embedded?.values ?? []).map((v: any) => ({
      label: v.label ?? v.value ?? '',
      count: v.count ?? 0,
      filterValue: v.filterValue ?? v.value ?? '',
    }));
  },

  async searchItems(
    apiUrl: string,
    query: string,
    opts: { field?: string; docType?: string; page?: number; size?: number } = {}
  ): Promise<{ items: DSpaceItemFull[]; total: number }> {
    const { field = 'ANY', docType, page = 0, size = 20 } = opts;
    const q = field !== 'ANY' && query ? `${field}:(${query})` : query || '*';
    let url = `${apiUrl}/discover/search/objects?query=${encodeURIComponent(q)}&dsoType=item&size=${size}&page=${page}`;
    if (docType && docType !== 'All') url += `&f.type=${encodeURIComponent(docType)},equals`;
    const data = await proxyFetch(url);
    const objects = data?._embedded?.searchResult?._embedded?.objects ?? [];
    return {
      items: objects.map((o: any) => o._embedded?.indexableObject).filter(Boolean),
      total: data?._embedded?.searchResult?.page?.totalElements ?? 0,
    };
  },

  async getItemBundles(bundlesUrl: string): Promise<any[]> {
    const data = await proxyFetch(bundlesUrl);
    return data?._embedded?.bundles ?? [];
  },

  async getTotalItemCount(apiUrl: string): Promise<number> {
    try {
      const data = await proxyFetch(`${apiUrl}/discover/search/objects?query=*&dsoType=item&size=1&page=0`);
      return data?._embedded?.searchResult?.page?.totalElements ?? 0;
    } catch {
      return 0;
    }
  },

  getMeta(
    item: { metadata?: Record<string, Array<{ value: string }>> } | null | undefined,
    field: string,
    fallback = ''
  ): string {
    return item?.metadata?.[field]?.[0]?.value ?? fallback;
  },

  getMetaAll(
    item: { metadata?: Record<string, Array<{ value: string }>> } | null | undefined,
    field: string
  ): string[] {
    return item?.metadata?.[field]?.map((v: any) => v.value) ?? [];
  },
};
