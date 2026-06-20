import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Plus, X, ChevronDown, ChevronUp, Filter,
  ExternalLink, FileText, BookOpen, GraduationCap, Microscope,
  Lock, Unlock, Star, AlertCircle, Loader, SlidersHorizontal,
  RefreshCw, Database, Globe, Sparkles, BookMarked, ArrowUpDown
} from 'lucide-react';
import { repositoryService } from '../services/repositoryService';
import CitationMenu from '../components/research/CitationMenu';

const FIELD_OPTIONS = [
  { value: 'all', label: 'All Fields' },
  { value: 'title', label: 'Title' },
  { value: 'author', label: 'Author' },
  { value: 'abstract', label: 'Abstract' },
  { value: 'subject', label: 'Subject / Keyword' },
  { value: 'doi', label: 'DOI' },
  { value: 'issn', label: 'ISSN' },
];

const BOOLEAN_OPS = ['AND', 'OR', 'NOT'];

const DOC_TYPES = [
  { id: 'article', label: 'Journal Article' },
  { id: 'book', label: 'Book / Chapter' },
  { id: 'dissertation', label: 'Thesis / Dissertation' },
  { id: 'conference', label: 'Conference Paper' },
  { id: 'preprint', label: 'Preprint' },
  { id: 'report', label: 'Report' },
  { id: 'dataset', label: 'Dataset' },
];

const SOURCES = [
  { id: 'openalex', label: 'OpenAlex', count: '250M+', color: 'bg-blue-100 text-blue-800' },
  { id: 'core', label: 'CORE', count: '220M+', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'semantic', label: 'Semantic Scholar', count: '200M+', color: 'bg-purple-100 text-purple-800' },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'date_desc', label: 'Date (Newest)' },
  { value: 'date_asc', label: 'Date (Oldest)' },
  { value: 'citations', label: 'Most Cited' },
  { value: 'title', label: 'Title A–Z' },
];

const SOURCE_COLORS = {
  'OpenAlex': 'bg-blue-100 text-blue-700 border-blue-200',
  'CORE': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Semantic Scholar': 'bg-purple-100 text-purple-700 border-purple-200',
};

const DOC_TYPE_ICONS = {
  article: FileText,
  book: BookOpen,
  dissertation: GraduationCap,
  conference: Microscope,
  preprint: FileText,
  report: FileText,
  dataset: Database,
};

function AccessBadge({ oaStatus, pdfUrl }) {
  if (pdfUrl || oaStatus === 'gold' || oaStatus === 'green' || oaStatus === 'diamond') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200">
        <Unlock size={9} /> Open Access
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-500 border border-slate-200">
      <Lock size={9} /> Restricted
    </span>
  );
}

function DocTypeBadge({ type }) {
  const label = DOC_TYPES.find(d => type?.toLowerCase().includes(d.id))?.label || (type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Article');
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
      {label}
    </span>
  );
}

