import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, BookOpen, FlaskConical, FileText, Newspaper, GraduationCap,
  ExternalLink, Download, Copy, Check, ChevronDown, ChevronUp,
  X, Loader2, BookMarked, Quote, Globe, Bookmark, BookmarkCheck,
  Plus, Trash2, SlidersHorizontal, ChevronLeft, ChevronRight,
  AlertCircle, LayoutList, Sparkles,
} from 'lucide-react';
import { semanticScholarService, SSPaper } from '../services/semanticScholarService';
import { doajService, DOAJArticle } from '../services/doajService';
import { europePMCService, EPMCArticle } from '../services/europePMCService';
import { baseSearchService, BASEDocument } from '../services/baseSearchService';
import { chroniclingAmericaService, CAPage } from '../services/chroniclingAmericaService';

type SourceTab = 'scholar' | 'doaj' | 'epmc' | 'base' | 'ca';
type SortOption = 'relevance' | 'date_desc' | 'date_asc' | 'citations';
type CiteFormat = 'bibtex' | 'apa' | 'mla' | 'chicago' | 'ris';

interface AcademicResult {
  id: string;
  title: string;
  abstract: string;
  authors: string;
  year: number | null;
  doi: string | null;
  url: string | null;
  pdfUrl: string | null;
  citations: number;
  isOA: boolean;
  isPeerReviewed?: boolean;
  type: string;
  venue: string;
  subjects: string[];
  source: string;
  language?: string;
}

interface AdvRow { field: string; op: 'AND' | 'OR' | 'NOT'; value: string }

const FIELD_OPTIONS = [
  { value: 'all', label: 'All Fields' },
  { value: 'title', label: 'Title' },
  { value: 'author', label: 'Author / Creator' },
  { value: 'abstract', label: 'Abstract / Description' },
  { value: 'keyword', label: 'Keywords / Subject' },
  { value: 'doi', label: 'DOI' },
  { value: 'issn', label: 'ISSN / ISBN' },
  { value: 'venue', label: 'Journal / Publisher' },
];

const DOC_TYPES = ['All', 'Article', 'Book', 'Thesis', 'Report', 'Dataset', 'Conference Paper', 'Newspaper'];
const LANGUAGES = ['All Languages', 'English', 'French', 'Portuguese', 'Swahili', 'Arabic', 'Shona', 'Ndebele'];

const SOURCE_STATS = [
  { label: 'OpenAlex Works', count: '240M+' },
  { label: 'Semantic Scholar', count: '200M+' },
  { label: 'Europe PMC', count: '40M+' },
  { label: 'DOAJ Articles', count: '8M+' },
  { label: 'Historical Docs', count: '19M+' },
];

const TABS: { id: SourceTab; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'scholar', label: 'All Research', icon: <BookOpen size={14} />, description: '200M+ scholarly articles' },
  { id: 'doaj', label: 'Open Access Journals', icon: <Globe size={14} />, description: '10M+ peer-reviewed' },
  { id: 'epmc', label: 'Biomedical', icon: <FlaskConical size={14} />, description: '40M+ biomedical papers' },
  { id: 'base', label: 'Theses & Dissertations', icon: <GraduationCap size={14} />, description: '300M+ academic documents' },
  { id: 'ca', label: 'Historical Archive', icon: <Newspaper size={14} />, description: '19M+ historical pages' },
];

const SOURCE_PILL: Record<string, string> = {
  'Semantic Scholar': 'bg-blue-100 text-blue-700 border-blue-200',
  'DOAJ': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Europe PMC': 'bg-purple-100 text-purple-700 border-purple-200',
  'BASE': 'bg-orange-100 text-orange-700 border-orange-200',
  'Chronicling America': 'bg-amber-100 text-amber-700 border-amber-200',
};

const DOC_ICON: Record<string, React.ReactNode> = {
  article: <FileText size={14} className="text-blue-500" />,
  'journal-article': <FileText size={14} className="text-blue-500" />,
  book: <BookOpen size={14} className="text-emerald-600" />,
  thesis: <GraduationCap size={14} className="text-orange-500" />,
  dissertation: <GraduationCap size={14} className="text-orange-500" />,
  newspaper: <Newspaper size={14} className="text-amber-600" />,
  report: <FileText size={14} className="text-slate-500" />,
};

