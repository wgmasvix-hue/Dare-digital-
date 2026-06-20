import { useState, useEffect, useCallback } from 'react';
import {
  Search, BookOpen, FlaskConical, FileText, Newspaper, GraduationCap,
  ExternalLink, Download, Copy, Check, ChevronDown, ChevronUp,
  Filter, X, Loader2, BookMarked, Quote, Globe,
} from 'lucide-react';
import { semanticScholarService, SSPaper } from '../services/semanticScholarService';
import { doajService, DOAJArticle } from '../services/doajService';
import { europePMCService, EPMCArticle } from '../services/europePMCService';
import { baseSearchService, BASEDocument } from '../services/baseSearchService';
import { chroniclingAmericaService, CAPage } from '../services/chroniclingAmericaService';

type SourceTab = 'scholar' | 'doaj' | 'epmc' | 'base' | 'ca';

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
  type: string;
  venue: string;
  subjects: string[];
  source: string;
}

const SOURCE_STATS = [
  { label: 'Semantic Scholar', count: '200M+', color: 'blue' },
  { label: 'DOAJ Articles', count: '10M+', color: 'green' },
  { label: 'Europe PMC', count: '40M+', color: 'purple' },
  { label: 'BASE Theses', count: '300M+', color: 'orange' },
  { label: 'Historical Docs', count: '19M+', color: 'amber' },
];

const TABS: { id: SourceTab; label: string; icon: React.ReactNode; color: string; description: string }[] = [
  { id: 'scholar', label: 'All Research', icon: <BookOpen size={16} />, color: 'blue', description: '200M+ scholarly articles' },
  { id: 'doaj', label: 'Open Access Journals', icon: <Globe size={16} />, color: 'green', description: '10M+ peer-reviewed articles' },
  { id: 'epmc', label: 'Biomedical', icon: <FlaskConical size={16} />, color: 'purple', description: '40M+ biomedical papers' },
  { id: 'base', label: 'Theses & Dissertations', icon: <GraduationCap size={16} />, color: 'orange', description: '300M+ academic documents' },
  { id: 'ca', label: 'Historical Archive', icon: <Newspaper size={16} />, color: 'amber', description: '19M+ historical newspaper pages' },
];

const SOURCE_COLORS: Record<string, string> = {
  'Semantic Scholar': 'bg-blue-100 text-blue-700',
  'DOAJ': 'bg-green-100 text-green-700',
  'Europe PMC': 'bg-purple-100 text-purple-700',
  'BASE': 'bg-orange-100 text-orange-700',
  'Chronicling America': 'bg-amber-100 text-amber-700',
};

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

function mapSS(p: SSPaper): AcademicResult {
  return {
    id: `ss-${p.id}`,
    title: p.title,
    abstract: p.abstract,
    authors: p.authors,
    year: p.year,
    doi: p.doi,
    url: p.doi ? `https://doi.org/${p.doi}` : `https://www.semanticscholar.org/paper/${p.id}`,
    pdfUrl: p.pdfUrl,
    citations: p.citations,
    isOA: p.isOA,
    type: p.types[0] ?? 'article',
    venue: p.venue,
    subjects: p.fields,
    source: 'Semantic Scholar',
  };
}

function mapDOAJ(a: DOAJArticle): AcademicResult {
  return {
    id: `doaj-${a.id}`,
    title: a.title,
    abstract: a.abstract,
    authors: a.authors,
    year: a.year,
    doi: a.doi,
    url: a.url ?? (a.doi ? `https://doi.org/${a.doi}` : null),
    pdfUrl: null,
    citations: 0,
    isOA: true,
    type: 'journal-article',
    venue: a.journal,
    subjects: a.subjects,
    source: 'DOAJ',
  };
}

