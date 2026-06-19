import { Book } from '../types';

export interface RepoSearchResult extends Book {
  doi?: string;
  pdfUrl?: string;
  oaStatus?: string;
  citationCount?: number;
  fieldsOfStudy?: string[];
  institution?: string;
  repositorySource?: string;
  publishedDate?: string;
}

export interface RepoSearchResponse {
  results: RepoSearchResult[];
  totalCount: number;
  source: string;
}

// ─── Decode OpenAlex abstract (inverted index format) ────────────────────────
function decodeAbstract(invertedIndex: Record<string, number[]> | null | undefined): string {
  if (!invertedIndex) return '';
  const words: [number, string][] = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) words.push([pos, word]);
  }
  words.sort((a, b) => a[0] - b[0]);
  return words.map(([, w]) => w).join(' ').substring(0, 400);
}

// ─── Proxy helper ────────────────────────────────────────────────────────────
async function proxyFetch(url: string): Promise<unknown> {
  const { supabase } = await import('../lib/supabase');
  const { data, error } = await supabase.functions.invoke('external-proxy', {
    body: { url, method: 'GET' }
  });
  if (error) throw error;
  return data?.data ?? data;
}

// ─── OpenAlex ────────────────────────────────────────────────────────────────
// 250M+ scholarly works from 109K+ institutions. No API key required.
export const openAlexService = {
  async searchWorks(query: string, page = 1, perPage = 20, filters: Record<string, string> = {}): Promise<RepoSearchResponse> {
    const params = new URLSearchParams({
      search: query,
      'per_page': String(perPage),
      page: String(page),
      select: 'id,title,authorships,abstract_inverted_index,open_access,publication_year,primary_location,topics,type,doi,cited_by_count',
      mailto: 'dare.digitallib@gmail.com',
    });
    if (filters.isOA) params.set('filter', 'is_oa:true');
    if (filters.type) params.set('filter', (params.get('filter') ? params.get('filter') + ',' : '') + `type:${filters.type}`);

    const url = `https://api.openalex.org/works?${params}`;
    const raw = await proxyFetch(url) as {
      results: Array<{
        id: string;
        title: string;
        authorships: Array<{ author: { display_name: string }; institutions?: Array<{ display_name: string }> }>;
        abstract_inverted_index: Record<string, number[]> | null;
        open_access: { is_oa: boolean; oa_url?: string | null; oa_status?: string };
        publication_year: number | null;
        primary_location: { source?: { display_name?: string; host_organization_name?: string } } | null;
        topics: Array<{ display_name: string }>;
        type: string;
        doi: string | null;
        cited_by_count: number;
      }>;
      meta: { count: number };
    };

    const results: RepoSearchResult[] = (raw?.results || []).map(w => {
      const arxivId = w.id?.replace('https://openalex.org/W', 'openalex-');
      const oaUrl = w.open_access?.oa_url;
      const institution = w.authorships?.[0]?.institutions?.[0]?.display_name || '';
      return {
        id: arxivId,
        title: w.title || 'Untitled',
        author_names: w.authorships?.slice(0, 3).map(a => a.author?.display_name).join(', ') || 'Unknown',
        description: decodeAbstract(w.abstract_inverted_index),
        cover_image_url: `https://picsum.photos/seed/${arxivId}/400/600`,
        file_url: oaUrl || w.doi ? `https://doi.org/${w.doi}` : '',
        url: w.doi ? `https://doi.org/${w.doi}` : w.id,
        doi: w.doi || undefined,
        pdfUrl: oaUrl || undefined,
        oaStatus: w.open_access?.oa_status,
        citationCount: w.cited_by_count,
        year_published: w.publication_year || undefined,
        source: 'OpenAlex',
        repositorySource: 'OpenAlex',
        access_model: w.open_access?.is_oa ? 'open_access' : 'licensed',
        institution,
        fieldsOfStudy: w.topics?.slice(0, 3).map(t => t.display_name),
        publisher_name: w.primary_location?.source?.display_name || institution,
        resource_type: w.type,
      } as RepoSearchResult;
    });

    return { results, totalCount: raw?.meta?.count || 0, source: 'OpenAlex' };
  },

  async searchByInstitution(openAlexId: string, query = '', page = 1): Promise<RepoSearchResponse> {
    const filterParts = [`institutions.id:${openAlexId}`, 'is_oa:true'];
    const params = new URLSearchParams({
      filter: filterParts.join(','),
      'per_page': '20',
      page: String(page),
      select: 'id,title,authorships,abstract_inverted_index,open_access,publication_year,topics,type,doi,cited_by_count',
      mailto: 'dare.digitallib@gmail.com',
    });
    if (query) params.set('search', query);

    const url = `https://api.openalex.org/works?${params}`;
    return this.searchWorks(query, page, 20, { isOA: 'true', institutionId: openAlexId });
  },

  async getInstitutionInfo(openAlexId: string) {
    const url = `https://api.openalex.org/institutions/${openAlexId}?mailto=dare.digitallib@gmail.com`;
    return proxyFetch(url) as Promise<{
      display_name: string;
      works_count: number;
      cited_by_count: number;
      country_code: string;
      type: string;
      image_url?: string;
    }>;
  },
};

