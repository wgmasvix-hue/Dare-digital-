import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileText, BookMarked } from 'lucide-react';

interface CiteItem {
  id?: string | number;
  title?: string;
  author_names?: string;
  publisher_name?: string;
  year_published?: number | string;
  url?: string;
  doi?: string;
  isbn?: string;
  source?: string;
}

function toBibTeX(items: CiteItem[]): string {
  return items.map(item => {
    const key = ((item.author_names || 'unknown').split(' ').pop()?.toLowerCase() ?? 'unknown') + (item.year_published || '');
    return [
      `@book{${key},`,
      `  author    = {${item.author_names || 'Unknown Author'}},`,
      `  title     = {${item.title || 'Untitled'}},`,
      `  publisher = {${item.publisher_name || ''}},`,
      `  year      = {${item.year_published || ''}},`,
      item.doi    ? `  doi       = {${item.doi}},`    : null,
      item.isbn   ? `  isbn      = {${item.isbn}},`   : null,
      item.url    ? `  url       = {${item.url}},`    : null,
      `}`,
    ].filter(Boolean).join('\n');
  }).join('\n\n');
}

function toRIS(items: CiteItem[]): string {
  return items.map(item => {
    const lines: string[] = [
      'TY  - BOOK',
      `TI  - ${item.title || 'Untitled'}`,
    ];
    if (item.author_names) lines.push(`AU  - ${item.author_names}`);
    if (item.publisher_name) lines.push(`PB  - ${item.publisher_name}`);
    if (item.year_published) lines.push(`PY  - ${item.year_published}`);
    if (item.doi) lines.push(`DO  - ${item.doi}`);
    if (item.isbn) lines.push(`SN  - ${item.isbn}`);
    if (item.url) lines.push(`UR  - ${item.url}`);
    lines.push('ER  -');
    return lines.join('\n');
  }).join('\n\n');
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface CollectionExportProps {
  savedIds: Set<string>;
  publications: CiteItem[];
}

export default function CollectionExport({ savedIds, publications }: CollectionExportProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const savedItems = publications.filter(p => savedIds.has(String(p.id)));
  if (savedIds.size === 0) return null;

  const exportBib = () => {
    download(toBibTeX(savedItems), 'dare-collection.bib', 'text/plain;charset=utf-8');
    setOpen(false);
  };

  const exportRIS = () => {
    download(toRIS(savedItems), 'dare-collection.ris', 'application/x-research-info-systems');
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-sm font-bold transition-all shadow-sm"
      >
        <BookMarked size={15} />
        Export Collection ({savedIds.size})
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 z-50 w-52 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Export {savedIds.size} saved items</p>
          </div>
          <button
            onClick={exportBib}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left"
          >
            <FileText size={14} className="text-slate-400" />
            <span>BibTeX (.bib)</span>
            <Download size={12} className="ml-auto text-slate-300" />
          </button>
          <button
            onClick={exportRIS}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left"
          >
            <FileText size={14} className="text-slate-400" />
            <span>RIS / Zotero (.ris)</span>
            <Download size={12} className="ml-auto text-slate-300" />
          </button>
        </div>
      )}
    </div>
  );
}