// ── Citation formatters ───────────────────────────────────────────────────

function toBibTeX(r: AcademicResult): string {
  const key = [
    (r.authors.split(',')[0]?.split(' ').pop() ?? 'Unknown').toLowerCase(),
    r.year ?? 'nd',
    r.title.split(' ')[0]?.toLowerCase() ?? 'untitled',
  ].join('');
  const type = r.type === 'dissertation' || r.type === 'thesis' ? '@phdthesis' : '@article';
  const lines = [`${type}{${key},`];
  lines.push(`  title     = {${r.title}},`);
  if (r.authors) lines.push(`  author    = {${r.authors}},`);
  if (r.year) lines.push(`  year      = {${r.year}},`);
  if (r.venue) lines.push(`  journal   = {${r.venue}},`);
  if (r.doi) lines.push(`  doi       = {${r.doi}},`);
  if (r.url) lines.push(`  url       = {${r.url}},`);
  lines.push('}');
  return lines.join('\n');
}

function toAPA(r: AcademicResult): string {
  const authors = r.authors
    ? r.authors.split(',').map(a => {
        const parts = a.trim().split(' ').filter(Boolean);
        if (parts.length === 1) return parts[0];
        const last = parts[parts.length - 1];
        const initials = parts.slice(0, -1).map(p => p[0] + '.').join(' ');
        return `${last}, ${initials}`;
      }).join(', ')
    : 'Unknown Author';
  const year = r.year ? `(${r.year})` : '(n.d.)';
  const venue = r.venue ? ` *${r.venue}*.` : '';
  const doi = r.doi ? ` https://doi.org/${r.doi}` : r.url ? ` ${r.url}` : '';
  return `${authors} ${year}. ${r.title}.${venue}${doi}`;
}

function toMLA(r: AcademicResult): string {
  const first = r.authors ? r.authors.split(',')[0]?.trim() : 'Unknown';
  const venue = r.venue ? `, *${r.venue}*` : '';
  const year = r.year ? `, ${r.year}` : '';
  const doi = r.doi ? `. https://doi.org/${r.doi}` : r.url ? `. ${r.url}` : '';
  return `${first}. "${r.title}"${venue}${year}${doi}.`;
}

function toChicago(r: AcademicResult): string {
  const authors = r.authors
    ? r.authors.split(',').map((a, i) => {
        const name = a.trim();
        if (i > 0) return name;
        const parts = name.split(' ').filter(Boolean);
        if (parts.length < 2) return name;
        return `${parts[parts.length - 1]}, ${parts.slice(0, -1).join(' ')}`;
      }).join(', ')
    : 'Unknown';
  const year = r.year ? ` ${r.year}.` : '';
  const venue = r.venue ? ` *${r.venue}*.` : '';
  const doi = r.doi ? ` https://doi.org/${r.doi}.` : r.url ? ` ${r.url}.` : '';
  return `${authors}.${year} "${r.title}."${venue}${doi}`;
}

function toRIS(r: AcademicResult): string {
  const typeMap: Record<string, string> = { article: 'JOUR', book: 'BOOK', thesis: 'THES', newspaper: 'NEWS' };
  const ty = typeMap[r.type] ?? 'JOUR';
  const lines = [`TY  - ${ty}`];
  if (r.title) lines.push(`TI  - ${r.title}`);
  if (r.authors) r.authors.split(',').forEach(a => lines.push(`AU  - ${a.trim()}`));
  if (r.year) lines.push(`PY  - ${r.year}///`);
  if (r.venue) lines.push(`JO  - ${r.venue}`);
  if (r.doi) lines.push(`DO  - ${r.doi}`);
  if (r.url) lines.push(`UR  - ${r.url}`);
  if (r.abstract) lines.push(`AB  - ${r.abstract}`);
  r.subjects.forEach(s => lines.push(`KW  - ${s}`));
  lines.push('ER  - ');
  return lines.join('\n');
}

// ── Map functions ─────────────────────────────────────────────────────────