// ─── CORE ────────────────────────────────────────────────────────────────────
// Millions of open access research papers from 10K+ repositories worldwide.
export const coreService = {
  async searchPapers(query: string, page = 1): Promise<RepoSearchResponse> {
    const offset = (page - 1) * 20;
    const url = `https://api.core.ac.uk/v3/search/outputs?q=${encodeURIComponent(query)}&limit=20&offset=${offset}`;

    const raw = await proxyFetch(url) as {
      results: Array<{
        id: string;
        title: string;
        authors: Array<{ name: string }>;
        abstract?: string;
        yearPublished?: number;
        downloadUrl?: string;
        repositories?: Array<{ name?: string; openDoarId?: number }>;
        publisher?: string;
        doi?: string;
        fieldOfStudy?: string;
        outputType?: { name?: string };
      }>;
      totalHits: number;
    };

    const results: RepoSearchResult[] = (raw?.results || []).map(p => ({
      id: `core-${p.id}`,
      title: p.title || 'Untitled',
      author_names: p.authors?.slice(0, 3).map(a => a.name).join(', ') || 'Unknown',
      description: (p.abstract || '').substring(0, 400),
      cover_image_url: `https://picsum.photos/seed/core-${p.id}/400/600`,
      file_url: p.downloadUrl || '',
      url: p.downloadUrl || `https://core.ac.uk/outputs/${p.id}`,
      doi: p.doi || undefined,
      pdfUrl: p.downloadUrl || undefined,
      year_published: p.yearPublished || undefined,
      source: 'CORE',
      repositorySource: 'CORE',
      access_model: 'open_access',
      institution: p.repositories?.[0]?.name || p.publisher || '',
      fieldsOfStudy: p.fieldOfStudy ? [p.fieldOfStudy] : [],
      publisher_name: p.repositories?.[0]?.name || p.publisher || 'University Repository',
      resource_type: p.outputType?.name || 'article',
    } as RepoSearchResult));

    return { results, totalCount: raw?.totalHits || 0, source: 'CORE' };
  },
};

// ─── Semantic Scholar ─────────────────────────────────────────────────────────
// 200M+ papers. Free, no key required for basic search.
export const semanticScholarService = {
  async searchPapers(query: string, page = 1): Promise<RepoSearchResponse> {
    const offset = (page - 1) * 20;
    const fields = 'title,authors,abstract,year,openAccessPdf,externalIds,fieldsOfStudy,citationCount,journal,publicationTypes';
    const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&fields=${fields}&limit=20&offset=${offset}`;

    const raw = await proxyFetch(url) as {
      data: Array<{
        paperId: string;
        title: string;
        authors: Array<{ name: string }>;
        abstract?: string;
        year?: number;
        openAccessPdf?: { url?: string };
        externalIds?: { DOI?: string; ArXiv?: string };
        fieldsOfStudy?: string[];
        citationCount?: number;
        journal?: { name?: string };
        publicationTypes?: string[];
      }>;
      total: number;
    };

    const results: RepoSearchResult[] = (raw?.data || []).map(p => ({
      id: `ss-${p.paperId}`,
      title: p.title || 'Untitled',
      author_names: p.authors?.slice(0, 3).map(a => a.name).join(', ') || 'Unknown',
      description: (p.abstract || '').substring(0, 400),
      cover_image_url: `https://picsum.photos/seed/ss-${p.paperId}/400/600`,
      file_url: p.openAccessPdf?.url || (p.externalIds?.DOI ? `https://doi.org/${p.externalIds.DOI}` : ''),
      url: `https://www.semanticscholar.org/paper/${p.paperId}`,
      doi: p.externalIds?.DOI || undefined,
      pdfUrl: p.openAccessPdf?.url || undefined,
      year_published: p.year || undefined,
      source: 'Semantic Scholar',
      repositorySource: 'Semantic Scholar',
      access_model: p.openAccessPdf?.url ? 'open_access' : 'licensed',
      citationCount: p.citationCount,
      fieldsOfStudy: p.fieldsOfStudy || [],
      publisher_name: p.journal?.name || 'Academic Journal',
      resource_type: p.publicationTypes?.[0] || 'article',
    } as RepoSearchResult));

    return { results, totalCount: raw?.total || 0, source: 'Semantic Scholar' };
  },
};

// ─── Unified Search ───────────────────────────────────────────────────────────
export const repositoryService = {
  async unifiedSearch(
    query: string,
    options: { page?: number; sources?: string[]; onlyOA?: boolean } = {}
  ): Promise<{ results: RepoSearchResult[]; totals: Record<string, number> }> {
    const { page = 1, sources = ['openalex', 'core', 'semantic'], onlyOA = false } = options;

    const tasks: Promise<RepoSearchResponse>[] = [];
    if (sources.includes('openalex')) {
      tasks.push(openAlexService.searchWorks(query, page, 20, onlyOA ? { isOA: 'true' } : {}));
    }
    if (sources.includes('core')) {
      tasks.push(coreService.searchPapers(query, page));
    }
    if (sources.includes('semantic')) {
      tasks.push(semanticScholarService.searchPapers(query, page));
    }

    const settled = await Promise.allSettled(tasks);
    const totals: Record<string, number> = {};
    const allResults: RepoSearchResult[] = [];

    for (const result of settled) {
      if (result.status === 'fulfilled') {
        totals[result.value.source] = result.value.totalCount;
        allResults.push(...result.value.results);
      }
    }

    // Deduplicate by DOI and title similarity
    const seenDois = new Set<string>();
    const seenTitles = new Set<string>();
    const deduped = allResults.filter(r => {
      if (r.doi && seenDois.has(r.doi)) return false;
      const titleKey = (r.title || '').toLowerCase().substring(0, 60);
      if (seenTitles.has(titleKey)) return false;
      if (r.doi) seenDois.add(r.doi);
      seenTitles.add(titleKey);
      return true;
    });

    return { results: deduped, totals };
  },
};
