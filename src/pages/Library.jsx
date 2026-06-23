import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  Filter,
  History,
  Globe,
  ArrowRight,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { transformBooks, BOOK_SELECT, OPENSTAX_CURATED } from '../lib/transformBook';
import { ALL_ADDITIONAL_OER } from '../lib/oerCatalog';
import { useGamification } from '../context/GamificationContext';
import BookCard from '../components/library/BookCard';
import DigitizationRequestModal from '../components/library/DigitizationRequestModal';
import FilterPanel from '../components/library/FilterPanel';
import SearchBar from '../components/library/SearchBar';

const ALL_LOCAL_OER = (() => {
  const combined = [...OPENSTAX_CURATED, ...ALL_ADDITIONAL_OER];
  const seenIds = new Set();
  return combined.filter(book => {
    if (!book.id || seenIds.has(book.id)) return false;
    seenIds.add(book.id);
    return true;
  });
})();
if (typeof window !== 'undefined') {
  window.ALL_LOCAL_OER = ALL_LOCAL_OER;
}

import { openStaxService } from '../services/openStaxService';
import { geminiService } from '../services/geminiService';
import { gutenbergService } from '../services/gutenbergService';
import { openLibraryService } from '../services/openLibraryService';
import { arxivService } from '../services/arxivService';

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { bookProgress } = useGamification();
  const navigate = useNavigate();
  
  // Filter States
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    faculty: searchParams.get('faculty') || 'All',
    level: searchParams.get('level') || 'All',
    pillar: searchParams.get('pillar') || 'All',
    access: searchParams.get('access') || 'All',
    source: searchParams.get('source') || 'All',
    format: searchParams.get('format') || 'All',
    university: searchParams.get('university') || 'All',
    yearFrom: searchParams.get('yearFrom') || '',
    yearTo: searchParams.get('yearTo') || '',
    isbn: searchParams.get('isbn') || '',
    zimAuthored: searchParams.get('zimAuthored') === 'true',
    africanContext: searchParams.get('africanContext') === 'true',
  });

  // UI States
  const [viewMode, setViewMode] = useState(searchParams.get('view') || 'tile'); // 'grid' | 'list' | 'tile'
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || (searchParams.get('q') ? 'relevance' : 'title'));
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isDigitizationModalOpen, setIsDigitizationModalOpen] = useState(false);
  
  // AI Search States
  const [isAiSearch, setIsAiSearch] = useState(false);
  const [useSemanticSearch, setUseSemanticSearch] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiThinking, setAiThinking] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Data States
  const [publications, setPublications] = useState([]);
  const [localSearch, setLocalSearch] = useState('');
  const [localCategory, setLocalCategory] = useState('All');
  const [semanticResults, setSemanticResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const stored = localStorage.getItem('dare_saved_books');
      return new Set(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set();
    }
  });
  const [searchField, setSearchField] = useState('all');
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0);
  const loadMoreRef = useRef(null);
  const LIMIT = 40;

  const withTimeout = (promise, ms = 8000) =>
    Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

  // Fetch Data
  const fetchPublications = useCallback(async (isLoadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      if (useSemanticSearch && semanticResults) {
        if (!isLoadMore) {
          setPublications(semanticResults);
          setTotalCount(semanticResults.length);
        }
        setLoading(false);
        return;
      }

      const currentOffset = isLoadMore ? offsetRef.current : 0;
      const page = Math.floor(currentOffset / LIMIT) + 1;
      const accessOk = filters.access === 'All' || filters.access === 'Dare Access';
      const srcAll = filters.source === 'All';
      const srcPartner = filters.source === 'Partner Resources';

      // ── 1. Supabase books ─────────────────────────────────────────────────────
      let dbData = [], dbCount = 0;
      if (srcAll || filters.source === 'Dare Library' || filters.source === 'Project Gutenberg' || srcPartner) {
        const needsDirectQuery = filters.isbn || filters.yearFrom || filters.yearTo ||
          filters.zimAuthored || filters.africanContext || filters.source === 'Project Gutenberg' ||
          srcPartner || (sortBy !== 'relevance' && sortBy !== 'title' && filters.q);

        if (!needsDirectQuery) {
          const rpcParams = {
            p_query: filters.q || null,
            p_faculty: filters.faculty === 'All' ? null : filters.faculty,
            p_level: filters.level === 'All' ? null : filters.level,
            p_limit: LIMIT, p_offset: currentOffset, p_sort: sortBy
          };
          const { data, count, error } = await supabase.rpc('search_publications', rpcParams, { count: 'exact' });
          if (!error) { dbData = data || []; dbCount = count || 0; }
        }

        if (dbData.length === 0 && (needsDirectQuery || dbCount === 0)) {
          let query = supabase.from('books').select(BOOK_SELECT, { count: 'exact' });
          if (filters.source === 'Project Gutenberg') query = query.eq('source', 'Project Gutenberg');
          if (filters.faculty !== 'All') {
            const fl = filters.faculty.toLowerCase();
            query = query.or(`subject.ilike.%${filters.faculty}%,faculty.ilike.%${filters.faculty}%,subject.ilike.%${fl.split(' ')[0]}%,faculty.ilike.%${fl.split(' ')[0]}%`);
          }
          if (filters.level !== 'All') query = query.ilike('programme', `%${filters.level}%`);
          if (filters.pillar !== 'All') query = query.contains('ai_topics', [filters.pillar]);
          if (filters.university !== 'All') query = query.ilike('institution_id', `%${filters.university}%`);
          if (filters.access !== 'All') {
            if (filters.access === 'Dare Access') query = query.in('access_model', ['dare_access', 'open_access']);
            else if (filters.access === 'Licensed') query = query.eq('access_model', 'licensed');
            else if (filters.access === 'Purchased') query = query.eq('is_purchased', true);
          }
          if (filters.isbn) query = query.or(`description.ilike.%${filters.isbn}%,title.ilike.%${filters.isbn}%`);
          if (filters.q) {
            if (searchField === 'title') query = query.ilike('title', `%${filters.q}%`);
            else if (searchField === 'author') query = query.ilike('author_names', `%${filters.q}%`);
            else if (searchField === 'subject') query = query.or(`subject.ilike.%${filters.q}%,faculty.ilike.%${filters.q}%`);
            else query = query.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%,author_names.ilike.%${filters.q}%`);
          }
          if (filters.yearFrom) query = query.gte('created_at', `${filters.yearFrom}-01-01`);
          if (filters.yearTo) query = query.lte('created_at', `${filters.yearTo}-12-31`);
          switch (sortBy) {
            case 'newest': query = query.order('created_at', { ascending: false }); break;
            case 'downloads': query = query.order('total_reads', { ascending: false }); break;
            case 'title': query = query.order('title', { ascending: true }); break;
            default: if (!filters.q) query = query.order('title', { ascending: true }); break;
          }
          if (filters.source === 'Featured Items') query = query.eq('is_featured', true);
          query = query.range(currentOffset, currentOffset + LIMIT - 1);
          const result = await query;
          if (result.error) throw result.error;
          dbData = transformBooks(result.data);
          dbCount = result.count || 0;
        }
      }

      // ── 1.5 DSpace documents ──────────────────────────────────────────────────
      let dspaceData = [], dspaceCount = 0;
      if (srcAll || filters.source === 'Research' || filters.source === 'Dare Library') {
        let docQuery = supabase.from('documents').select('*', { count: 'exact' }).not('synced_from_dspace_at', 'is', null);
        if (filters.q) docQuery = docQuery.or(`title.ilike.%${filters.q}%,creator.ilike.%${filters.q}%,description.ilike.%${filters.q}%`);
        if (filters.faculty !== 'All') docQuery = docQuery.or(`description.ilike.%${filters.faculty}%,title.ilike.%${filters.faculty}%`);
        docQuery = docQuery.range(currentOffset, currentOffset + LIMIT - 1);
        const { data, count, error } = await docQuery;
        if (!error) {
          dspaceData = (data || []).map(doc => ({
            id: doc.id, title: doc.title, author_names: doc.creator || 'Unknown Author',
            description: doc.description, publisher_name: doc.institution || doc.publisher || 'DSpace Repository',
            year_published: doc.date ? new Date(doc.date).getFullYear() : null, format: doc.format || 'pdf',
            access_model: 'open_access', source: 'Research', resource_type: 'Research',
            file_url: doc.url, is_dspace: true, cover_image_url: null
          }));
          dspaceCount = count || 0;
        }
      }

      // ── 2. Local OER catalog ──────────────────────────────────────────────────
      let openStaxData = [], openStaxCount = 0;
      if ((srcAll || srcPartner || filters.source === 'Featured Items') && accessOk) {
        if (!filters.zimAuthored && !filters.africanContext && !filters.isbn) {
          let filteredOER = ALL_LOCAL_OER;
          if (filters.source === 'Featured Items') filteredOER = filteredOER.filter(b => b.featured === true || b.is_featured === true);
          if (filters.faculty !== 'All') {
            const fl = filters.faculty.toLowerCase();
            filteredOER = filteredOER.filter(b => {
              const bf = (b.faculty || '').toLowerCase(), bs = (b.subject || '').toLowerCase();
              return bf.includes(fl) || fl.includes(bf) || bs.includes(fl) || fl.includes(bs);
            });
          }
          if (filters.q) {
            const q = filters.q.toLowerCase();
            filteredOER = filteredOER.filter(b => b.title.toLowerCase().includes(q) || b.author_names.toLowerCase().includes(q));
          }
          openStaxData = filteredOER.slice(currentOffset, currentOffset + LIMIT);
          openStaxCount = filteredOER.length;
        }
      }

      // ── Phase 1: show local data immediately ──────────────────────────────────
      const buildMerge = (gData, osApiData, olData, axData, gCount, osApiCount, olCount, axCount) => {
        let combined = [];
        if (srcPartner) {
          combined = [...dbData, ...openStaxData, ...gData, ...osApiData, ...olData, ...axData];
          setTotalCount(dbCount + openStaxCount + gCount + osApiCount + olCount + axCount);
        } else if (filters.source === 'Research') {
          combined = dspaceData; setTotalCount(dspaceCount);
        } else if (filters.source === 'Gutenberg' || filters.source === 'Project Gutenberg') {
          combined = gData; setTotalCount(gCount);
        } else if (filters.source === 'Open Library') {
          combined = olData; setTotalCount(olCount);
        } else if (filters.source === 'arXiv Research') {
          combined = axData; setTotalCount(axCount);
        } else if (filters.source === 'Dare Library') {
          combined = [...dbData, ...dspaceData]; setTotalCount(dbCount + dspaceCount);
        } else if (filters.source === 'Featured Items') {
          combined = [...dbData, ...openStaxData]; setTotalCount(dbCount + openStaxCount);
        } else {
          const seen = new Set(dbData.map(b => b.title?.toLowerCase()));
          combined = [
            ...dbData,
            ...dspaceData.filter(b => !seen.has(b.title?.toLowerCase())),
            ...openStaxData.filter(b => !seen.has(b.title?.toLowerCase())),
            ...gData.filter(b => !seen.has(b.title?.toLowerCase())),
            ...osApiData.filter(b => !seen.has(b.title?.toLowerCase())),
            ...olData.filter(b => !seen.has(b.title?.toLowerCase())),
            ...axData.filter(b => !seen.has(b.title?.toLowerCase())),
          ];
          if (!isLoadMore) setTotalCount(dbCount + dspaceCount + openStaxCount + gCount + osApiCount + olCount + axCount);
        }
        return combined;
      };

      if (!isLoadMore) {
        setPublications(buildMerge([], [], [], [], 0, 0, 0, 0));
      }
      setLoading(false);

      // ── Phase 2: all external APIs in parallel ────────────────────────────────
      const needsRemote = accessOk && (srcAll || srcPartner ||
        filters.source === 'Gutenberg' || filters.source === 'Project Gutenberg' ||
        filters.source === 'Open Library' || filters.source === 'arXiv Research');
      if (!needsRemote) return;

      setLoadingRemote(true);
      const doGutenberg  = srcAll || srcPartner || filters.source === 'Gutenberg' || filters.source === 'Project Gutenberg';
      const doOpenStaxApi = srcAll || srcPartner;
      const doOpenLibrary = srcAll || srcPartner || filters.source === 'Open Library';
      const doArxiv = srcAll || srcPartner || filters.source === 'arXiv Research';

      const [gR, osR, olR, axR] = await Promise.allSettled([
        doGutenberg   ? withTimeout(gutenbergService.searchBooks(filters.q, page))                          : Promise.resolve(null),
        doOpenStaxApi ? withTimeout(openStaxService.searchBooks({ query: filters.q, page, limit: LIMIT })) : Promise.resolve(null),
        doOpenLibrary ? withTimeout(openLibraryService.searchBooks(filters.q || 'Zimbabwe', page))          : Promise.resolve(null),
        doArxiv       ? withTimeout(arxivService.searchResearch(filters.q || 'Zimbabwe', page))             : Promise.resolve(null),
      ]);

      if (gR.status  === 'rejected') console.error('Gutenberg:', gR.reason?.message);
      if (osR.status === 'rejected') console.error('OpenStax:', osR.reason?.message);
      if (olR.status === 'rejected') console.error('Open Library:', olR.reason?.message);
      if (axR.status === 'rejected') console.error('arXiv:', axR.reason?.message);

      const gutenbergData    = (gR.status  === 'fulfilled' && gR.value)  ? gR.value.books  ?? [] : [];
      const gutenbergCount   = (gR.status  === 'fulfilled' && gR.value)  ? gR.value.count  ?? 0  : 0;
      const openStaxApiData  = (osR.status === 'fulfilled' && osR.value) ? osR.value.data  ?? [] : [];
      const openStaxApiCount = (osR.status === 'fulfilled' && osR.value) ? osR.value.total ?? 0  : 0;
      const openLibraryData  = (olR.status === 'fulfilled' && olR.value) ? olR.value.books    ?? [] : [];
      const openLibraryCount = (olR.status === 'fulfilled' && olR.value) ? olR.value.numFound ?? 0  : 0;
      const arxivData        = (axR.status === 'fulfilled' && axR.value) ? axR.value.books        ?? [] : [];
      const arxivCount       = (axR.status === 'fulfilled' && axR.value) ? axR.value.totalResults ?? 0  : 0;

      const fullCombined = buildMerge(gutenbergData, openStaxApiData, openLibraryData, arxivData, gutenbergCount, openStaxApiCount, openLibraryCount, arxivCount);

      if (isLoadMore) {
        setPublications(prev => [...prev, ...fullCombined]);
        offsetRef.current += LIMIT;
        setOffset(offsetRef.current);
      } else {
        setPublications(fullCombined);
        offsetRef.current = LIMIT;
        setOffset(LIMIT);
      }

    } catch (err) {
      console.error('Error fetching publications:', err);
      setError('Unable to load publications. Please try again.');
    } finally {
      setLoading(false);
      setLoadingRemote(false);
    }
  }, [filters, sortBy, searchField]);

  useEffect(() => {
    if (filters.q && sortBy === 'title') {
      setSortBy('relevance');
    } else if (!filters.q && sortBy === 'relevance') {
      setSortBy('title');
    }
  }, [filters.q, sortBy]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingRemote && publications.length < totalCount) {
          fetchPublications(true);
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loading, loadingRemote, publications.length, totalCount, fetchPublications]);

  useEffect(() => {
    offsetRef.current = 0;
    setOffset(0);
    fetchPublications(false);
  }, [fetchPublications]);

  useEffect(() => {
    const query = isAiSearch ? aiQuery : filters.q;
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const terms = await geminiService.getSearchSuggestions(query);
        setSuggestions(terms);
      } catch (err) {
        console.error('Suggestions error:', err);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [filters.q, aiQuery, isAiSearch]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleSaved = useCallback((id) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try { localStorage.setItem('dare_saved_books', JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v && v !== 'All' && v !== false) {
        params[k] = String(v);
      }
    });
    params.view = viewMode;
    params.sort = sortBy;
    setSearchParams(params, { replace: true });
  }, [filters, viewMode, sortBy, setSearchParams]);

  const clearFilters = () => {
    const resetFilters = {
      q: '',
      faculty: 'All',
      level: 'All',
      access: 'All',
      source: 'All',
      format: 'All',
      university: 'All',
      yearFrom: '',
      yearTo: '',
      isbn: '',
      zimAuthored: false,
      africanContext: false,
    };
    setFilters(resetFilters);
  };

  const handleAiSearch = async () => {
    if (!aiQuery.trim() || aiThinking) return;
    
    setAiThinking(true);
    try {
      if (useSemanticSearch) {
        const results = await geminiService.semanticSearch(aiQuery);
        if (results && results.length > 0) {
          setSemanticResults(results);
          setPublications(results);
          setTotalCount(results.length);
          setIsAiSearch(false);
          setAiQuery('');
          return;
        }
      }

      const result = await geminiService.searchBooks(aiQuery);
      
      setSemanticResults(null);
      setFilters(prev => ({
        ...prev,
        q: result.keywords.join(' '),
        faculty: result.faculty !== 'All' ? result.faculty : 'All',
        level: result.level !== 'All' ? result.level : 'All'
      }));
      
      setIsAiSearch(false);
      setAiQuery('');
    } catch (err) {
      console.error('AI Search Error:', err);
      setError('AI Search failed. Please try again.');
    } finally {
      setAiThinking(false);
    }
  };

  const filteredPublications = publications.filter(pub => {
    const matchesCategory = localCategory === 'All' || 
      pub.category?.toLowerCase() === localCategory.toLowerCase() ||
      pub.subject?.toLowerCase().includes(localCategory.toLowerCase()) ||
      pub.faculty?.toLowerCase().includes(localCategory.toLowerCase());
    
    return matchesCategory;
  });

  return (
    <div className="relative pt-24 lg:pt-28 pb-32 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 w-full min-h-screen bg-slate-50 flex flex-col md:flex-row gap-8">
      {/* SIDEBAR FILTERS */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-slate-200 p-6 overflow-y-auto transform transition-transform duration-300 md:relative md:translate-x-0 md:bg-transparent md:border-none md:p-0 md:overflow-visible md:w-72 shrink-0 ${isMobileFiltersOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="md:hidden flex items-center justify-between mb-6">
          <h2 className="font-bold text-xl">Filters</h2>
          <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
             <AlertCircle size={20} />
          </button>
        </div>
        <FilterPanel 
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          onRequestDigitization={() => setIsDigitizationModalOpen(true)}
        />
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full min-w-0">
        <DigitizationRequestModal 
          isOpen={isDigitizationModalOpen} 
          onClose={() => setIsDigitizationModalOpen(false)} 
        />
        {/* Mobile Filter Toggle */}
        <button 
          className="md:hidden flex items-center justify-center gap-2 w-full py-3 bg-white border border-slate-200 rounded-xl mb-6 text-sm font-bold shadow-sm"
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
        >
          <Filter size={18} /> Filters
        </button>

        {/* Modern Tabs for Source Filtering */}
        <div className="flex overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-2xl w-fit whitespace-nowrap shadow-sm">
            {['All', 'Featured Items', 'Dare Library', 'Research', 'Partner Resources', 'Project Gutenberg', 'Open Library', 'arXiv Research'].map((source) => (
              <button
                key={source}
                onClick={() => handleFilterChange('source', source)}
                className={`px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  filters.source === source
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {source}
              </button>
            ))}
            <button
              onClick={() => navigate('/global-repos')}
              className="px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all text-teal-600 hover:text-teal-800 hover:bg-teal-50 flex items-center gap-1.5 border border-teal-200"
            >
              <Globe size={14} /> Global Repos
            </button>
          </div>
        </div>

        {/* Continue Learning Section */}
        {Object.keys(bookProgress).length > 0 && filters.source === 'All' && !filters.q && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600">
                <History size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Continue Learning</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pick up where you left off</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {publications
                .filter(p => bookProgress[p.id] > 0)
                .slice(0, 4)
                .map(book => (
                  <BookCard
                    key={`continue-${book.id}`}
                    publication={book}
                    variant="tile"
                    progress={bookProgress[book.id]}
                    isSaved={savedIds.has(String(book.id))}
                    onToggleSave={toggleSaved}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Category Filters (Local) */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {['All', 'Vocational', 'Polytechnic', 'Science', 'Mathematics', 'Business', 'Technology', 'Arts'].map((cat) => (
            <button
              key={cat}
              onClick={() => setLocalCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                localCategory === cat
                  ? 'bg-teal-500 border-teal-500 text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-teal-500/50 hover:text-teal-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 1M+ Open Source Books Connect Spotlight Banner */}
        <div className="bg-gradient-to-r from-teal-500/15 via-emerald-500/5 to-transparent rounded-3xl p-6 md:p-8 mb-8 border border-teal-500/20 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute inset-0 z-0 opacity-10">
            <img 
              src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=800" 
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="relative z-10 max-w-xl text-left">
            <div className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-800 font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider mb-3">
              <Globe size={11} className="text-teal-600 animate-spin-slow" />
              1,000,000+ Unified Ebooks Connect Active
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-2">
              Explore Peer-Reviewed & Classic Ebooks
            </h3>
            <p className="text-slate-600 text-xs md:text-sm font-semibold leading-relaxed">
              Query a massive global library containing digitizations, masterworks, and papers from Open Library, Project Gutenberg, and arXiv. Align any text immediately to assignments.
            </p>
          </div>
          <div className="relative z-10 shrink-0 flex flex-wrap gap-2.5 w-full md:w-auto">
            <Link 
              to="/open-books" 
              className="flex-1 md:flex-none text-center px-4.5 py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>Launch Custom Ebook Hub</span>
              <ArrowRight size={13} />
            </Link>
            <button
              onClick={() => {
                handleFilterChange('source', 'Project Gutenberg');
                setLocalSearch('');
                handleFilterChange('q', '');
              }}
              className="flex-1 md:flex-none text-center px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs border border-slate-200 shadow-sm transition-all active:scale-95 whitespace-nowrap"
            >
              Filter Gutenberg
            </button>
          </div>
        </div>

        {/* Search Header */}
        <div className="relative overflow-hidden rounded-3xl p-8 mb-8 bg-slate-900 border border-slate-800 shadow-2xl">
          {/* Real Book Background Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=2000" 
              alt="Library Search Background" 
              className="w-full h-full object-cover opacity-20 mix-blend-overlay"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <h1 className="text-3xl font-black text-white px-2">Library</h1>
                <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-xl backdrop-blur-sm border border-slate-700/50">
                  <button 
                    onClick={() => setUseSemanticSearch(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!useSemanticSearch ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-300'}`}
                  >
                    Keyword
                  </button>
                  <button 
                    onClick={() => setUseSemanticSearch(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${useSemanticSearch ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-300'}`}
                  >
                    Semantic (AI)
                  </button>
                </div>
              </div>
              {semanticResults && (
                <button 
                  onClick={() => {
                    setSemanticResults(null);
                    fetchPublications(false);
                  }}
                  className="text-xs font-bold text-amber-400 hover:underline"
                >
                  Clear AI Results
                </button>
              )}
            </div>
            
            <div className="mt-6 max-w-3xl">
              <SearchBar 
                value={isAiSearch ? aiQuery : localSearch}
                onChange={(val) => isAiSearch ? setAiQuery(val) : setLocalSearch(val)}
                onSearch={isAiSearch ? handleAiSearch : () => {
                  handleFilterChange('q', localSearch);
                  fetchPublications(false);
                }}
                isAiMode={isAiSearch}
                onToggleAi={() => setIsAiSearch(!isAiSearch)}
                aiThinking={aiThinking}
                suggestions={suggestions}
                onSelectSuggestion={(term) => {
                  if (isAiSearch) {
                    setAiQuery(term);
                  } else {
                    setLocalSearch(term);
                    handleFilterChange('q', term);
                  }
                  setSuggestions([]);
                }}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
                searchField={searchField}
                onSearchFieldChange={setSearchField}
              />
            </div>
          </div>
        </div>


        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
              {(1000000 + totalCount).toLocaleString()} Titles Indexed
            </span>
            <div className="h-4 w-[1px] bg-slate-300" />
            <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
              <button 
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'tile' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
                onClick={() => setViewMode('tile')}
                title="Modern Tile View"
              >
                <LayoutGrid size={16} />
              </button>
              <button 
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
                onClick={() => setViewMode('grid')}
                title="Compact Grid View"
              >
                <Sparkles size={16} />
              </button>
              <button 
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <ListIcon size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sort By</span>
            <select 
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-teal-500 focus:ring-4 ring-teal-500/20 transition-all shadow-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {filters.q && <option value="relevance">Relevance</option>}
              <option value="title">Title (A-Z)</option>
              <option value="newest">Newest</option>
              <option value="rating">Rating</option>
              <option value="downloads">Most Read</option>
            </select>
          </div>
        </div>

        {/* Result Summary Bar */}
        {filteredPublications.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4 min-h-[28px]">
            <span className="text-sm font-semibold text-slate-500 shrink-0">
              {filteredPublications.length.toLocaleString()} result{filteredPublications.length !== 1 ? 's' : ''}
              {loadingRemote && <span className="ml-1 text-xs text-teal-500 font-bold">· loading more…</span>}
            </span>
            {[
              filters.q && { key: 'q', label: `"${filters.q}"`, clear: () => handleFilterChange('q', '') },
              filters.faculty !== 'All' && { key: 'faculty', label: filters.faculty, clear: () => handleFilterChange('faculty', 'All') },
              filters.level !== 'All' && { key: 'level', label: filters.level, clear: () => handleFilterChange('level', 'All') },
              filters.access !== 'All' && { key: 'access', label: filters.access, clear: () => handleFilterChange('access', 'All') },
              filters.format !== 'All' && { key: 'format', label: `Format: ${filters.format}`, clear: () => handleFilterChange('format', 'All') },
              filters.yearFrom && { key: 'yearFrom', label: `From ${filters.yearFrom}`, clear: () => handleFilterChange('yearFrom', '') },
              filters.yearTo && { key: 'yearTo', label: `To ${filters.yearTo}`, clear: () => handleFilterChange('yearTo', '') },
              filters.zimAuthored && { key: 'zimAuthored', label: '🇿🇼 Zimbabwe', clear: () => handleFilterChange('zimAuthored', false) },
              filters.africanContext && { key: 'africanContext', label: '🌍 African', clear: () => handleFilterChange('africanContext', false) },
            ].filter(Boolean).map(chip => (
              <button
                key={chip.key}
                onClick={chip.clear}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
              >
                {chip.label}<X size={11} />
              </button>
            ))}
          </div>
        )}


        <div className={
          viewMode === 'tile' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6" : 
          viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" : 
          "flex flex-col gap-4"
        }>
          {loading && publications.length === 0
            ? Array(12).fill(0).map((_, i) => (
                <BookCard key={i} loading={true} variant={viewMode} />
              ))
            : filteredPublications.map(book => (
                <BookCard
                  key={book.id}
                  publication={book}
                  variant={viewMode}
                  progress={bookProgress[book.id] || 0}
                  isSaved={savedIds.has(String(book.id))}
                  onToggleSave={toggleSaved}
                />
              ))
          }
        </div>

        {/* Remote sources loading hint */}
        {loadingRemote && !loading && (
          <div className="flex items-center justify-center gap-2 py-2 mb-2 text-xs font-bold text-slate-400">
            <div className="w-3 h-3 border-2 border-slate-200 border-t-teal-400 rounded-full animate-spin" />
            Loading more sources…
          </div>
        )}

        {/* Infinite Scroll Sentinel */}
        <div ref={loadMoreRef} className="py-12 flex justify-center w-full">
          {(loading || loadingRemote) && publications.length > 0 && (
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-full shadow-sm text-sm font-bold text-slate-600">
              <div className="w-4 h-4 border-2 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
              <span>Loading more titles…</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
