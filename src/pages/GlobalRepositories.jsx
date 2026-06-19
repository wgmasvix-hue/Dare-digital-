import { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Globe, Building2, ExternalLink, Download, BookOpen,
  ChevronDown, ChevronRight, Filter, Sparkles, ArrowRight,
  FileText, Users, Award, Zap, Database, CheckCircle, X,
  Loader2, AlertCircle, GraduationCap, Star
} from 'lucide-react';
import {
  INTERNATIONAL_REPOSITORIES, REGIONS, REGION_META
} from '../data/internationalRepositories';
import { repositoryService, openAlexService, coreService } from '../services/repositoryService';

// ─── Source Badge ─────────────────────────────────────────────────────────────
const sourceBadge = {
  'OpenAlex':         { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'CORE':             { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Semantic Scholar': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

// ─── Result Card ──────────────────────────────────────────────────────────────
function ResultCard({ item, index }) {
  const [expanded, setExpanded] = useState(false);
  const src = sourceBadge[item.repositorySource] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
  const isOA = item.access_model === 'open_access' || !!item.pdfUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 group"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-500 transition-colors mt-0.5">
          <FileText size={18} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${src.bg} ${src.text} ${src.border}`}>
              {item.repositorySource}
            </span>
            {isOA && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-teal-50 text-teal-700 border-teal-200 flex items-center gap-0.5">
                <CheckCircle size={9} /> Open Access
              </span>
            )}
            {item.citationCount > 0 && (
              <span className="text-[10px] font-bold text-slate-400">
                {item.citationCount.toLocaleString()} citations
              </span>
            )}
          </div>

          <h3
            className="font-bold text-slate-900 leading-snug group-hover:text-teal-700 transition-colors cursor-pointer line-clamp-2 mb-1"
            onClick={() => setExpanded(!expanded)}
          >
            {item.title}
          </h3>

          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500 mb-2">
            {item.author_names && (
              <span className="flex items-center gap-1">
                <Users size={11} /> {item.author_names}
              </span>
            )}
            {item.year_published && (
              <span className="flex items-center gap-1">
                <Award size={11} /> {item.year_published}
              </span>
            )}
            {item.institution && (
              <span className="flex items-center gap-1 text-slate-400">
                <Building2 size={11} /> {item.institution}
              </span>
            )}
          </div>

          {/* Fields of study */}
          {item.fieldsOfStudy?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {item.fieldsOfStudy.slice(0, 3).map(f => (
                <span key={f} className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                  {f}
                </span>
              ))}
            </div>
          )}

          {/* Abstract (expandable) */}
          {item.description && (
            <AnimatePresence>
              {expanded ? (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="text-sm text-slate-600 leading-relaxed overflow-hidden mb-2"
                >
                  {item.description}
                </motion.p>
              ) : (
                <p
                  className="text-sm text-slate-500 line-clamp-2 cursor-pointer hover:text-slate-700 transition-colors"
                  onClick={() => setExpanded(true)}
                >
                  {item.description}
                </p>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0">
          {(item.pdfUrl || item.file_url) && (
            <a
              href={item.pdfUrl || item.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 text-white font-bold text-xs rounded-lg hover:bg-teal-400 transition"
            >
              <Download size={13} />
              PDF
            </a>
          )}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-200 transition"
          >
            <ExternalLink size={13} />
            View
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Institution Card ─────────────────────────────────────────────────────────
function InstitutionCard({ repo, onSelect, selected }) {
  const regionMeta = REGION_META[repo.region];
  return (
    <motion.button
      onClick={() => onSelect(repo)}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
        selected?.id === repo.id
          ? 'border-teal-500 bg-teal-50 shadow-md'
          : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-sm'
      }`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl ${regionMeta.bg} ${regionMeta.border} border flex items-center justify-center text-base shrink-0`}>
          {regionMeta.flag}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-sm text-slate-900 truncate">{repo.shortName}</p>
            {repo.flagship && <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />}
          </div>
          <p className="text-xs text-slate-500 truncate">{repo.country}</p>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GlobalRepositories() {
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'browse'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totals, setTotals] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [onlyOA, setOnlyOA] = useState(true);
  const [activeSources, setActiveSources] = useState(['openalex', 'core', 'semantic']);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [institutionResults, setInstitutionResults] = useState([]);
  const [institutionLoading, setInstitutionLoading] = useState(false);
  const [repoQuery, setRepoQuery] = useState('');

  const TOTAL_PAPERS = '250M+';
  const TOTAL_REPOS = INTERNATIONAL_REPOSITORIES.length;
  const TOTAL_COUNTRIES = [...new Set(INTERNATIONAL_REPOSITORIES.map(r => r.country))].length;

  const handleSearch = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setPage(1);
    setResults([]);

    try {
      const { results: res, totals: tot } = await repositoryService.unifiedSearch(query, {
        page: 1,
        sources: activeSources,
        onlyOA,
      });
      setResults(res);
      setTotals(tot);
      setHasMore(res.length >= 20);
    } catch (err) {
      setError('Search failed. Some repositories may be temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }, [query, activeSources, onlyOA]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoading(true);
    try {
      const { results: more } = await repositoryService.unifiedSearch(query, {
        page: nextPage,
        sources: activeSources,
        onlyOA,
      });
      setResults(prev => [...prev, ...more]);
      setHasMore(more.length >= 20);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleInstitutionSelect = async (repo) => {
    setSelectedInstitution(repo);
    if (!repo.openAlexId) {
      setInstitutionResults([]);
      return;
    }
    setInstitutionLoading(true);
    try {
      const { results: res } = await openAlexService.searchWorks(
        repo.name,
        1,
        20,
        { isOA: 'true', institutionId: repo.openAlexId }
      );
      setInstitutionResults(res);
    } catch {
      setInstitutionResults([]);
    } finally {
      setInstitutionLoading(false);
    }
  };

  const toggleSource = (src) => {
    setActiveSources(prev =>
      prev.includes(src) ? prev.filter(s => s !== src) : [...prev, src]
    );
  };

  const filteredRepos = INTERNATIONAL_REPOSITORIES.filter(r => {
    const matchesRegion = !selectedRegion || r.region === selectedRegion;
    const matchesQuery = !repoQuery || r.name.toLowerCase().includes(repoQuery.toLowerCase()) ||
      r.country.toLowerCase().includes(repoQuery.toLowerCase()) ||
      r.shortName.toLowerCase().includes(repoQuery.toLowerCase());
    return matchesRegion && matchesQuery;
  });

  const totalFromSearch = Object.values(totals).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-30%] left-[-10%] w-[50%] h-[100%] rounded-full bg-teal-500/10 blur-3xl" />
          <div className="absolute bottom-[-30%] right-[-10%] w-[50%] h-[100%] rounded-full bg-blue-500/10 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 text-teal-400 text-xs font-bold rounded-full uppercase tracking-widest mb-6">
              <Globe size={13} className="animate-pulse" /> Global Repository Network
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-4">
              Search the World's<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                University Research
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mb-8">
              Unified search across OpenAlex, CORE, and Semantic Scholar — giving you access to millions of peer-reviewed papers, theses, and reports from {TOTAL_REPOS}+ universities in {TOTAL_COUNTRIES}+ countries.
            </p>

            {/* Stats Strip */}
            <div className="grid grid-cols-3 gap-6 mb-8 max-w-md">
              {[
                { label: 'Papers Indexed', value: TOTAL_PAPERS },
                { label: 'Universities', value: `${TOTAL_REPOS}+` },
                { label: 'Countries', value: `${TOTAL_COUNTRIES}+` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder='e.g. "climate change Africa", "quantum computing", "COVID-19 vaccine"'
                  className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-7 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-2xl transition active:scale-95 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                Search
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* ─── Body ─────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-2xl p-1 w-fit shadow-sm mb-8">
          {[
            { id: 'search', label: 'Search Results', icon: Search },
            { id: 'browse', label: 'Browse Universities', icon: Building2 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* ─── Search Tab ──────────────────────────────────────────────────── */}
        {activeTab === 'search' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1 space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-bold text-sm text-slate-900 mb-4">Sources</h3>
                {[
                  { id: 'openalex', label: 'OpenAlex', desc: '250M+ works', color: 'blue' },
                  { id: 'core', label: 'CORE', desc: '220M+ OA papers', color: 'emerald' },
                  { id: 'semantic', label: 'Semantic Scholar', desc: '200M+ papers', color: 'purple' },
                ].map(({ id, label, desc, color }) => (
                  <label key={id} className="flex items-start gap-3 py-2.5 cursor-pointer group">
                    <div
                      onClick={() => toggleSource(id)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all mt-0.5 ${
                        activeSources.includes(id)
                          ? `bg-${color}-500 border-${color}-500`
                          : 'border-slate-300 group-hover:border-slate-400'
                      }`}
                    >
                      {activeSources.includes(id) && <CheckCircle size={12} className="text-white" />}
                    </div>
                    <div onClick={() => toggleSource(id)}>
                      <p className="text-sm font-bold text-slate-800">{label}</p>
                      <p className="text-xs text-slate-400">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-bold text-sm text-slate-900 mb-3">Access</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setOnlyOA(!onlyOA)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${onlyOA ? 'bg-teal-500' : 'bg-slate-200'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${onlyOA ? 'translate-x-5' : ''}`} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Open Access only</span>
                </label>
              </div>

              {/* Source counts */}
              {Object.keys(totals).length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="font-bold text-sm text-slate-900 mb-3">Results by Source</h3>
                  {Object.entries(totals).map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between py-1.5">
                      <span className="text-xs font-medium text-slate-600">{source}</span>
                      <span className="text-xs font-black text-slate-900">{count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Results */}
            <div className="lg:col-span-3 space-y-4">
              {/* Header */}
              {results.length > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-500">
                    {results.length} shown · {totalFromSearch.toLocaleString()} total across sources
                  </p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
                  <AlertCircle size={18} className="shrink-0" />
                  {error}
                </div>
              )}

              {loading && results.length === 0 && (
                <div className="space-y-4">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse bg-white rounded-2xl border border-slate-200 p-5 h-28" />
                  ))}
                </div>
              )}

              {!loading && results.length === 0 && !error && (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 flex flex-col items-center text-center">
                  <Globe size={40} className="text-slate-200 mb-4" />
                  <h3 className="font-black text-xl text-slate-900 mb-2">Search the world's research</h3>
                  <p className="text-slate-500 max-w-sm text-sm">
                    Enter a topic above to search OpenAlex, CORE, and Semantic Scholar simultaneously. Try "malaria prevention", "renewable energy Africa", or "machine learning healthcare".
                  </p>
                </div>
              )}

              {results.map((item, i) => (
                <ResultCard key={item.id} item={item} index={i} />
              ))}

              {/* Load More */}
              {results.length > 0 && hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-2xl hover:bg-slate-50 transition flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
                  Load More Results
                </button>
              )}
            </div>
          </div>
        )}

        {/* ─── Browse Tab ───────────────────────────────────────────────────── */}
        {activeTab === 'browse' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: University Picker */}
            <div className="lg:col-span-1 space-y-4">
              {/* Search repos */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={repoQuery}
                    onChange={e => setRepoQuery(e.target.value)}
                    placeholder="Search universities…"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-teal-400 transition bg-slate-50"
                  />
                </div>
              </div>

              {/* Region filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedRegion(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    !selectedRegion ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                  }`}
                >
                  All Regions
                </button>
                {REGIONS.map(region => {
                  const meta = REGION_META[region];
                  return (
                    <button
                      key={region}
                      onClick={() => setSelectedRegion(region === selectedRegion ? null : region)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1 ${
                        selectedRegion === region
                          ? `${meta.bg} ${meta.text} ${meta.border}`
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                      }`}
                    >
                      {meta.flag} {region}
                    </button>
                  );
                })}
              </div>

              {/* Institution list */}
              <div className="grid grid-cols-1 gap-2 max-h-[70vh] overflow-y-auto pr-1">
                {filteredRepos.map(repo => (
                  <InstitutionCard
                    key={repo.id}
                    repo={repo}
                    onSelect={handleInstitutionSelect}
                    selected={selectedInstitution}
                  />
                ))}
              </div>
            </div>

            {/* Right: Institution Papers */}
            <div className="lg:col-span-2">
              {!selectedInstitution ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 flex flex-col items-center text-center h-full min-h-[400px] justify-center">
                  <Building2 size={40} className="text-slate-200 mb-4" />
                  <h3 className="font-black text-xl text-slate-900 mb-2">Select a University</h3>
                  <p className="text-slate-500 text-sm max-w-xs">
                    Click any institution on the left to explore their open access research papers from OpenAlex.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Institution Header */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{REGION_META[selectedInstitution.region]?.flag}</span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedInstitution.country}</span>
                          {selectedInstitution.flagship && (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full flex items-center gap-1">
                              <Star size={9} className="fill-amber-400 text-amber-400" /> Flagship
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-black text-slate-900">{selectedInstitution.name}</h2>
                        {selectedInstitution.established && (
                          <p className="text-xs text-slate-400 mt-0.5">Est. {selectedInstitution.established}</p>
                        )}
                        <p className="text-sm text-slate-600 mt-2 max-w-xl">{selectedInstitution.description}</p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        {selectedInstitution.repoUrl && (
                          <a
                            href={selectedInstitution.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition"
                          >
                            <Database size={13} /> Repository
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Papers */}
                  {!selectedInstitution.openAlexId ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                      <AlertCircle size={32} className="mx-auto text-slate-200 mb-3" />
                      <p className="font-bold text-slate-700">No OpenAlex integration</p>
                      <p className="text-sm text-slate-400 mt-1">
                        This institution's papers are not yet indexed by OpenAlex.
                        {selectedInstitution.repoUrl && (
                          <> Visit their <a href={selectedInstitution.repoUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline font-medium">repository directly</a>.</>
                        )}
                      </p>
                    </div>
                  ) : institutionLoading ? (
                    <div className="space-y-4">
                      {Array(4).fill(0).map((_, i) => (
                        <div key={i} className="animate-pulse bg-white rounded-2xl border border-slate-200 p-5 h-24" />
                      ))}
                    </div>
                  ) : institutionResults.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                        Open Access Papers from {selectedInstitution.shortName}
                      </p>
                      {institutionResults.map((item, i) => (
                        <ResultCard key={item.id} item={item} index={i} />
                      ))}
                      {selectedInstitution.openAlexId && (
                        <a
                          href={`https://openalex.org/institutions/${selectedInstitution.openAlexId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-sm font-bold text-slate-600 rounded-2xl hover:bg-slate-50 transition"
                        >
                          View all papers on OpenAlex <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                      <BookOpen size={32} className="mx-auto text-slate-200 mb-3" />
                      <p className="font-bold text-slate-700">No papers found</p>
                      <p className="text-sm text-slate-400 mt-1">No open access papers were returned for this institution.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Region Showcase ─────────────────────────────────────────────── */}
        <div className="mt-16">
          <h2 className="text-2xl font-black text-slate-900 mb-8">Connected Regions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {REGIONS.map(region => {
              const meta = REGION_META[region];
              const count = INTERNATIONAL_REPOSITORIES.filter(r => r.region === region).length;
              return (
                <motion.button
                  key={region}
                  onClick={() => { setActiveTab('browse'); setSelectedRegion(region); }}
                  whileHover={{ y: -4 }}
                  className={`flex flex-col items-center gap-3 p-6 rounded-2xl border ${meta.bg} ${meta.border} ${meta.text} transition-all text-center hover:shadow-md`}
                >
                  <span className="text-3xl">{meta.flag}</span>
                  <div>
                    <p className="font-black text-sm">{region}</p>
                    <p className="text-xs opacity-70 mt-0.5">{count} universities</p>
                  </div>
                  <ArrowRight size={14} className="opacity-50" />
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ─── CTA ─────────────────────────────────────────────────────────── */}
        <div className="mt-12 bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-black text-2xl mb-2">Powered by Open Science</h3>
            <p className="text-slate-400 text-sm max-w-lg">
              DARE aggregates from OpenAlex, CORE, and Semantic Scholar — three of the world's largest open scholarly databases — giving Zimbabwean students and researchers access to the same knowledge as any top university.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link to="/tutor" className="inline-flex items-center gap-2 px-5 py-3 bg-teal-500 text-slate-900 font-bold rounded-xl hover:bg-teal-400 transition">
              <Sparkles size={16} /> Ask DARA
            </Link>
            <Link to="/library" className="inline-flex items-center gap-2 px-5 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition border border-slate-700">
              <BookOpen size={16} /> Full Library
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
