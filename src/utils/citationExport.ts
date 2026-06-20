export interface CitableItem {
  title?: string;
  author_names?: string;
  year_published?: number;
  publisher_name?: string;
  doi?: string;
  url?: string;
  resource_type?: string;
  repositorySource?: string;
  citationCount?: number;
  oaStatus?: string;
}

export type CitationFormat = 'APA' | 'MLA' | 'Chicago' | 'BibTeX' | 'RIS';

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, -1).map(p => p[0] + '.').join(' ');
}

function lastName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1];
}

function authorsAPA(raw: string): string {
  return raw.split(',').map(a => {
    const trimmed = a.trim();
    const ln = lastName(trimmed);
    const ini = initials(trimmed);
    return ini ? `${ln}, ${ini}` : ln;
  }).join(', ');
}

function isArticle(type?: string): boolean {
  return !type || ['article', 'journal-article', 'preprint', 'paper'].some(t => type.toLowerCase().includes(t));
}

export function formatAPA(item: CitableItem): string {
  const author = item.author_names ? authorsAPA(item.author_names) : 'Unknown Author';
  const year = item.year_published ?? 'n.d.';
  const title = item.title ?? 'Untitled';
  const source = item.publisher_name ?? '';
  const doiPart = item.doi ? ` https://doi.org/${item.doi}` : item.url ? ` ${item.url}` : '';
  if (isArticle(item.resource_type)) {
    return `${author} (${year}). ${title}. ${source ? `*${source}*.` : ''}${doiPart}`;
  }
  return `${author} (${year}). *${title}*. ${source}.${doiPart}`;
}

export function formatMLA(item: CitableItem): string {
  const author = item.author_names ?? 'Unknown Author';
  const title = item.title ?? 'Untitled';
  const source = item.publisher_name ?? '';
  const year = item.year_published ?? 'n.d.';
  const doiPart = item.doi ? ` doi:${item.doi}.` : item.url ? ` ${item.url}.` : '';
  return `${author}. "${title}." *${source}*, ${year}.${doiPart}`;
}

export function formatChicago(item: CitableItem): string {
  const author = item.author_names ?? 'Unknown Author';
  const title = item.title ?? 'Untitled';
  const source = item.publisher_name ?? '';
  const year = item.year_published ?? 'n.d.';
  const doiPart = item.doi ? ` https://doi.org/${item.doi}.` : item.url ? ` ${item.url}.` : '';
  return `${author}. "${title}." *${source}* (${year}).${doiPart}`;
}

export function formatBibTeX(item: CitableItem): string {
  const authorSlug = (item.author_names ?? 'unknown').split(/[\s,]+/).find(w => w.length > 2) ?? 'author';
  const key = `${authorSlug.toLowerCase()}${item.year_published ?? 'nd'}`;
  const type = isArticle(item.resource_type) ? 'article' : 'misc';
  const fields: [string, string | number | undefined][] = [
    ['title', item.title],
    ['author', item.author_names],
    ['year', item.year_published],
    ['journal', item.publisher_name],
    ['doi', item.doi],
    ['url', item.url],
  ];
  const body = fields
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `  ${k} = {${v}}`)
    .join(',\n');
  return `@${type}{${key},\n${body}\n}`;
}

export function formatRIS(item: CitableItem): string {
  const type = isArticle(item.resource_type) ? 'JOUR' : 'GEN';
  const lines: string[] = [`TY  - ${type}`];
  if (item.title) lines.push(`TI  - ${item.title}`);
  if (item.author_names) {
    item.author_names.split(',').forEach(a => lines.push(`AU  - ${a.trim()}`));
  }
  if (item.year_published) lines.push(`PY  - ${item.year_published}`);
  if (item.publisher_name) lines.push(`JO  - ${item.publisher_name}`);
  if (item.doi) lines.push(`DO  - ${item.doi}`);
  if (item.url) lines.push(`UR  - ${item.url}`);
  lines.push(`ER  -`);
  return lines.join('\n');
}

export function getCitation(item: CitableItem, format: CitationFormat): string {
  switch (format) {
    case 'APA': return formatAPA(item);
    case 'MLA': return formatMLA(item);
    case 'Chicago': return formatChicago(item);
    case 'BibTeX': return formatBibTeX(item);
    case 'RIS': return formatRIS(item);
  }
}

export function downloadCitation(item: CitableItem, format: 'BibTeX' | 'RIS'): void {
  const content = getCitation(item, format);
  const ext = format === 'BibTeX' ? '.bib' : '.ris';
  const mime = format === 'BibTeX' ? 'application/x-bibtex' : 'application/x-research-info-systems';
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(item.title ?? 'citation').substring(0, 40).replace(/[^a-z0-9]/gi, '_')}${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}