function mapSS(p: SSPaper): AcademicResult {
  return {
    id: `ss-${p.id}`, title: p.title, abstract: p.abstract, authors: p.authors,
    year: p.year, doi: p.doi, url: p.doi ? `https://doi.org/${p.doi}` : `https://www.semanticscholar.org/paper/${p.id}`,
    pdfUrl: p.pdfUrl, citations: p.citations, isOA: p.isOA, isPeerReviewed: true,
    type: p.types[0] ?? 'article', venue: p.venue, subjects: p.fields, source: 'Semantic Scholar',
  };
}
function mapDOAJ(a: DOAJArticle): AcademicResult {
  return {
    id: `doaj-${a.id}`, title: a.title, abstract: a.abstract, authors: a.authors,
    year: a.year, doi: a.doi, url: a.url ?? (a.doi ? `https://doi.org/${a.doi}` : null),
    pdfUrl: null, citations: 0, isOA: true, isPeerReviewed: true,
    type: 'journal-article', venue: a.journal, subjects: a.subjects, source: 'DOAJ',
  };
}
function mapEPMC(a: EPMCArticle): AcademicResult {
  return {
    id: `epmc-${a.id}`, title: a.title, abstract: a.abstract, authors: a.authors,
    year: a.year, doi: a.doi, url: a.doi ? `https://doi.org/${a.doi}` : (a.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/` : null),
    pdfUrl: a.pdfUrl, citations: 0, isOA: a.isOA,
    type: 'journal-article', venue: a.journal, subjects: [], source: 'Europe PMC',
  };
}
function mapBASE(d: BASEDocument): AcademicResult {
  return {
    id: `base-${d.id}`, title: d.title, abstract: d.abstract, authors: d.authors,
    year: d.year, doi: d.doi, url: d.url, pdfUrl: null, citations: 0, isOA: true,
    type: d.type, venue: d.publisher, subjects: d.subjects, source: 'BASE',
  };
}
function mapCA(p: CAPage): AcademicResult {
  return {
    id: `ca-${p.id}`, title: `${p.title} — ${p.date}`,
    abstract: `Historical newspaper page from ${p.city}${p.city && p.state ? ', ' : ''}${p.state}. Edition: ${p.edition || 'N/A'}.`,
    authors: p.city && p.state ? `${p.city}, ${p.state}` : 'Library of Congress',
    year: p.year, doi: null, url: p.url, pdfUrl: p.pdfUrl, citations: 0, isOA: true,
    type: 'newspaper', venue: p.title, subjects: ['History', 'Journalism'], source: 'Chronicling America',
  };
}

// ── Sub-components ────────────────────────────────────────────────────────

function CiteModal({ result, onClose }: { result: AcademicResult; onClose: () => void }) {
  const [fmt, setFmt] = useState<CiteFormat>('apa');
  const [copied, setCopied] = useState(false);

  const text = fmt === 'bibtex' ? toBibTeX(result)
    : fmt === 'apa' ? toAPA(result)
    : fmt === 'mla' ? toMLA(result)
    : fmt === 'chicago' ? toChicago(result)
    : toRIS(result);

  const copy = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const FMTS: { id: CiteFormat; label: string }[] = [
    { id: 'apa', label: 'APA 7th' }, { id: 'mla', label: 'MLA 9th' },
    { id: 'chicago', label: 'Chicago' }, { id: 'bibtex', label: 'BibTeX' }, { id: 'ris', label: 'RIS' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <BookMarked size={18} className="text-green-700" /> Export Citation
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X size={18} /></button>
        </div>
        <div className="px-6 pt-4">
          <p className="text-sm font-semibold text-slate-700 mb-1 line-clamp-1">{result.title}</p>
          <p className="text-xs text-slate-400 mb-4">{result.authors} {result.year ? `(${result.year})` : ''}</p>
          <div className="flex gap-1 mb-3 flex-wrap">
            {FMTS.map(f => (
              <button key={f.id} onClick={() => setFmt(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${fmt === f.id ? 'bg-green-700 text-white border-green-700' : 'bg-white text-slate-600 border-slate-200 hover:border-green-300 hover:text-green-700'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <pre className={`bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-700 overflow-x-auto whitespace-pre-wrap mb-4 max-h-48 ${fmt === 'apa' || fmt === 'mla' || fmt === 'chicago' ? 'font-sans text-sm leading-relaxed' : ''}`}>
            {text}
          </pre>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={copy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-700 text-white font-bold rounded-xl hover:bg-green-600 transition-colors">
            {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200">Close</button>
        </div>
      </div>
    </div>
  );
}

function ResultRow({
  result, selected, onSelect, onCite, onSave, saved,
}: {
  result: AcademicResult;
  selected: boolean;
  onSelect: () => void;
  onCite: () => void;
  onSave: () => void;
  saved: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const PREVIEW = 220;
  const hasLong = result.abstract && result.abstract.length > PREVIEW;
  const abstract = !result.abstract || result.abstract === 'No abstract available.' ? null : result.abstract;
  const displayAbstract = expanded ? abstract : abstract?.slice(0, PREVIEW) + (hasLong ? '…' : '');

  return (
    <div className={`group border-b border-slate-200 last:border-0 py-4 px-1 transition-colors ${selected ? 'bg-green-50/40' : 'hover:bg-slate-50/70'}`}>
      <div className="flex gap-3">
        {/* Checkbox */}
        <div className="pt-0.5 shrink-0">
          <input type="checkbox" checked={selected} onChange={onSelect}
            className="w-4 h-4 rounded border-slate-300 text-green-700 focus:ring-green-600 cursor-pointer" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className="text-slate-400">{DOC_ICON[result.type.toLowerCase()] ?? <FileText size={14} className="text-slate-400" />}</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${SOURCE_PILL[result.source] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
              {result.source}
            </span>
            {result.isOA && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Open Access
              </span>
            )}
            {result.isPeerReviewed && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Peer Reviewed
              </span>
            )}
            {result.year && <span className="text-[11px] text-slate-400 font-mono">{result.year}</span>}
            {result.citations > 0 && (
              <span className="text-[11px] text-slate-400 ml-auto shrink-0">
                Cited by <span className="font-bold text-slate-600">{result.citations.toLocaleString()}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-[15px] leading-snug mb-1 group-hover:text-green-800 transition-colors">
            {result.url ? (
              <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-2">
                {result.title}
              </a>
            ) : result.title}
          </h3>

          {/* Authors + venue */}
          <p className="text-sm text-slate-600 mb-0.5 truncate">{result.authors}</p>
          {result.venue && (
            <p className="text-xs text-slate-400 italic mb-2 truncate">{result.venue}</p>
          )}

          {/* Abstract */}
          {displayAbstract && (
            <div className="mb-2">
              <p className="text-sm text-slate-600 leading-relaxed">{displayAbstract}</p>
              {hasLong && (
                <button onClick={() => setExpanded(!expanded)}
                  className="text-xs text-green-700 hover:text-green-600 mt-0.5 flex items-center gap-0.5 font-semibold">
                  {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Show more</>}
                </button>
              )}
            </div>
          )}

          {/* Subject tags */}
          {result.subjects.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {result.subjects.slice(0, 5).map(s => (
                <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">{s}</span>
              ))}
            </div>
          )}

          {/* DOI */}
          {result.doi && (
            <p className="text-[11px] text-slate-400 font-mono mb-2 truncate">DOI: {result.doi}</p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {result.pdfUrl && (
              <a href={result.pdfUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-green-700 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors">
                <Download size={11} /> Full Text PDF
              </a>
            )}
            {result.url && (
              <a href={result.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors border border-slate-200">
                <ExternalLink size={11} /> View Source
              </a>
            )}
            <button onClick={onCite}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors border border-slate-200">
              <Quote size={11} /> Cite
            </button>
            <button onClick={onSave}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${saved ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}`}>
              {saved ? <><BookmarkCheck size={11} /> Saved</> : <><Bookmark size={11} /> Save</>}
            </button>
            <button
              onClick={() => window.open(`https://dare.co.zw/academic?q=${encodeURIComponent(result.title)}`, '_blank')}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg hover:bg-amber-100 transition-colors border border-amber-200">
              <Sparkles size={11} /> DARA Assist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export default function AcademicDatabase() {
  const [activeTab, setActiveTab] = useState<SourceTab>('scholar');
  const [query, setQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState<AcademicResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [citeTarget, setCiteTarget] = useState<AcademicResult | null>(null);
  const [oaOnly, setOaOnly] = useState(false);
  const [peerOnly, setPeerOnly] = useState(false);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [docType, setDocType] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advRows, setAdvRows] = useState<AdvRow[]>([
    { field: 'all', op: 'AND', value: '' },
    { field: 'author', op: 'AND', value: '' },
  ]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [savedItems, setSavedItems] = useState<AcademicResult[]>(() => {
    try { return JSON.parse(localStorage.getItem('dare-reading-list') ?? '[]'); } catch { return []; }
  });
  const [showReadingList, setShowReadingList] = useState(false);
  const [batchExported, setBatchExported] = useState(false);

  const savedSet = new Set(savedItems.map(s => s.id));

  const persist = (items: AcademicResult[]) => {
    setSavedItems(items);
    localStorage.setItem('dare-reading-list', JSON.stringify(items));
  };

  const toggleSave = (r: AcademicResult) => {
    if (savedSet.has(r.id)) {
      persist(savedItems.filter(s => s.id !== r.id));
    } else {
      persist([...savedItems, r]);
    }
  };

  const doSearch = useCallback(async (q: string, tab: SourceTab, pg: number, append = false) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      let mapped: AcademicResult[] = [];
      let tot = 0;
      if (tab === 'scholar') { const r = await semanticScholarService.search(q, pg); mapped = r.papers.map(mapSS); tot = r.total; }
      else if (tab === 'doaj') { const r = await doajService.search(q, pg); mapped = r.articles.map(mapDOAJ); tot = r.total; }
      else if (tab === 'epmc') { const r = await europePMCService.search(q, pg); mapped = r.articles.map(mapEPMC); tot = r.total; }
      else if (tab === 'base') { const r = await baseSearchService.search(q, pg); mapped = r.documents.map(mapBASE); tot = r.total; }
      else if (tab === 'ca') { const r = await chroniclingAmericaService.search(q, pg); mapped = r.pages.map(mapCA); tot = r.total; }

      if (oaOnly) mapped = mapped.filter(r => r.isOA);
      if (peerOnly) mapped = mapped.filter(r => r.isPeerReviewed);
      if (yearFrom) mapped = mapped.filter(r => !r.year || r.year >= parseInt(yearFrom));
      if (yearTo) mapped = mapped.filter(r => !r.year || r.year <= parseInt(yearTo));
      if (docType !== 'All') mapped = mapped.filter(r => r.type.toLowerCase().includes(docType.toLowerCase()));

      if (sortBy === 'date_desc') mapped.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
      else if (sortBy === 'date_asc') mapped.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
      else if (sortBy === 'citations') mapped.sort((a, b) => b.citations - a.citations);

      setResults(prev => append ? [...prev, ...mapped] : mapped);
      setTotal(tot);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed. The API may be temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }, [oaOnly, peerOnly, yearFrom, yearTo, docType, sortBy]);

  const handleBasicSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = inputValue.trim();
    if (!q) return;
    setQuery(q);
    setPage(1);
    setResults([]);
    setSelectedIds(new Set());
    doSearch(q, activeTab, 1, false);
  };

  const handleAdvancedSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const parts = advRows.filter(r => r.value.trim()).map((r, i) => {
      const prefix = i === 0 ? '' : `${r.op} `;
      const fieldPrefix = r.field !== 'all' ? `${r.field}:` : '';
      return `${prefix}${fieldPrefix}${r.value.trim()}`;
    });
    const q = parts.join(' ').trim();
    if (!q) return;
    setInputValue(q);
    setQuery(q);
    setPage(1);
    setResults([]);
    setSelectedIds(new Set());
    setShowAdvanced(false);
    doSearch(q, activeTab, 1, false);
  };

  const handleTabChange = (tab: SourceTab) => {
    setActiveTab(tab);
    setPage(1);
    setResults([]);
    setSelectedIds(new Set());
    if (query) doSearch(query, tab, 1, false);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    doSearch(query, activeTab, next, true);
  };

  useEffect(() => {
    if (query) { setPage(1); setResults([]); doSearch(query, activeTab, 1, false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oaOnly, peerOnly, yearFrom, yearTo, docType, sortBy]);

  const toggleSelectAll = () => {
    if (selectedIds.size === results.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(results.map(r => r.id)));
    }
  };

  const exportSelected = () => {
    const items = results.filter(r => selectedIds.has(r.id));
    const bibtex = items.map(toBibTeX).join('\n\n');
    const blob = new Blob([bibtex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'dare-citations.bib'; a.click();
    URL.revokeObjectURL(url);
    setBatchExported(true);
    setTimeout(() => setBatchExported(false), 2000);
  };

  const hasMore = results.length < total && results.length > 0;
  const activeTabConfig = TABS.find(t => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* ── Header ── */}
      <div className="bg-[#0D1F17] border-b border-green-900/40 pt-20 pb-0 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-green-800/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-60 h-60 rounded-full bg-amber-700/10 blur-3xl pointer-events-none" />
        {/* Flag stripe */}
        <div className="absolute top-0 left-0 w-full h-1 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, #166534 0% 25%, #D97706 25% 50%, #C2410C 50% 75%, #1C1917 75% 100%)' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-6 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-green-700 mb-4">
            <span>DARE Digital Library</span>
            <ChevronRight size={12} />
            <span className="text-green-400 font-semibold">Academic Database</span>
          </div>

          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-900/60 border border-green-700/40 text-green-300 text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                <GraduationCap size={11} />
                500M+ Peer-Reviewed Documents
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none">
                Academic <span className="text-green-400">Database</span>
              </h1>
              <p className="text-stone-400 text-sm mt-1.5 font-medium">
                Semantic Scholar · DOAJ · Europe PMC · BASE · Chronicling America
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowReadingList(!showReadingList)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${showReadingList ? 'bg-amber-500 text-white border-amber-500' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
              >
                <BookMarked size={15} />
                Reading List
                {savedItems.length > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {savedItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Source stats strip */}
          <div className="flex gap-6 mb-6 overflow-x-auto scrollbar-hide pb-1">
            {SOURCE_STATS.map((s, i) => (
              <div key={s.label} className="shrink-0">
                <div className="text-xl font-black text-amber-400 leading-none">{s.count}</div>
                <div className="text-[10px] text-stone-500 mt-0.5 whitespace-nowrap font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search bar */}
          <form onSubmit={handleBasicSearch}>
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Search papers, theses, journals, historical documents…"
                  className="w-full pl-10 pr-4 py-3.5 bg-white/10 border border-white/15 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm backdrop-blur-sm"
                />
              </div>
              <button type="submit"
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors shadow-sm text-sm">
                Search
              </button>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className={`px-3 py-3 rounded-xl font-bold border text-sm flex items-center gap-1.5 transition-all ${showAdvanced ? 'bg-amber-500 text-white border-amber-500' : 'bg-white/10 text-white border-white/15 hover:bg-white/20'}`}>
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline">Advanced</span>
              </button>
            </div>
          </form>

          {/* Advanced Search Panel */}
          {showAdvanced && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
              <form onSubmit={handleAdvancedSearch} className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-slate-700">Advanced Search</h3>
                  <button type="button" onClick={() => setShowAdvanced(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                </div>

                {advRows.map((row, i) => (
                  <div key={i} className="flex gap-2 items-center flex-wrap">
                    {i > 0 && (
                      <select value={row.op} onChange={e => { const r = [...advRows]; r[i] = { ...r[i], op: e.target.value as 'AND'|'OR'|'NOT' }; setAdvRows(r); }}
                        className="w-20 px-2 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-green-600">
                        <option>AND</option><option>OR</option><option>NOT</option>
                      </select>
                    )}
                    <select value={row.field} onChange={e => { const r = [...advRows]; r[i] = { ...r[i], field: e.target.value }; setAdvRows(r); }}
                      className="w-44 px-2 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-green-600">
                      {FIELD_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                    <input type="text" value={row.value} onChange={e => { const r = [...advRows]; r[i] = { ...r[i], value: e.target.value }; setAdvRows(r); }}
                      placeholder="Enter search term…"
                      className="flex-1 min-w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-green-600" />
                    {advRows.length > 1 && (
                      <button type="button" onClick={() => setAdvRows(advRows.filter((_, j) => j !== i))}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={14} /></button>
                    )}
                  </div>
                ))}

                <button type="button" onClick={() => setAdvRows([...advRows, { field: 'all', op: 'AND', value: '' }])}
                  className="flex items-center gap-1 text-xs text-green-700 font-bold hover:text-green-600">
                  <Plus size={13} /> Add search row
                </button>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Document Type</label>
                    <select value={docType} onChange={e => setDocType(e.target.value)}
                      className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-green-600">
                      {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Year From</label>
                    <input type="number" placeholder="e.g. 2000" value={yearFrom} onChange={e => setYearFrom(e.target.value)} min="1800" max="2025"
                      className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-green-600" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Year To</label>
                    <input type="number" placeholder="e.g. 2025" value={yearTo} onChange={e => setYearTo(e.target.value)} min="1800" max="2025"
                      className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-green-600" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Language</label>
                    <select className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-green-600">
                      {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={oaOnly} onChange={e => setOaOnly(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-green-700 focus:ring-green-600" />
                    Open Access only
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={peerOnly} onChange={e => setPeerOnly(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-green-700 focus:ring-green-600" />
                    Peer-reviewed only
                  </label>
                </div>

                <div className="flex gap-2 pt-1">
                  <button type="submit"
                    className="px-6 py-2.5 bg-green-700 text-white font-bold rounded-xl hover:bg-green-600 transition-colors text-sm">
                    Search
                  </button>
                  <button type="button"
                    onClick={() => { setAdvRows([{ field: 'all', op: 'AND', value: '' }, { field: 'author', op: 'AND', value: '' }]); setDocType('All'); setYearFrom(''); setYearTo(''); setOaOnly(false); setPeerOnly(false); }}
                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm">
                    Clear
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Source tabs */}
          <div className="flex gap-0 overflow-x-auto scrollbar-hide border-t border-white/10 -mx-4 sm:-mx-6 px-4 sm:px-6">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3.5 font-bold text-sm whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id ? 'border-green-400 text-green-400' : 'border-transparent text-stone-500 hover:text-stone-200 hover:border-stone-600'}`}>
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* ── Left sidebar filters ── */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-24 space-y-5">
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">Refine Results</h3>

              {/* Access type */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Access Type</p>
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer mb-1.5">
                  <input type="checkbox" checked={oaOnly} onChange={e => setOaOnly(e.target.checked)} className="w-3.5 h-3.5 rounded border-slate-300 text-green-700 focus:ring-green-600" />
                  Open Access only
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={peerOnly} onChange={e => setPeerOnly(e.target.checked)} className="w-3.5 h-3.5 rounded border-slate-300 text-green-700 focus:ring-green-600" />
                  Peer-reviewed
                </label>
              </div>

              {/* Document type */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Document Type</p>
                <div className="space-y-1">
                  {DOC_TYPES.slice(0, 6).map(t => (
                    <button key={t} onClick={() => setDocType(t)}
                      className={`block w-full text-left text-sm px-2 py-1 rounded-lg transition-colors ${docType === t ? 'bg-green-50 text-green-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date range */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Publication Year</p>
                <div className="flex gap-1.5">
                  <input type="number" placeholder="From" value={yearFrom} onChange={e => setYearFrom(e.target.value)} min="1800" max="2025"
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-green-600" />
                  <input type="number" placeholder="To" value={yearTo} onChange={e => setYearTo(e.target.value)} min="1800" max="2025"
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-green-600" />
                </div>
              </div>

              {/* Sort */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Sort By</p>
                <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}
                  className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-green-600">
                  <option value="relevance">Relevance</option>
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="citations">Most Cited</option>
                </select>
              </div>

              {(oaOnly || peerOnly || yearFrom || yearTo || docType !== 'All') && (
                <button onClick={() => { setOaOnly(false); setPeerOnly(false); setYearFrom(''); setYearTo(''); setDocType('All'); }}
                  className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1">
                  <X size={11} /> Clear all filters
                </button>
              )}
            </div>
          </aside>

          {/* ── Results pane ── */}
          <div className="flex-1 min-w-0">
            {/* Reading list panel */}
            {showReadingList && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-amber-900 flex items-center gap-2"><BookMarked size={16} /> Reading List ({savedItems.length})</h3>
                  <button onClick={() => setShowReadingList(false)} className="text-amber-500 hover:text-amber-700"><X size={16} /></button>
                </div>
                {savedItems.length === 0 ? (
                  <p className="text-sm text-amber-700">No saved items yet. Click "Save" on any result to add it here.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {savedItems.map(item => (
                      <div key={item.id} className="flex items-start gap-2 text-sm">
                        <button onClick={() => persist(savedItems.filter(s => s.id !== item.id))} className="mt-0.5 text-amber-400 hover:text-red-500 shrink-0"><Trash2 size={13} /></button>
                        <div>
                          <p className="font-semibold text-amber-900 line-clamp-1">{item.title}</p>
                          <p className="text-xs text-amber-600">{item.authors} • {item.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {savedItems.length > 0 && (
                  <button onClick={() => { const b = savedItems.map(toBibTeX).join('\n\n'); const el = document.createElement('a'); el.href = URL.createObjectURL(new Blob([b], {type:'text/plain'})); el.download = 'dare-reading-list.bib'; el.click(); }}
                    className="mt-3 flex items-center gap-1.5 text-xs text-amber-700 font-bold hover:text-amber-900">
                    <Download size={12} /> Export all as BibTeX
                  </button>
                )}
              </div>
            )}

            {/* Empty / prompt state */}
            {!query && (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-700 scale-125">{activeTabConfig.icon}</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-1">{activeTabConfig.label}</h2>
                <p className="text-slate-500 text-sm mb-2">{activeTabConfig.description}</p>
                <p className="text-slate-400 text-sm mb-8">Enter a search term above to explore the database</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['climate change Africa', 'Zimbabwe education policy', 'malaria treatment', 'machine learning healthcare'].map(q => (
                    <button key={q} onClick={() => { setInputValue(q); setQuery(q); setResults([]); doSearch(q, activeTab, 1, false); }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-green-50 hover:text-green-700 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 hover:border-green-200 transition-all">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start gap-3 text-sm text-red-700">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>{error} — Try switching to a different source tab above.</div>
              </div>
            )}

            {/* Results header + batch toolbar */}
            {query && results.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 mb-3 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <input type="checkbox"
                    checked={selectedIds.size === results.length && results.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-green-700 focus:ring-green-600" />
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{total.toLocaleString()}</span>
                    <span className="text-slate-500 text-sm"> results for </span>
                    <span className="font-bold text-slate-700 text-sm">"{query}"</span>
                    {selectedIds.size > 0 && (
                      <span className="text-slate-400 text-xs ml-2">({selectedIds.size} selected)</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {selectedIds.size > 0 && (
                    <button onClick={exportSelected}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors">
                      {batchExported ? <><Check size={12} /> Exported!</> : <><Download size={12} /> Export {selectedIds.size} citations</>}
                    </button>
                  )}
                  <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}
                    className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-green-600 lg:hidden">
                    <option value="relevance">Relevance</option>
                    <option value="date_desc">Newest</option>
                    <option value="date_asc">Oldest</option>
                    <option value="citations">Most Cited</option>
                  </select>
                  <span className="text-xs text-slate-400">{results.length} of {total.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Result list */}
            {results.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 px-4">
                {results.map(r => (
                  <ResultRow
                    key={r.id}
                    result={r}
                    selected={selectedIds.has(r.id)}
                    onSelect={() => {
                      const s = new Set(selectedIds);
                      s.has(r.id) ? s.delete(r.id) : s.add(r.id);
                      setSelectedIds(s);
                    }}
                    onCite={() => setCiteTarget(r)}
                    onSave={() => toggleSave(r)}
                    saved={savedSet.has(r.id)}
                  />
                ))}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex justify-center py-12">
                <div className="flex items-center gap-3 text-slate-500">
                  <Loader2 className="animate-spin text-green-700" size={24} />
                  <span className="text-sm font-semibold">Searching {activeTabConfig.label}…</span>
                </div>
              </div>
            )}

            {/* Empty search result */}
            {query && !loading && results.length === 0 && !error && (
              <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
                <Search className="mx-auto text-slate-200 mb-4" size={48} />
                <h3 className="text-lg font-bold text-slate-700 mb-1">No results found</h3>
                <p className="text-slate-400 text-sm">Try a different query, remove filters, or switch to another database tab.</p>
              </div>
            )}

            {/* Load more */}
            {hasMore && !loading && (
              <button onClick={loadMore}
                className="w-full mt-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-green-400 hover:text-green-700 transition-all flex items-center justify-center gap-2">
                <ChevronDown size={16} /> Load more results
              </button>
            )}
          </div>
        </div>
      </div>

      {citeTarget && <CiteModal result={citeTarget} onClose={() => setCiteTarget(null)} />}
    </div>
  );
}
