export interface DOAJArticle {
  id: string;
  title: string;
  abstract: string;
  authors: string;
  year: number | null;
  doi: string | null;
  journal: string;
  issn: string | null;
  url: string | null;
  language: string;
  subjects: string[];
  source: 'DOAJ';
}

export interface DOAJResponse {
  articles: DOAJArticle[];
  total: number;
}

interface RawDOAJResult {
  id?: string;
  bibjson?: {
    title?: string;
    abstract?: string;
    author?: { name?: string }[];
    year?: string;
    identifier?: { type?: string; id?: string }[];
    journal?: { title?: string; issn?: string[] };
    link?: { type?: string; url?: string }[];
    subject?: { term?: string }[];
    language?: string[];
  };
}

export const doajService = {
  async search(query: string, page = 1): Promise<DOAJResponse> {
    const url = `https://doaj.org/api/search/articles/${encodeURIComponent(query)}?page=${page}&pageSize=20`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) throw new Error(`DOAJ error: ${response.status}`);
    const data = await response.json();

    const results: RawDOAJResult[] = data.results ?? [];
    return {
      articles: results.map(r => {
        const bib = r.bibjson ?? {};
        const doi = bib.identifier?.find(i => i.type === 'doi')?.id ?? null;
        const fullTextLink = bib.link?.find(l => l.type === 'fulltext')?.url ?? null;
        return {
          id: r.id ?? Math.random().toString(36).slice(2),
          title: bib.title ?? 'Untitled',
          abstract: bib.abstract ?? 'No abstract available.',
          authors: bib.author?.map(a => a.name).filter(Boolean).join(', ') ?? 'Unknown Author',
          year: bib.year ? parseInt(bib.year, 10) : null,
          doi: doi ?? null,
          journal: bib.journal?.title ?? '',
          issn: bib.journal?.issn?.[0] ?? null,
          url: fullTextLink,
          language: bib.language?.[0] ?? 'EN',
          subjects: bib.subject?.map(s => s.term ?? '').filter(Boolean) ?? [],
          source: 'DOAJ' as const,
        };
      }),
      total: (data.total as number) ?? 0,
    };
  },
};
