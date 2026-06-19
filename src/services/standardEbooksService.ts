import { Book } from '../types';
import { XMLParser } from 'fast-xml-parser';

export interface StandardEbooksResponse {
  books: Book[];
  totalResults: number;
}

interface AtomLink {
  '@_rel'?: string;
  '@_href'?: string;
  '@_type'?: string;
  '@_title'?: string;
}

interface AtomAuthor {
  name?: string;
}

interface AtomEntry {
  id?: string;
  title?: string;
  author?: AtomAuthor | AtomAuthor[];
  summary?: string;
  content?: string;
  link?: AtomLink | AtomLink[];
}

interface AtomFeed {
  feed?: {
    entry?: AtomEntry | AtomEntry[];
    'opensearch:totalResults'?: number | string;
  };
}

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

export const standardEbooksService = {
  async searchBooks(query = '', page = 1): Promise<StandardEbooksResponse> {
    try {
      const url = query.trim()
        ? `https://standardebooks.org/feeds/opds?q=${encodeURIComponent(query)}`
        : `https://standardebooks.org/feeds/opds/all?page=${page}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Standard Ebooks API error: ${response.status}`);
      }

      const xml = await response.text();
      const parsed: AtomFeed = parser.parse(xml);

      const rawEntries = parsed?.feed?.entry;
      const entries: AtomEntry[] = rawEntries
        ? Array.isArray(rawEntries)
          ? rawEntries
          : [rawEntries]
        : [];

      const books: Book[] = entries.map((entry: AtomEntry, idx: number): Book => {
        // Get links array
        const links: AtomLink[] = entry.link
          ? Array.isArray(entry.link)
            ? entry.link
            : [entry.link]
          : [];

        // Find epub file link
        const epubLink = links.find(
          (l) => l['@_type'] && l['@_type'].includes('epub')
        );
        const file_url = epubLink?.['@_href'] || '';

        // Find cover image link
        const imageLink = links.find(
          (l) => l['@_type'] && l['@_type'].includes('image')
        );

        // Find alternate (page) link
        const pageLink = links.find((l) => l['@_rel'] === 'alternate');
        const pageUrl = pageLink?.['@_href'] || '';

        // Extract slug from id or page URL for cover
        const idStr = entry.id || pageUrl || '';
        const slugMatch = idStr.match(/\/ebooks\/([^/]+(?:\/[^/]+)?)\/?$/);
        const slug = slugMatch ? slugMatch[1].replace(/\//g, '_') : `se-${idx}`;

        const coverUrl = imageLink?.['@_href'] || `https://standardebooks.org/images/covers/${slug}.jpg`;

        // Author
        const authorRaw = entry.author;
        let authorName = 'Unknown Author';
        if (authorRaw) {
          if (Array.isArray(authorRaw)) {
            authorName = authorRaw.map((a) => a.name || '').filter(Boolean).join(', ');
          } else {
            authorName = authorRaw.name || 'Unknown Author';
          }
        }

        const description = entry.summary || entry.content || '';

        return {
          id: `se-${slug}-${idx}`,
          title: typeof entry.title === 'string' ? entry.title : 'Unknown Title',
          author_names: authorName,
          description: typeof description === 'string' ? description.substring(0, 400) : '',
          cover_image_url: coverUrl,
          file_url: file_url || pageUrl,
          url: pageUrl,
          language: 'English',
          source: 'Standard Ebooks',
          access_model: 'public_domain',
        };
      });

      const total = parsed?.feed?.['opensearch:totalResults'];
      const totalResults = total ? Number(total) : books.length;

      return { books, totalResults };
    } catch (error) {
      console.error('Standard Ebooks Service Error:', error);
      return { books: [], totalResults: 0 };
    }
  },
};