function mapEPMC(a: EPMCArticle): AcademicResult {
  return {
    id: `epmc-${a.id}`,
    title: a.title,
    abstract: a.abstract,
    authors: a.authors,
    year: a.year,
    doi: a.doi,
    url: a.doi ? `https://doi.org/${a.doi}` : (a.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/` : null),
    pdfUrl: a.pdfUrl,
    citations: 0,
    isOA: a.isOA,
    type: 'journal-article',
    venue: a.journal,
    subjects: [],
    source: 'Europe PMC',
  };
}

function mapBASE(d: BASEDocument): AcademicResult {
  return {
    id: `base-${d.id}`,
    title: d.title,
    abstract: d.abstract,
    authors: d.authors,
    year: d.year,
    doi: d.doi,
    url: d.url,
    pdfUrl: null,
    citations: 0,
    isOA: true,
    type: d.type,
    venue: d.publisher,
    subjects: d.subjects,
    source: 'BASE',
  };
}

function mapCA(p: CAPage): AcademicResult {
  return {
    id: `ca-${p.id}`,
    title: `${p.title} — ${p.date}`,
    abstract: `Historical newspaper page from ${p.city}${p.city && p.state ? ', ' : ''}${p.state}. Edition: ${p.edition || 'N/A'}. Page sequence: ${p.sequence}.`,
    authors: p.city && p.state ? `${p.city}, ${p.state}` : 'Library of Congress',
    year: p.year,
    doi: null,
    url: p.url,
    pdfUrl: p.pdfUrl,
    citations: 0,
    isOA: true,
    type: 'newspaper',
    venue: p.title,
    subjects: ['History', 'Journalism'],
    source: 'Chronicling America',
  };
}

function ResultCard({ result, onCite }: { result: AcademicResult; onCite: (r: AcademicResult) => void }) {
  const [expanded, setExpanded] = useState(false);
  const shortAbstract = result.abstract.length > 280 ? result.abstract.slice(0, 280) + '…' : result.abstract;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex flex-wrap gap-2 items-center">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${SOURCE_COLORS[result.source] ?? 'bg-slate-100 text-slate-600'}`}>
            {result.source}
          </span>
          {result.isOA && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              Open Access
            </span>
          )}
          {result.type && result.type !== 'unknown' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 capitalize">
              {result.type.replace(/-/g, ' ')}
            </span>
          )}
          {result.year && (
            <span className="text-xs text-slate-400 font-mono">{result.year}</span>
          )}
        </div>
        {result.citations > 0 && (
          <div className="text-xs text-slate-500 shrink-0">
            <span className="font-bold text-slate-700">{result.citations.toLocaleString()}</span> citations
          </div>
        )}
      </div>

      <h3 className="font-bold text-slate-900 text-base leading-snug mb-1">
        {result.url ? (
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition-colors">
            {result.title}
          </a>
        ) : result.title}
      </h3>

      {result.authors && (
        <p className="text-sm text-slate-500 mb-2 truncate">{result.authors}</p>
      )}

      {result.venue && (
        <p className="text-xs text-slate-400 mb-2 italic">{result.venue}</p>
      )}

      {result.abstract && result.abstract !== 'No abstract available.' && (
        <div className="mb-3">
          <p className="text-sm text-slate-600 leading-relaxed">
            {expanded ? result.abstract : shortAbstract}
          </p>
          {result.abstract.length > 280 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-1"
            >
              {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Show more</>}
            </button>
          )}
        </div>
      )}

      {result.subjects.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {result.subjects.slice(0, 4).map(s => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{s}</span>
          ))}
        </div>
      )}

      {result.doi && (
        <p className="text-xs text-slate-400 font-mono mb-3 truncate">DOI: {result.doi}</p>
      )}

      <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
        {result.pdfUrl && (
          <a
            href={result.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={12} /> PDF
          </a>
        )}
        {result.url && (
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
          >
            <ExternalLink size={12} /> View Source
          </a>
        )}
        <button
          onClick={() => onCite(result)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
        >
          <Quote size={12} /> Cite
        </button>
      </div>
    </div>
  );
}