function ResultCard({ item, index }) {
  const [abstractOpen, setAbstractOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const doiUrl = item.doi ? `https://doi.org/${item.doi}` : null;
  const fullTextUrl = item.pdfUrl || doiUrl || item.url;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-md transition-all group">
      {/* Top badges row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${SOURCE_COLORS[item.repositorySource || item.source] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
          <Database size={9} /> {item.repositorySource || item.source}
        </span>
        <DocTypeBadge type={item.resource_type} />
        <AccessBadge oaStatus={item.oaStatus} pdfUrl={item.pdfUrl} />
        {item.citationCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            ★ {item.citationCount.toLocaleString()} citations
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1.5 group-hover:text-teal-700 transition-colors">
        {fullTextUrl ? (
          <a href={fullTextUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {item.title || 'Untitled'}
          </a>
        ) : (
          item.title || 'Untitled'
        )}
      </h3>

      {/* Authors + year + source */}
      <p className="text-xs text-slate-500 mb-1">
        <span className="font-semibold text-slate-700">{item.author_names || 'Unknown Author'}</span>
        {item.year_published && <span> · {item.year_published}</span>}
        {item.publisher_name && <span> · <em>{item.publisher_name}</em></span>}
        {item.institution && <span className="text-slate-400"> · {item.institution}</span>}
      </p>

      {/* DOI */}
      {item.doi && (
        <p className="text-[11px] text-slate-400 mb-2">
          DOI: <a href={`https://doi.org/${item.doi}`} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">{item.doi}</a>
        </p>
      )}

      {/* Fields of study */}
      {item.fieldsOfStudy?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.fieldsOfStudy.slice(0, 4).map(f => (
            <span key={f} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {f}
            </span>
          ))}
        </div>
      )}

      {/* Abstract */}
      {item.description && (
        <div className="mb-3">
          <p className={`text-xs text-slate-600 leading-relaxed ${abstractOpen ? '' : 'line-clamp-2'}`}>
            {item.description}
          </p>
          {item.description.length > 150 && (
            <button
              onClick={() => setAbstractOpen(!abstractOpen)}
              className="text-[10px] font-bold text-teal-600 hover:text-teal-700 mt-1 flex items-center gap-1"
            >
              {abstractOpen ? <><ChevronUp size={11} /> Show less</> : <><ChevronDown size={11} /> Show abstract</>}
            </button>
          )}
        </div>
      )}

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
        {fullTextUrl && (
          <a
            href={fullTextUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              item.pdfUrl
                ? 'bg-teal-600 text-white hover:bg-teal-700'
                : 'bg-slate-900 text-white hover:bg-slate-700'
            }`}
          >
            <ExternalLink size={12} /> {item.pdfUrl ? 'Full Text PDF' : 'View Source'}
          </a>
        )}
        <CitationMenu item={item} />
        <button
          onClick={() => setSaved(!saved)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
            saved ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Star size={12} className={saved ? 'fill-amber-400 text-amber-400' : ''} />
          {saved ? 'Saved' : 'Save'}
        </button>
        <Link
          to="/tutor"
          state={{ context: `${item.title} by ${item.author_names}. ${item.description?.substring(0, 200)}` }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold transition-all"
        >
          <Sparkles size={12} className="text-amber-500" /> Ask DARA
        </Link>
      </div>
    </div>
  );
}

export default function AdvancedSearch() {
  const [rows, setRows] = useState([
    { id: 1, bool: 'AND', field: 'all', value: '' },
    { id: 2, bool: 'AND', field: 'author', value: '' },
    { id: 3, bool: 'AND', field: 'subject', value: '' },
  ]);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [docTypes, setDocTypes] = useState([]);
  const [peerReviewed, setPeerReviewed] = useState(false);
  const [fullTextOnly, setFullTextOnly] = useState(false);
  const [activeSources, setActiveSources] = useState(['openalex', 'core', 'semantic']);
  const [sortBy, setSortBy] = useState('relevance');
  const [results, setResults] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const addRow = () => {
    if (rows.length >= 6) return;
    setRows(r => [...r, { id: Date.now(), bool: 'AND', field: 'all', value: '' }]);
  };
  const removeRow = (id) => setRows(r => r.filter(row => row.id !== id));
  const updateRow = (id, key, val) => setRows(r => r.map(row => row.id === id ? { ...row, [key]: val } : row));

  const toggleDocType = (id) => setDocTypes(t => t.includes(id) ? t.filter(d => d !== id) : [...t, id]);
  const toggleSource = (id) => setActiveSources(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const buildQuery = () => {
    return rows
      .filter(r => r.value.trim())
      .map((r, i) => {
        const fieldPrefix = r.field !== 'all' ? `${r.field}:` : '';
        return i === 0 ? `${fieldPrefix}${r.value}` : `${r.bool} ${fieldPrefix}${r.value}`;
      })
      .join(' ');
  };

  const handleSearch = useCallback(async (newPage = 1) => {
    const query = buildQuery();
    if (!query.trim()) return;
    setLoading(true);
    if (newPage === 1) { setResults([]); setSearched(false); }
    try {
      const { results: res, totals: tot } = await repositoryService.unifiedSearch(query, {
        page: newPage,
        sources: activeSources,
        onlyOA: fullTextOnly,
      });

      let filtered = res;
      if (docTypes.length > 0) {
        filtered = filtered.filter(r => docTypes.some(d => r.resource_type?.toLowerCase().includes(d)));
      }
      if (peerReviewed) {
        filtered = filtered.filter(r => r.citationCount > 0 || r.oaStatus === 'gold' || r.oaStatus === 'green');
      }
      if (yearFrom) filtered = filtered.filter(r => !r.year_published || r.year_published >= parseInt(yearFrom));
      if (yearTo) filtered = filtered.filter(r => !r.year_published || r.year_published <= parseInt(yearTo));

      // Sort
      if (sortBy === 'date_desc') filtered.sort((a, b) => (b.year_published || 0) - (a.year_published || 0));
      else if (sortBy === 'date_asc') filtered.sort((a, b) => (a.year_published || 0) - (b.year_published || 0));
      else if (sortBy === 'citations') filtered.sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0));
      else if (sortBy === 'title') filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

      setResults(prev => newPage === 1 ? filtered : [...prev, ...filtered]);
      setTotals(tot);
      setPage(newPage);
      setHasMore(filtered.length >= 15);
      setSearched(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [rows, activeSources, fullTextOnly, docTypes, peerReviewed, yearFrom, yearTo, sortBy]);

  const totalResults = Object.values(totals).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
              <BookMarked size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">DARE Research Database</h1>
              <p className="text-xs text-slate-500 font-medium">Advanced Academic Search · 670M+ scholarly works</p>
            </div>
          </div>

          {/* Advanced Search Builder */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            {rows.map((row, idx) => (
              <div key={row.id} className="flex items-center gap-2">
                {idx === 0 ? (
                  <div className="w-16 text-xs font-black text-slate-400 uppercase tracking-wider shrink-0">Search</div>
                ) : (
                  <select
                    value={row.bool}
                    onChange={e => updateRow(row.id, 'bool', e.target.value)}
                    className="w-16 px-1.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-700 outline-none focus:border-teal-400 shrink-0"
                  >
                    {BOOLEAN_OPS.map(op => <option key={op}>{op}</option>)}
                  </select>
                )}
                <select
                  value={row.field}
                  onChange={e => updateRow(row.id, 'field', e.target.value)}
                  className="w-36 px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-teal-400 shrink-0"
                >
                  {FIELD_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                <span className="text-xs text-slate-400 shrink-0">contains</span>
                <input
                  type="text"
                  value={row.value}
                  onChange={e => updateRow(row.id, 'value', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch(1)}
                  placeholder={`Enter ${FIELD_OPTIONS.find(f => f.value === row.field)?.label.toLowerCase() || 'search term'}…`}
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-slate-900"
                />
                {rows.length > 1 && (
                  <button onClick={() => removeRow(row.id)} className="text-slate-400 hover:text-slate-600 shrink-0">
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <button onClick={addRow} disabled={rows.length >= 6} className="flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 disabled:opacity-40">
                <Plus size={14} /> Add search field
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => { setRows([{ id: 1, bool: 'AND', field: 'all', value: '' }, { id: 2, bool: 'AND', field: 'author', value: '' }, { id: 3, bool: 'AND', field: 'subject', value: '' }]); setResults([]); setSearched(false); }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Clear
                </button>
                <button
                  onClick={() => handleSearch(1)}
                  disabled={loading || !buildQuery().trim()}
                  className="px-6 py-2 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-700 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {loading ? <Loader size={13} className="animate-spin" /> : <Search size={13} />}
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Limit options row */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date:</span>
              <input type="number" placeholder="From" value={yearFrom} onChange={e => setYearFrom(e.target.value)}
                className="w-20 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-400 text-slate-700" />
              <span className="text-slate-400 text-xs">–</span>
              <input type="number" placeholder="To" value={yearTo} onChange={e => setYearTo(e.target.value)}
                className="w-20 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-400 text-slate-700" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={peerReviewed} onChange={e => setPeerReviewed(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500" />
              <span className="text-xs font-bold text-slate-600">Peer Reviewed</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={fullTextOnly} onChange={e => setFullTextOnly(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500" />
              <span className="text-xs font-bold text-slate-600">Full Text Available</span>
            </label>
          </div>
        </div>
      </div>

      {/* Body: sidebar + results */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Left sidebar: facets */}
        <div className="w-56 shrink-0 space-y-6">
          <div>
            <button onClick={() => setFiltersOpen(!filtersOpen)} className="flex items-center justify-between w-full text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
              <span className="flex items-center gap-2"><SlidersHorizontal size={13} /> Refine Results</span>
              {filtersOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {filtersOpen && (
              <div className="space-y-6">
                {/* Source databases */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Database</p>
                  {SOURCES.map(s => (
                    <label key={s.id} className="flex items-center justify-between py-1.5 cursor-pointer group">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={activeSources.includes(s.id)} onChange={() => toggleSource(s.id)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-teal-500 focus:ring-teal-500" />
                        <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">{s.label}</span>
                      </div>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${s.color}`}>{s.count}</span>
                    </label>
                  ))}
                </div>

                {/* Document type */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Document Type</p>
                  {DOC_TYPES.map(d => (
                    <label key={d.id} className="flex items-center gap-2 py-1.5 cursor-pointer group">
                      <input type="checkbox" checked={docTypes.includes(d.id)} onChange={() => toggleDocType(d.id)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-teal-500 focus:ring-teal-500" />
                      <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">{d.label}</span>
                    </label>
                  ))}
                </div>

                {/* Source breakdown after search */}
                {searched && Object.keys(totals).length > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Results by Source</p>
                    {Object.entries(totals).map(([src, cnt]) => (
                      <div key={src} className="flex items-center justify-between py-1">
                        <span className="text-xs text-slate-600">{src}</span>
                        <span className="text-[10px] font-black text-slate-400">{cnt?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results pane */}
        <div className="flex-1 min-w-0">
          {!searched && !loading && (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-slate-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-700 mb-2">Start Your Research</h2>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">Use the advanced search above to find peer-reviewed articles, books, dissertations, and more from 670M+ scholarly works.</p>
            </div>
          )}

          {loading && results.length === 0 && (
            <div className="text-center py-24">
              <Loader size={32} className="animate-spin text-teal-500 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-500">Searching across databases…</p>
            </div>
          )}

          {searched && (
            <>
              {/* Results header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm font-black text-slate-900">
                    {results.length} results
                    {totalResults > 0 && <span className="text-slate-400 font-bold"> of ~{totalResults.toLocaleString()} total</span>}
                  </p>
                  <p className="text-xs text-slate-400">Query: <em>{buildQuery()}</em></p>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpDown size={13} className="text-slate-400" />
                  <select value={sortBy} onChange={e => { setSortBy(e.target.value); }}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-teal-400">
                    {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <button onClick={() => handleSearch(1)} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100" title="Re-sort">
                    <RefreshCw size={13} />
                  </button>
                </div>
              </div>

              {results.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                  <AlertCircle size={28} className="text-slate-300 mx-auto mb-3" />
                  <p className="font-bold text-slate-500">No results found</p>
                  <p className="text-sm text-slate-400 mt-1">Try broadening your search or removing filters.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((item, i) => <ResultCard key={item.id || i} item={item} index={i} />)}
                </div>
              )}

              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => handleSearch(page + 1)}
                    disabled={loading}
                    className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-700 disabled:opacity-50 transition-all flex items-center gap-2 mx-auto"
                  >
                    {loading ? <Loader size={15} className="animate-spin" /> : null}
                    Load More Results
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
