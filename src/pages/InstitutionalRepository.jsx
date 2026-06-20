import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Database, Search, ChevronRight, Download, FileText, Calendar, User, Tag,
  Settings, RefreshCw, Upload, Clock, Loader2, X, Library, Folder, FolderOpen,
  BookOpen, Hash, ExternalLink, Info, Filter, ArrowRight, CheckCircle,
  AlertCircle, Globe, BarChart2, Layers, BookMarked
} from 'lucide-react';
import { dspaceService } from '../services/dspaceService';
import CitationMenu from '../components/research/CitationMenu';

const DEFAULT_API = 'https://demo.dspace.org/server/api';
const ITEM_TYPES = ['All', 'Article', 'Thesis', 'Dataset', 'Book', 'Conference Paper', 'Working Paper', 'Report', 'Patent'];
const SEARCH_FIELDS = [
  { value: 'ANY', label: 'All Fields' },
  { value: 'dc.title', label: 'Title' },
  { value: 'dc.contributor.author', label: 'Author' },
  { value: 'dc.subject', label: 'Subject' },
  { value: 'dc.description.abstract', label: 'Abstract' },
];

// ── Sub-components ─────────────────────────────────────────────────────────

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-100 rounded-lg ${className}`} />;
}

function TypeBadge({ type }) {
  const colors = {
    article: 'bg-blue-50 text-blue-700 border-blue-200',
    thesis: 'bg-purple-50 text-purple-700 border-purple-200',
    dataset: 'bg-amber-50 text-amber-700 border-amber-200',
    book: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    default: 'bg-slate-50 text-slate-600 border-slate-200',
  };
  const key = (type || '').toLowerCase();
  const cls = Object.keys(colors).find(k => key.includes(k)) ? colors[Object.keys(colors).find(k => key.includes(k))] : colors.default;
  return (
    <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${cls}`}>
      {type || 'Item'}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${color}`}>
      <Icon size={16} className="shrink-0" />
      <div>
        <p className="text-lg font-black leading-none">{value ?? '—'}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function ItemRow({ item, isSelected, onClick }) {
  const title = dspaceService.getMeta(item, 'dc.title') || item.name || 'Untitled';
  const author = dspaceService.getMetaAll(item, 'dc.contributor.author').slice(0, 2).join(', ');
  const date = dspaceService.getMeta(item, 'dc.date.issued') || dspaceService.getMeta(item, 'dc.date.accessioned')?.slice(0, 10);
  const type = dspaceService.getMeta(item, 'dc.type');

  return (
    <button
      onClick={() => onClick(item)}
      className={`w-full text-left px-4 py-3.5 border-b border-slate-50 transition-all group ${
        isSelected ? 'bg-teal-50 border-l-2 border-l-teal-500 pl-3.5' : 'hover:bg-slate-50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm leading-snug truncate ${isSelected ? 'text-teal-700' : 'text-slate-900 group-hover:text-teal-700'} transition-colors`}>
            {title}
          </p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {author && <span className="text-xs text-slate-500 flex items-center gap-1 truncate max-w-[200px]"><User size={10} />{author}</span>}
            {date && <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar size={10} />{date.slice(0, 4)}</span>}
            {type && <TypeBadge type={type} />}
          </div>
        </div>
        <ChevronRight size={14} className={`shrink-0 mt-0.5 transition-colors ${isSelected ? 'text-teal-500' : 'text-slate-300 group-hover:text-slate-500'}`} />
      </div>
    </button>
  );
}

