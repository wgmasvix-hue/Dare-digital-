import { useState, useRef, useEffect } from 'react';
import { Quote, Copy, Check, ChevronDown } from 'lucide-react';

interface CitationItem {
  title?: string;
  author_names?: string;
  publisher_name?: string;
  year_published?: number | string;
  url?: string;
}

interface CitationMenuProps {
  item: CitationItem;
  className?: string;
}

function formatAPA({ title, author_names, publisher_name, year_published, url }: CitationItem): string {
  const author = author_names || 'Unknown Author';
  const year = year_published ? `(${year_published})` : '(n.d.)';
  const pub = publisher_name ? `${publisher_name}.` : '';
  const link = url ? ` ${url}` : '';
  return `${author} ${year}. ${title || 'Untitled'}. ${pub}${link}`.trim();
}

function formatMLA({ title, author_names, publisher_name, year_published, url }: CitationItem): string {
  const author = author_names || 'Unknown Author';
  const pub = publisher_name ? `${publisher_name}, ` : '';
  const year = year_published || 'n.d.';
  const link = url ? ` Web. <${url}>` : '';
  return `${author}. "${title || 'Untitled'}". ${pub}${year}.${link}`.trim();
}

function formatChicago({ title, author_names, publisher_name, year_published, url }: CitationItem): string {
  const author = author_names || 'Unknown Author';
  const pub = publisher_name ? `${publisher_name}, ` : '';
  const year = year_published || 'n.d.';
  const link = url ? ` ${url}.` : '';
  return `${author}. "${title || 'Untitled'}". ${pub}${year}.${link}`.trim();
}

function formatBibTeX({ title, author_names, publisher_name, year_published, url }: CitationItem): string {
  const key = (author_names || 'unknown').split(' ').pop()?.toLowerCase() + (year_published || '');
  const lines = [
    `@book{${key},`,
    `  author    = {${author_names || 'Unknown Author'}},`,
    `  title     = {${title || 'Untitled'}},`,
    `  publisher = {${publisher_name || ''}},`,
    `  year      = {${year_published || ''}},`,
    url ? `  url       = {${url}},` : null,
    `}`,
  ].filter(Boolean);
  return lines.join('\n');
}

const FORMATS = [
  { id: 'APA',     label: 'APA 7th',  fn: formatAPA },
  { id: 'MLA',     label: 'MLA 9th',  fn: formatMLA },
  { id: 'Chicago', label: 'Chicago',  fn: formatChicago },
  { id: 'BibTeX',  label: 'BibTeX',   fn: formatBibTeX },
];

export default function CitationMenu({ item, className = '' }: CitationMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const copy = async (formatId: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(formatId);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-xs font-bold transition-all"
      >
        <Quote size={12} /> Cite <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute bottom-full mb-2 left-0 z-50 w-52 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Export Citation</p>
          </div>
          {FORMATS.map(fmt => {
            const text = fmt.fn(item);
            const isCopied = copied === fmt.id;
            return (
              <button
                key={fmt.id}
                onClick={e => copy(fmt.id, text, e)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>{fmt.label}</span>
                {isCopied
                  ? <Check size={13} className="text-teal-500" />
                  : <Copy size={13} className="text-slate-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