function CiteModal({ result, onClose }: { result: AcademicResult; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const bibtex = toBibTeX(result);

  const handleCopy = () => {
    navigator.clipboard.writeText(bibtex).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <BookMarked size={20} className="text-blue-600" /> Export Citation
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-2 font-mono">BibTeX</p>
        <pre className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-700 overflow-x-auto whitespace-pre-wrap mb-4">
          {bibtex}
        </pre>
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy BibTeX</>}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const doSearch = useCallback(async (q: string, tab: SourceTab, pg: number, append = false) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      let mapped: AcademicResult[] = [];
      let tot = 0;

      if (tab === 'scholar') {
        const r = await semanticScholarService.search(q, pg);
        mapped = r.papers.map(mapSS);
        tot = r.total;
      } else if (tab === 'doaj') {
        const r = await doajService.search(q, pg);
        mapped = r.articles.map(mapDOAJ);
        tot = r.total;
      } else if (tab === 'epmc') {
        const r = await europePMCService.search(q, pg);
        mapped = r.articles.map(mapEPMC);
        tot = r.total;
      } else if (tab === 'base') {
        const r = await baseSearchService.search(q, pg);
        mapped = r.documents.map(mapBASE);
        tot = r.total;
      } else if (tab === 'ca') {
        const r = await chroniclingAmericaService.search(q, pg);
        mapped = r.pages.map(mapCA);
        tot = r.total;
      }

      if (oaOnly) mapped = mapped.filter(r => r.isOA);
      if (yearFrom) mapped = mapped.filter(r => r.year === null || r.year >= parseInt(yearFrom));
      if (yearTo) mapped = mapped.filter(r => r.year === null || r.year <= parseInt(yearTo));

      setResults(prev => append ? [...prev, ...mapped] : mapped);
      setTotal(tot);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [oaOnly, yearFrom, yearTo]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = inputValue.trim();
    if (!q) return;
    setQuery(q);
    setPage(1);
    setResults([]);
    doSearch(q, activeTab, 1, false);
  };

  const handleTabChange = (tab: SourceTab) => {
    setActiveTab(tab);
    setPage(1);
    setResults([]);
    if (query) doSearch(query, tab, 1, false);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    doSearch(query, activeTab, next, true);
  };

  useEffect(() => {
    if (query) {
      setPage(1);
      setResults([]);
      doSearch(query, activeTab, 1, false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oaOnly, yearFrom, yearTo]);

  const tabConfig = TABS.find(t => t.id === activeTab)!;
  const hasMore = results.length < total && results.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 pt-28 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <FileText className="text-blue-300" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Academic Database</h1>
              <p className="text-blue-300 text-sm">560M+ scholarly documents across all disciplines</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 mb-8">
            {SOURCE_STATS.map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2">
                <div className="text-white font-black text-lg leading-none">{s.count}</div>
                <div className="text-blue-200 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch}>
            <div className="relative flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Search papers, theses, journals, historical documents…"
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-xl text-base"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-2xl transition-colors shadow-xl"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-4 rounded-2xl font-bold transition-colors shadow-xl flex items-center gap-2 ${showFilters ? 'bg-white text-slate-900' : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'}`}
              >
                <Filter size={18} />
              </button>
            </div>

            {/* Filter row */}
            {showFilters && (
              <div className="mt-3 flex flex-wrap gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                <label className="flex items-center gap-2 text-white text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={oaOnly}
                    onChange={e => setOaOnly(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  Open Access only
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm">Year:</span>
                  <input
                    type="number"
                    placeholder="From"
                    value={yearFrom}
                    onChange={e => setYearFrom(e.target.value)}
                    className="w-24 px-3 py-1.5 rounded-xl text-sm bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none"
                  />
                  <span className="text-blue-300">—</span>
                  <input
                    type="number"
                    placeholder="To"
                    value={yearTo}
                    onChange={e => setYearTo(e.target.value)}
                    className="w-24 px-3 py-1.5 rounded-xl text-sm bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Source Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Active tab info */}
        {!query && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-6">
              <span className="text-blue-500 scale-150">{tabConfig.icon}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">{tabConfig.label}</h2>
            <p className="text-slate-500 mb-2">{tabConfig.description}</p>
            <p className="text-slate-400 text-sm">Enter a search term above to explore the database</p>
          </div>
        )}

        {/* Results header */}
        {query && !loading && results.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="font-bold text-slate-900">{total.toLocaleString()}</span>
              <span className="text-slate-500 ml-1">results for "{query}"</span>
            </div>
            <span className="text-sm text-slate-400">{results.length} loaded</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-red-700 text-sm">
            {error} — The API may be temporarily unavailable. Try a different source tab.
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          {results.map(r => (
            <ResultCard key={r.id} result={r} onCite={setCiteTarget} />
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        )}

        {/* Empty state */}
        {query && !loading && results.length === 0 && !error && (
          <div className="text-center py-16">
            <Search className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-700 mb-1">No results found</h3>
            <p className="text-slate-400 text-sm">Try a different query or switch to another source tab</p>
          </div>
        )}

        {/* Load more */}
        {hasMore && !loading && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors shadow-md"
            >
              Load More Results
            </button>
          </div>
        )}
      </div>

      {/* Citation modal */}
      {citeTarget && (
        <CiteModal result={citeTarget} onClose={() => setCiteTarget(null)} />
      )}
    </div>
  );
}