function DetailPanel({ item, onClose }) {
  const [bundles, setBundles] = useState([]);
  const [loadingBundles, setLoadingBundles] = useState(false);
  const [showFullAbstract, setShowFullAbstract] = useState(false);

  useEffect(() => {
    if (!item) return;
    setBundles([]);
    setShowFullAbstract(false);
    setLoadingBundles(true);
    dspaceService.getItemBundles(item._links.bundles.href)
      .then(b => setBundles(b))
      .catch(() => {})
      .finally(() => setLoadingBundles(false));
  }, [item?.uuid]);

  if (!item) return null;

  const title = dspaceService.getMeta(item, 'dc.title') || item.name;
  const authors = dspaceService.getMetaAll(item, 'dc.contributor.author');
  const date = dspaceService.getMeta(item, 'dc.date.issued') || dspaceService.getMeta(item, 'dc.date.accessioned')?.slice(0, 10);
  const abstract = dspaceService.getMeta(item, 'dc.description.abstract');
  const type = dspaceService.getMeta(item, 'dc.type');
  const publisher = dspaceService.getMeta(item, 'dc.publisher');
  const subjects = dspaceService.getMetaAll(item, 'dc.subject');
  const doi = dspaceService.getMeta(item, 'dc.identifier.doi') || dspaceService.getMeta(item, 'dc.relation.doi');
  const handle = dspaceService.getMeta(item, 'dc.identifier.uri');
  const issn = dspaceService.getMeta(item, 'dc.identifier.issn');
  const language = dspaceService.getMeta(item, 'dc.language.iso');

  const citableItem = {
    title,
    author_names: authors.join(', '),
    year_published: date ? parseInt(date) : undefined,
    publisher_name: publisher,
    doi: doi || undefined,
    url: handle || item._links.self.href,
    resource_type: type,
  };

  const allBitstreams = bundles.flatMap(b => b._embedded?.bitstreams || []);
  const contentFiles = allBitstreams.filter(f => f.name && !f.name.startsWith('.'));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full overflow-y-auto"
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X size={14} />
        </button>
        {type && <TypeBadge type={type} />}
        <h2 className="font-black text-base leading-snug mt-2 pr-8">{title}</h2>
        {authors.length > 0 && (
          <p className="text-xs text-slate-300 mt-1.5 flex items-center gap-1">
            <User size={11} /> {authors.slice(0, 3).join(' · ')}{authors.length > 3 ? ` +${authors.length - 3}` : ''}
          </p>
        )}
        {date && (
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Calendar size={11} /> {date.slice(0, 10)}
          </p>
        )}
      </div>

      <div className="flex-1 p-4 space-y-5 overflow-y-auto">
        {/* Action bar */}
        <div className="flex gap-2 flex-wrap">
          <CitationMenu item={citableItem} className="flex-1" />
          {handle && (
            <a
              href={handle}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
            >
              <ExternalLink size={13} /> Handle
            </a>
          )}
        </div>

        {/* Abstract */}
        {abstract && (
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
              <Info size={12} /> Abstract
            </h4>
            <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-3">
              {showFullAbstract || abstract.length <= 300 ? abstract : abstract.slice(0, 300) + '…'}
              {abstract.length > 300 && (
                <button
                  onClick={() => setShowFullAbstract(!showFullAbstract)}
                  className="text-teal-600 font-bold ml-1 hover:underline"
                >
                  {showFullAbstract ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {publisher && (
            <div className="col-span-2 bg-slate-50 rounded-lg px-3 py-2">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">Publisher</span>
              <span className="text-slate-700 font-medium">{publisher}</span>
            </div>
          )}
          {doi && (
            <div className="col-span-2 bg-slate-50 rounded-lg px-3 py-2">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">DOI</span>
              <a href={`https://doi.org/${doi}`} target="_blank" rel="noopener noreferrer" className="text-teal-600 font-medium hover:underline break-all">
                {doi}
              </a>
            </div>
          )}
          {issn && (
            <div className="bg-slate-50 rounded-lg px-3 py-2">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">ISSN</span>
              <span className="text-slate-700 font-medium">{issn}</span>
            </div>
          )}
          {language && (
            <div className="bg-slate-50 rounded-lg px-3 py-2">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">Language</span>
              <span className="text-slate-700 font-medium">{language.toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Subjects */}
        {subjects.length > 0 && (
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
              <Tag size={12} /> Subjects
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {subjects.map((s, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
            <Download size={12} /> Files & Bitstreams
          </h4>
          {loadingBundles ? (
            <div className="space-y-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : contentFiles.length > 0 ? (
            <div className="space-y-2">
              {contentFiles.map(file => (
                <a
                  key={file.uuid}
                  href={file._links.content.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-teal-50 hover:border-teal-200 transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText size={16} className="text-slate-400 group-hover:text-teal-600 shrink-0 transition-colors" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {file.sizeBytes ? `${(file.sizeBytes / 1024 / 1024).toFixed(2)} MB` : ''} {file.format?.description || ''}
                      </p>
                    </div>
                  </div>
                  <Download size={14} className="text-slate-300 group-hover:text-teal-600 shrink-0 transition-colors" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic p-2">No downloadable files available.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function InstitutionalRepository() {
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('dspace_api_url') || DEFAULT_API);
  const [apiInput, setApiInput] = useState(apiUrl);
  const [showConfig, setShowConfig] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [status, setStatus] = useState('idle'); // idle | loading | ok | error

  // Stats
  const [totalItems, setTotalItems] = useState(null);
  const [totalCommunities, setTotalCommunities] = useState(null);

  // Browse state
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionItems, setCollectionItems] = useState([]);
  const [collectionTotal, setCollectionTotal] = useState(0);
  const [collectionPage, setCollectionPage] = useState(0);

  // Recent
  const [recentItems, setRecentItems] = useState([]);

  // Subjects
  const [subjects, setSubjects] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState('');

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('ANY');
  const [searchDocType, setSearchDocType] = useState('All');
  const [searchResults, setSearchResults] = useState([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(0);
  const [searched, setSearched] = useState(false);

  // Selected item for detail panel
  const [selectedItem, setSelectedItem] = useState(null);

  // Loading flags
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState(null);

  const loadCommunities = useCallback(async (url) => {
    setLoadingCommunities(true);
    setStatus('loading');
    setError(null);
    try {
      const [comms, total] = await Promise.all([
        dspaceService.getCommunities(url),
        dspaceService.getTotalItemCount(url),
      ]);
      setCommunities(comms);
      setTotalItems(total.toLocaleString());
      setTotalCommunities(comms.length);
      setStatus('ok');
    } catch (e) {
      setError('Could not connect to the repository. Check the API URL in config.');
      setStatus('error');
    } finally {
      setLoadingCommunities(false);
    }
  }, []);

  useEffect(() => {
    loadCommunities(apiUrl);
  }, [apiUrl, loadCommunities]);

  const handleSelectCommunity = async (community) => {
    setSelectedCommunity(community);
    setSelectedCollection(null);
    setCollectionItems([]);
    setCollectionTotal(0);
    setSelectedItem(null);
    setLoadingCollections(true);
    try {
      const cols = await dspaceService.getCollections(apiUrl, community.uuid);
      setCollections(cols);
    } catch {
      setCollections([]);
    } finally {
      setLoadingCollections(false);
    }
  };

  const handleSelectCollection = async (collection, page = 0) => {
    setSelectedCollection(collection);
    setSelectedItem(null);
    setCollectionPage(page);
    setLoadingItems(true);
    try {
      const { items, total } = await dspaceService.getCollectionItems(apiUrl, collection.uuid, page);
      setCollectionItems(page === 0 ? items : prev => [...prev, ...items]);
      setCollectionTotal(total);
    } catch {
      setCollectionItems([]);
      setCollectionTotal(0);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'recent' || recentItems.length > 0) return;
    setLoadingRecent(true);
    dspaceService.getRecentSubmissions(apiUrl, 15)
      .then(setRecentItems)
      .catch(() => {})
      .finally(() => setLoadingRecent(false));
  }, [activeTab, apiUrl]);

  useEffect(() => {
    if (activeTab !== 'subjects' || subjects.length > 0) return;
    setLoadingSubjects(true);
    dspaceService.getSubjectFacets(apiUrl, 60)
      .then(setSubjects)
      .catch(() => {})
      .finally(() => setLoadingSubjects(false));
  }, [activeTab, apiUrl]);

  const handleSearch = async (page = 0) => {
    if (!searchQuery.trim()) return;
    setLoadingSearch(true);
    setSearched(true);
    setSearchPage(page);
    try {
      const { items, total } = await dspaceService.searchItems(apiUrl, searchQuery, {
        field: searchField,
        docType: searchDocType,
        page,
        size: 20,
      });
      setSearchResults(page === 0 ? items : prev => [...prev, ...items]);
      setSearchTotal(total);
    } catch {
      setSearchResults([]);
      setSearchTotal(0);
    } finally {
      setLoadingSearch(false);
    }
  };

  const applyConfig = () => {
    const trimmed = apiInput.trim().replace(/\/$/, '');
    localStorage.setItem('dspace_api_url', trimmed);
    setApiUrl(trimmed);
    setCommunities([]);
    setSelectedCommunity(null);
    setCollections([]);
    setSelectedCollection(null);
    setCollectionItems([]);
    setRecentItems([]);
    setSubjects([]);
    setShowConfig(false);
  };

  const filteredSubjects = subjectFilter
    ? subjects.filter(s => s.label.toLowerCase().includes(subjectFilter.toLowerCase()))
    : subjects;

  const TABS = [
    { id: 'browse', label: 'Browse', icon: Layers },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'subjects', label: 'Subjects', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* ── Top Header ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                <Library size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 leading-tight">Institutional Repository</h1>
                <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                  <Globe size={10} />
                  {apiUrl.replace('https://', '').replace('/server/api', '')}
                  {status === 'ok' && <CheckCircle size={10} className="text-emerald-500" />}
                  {status === 'error' && <AlertCircle size={10} className="text-red-400" />}
                </p>
              </div>
            </div>

            {/* Stats chips */}
            <div className="flex items-center gap-2 flex-wrap">
              {totalItems !== null && (
                <StatCard label="Items" value={totalItems} icon={BookOpen} color="text-teal-700 bg-teal-50 border-teal-100" />
              )}
              {totalCommunities !== null && (
                <StatCard label="Communities" value={totalCommunities} icon={Folder} color="text-slate-700 bg-slate-50 border-slate-200" />
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                to="/dspace"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:text-teal-700 text-xs font-bold transition-all"
              >
                <Upload size={13} /> Submit
              </Link>
              <button
                onClick={() => { setShowConfig(!showConfig); setApiInput(apiUrl); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                  showConfig ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
              >
                <Settings size={13} /> Config
              </button>
            </div>
          </div>

          {/* Config panel */}
          <AnimatePresence>
            {showConfig && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                    <Database size={12} /> Wire to your DSpace instance
                  </p>
                  <div className="flex gap-2 items-center">
                    <input
                      value={apiInput}
                      onChange={e => setApiInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && applyConfig()}
                      placeholder="https://your-institution.ac.zw/server/api"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-teal-400 transition-colors font-mono"
                    />
                    <button
                      onClick={applyConfig}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 transition-colors whitespace-nowrap"
                    >
                      Connect
                    </button>
                    <button
                      onClick={() => { setApiInput(DEFAULT_API); }}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-100 transition-colors whitespace-nowrap"
                    >
                      Reset Demo
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    DSpace 7+ REST API base URL. Example: <code className="font-mono bg-slate-200 px-1 rounded">https://dspace.youruniversity.ac.zw/server/api</code>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab nav */}
          <div className="flex gap-1 mt-4 border-b border-slate-100 -mb-5 pb-0">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
            <button onClick={() => loadCommunities(apiUrl)} className="ml-auto flex items-center gap-1 text-xs font-bold hover:underline">
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        </div>
      )}

      {/* ── Tab Content ── */}
      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* ── BROWSE TAB ── */}
        {activeTab === 'browse' && (
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_360px] gap-5">

            {/* Column 1: Communities */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <Folder size={14} className="text-slate-500" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Communities</span>
              </div>
              <div className="overflow-y-auto max-h-[60vh]">
                {loadingCommunities ? (
                  <div className="p-4 space-y-3">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}
                  </div>
                ) : communities.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm">
                    <Folder size={32} className="mx-auto mb-2 opacity-30" />
                    No communities found
                  </div>
                ) : (
                  communities.map(community => (
                    <button
                      key={community.uuid}
                      onClick={() => handleSelectCommunity(community)}
                      className={`w-full text-left px-4 py-3.5 border-b border-slate-50 transition-all group flex items-center justify-between gap-2 ${
                        selectedCommunity?.uuid === community.uuid
                          ? 'bg-teal-50 border-l-2 border-l-teal-500 pl-3.5'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {selectedCommunity?.uuid === community.uuid
                          ? <FolderOpen size={15} className="text-teal-600 shrink-0" />
                          : <Folder size={15} className="text-slate-400 group-hover:text-slate-600 shrink-0 transition-colors" />
                        }
                        <span className={`text-sm font-bold truncate ${
                          selectedCommunity?.uuid === community.uuid ? 'text-teal-800' : 'text-slate-700 group-hover:text-slate-900'
                        }`}>
                          {community.name}
                        </span>
                      </div>
                      <ChevronRight size={13} className={`shrink-0 ${
                        selectedCommunity?.uuid === community.uuid ? 'text-teal-400' : 'text-slate-200 group-hover:text-slate-400'
                      }`} />
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Column 2: Collections + Items */}
            <div className="space-y-4">
              {/* Collections */}
              {selectedCommunity && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    <ArrowRight size={12} className="text-teal-500" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                      Collections in {selectedCommunity.name}
                    </span>
                  </div>
                  {loadingCollections ? (
                    <div className="p-4 grid grid-cols-2 gap-2">
                      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}
                    </div>
                  ) : collections.length === 0 ? (
                    <p className="p-4 text-sm text-slate-400 text-center">No collections in this community</p>
                  ) : (
                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {collections.map(col => (
                        <button
                          key={col.uuid}
                          onClick={() => handleSelectCollection(col)}
                          className={`text-left p-3.5 rounded-xl border transition-all group ${
                            selectedCollection?.uuid === col.uuid
                              ? 'border-teal-300 bg-teal-50 shadow-sm'
                              : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <p className={`text-sm font-bold leading-snug ${
                            selectedCollection?.uuid === col.uuid ? 'text-teal-800' : 'text-slate-800 group-hover:text-slate-900'
                          }`}>
                            {col.name}
                          </p>
                          {col.archivedItemsCount !== undefined && (
                            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                              <Hash size={9} /> {col.archivedItemsCount} items
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Items list */}
              {selectedCollection && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen size={13} className="text-slate-500" />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500">{selectedCollection.name}</span>
                    </div>
                    {collectionTotal > 0 && (
                      <span className="text-xs font-bold text-slate-400">{collectionTotal.toLocaleString()} items</span>
                    )}
                  </div>
                  <div className="divide-y divide-transparent">
                    {loadingItems && collectionPage === 0 ? (
                      <div className="p-4 space-y-3">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}
                      </div>
                    ) : collectionItems.length === 0 ? (
                      <p className="p-6 text-center text-sm text-slate-400">No items in this collection</p>
                    ) : (
                      <>
                        {collectionItems.map(item => (
                          <ItemRow
                            key={item.uuid}
                            item={item}
                            isSelected={selectedItem?.uuid === item.uuid}
                            onClick={setSelectedItem}
                          />
                        ))}
                        {collectionItems.length < collectionTotal && (
                          <div className="p-3 text-center">
                            <button
                              onClick={() => handleSelectCollection(selectedCollection, collectionPage + 1)}
                              disabled={loadingItems}
                              className="px-5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                              {loadingItems ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Load More'}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {!selectedCommunity && !loadingCommunities && communities.length > 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                  <FolderOpen size={40} className="mb-3 opacity-40" />
                  <p className="font-bold text-slate-500">Select a community to browse</p>
                  <p className="text-sm mt-1">Choose from the list on the left</p>
                </div>
              )}
            </div>

            {/* Column 3: Detail panel */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-36 max-h-[78vh]">
              <AnimatePresence mode="wait">
                {selectedItem ? (
                  <DetailPanel key={selectedItem.uuid} item={selectedItem} onClose={() => setSelectedItem(null)} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-center p-6 text-slate-400">
                    <BookMarked size={40} className="mb-3 opacity-30" />
                    <p className="font-bold text-slate-500 text-sm">Item Details</p>
                    <p className="text-xs mt-1">Select an item from the list to view full metadata, files, and citations</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ── SEARCH TAB ── */}
        {activeTab === 'search' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
            <div className="space-y-4">
              {/* Search form */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch(0)}
                      placeholder="Search items in the repository..."
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-teal-400 transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => handleSearch(0)}
                    disabled={loadingSearch || !searchQuery.trim()}
                    className="px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {loadingSearch ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                    Search
                  </button>
                </div>
                <div className="flex gap-3 mt-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter size={12} className="text-slate-400" />
                    <select
                      value={searchField}
                      onChange={e => setSearchField(e.target.value)}
                      className="text-xs font-bold text-slate-600 border border-slate-200 rounded-lg px-2 py-1.5 outline-none bg-white"
                    >
                      {SEARCH_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                  <select
                    value={searchDocType}
                    onChange={e => setSearchDocType(e.target.value)}
                    className="text-xs font-bold text-slate-600 border border-slate-200 rounded-lg px-2 py-1.5 outline-none bg-white"
                  >
                    {ITEM_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Results */}
              {searched && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Results</span>
                    {searchTotal > 0 && <span className="text-xs font-bold text-slate-400">{searchTotal.toLocaleString()} found</span>}
                  </div>
                  {loadingSearch && searchPage === 0 ? (
                    <div className="p-4 space-y-3">
                      {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14" />)}
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">
                      <Search size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="font-bold text-slate-500 text-sm">No results found</p>
                    </div>
                  ) : (
                    <>
                      {searchResults.map(item => (
                        <ItemRow key={item.uuid} item={item} isSelected={selectedItem?.uuid === item.uuid} onClick={setSelectedItem} />
                      ))}
                      {searchResults.length < searchTotal && (
                        <div className="p-3 text-center border-t border-slate-50">
                          <button
                            onClick={() => handleSearch(searchPage + 1)}
                            disabled={loadingSearch}
                            className="px-5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                          >
                            {loadingSearch ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Load More'}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Detail panel */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-36 max-h-[78vh]">
              <AnimatePresence mode="wait">
                {selectedItem ? (
                  <DetailPanel key={selectedItem.uuid} item={selectedItem} onClose={() => setSelectedItem(null)} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400 text-center p-6">
                    <Info size={36} className="mb-3 opacity-30" />
                    <p className="font-bold text-slate-500 text-sm">Select a result</p>
                    <p className="text-xs mt-1">Click any item to view full details and downloads</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ── RECENT TAB ── */}
        {activeTab === 'recent' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Latest Submissions</span>
                </div>
                <button
                  onClick={() => { setRecentItems([]); setLoadingRecent(true); dspaceService.getRecentSubmissions(apiUrl, 15).then(setRecentItems).catch(() => {}).finally(() => setLoadingRecent(false)); }}
                  className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
              {loadingRecent ? (
                <div className="p-4 space-y-3">
                  {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : recentItems.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                  <Clock size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="font-bold text-slate-500 text-sm">No recent items</p>
                </div>
              ) : (
                recentItems.map((item, i) => (
                  <div key={item.uuid} className="flex items-stretch border-b border-slate-50 last:border-0">
                    <div className="w-8 text-center py-4 text-[10px] font-black text-slate-300 bg-slate-50/50 border-r border-slate-50 flex-col flex items-center justify-center gap-1 shrink-0">
                      <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-[9px]">{i + 1}</span>
                    </div>
                    <ItemRow
                      item={item}
                      isSelected={selectedItem?.uuid === item.uuid}
                      onClick={setSelectedItem}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Detail panel */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-36 max-h-[78vh]">
              <AnimatePresence mode="wait">
                {selectedItem ? (
                  <DetailPanel key={selectedItem.uuid} item={selectedItem} onClose={() => setSelectedItem(null)} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400 text-center p-6">
                    <Clock size={36} className="mb-3 opacity-30" />
                    <p className="font-bold text-slate-500 text-sm">Select a submission</p>
                    <p className="text-xs mt-1">Click any item from the recent list</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ── SUBJECTS TAB ── */}
        {activeTab === 'subjects' && (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={subjectFilter}
                  onChange={e => setSubjectFilter(e.target.value)}
                  placeholder="Filter subjects..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-teal-400 transition-colors bg-white"
                />
              </div>
              {subjects.length > 0 && (
                <span className="text-xs font-bold text-slate-400">{filteredSubjects.length} subjects</span>
              )}
            </div>

            {loadingSubjects ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {[...Array(20)].map((_, i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Tag size={36} className="mx-auto mb-2 opacity-30" />
                <p className="font-bold text-slate-500 text-sm">No subjects found</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filteredSubjects.map((subject, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSearchQuery(subject.label);
                      setSearchField('dc.subject');
                      setActiveTab('search');
                      setTimeout(() => handleSearch(0), 100);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50 transition-all group text-left"
                  >
                    <span className="text-sm font-bold text-slate-700 group-hover:text-teal-800 transition-colors">
                      {subject.label}
                    </span>
                    {subject.count > 0 && (
                      <span className="text-[10px] font-black text-slate-400 bg-slate-100 group-hover:bg-teal-100 group-hover:text-teal-600 px-1.5 py-0.5 rounded-full transition-colors">
                        {subject.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
