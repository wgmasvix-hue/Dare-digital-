import { Book } from '../types';

export interface OpenAlexFilters {
  type?: string;
  isOA?: boolean;
  yearFrom?: number;
  yearTo?: number;
  conceptId?: string;
  sort?: string;
}

export interface OpenAlexPaper {
  id: string;
  title: string;
  abstract: string;
  authors: string;
  year: number | null;
  citations: number;
  doi: string | null;
  isOA: boolean;
  oaUrl: string | null;
  type: string;
  concepts: string[];
  venue: string;
}

export interface OpenAlexSearchResponse {
  papers: OpenAlexPaper[];
  totalResults: number;
}

interface RawWork {
  id: string;
  title?: string;
  abstract_inverted_index?: Record<string, number[]>;
  authorships?: { author?: { display_name?: string } }[];
  open_access?: { oa_url?: string; is_oa?: boolean };
  publication_year?: number;
  cited_by_count?: number;
  doi?: string;
  type?: string;
  primary_location?: { source?: { display_name?: string } };
  concepts?: { display_name?: string; score?: number }[];
}

function reconstructAbstract(invertedIndex?: Record<string, number[]>): string {
  if (!invertedIndex) return '';
  const entries: [number, string][] = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) entries.push([pos, word]);
  }
  entries.sort((a, b) => a[0] - b[0]);
  return entries.map(([, w]) => w).join(' ');
}

function mapWork(work: RawWork, idx: number): OpenAlexPaper {
  const id = work.id?.split('/').pop() ?? `${idx}`;
  return {
    id,
    title: work.title ?? 'Untitled',
    abstract: reconstructAbstract(work.abstract_inverted_index) || 'No abstract available.',
    authors: work.authorships
      ?.map(a => a.author?.display_name)
      .filter(Boolean)
      .join(', ') ?? 'Unknown Author',
    year: work.publication_year ?? null,
    citations: work.cited_by_count ?? 0,
    doi: work.doi ?? null,
    isOA: work.open_access?.is_oa ?? false,
    oaUrl: work.open_access?.oa_url ?? null,
    type: work.type ?? 'unknown',
    concepts: work.concepts
      ?.filter(c => (c.score ?? 0) > 0.3)
      .slice(0, 5)
      .map(c => c.display_name ?? '') ?? [],
    venue: work.primary_location?.source?.display_name ?? '',
  };
}

const SELECT =
  'id,title,abstract_inverted_index,authorships,open_access,publication_year,cited_by_count,doi,type,primary_location,concepts';
const MAILTO = 'mailto=contact@dare.ac.zw';

export const OPENALEX_CONCEPTS = [
  { id: 'C41008148',  name: 'Computer Science' },
  { id: 'C71924100',  name: 'Medicine' },
  { id: 'C86803240',  name: 'Biology' },
  { id: 'C121332964', name: 'Physics' },
  { id: 'C162324750', name: 'Economics' },
  { id: 'C144024400', name: 'Sociology' },
  { id: 'C185592680', name: 'Chemistry' },
  { id: 'C127413603', name: 'Engineering' },
  { id: 'C17744445',  name: 'Political Science' },
  { id: 'C144133560', name: 'Business' },
  { id: 'C15744967',  name: 'Psychology' },
  { id: 'C95457728',  name: 'History' },
  { id: 'C39432304',  name: 'Environmental Science' },
  { id: 'C33923547',  name: 'Mathematics' },
  { id: 'C191897082', name: 'Linguistics' },
  { id: 'C138496976', name: 'Education' },
  { id: 'C205649164', name: 'Geography' },
  { id: 'C142362112', name: 'Art' },
  { id: 'C17974750',  name: 'Law' },
  { id: 'C192562407', name: 'Materials Science' },
];

export const OPENALEX_TYPES = [
  { value: '',                   label: 'All Types' },
  { value: 'journal-article',    label: 'Journal Article' },
  { value: 'book-chapter',       label: 'Book Chapter' },
  { value: 'conference-paper',   label: 'Conference Paper' },
  { value: 'preprint',           label: 'Preprint' },
  { value: 'dataset',            label: 'Dataset' },
  { value: 'review',             label: 'Review' },
  { value: 'book',               label: 'Book' },
  { value: 'dissertation',       label: 'Dissertation' },
];

export const openAlexService = {
  async search(
    query: string,
    page = 1,
    filters: OpenAlexFilters = {},
  ): Promise<OpenAlexSearchResponse> {
    const params: string[] = [];
    if (query.trim()) params.push(`search=${encodeURIComponent(query)}`);

    const filterParts: string[] = [];
    if (filters.type) filterParts.push(`type:${filters.type}`);
    if (filters.isOA) filterParts.push('is_oa:true');
    if (filters.yearFrom || filters.yearTo) {
      const from = filters.yearFrom ?? 1900;
      const to   = filters.yearTo   ?? new Date().getFullYear();
      filterParts.push(`publication_year:${from}-${to}`);
    }
    if (filters.conceptId) {
      filterParts.push(`concepts.id:https://openalex.org/${filters.conceptId}`);
    }
    if (filterParts.length) params.push(`filter=${filterParts.join(',')}`);

    const sort =
      filters.sort === 'citations' ? 'cited_by_count:desc'
      : filters.sort === 'date'    ? 'publication_date:desc'
      : 'relevance_score:desc';

    params.push(`sort=${sort}`, `page=${page}`, 'per-page=20', `select=${SELECT}`, MAILTO);

    const response = await fetch(`https://api.openalex.org/works?${params.join('&')}`);
    if (!response.ok) throw new Error(`OpenAlex API error: ${response.status}`);
    const data = await response.json();

    return {
      papers: (data.results as RawWork[]).map(mapWork),
      totalResults: (data.meta?.count as number) ?? 0,
    };
  },

  async getFeatured(): Promise<OpenAlexPaper[]> {
    const year = new Date().getFullYear();
    const url = `https://api.openalex.org/works?filter=is_oa:true,publication_year:${year - 2}-${year}&sort=cited_by_count:desc&per-page=9&select=${SELECT}&${MAILTO}`;
    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.results as RawWork[]).map(mapWork);
    } catch {
      return [];
    }
  },

  async getStats(): Promise<{ total: number }> {
    try {
      const res = await fetch(`https://api.openalex.org/works?per-page=1&${MAILTO}`);
      if (!res.ok) return { total: 250_000_000 };
      const data = await res.json();
      return { total: (data.meta?.count as number) ?? 250_000_000 };
    } catch {
      return { total: 250_000_000 };
    }
  },

  async searchResearch(query: string, page = 1): Promise<{ books: Book[]; totalResults: number }> {
    const result = await this.search(query, page);
    const books: Book[] = result.papers.map(p => ({
      id: `openalex-${p.id}`,
      title: p.title,
      author_names: p.authors,
      description: p.abstract,
      cover_image_url: `https://picsum.photos/seed/openalex-${p.id}/400/600`,
      file_url: p.oaUrl ?? `https://openalex.org/W${p.id}`,
      url: `https://openalex.org/W${p.id}`,
      language: 'English',
      source: 'OpenAlex',
      access_model: p.isOA ? 'open_access' : 'restricted',
    }));
    return { books, totalResults: result.totalResults };
  },
};
