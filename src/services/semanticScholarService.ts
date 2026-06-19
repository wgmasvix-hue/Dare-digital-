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

export const semanticScholarService = {
  async search(query: string, page = 1): Promise<SSResponse> {
    const offset = (page - 1) * 20;
    const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&fields=${FIELDS}&limit=20&offset=${offset}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'DARE-Digital/1.0 (contact@dare.ac.zw)' },
    });
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
  },
};
