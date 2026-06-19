export interface EPMCArticle {
  id: string;
  title: string;
  abstract: string;
  authors: string;
  year: number | null;
  doi: string | null;
  pmid: string | null;
  journal: string;
  isOA: boolean;
  pdfUrl: string | null;
  source: 'Europe PMC';
}

export interface EPMCResponse {
  articles: EPMCArticle[];
  total: number;
}

interface RawEPMCResult {
  id?: string;
  title?: string;
  abstractText?: string;
  authorString?: string;
  pubYear?: string;
  doi?: string;
  pmid?: string;
  journalTitle?: string;
  isOpenAccess?: string;
  fullTextUrlList?: { fullTextUrl?: { url?: string; documentStyle?: string }[] };
}

export const europePMCService = {
  async search(query: string, page = 1): Promise<EPMCResponse> {
    const cursor = (page - 1) * 20 + 1;
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&format=json&pageSize=20&resultType=core&cursorMark=${cursor === 1 ? '*' : cursor}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Europe PMC error: ${response.status}`);
    const data = await response.json();

    const results: RawEPMCResult[] = data.resultList?.result ?? [];
    return {
      articles: results.map(r => {
        const urls = r.fullTextUrlList?.fullTextUrl ?? [];
        const pdfUrl = urls.find(u => u.documentStyle === 'pdf')?.url ?? null;
        return {
          id: r.id ?? Math.random().toString(36).slice(2),
          title: r.title ?? 'Untitled',
          abstract: r.abstractText ?? 'No abstract available.',
          authors: r.authorString ?? 'Unknown Author',
          year: r.pubYear ? parseInt(r.pubYear, 10) : null,
          doi: r.doi ?? null,
          pmid: r.pmid ?? null,
          journal: r.journalTitle ?? '',
          isOA: r.isOpenAccess === 'Y',
          pdfUrl,
          source: 'Europe PMC' as const,
        };
      }),
      total: (data.hitCount as number) ?? 0,
    };
  },
};
