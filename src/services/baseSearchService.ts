export interface BASEDocument {
  id: string;
  title: string;
  abstract: string;
  authors: string;
  year: number | null;
  doi: string | null;
  type: string;
  url: string | null;
  publisher: string;
  subjects: string[];
  source: 'BASE';
}

export interface BASEResponse {
  documents: BASEDocument[];
  total: number;
}

interface RawBASEDoc {
  dctitle?: string | string[];
  dcidentifier?: string | string[];
  dcyear?: string;
  dccreator?: string | string[];
  dcdescription?: string | string[];
  dctype?: string | string[];
  dcpublisher?: string | string[];
  dcsubject?: string | string[];
  link?: string;
}

function first(val: string | string[] | undefined): string {
  if (!val) return '';
  return Array.isArray(val) ? val[0] : val;
}

function all(val: string | string[] | undefined): string[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

export const baseSearchService = {
  async search(query: string, page = 1): Promise<BASEResponse> {
    const offset = (page - 1) * 20;
    const url = `https://api.base-search.net/cgi-bin/BaseHttpSearchInterface.fcgi?func=PerformSearch&query=${encodeURIComponent(query)}&hits=20&offset=${offset}&format=json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`BASE Search error: ${response.status}`);
    const data = await response.json();

    const docs: RawBASEDoc[] = data.response?.docs ?? [];
    const total: number = data.response?.numFound ?? 0;

    return {
      documents: docs.map((d, i) => {
        const identifiers = all(d.dcidentifier);
        const doi = identifiers.find(id => id.startsWith('10.') || id.includes('doi.org')) ?? null;
        const url = d.link ?? identifiers.find(id => id.startsWith('http')) ?? null;
        const year = d.dcyear ? parseInt(d.dcyear, 10) : null;
        return {
          id: url ?? `base-${i}`,
          title: first(d.dctitle) || 'Untitled',
          abstract: first(d.dcdescription) || 'No abstract available.',
          authors: all(d.dccreator).filter(Boolean).join(', ') || 'Unknown Author',
          year: isNaN(year as number) ? null : year,
          doi,
          type: first(d.dctype) || 'unknown',
          url,
          publisher: first(d.dcpublisher) || '',
          subjects: all(d.dcsubject).filter(Boolean),
          source: 'BASE' as const,
        };
      }),
      total,
    };
  },
};
