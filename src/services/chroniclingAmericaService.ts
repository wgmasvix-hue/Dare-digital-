export interface CAPage {
  id: string;
  title: string;
  date: string;
  year: number | null;
  city: string;
  state: string;
  edition: string;
  url: string;
  pdfUrl: string | null;
  sequence: number;
  source: 'Chronicling America';
}

export interface CAResponse {
  pages: CAPage[];
  total: number;
}

interface RawCAItem {
  id?: string;
  title?: string;
  date?: string;
  city?: string[];
  state?: string[];
  edition_label?: string;
  url?: string;
  pdf_filename?: string;
  sequence?: number;
}

export const chroniclingAmericaService = {
  async search(query: string, page = 1): Promise<CAResponse> {
    const url = `https://chroniclingamerica.loc.gov/search/pages/results/?andtext=${encodeURIComponent(query)}&format=json&rows=20&page=${page}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Chronicling America error: ${response.status}`);
    const data = await response.json();

    const items: RawCAItem[] = data.items ?? [];
    return {
      pages: items.map(item => {
        const year = item.date ? parseInt(item.date.slice(0, 4), 10) : null;
        const baseUrl = 'https://chroniclingamerica.loc.gov';
        const pdfUrl = item.pdf_filename
          ? `${baseUrl}${item.url ?? ''}${item.pdf_filename}`
          : null;
        return {
          id: item.id ?? item.url ?? Math.random().toString(36).slice(2),
          title: item.title ?? 'Historical Newspaper',
          date: item.date ?? '',
          year: year && !isNaN(year) ? year : null,
          city: item.city?.[0] ?? '',
          state: item.state?.[0] ?? '',
          edition: item.edition_label ?? '',
          url: item.url ? `${baseUrl}${item.url}` : baseUrl,
          pdfUrl,
          sequence: item.sequence ?? 1,
          source: 'Chronicling America' as const,
        };
      }),
      total: (data.totalItems as number) ?? 0,
    };
  },
};
