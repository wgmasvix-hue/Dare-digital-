export interface SSPaper {
  id: string;
  title: string;
  abstract: string;
  authors: string;
  year: number | null;
  citations: number;
  doi: string | null;
  isOA: boolean;
  pdfUrl: string | null;
  fields: string[];
  types: string[];
  venue: string;
  source: 'Semantic Scholar';
}

export interface SSResponse {
  papers: SSPaper[];
  total: number;
}

interface RawSSPaper {
  paperId: string;
  title?: string;
  abstract?: string;
  year?: number;
  citationCount?: number;
  isOpenAccess?: boolean;
  openAccessPdf?: { url?: string };
  authors?: { name?: string }[];
  externalIds?: { DOI?: string };
  fieldsOfStudy?: string[];
  publicationTypes?: string[];
  venue?: string;
}

const FIELDS =
  'title,abstract,year,citationCount,isOpenAccess,openAccessPdf,authors,externalIds,fieldsOfStudy,publicationTypes,venue';

function reconstructAbstract(inv: Record<string, number[]> | null | undefined): string {
  if (!inv) return 'No abstract available.';
  const words: string[] = [];
  for (const [word, positions] of Object.entries(inv)) {
    for (const pos of positions) words[pos] = word;
  }
  return words.filter(Boolean).join(' ') || 'No abstract available.';
}

async function openAlexFallback(query: string, page: number): Promise<SSResponse> {
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=20&page=${page}&mailto=contact@dare.ac.zw`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Search unavailable (${res.status}). Try the DOAJ or Europe PMC tabs.`);
  const data = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const works: any[] = data.results ?? [];
  return {
    papers: works.map(w => ({
      id: (w.id as string)?.replace('https://openalex.org/', '') ?? Math.random().toString(36).slice(2),
      title: (w.title as string) ?? 'Untitled',
      abstract: reconstructAbstract(w.abstract_inverted_index),
      authors: ((w.authorships ?? []) as { author?: { display_name?: string } }[])
        .map(a => a.author?.display_name ?? '')
        .filter(Boolean)
        .join(', ') || 'Unknown Author',
      year: (w.publication_year as number | null) ?? null,
      citations: (w.cited_by_count as number) ?? 0,
      doi: (w.doi as string | null)?.replace('https://doi.org/', '') ?? null,
      isOA: (w.open_access as { is_oa?: boolean })?.is_oa ?? false,
      pdfUrl: (w.open_access as { oa_url?: string })?.oa_url ?? null,
      fields: ((w.topics ?? []) as { display_name?: string }[]).slice(0, 3).map(t => t.display_name ?? '').filter(Boolean),
      types: [(w.type as string) ?? 'article'],
      venue: (w.primary_location as { source?: { display_name?: string } } | null)?.source?.display_name ?? '',
      source: 'Semantic Scholar' as const,
    })),
    total: (data.meta?.count as number) ?? 0,
  };
}

export const semanticScholarService = {
  async search(query: string, page = 1): Promise<SSResponse> {
    const offset = (page - 1) * 20;
    const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&fields=${FIELDS}&limit=20&offset=${offset}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Semantic Scholar error: ${response.status}`);
      const data = await response.json();

      return {
        papers: ((data.data as RawSSPaper[]) ?? []).map(p => ({
          id: p.paperId,
          title: p.title ?? 'Untitled',
          abstract: p.abstract ?? 'No abstract available.',
          authors: p.authors?.map(a => a.name).filter(Boolean).join(', ') ?? 'Unknown Author',
          year: p.year ?? null,
          citations: p.citationCount ?? 0,
          doi: p.externalIds?.DOI ?? null,
          isOA: p.isOpenAccess ?? false,
          pdfUrl: p.openAccessPdf?.url ?? null,
          fields: p.fieldsOfStudy ?? [],
          types: p.publicationTypes ?? [],
          venue: p.venue ?? '',
          source: 'Semantic Scholar' as const,
        })),
        total: (data.total as number) ?? 0,
      };
    } catch {
      return openAlexFallback(query, page);
    }
  },
};
