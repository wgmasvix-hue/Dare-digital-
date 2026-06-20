import { CitableItem } from '../utils/citationExport';

export interface SearchResult extends CitableItem {
  id: string;
  abstract?: string;
  fieldsOfStudy?: string[];
  isPeerReviewed?: boolean;
  isOpenAccess?: boolean;
  fullTextUrl?: string;
  repositorySource: string;
  citationCount?: number;
  oaStatus?: string;
}

export interface UnifiedSearchOptions {
  page?: number;
  perPage?: number;
  sources?: string[];
  onlyOA?: boolean;
}

export interface UnifiedSearchResponse {
  results: SearchResult[];
  totals: Record<string, number>;
}

function reconstructAbstract(invertedIndex: Record<string, number[]> | null): string {
  if (!invertedIndex) return '';
  const wordMap: Record<number, string> = {};
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) wordMap[pos] = word;
  }
  return Object.keys(wordMap)
    .sort((a, b) => Number(a) - Number(b))
    .map(k => wordMap[Number(k)])
    .join(' ');
}

async function searchOpenAlex(query: string, page = 1, perPage = 20): Promise<{ results: SearchResult[]; total: number }> {
  try {
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&page=${page}&per-page=${perPage}&select=id,title,authorships,abstract_inverted_index,publication_year,primary_location,open_access,cited_by_count,type,concepts&mailto=dare@university.ac.zw`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OpenAlex ${res.status}`);
    const data = await res.json();
    const results: SearchResult[] = (data.results || []).map((w: any) => {
      const authors = w.authorships?.map((a: any) => a.author?.display_name).filter(Boolean).join(', ') || '';
      const source = w.primary_location?.source?.display_name || '';
      const doi = w.doi?.replace('https://doi.org/', '') || undefined;
      const abstract = reconstructAbstract(w.abstract_inverted_index);
      return {
        id: `openalex-${w.id?.split('/').pop()}`,
        title: w.title || 'Untitled',
        author_names: authors,
        year_published: w.publication_year,
        publisher_name: source,
        doi,
        url: w.primary_location?.landing_page_url || w.id,
        resource_type: w.type || 'article',
        repositorySource: 'OpenAlex',
        citationCount: w.cited_by_count || 0,
        oaStatus: w.open_access?.oa_status || '',
        abstract,
        fieldsOfStudy: w.concepts?.slice(0, 5).map((c: any) => c.display_name) || [],
        isPeerReviewed: w.type === 'journal-article',
        isOpenAccess: w.open_access?.is_oa || false,
        fullTextUrl: w.open_access?.oa_url || undefined,
      };
    });
    return { results, total: data.meta?.count || 0 };
  } catch {
    return { results: [], total: 0 };
  }
}

async function searchCORE(query: string, page = 1, perPage = 20): Promise<{ results: SearchResult[]; total: number }> {
  try {
    const offset = (page - 1) * perPage;
    const url = `https://api.core.ac.uk/v3/search/works?q=${encodeURIComponent(query)}&offset=${offset}&limit=${perPage}`;
    const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' } });
    if (!res.ok) throw new Error(`CORE ${res.status}`);
    const data = await res.json();
    const results: SearchResult[] = (data.results || []).map((w: any) => ({
      id: `core-${w.id}`,
      title: w.title || 'Untitled',
      author_names: w.authors?.map((a: any) => a.name).join(', ') || '',
      year_published: w.yearPublished,
      publisher_name: w.publisher || w.journals?.[0]?.title || '',
      doi: w.doi || undefined,
      url: w.sourceFulltextUrls?.[0] || w.downloadUrl || '',
      resource_type: 'article',
      repositorySource: 'CORE',
      abstract: w.abstract || '',
      fieldsOfStudy: w.subjects || [],
      isPeerReviewed: false,
      isOpenAccess: true,
      fullTextUrl: w.downloadUrl || undefined,
    }));
    return { results, total: data.totalHits || 0 };
  } catch {
    return { results: [], total: 0 };
  }
}

async function searchSemanticScholar(query: string, page = 1, perPage = 20): Promise<{ results: SearchResult[]; total: number }> {
  try {
    const offset = (page - 1) * perPage;
    const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&offset=${offset}&limit=${perPage}&fields=title,authors,year,venue,externalIds,openAccessPdf,citationCount,fieldsOfStudy,abstract,isOpenAccess,publicationTypes`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`S2 ${res.status}`);
    const data = await res.json();
    const results: SearchResult[] = (data.data || []).map((p: any) => ({
      id: `s2-${p.paperId}`,
      title: p.title || 'Untitled',
      author_names: p.authors?.map((a: any) => a.name).join(', ') || '',
      year_published: p.year,
      publisher_name: p.venue || '',
      doi: p.externalIds?.DOI || undefined,
      url: p.openAccessPdf?.url || `https://www.semanticscholar.org/paper/${p.paperId}`,
      resource_type: p.publicationTypes?.[0]?.toLowerCase() || 'article',
      repositorySource: 'Semantic Scholar',
      citationCount: p.citationCount || 0,
      abstract: p.abstract || '',
      fieldsOfStudy: p.fieldsOfStudy?.map((f: any) => typeof f === 'string' ? f : f.category) || [],
      isPeerReviewed: p.publicationTypes?.includes('JournalArticle') || false,
      isOpenAccess: p.isOpenAccess || false,
      fullTextUrl: p.openAccessPdf?.url || undefined,
    }));
    return { results, total: data.total || 0 };
  } catch {
    return { results: [], total: 0 };
  }
}

export const repositoryService = {
  async unifiedSearch(query: string, opts: UnifiedSearchOptions = {}): Promise<UnifiedSearchResponse> {
    const { page = 1, perPage = 20, sources = ['OpenAlex', 'Semantic Scholar'] } = opts;

    const promises: Promise<{ results: SearchResult[]; total: number }>[] = [];
    const sourceNames: string[] = [];

    if (sources.includes('OpenAlex')) {
      promises.push(searchOpenAlex(query, page, perPage));
      sourceNames.push('OpenAlex');
    }
    if (sources.includes('CORE')) {
      promises.push(searchCORE(query, page, perPage));
      sourceNames.push('CORE');
    }
    if (sources.includes('Semantic Scholar')) {
      promises.push(searchSemanticScholar(query, page, perPage));
      sourceNames.push('Semantic Scholar');
    }

    const settled = await Promise.allSettled(promises);
    const allResults: SearchResult[] = [];
    const sourceBreakdown: Record<string, number> = {};

    settled.forEach((res, i) => {
      const name = sourceNames[i];
      if (res.status === 'fulfilled') {
        allResults.push(...res.value.results);
        sourceBreakdown[name] = res.value.total;
      } else {
        sourceBreakdown[name] = 0;
      }
    });

    allResults.sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0));

    return { results: allResults, totals: sourceBreakdown };
  }
};
