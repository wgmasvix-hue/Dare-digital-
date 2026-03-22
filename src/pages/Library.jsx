import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Sparkles, 
  LayoutGrid, 
  List as ListIcon, 
  Filter, 
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { transformBooks, BOOK_SELECT, OPENSTAX_CURATED } from '../lib/transformBook';
import { ALL_ADDITIONAL_OER } from '../lib/oerCatalog';
import BookCard from '../components/library/BookCard';
import DigitizationRequestModal from '../components/library/DigitizationRequestModal';
import FilterPanel from '../components/library/FilterPanel';
import SearchBar from '../components/library/SearchBar';

const ALL_LOCAL_OER = [...OPENSTAX_CURATED, ...ALL_ADDITIONAL_OER];
import styles from './Library.module.css';

import { openStaxService } from '../services/openStaxService';
import { geminiService } from '../services/geminiService';

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter States
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    faculty: searchParams.get('faculty') || 'All',
    level: searchParams.get('level') || 'All',
    pillar: searchParams.get('pillar') || 'All',
    access: searchParams.get('access') || 'All',
    source: searchParams.get('source') || 'Partner Resources',
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
  const [semanticResults, setSemanticResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0);
  const loadMoreRef = useRef(null);
  const LIMIT = 40;

  // Fetch Data
  const fetchPublications = useCallback(async (isLoadMore = false) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useSemanticSearch && semanticResults) {
        // If we have semantic results, we don't need to fetch from DB
        // But we might want to paginate them if there are many
        if (!isLoadMore) {
          setPublications(semanticResults);
          setTotalCount(semanticResults.length);
        }
        setLoading(false);
        return;
      }

      const currentOffset = isLoadMore ? offsetRef.current : 0;
      const currentPage = Math.floor(currentOffset / LIMIT) + 1;
      
      let dbData = [];
      let openStaxData = [];
      let dbCount = 0;
      let openStaxCount = 0;

      // 1. Fetch from Supabase (Internal DB)
      if (filters.source === 'All' || filters.source === 'Dare Library') {
        const needsDirectQuery = filters.isbn || filters.yearFrom || filters.yearTo || 
          filters.zimAuthored || filters.africanContext ||
          (sortBy !== 'relevance' && sortBy !== 'title' && filters.q);

        if (!needsDirectQuery) {
          const rpcParams = {
            search_query: filters.q || null,
            p_faculty: filters.faculty === 'All' ? null : filters.faculty,
            p_level: filters.level === 'All' ? null : filters.level,
            p_limit: LIMIT,
            p_offset: currentOffset
          };
          const result = await supabase.rpc('search_publications', rpcParams);
          if (!result.error) {
            dbData = result.data || [];
            dbCount = dbData.length < LIMIT ? dbData.length + currentOffset : 1000;
          }
        }

        if (dbData.length === 0 && (needsDirectQuery || dbCount === 0)) {
          let query = supabase
            .from('books')
            .select(BOOK_SELECT, { count: 'exact' });

          if (filters.faculty !== 'All') query = query.ilike('subject', `%${filters.faculty}%`);
          if (filters.level !== 'All') query = query.ilike('programme', `%${filters.level}%`);
          if (filters.pillar !== 'All') query = query.contains('ai_topics', [filters.pillar]);
          if (filters.university !== 'All') query = query.ilike('institution_id', `%${filters.university}%`);
          if (filters.access !== 'All') {
            if (filters.access === 'Dare Access') query = query.is('institution_id', null);
            else if (filters.access === 'Licensed') query = query.not('institution_id', 'is', null);
          }
          if (filters.isbn) query = query.or(`description.ilike.%${filters.isbn}%,title.ilike.%${filters.isbn}%`);
          if (filters.q) query = query.ilike('title', `%${filters.q}%`);
          if (filters.yearFrom) query = query.gte('created_at', `${filters.yearFrom}-01-01`);
          if (filters.yearTo) query = query.lte('created_at', `${filters.yearTo}-12-31`);

          switch (sortBy) {
            case 'newest': query = query.order('created_at', { ascending: false }); break;
            case 'downloads': query = query.order('total_reads', { ascending: false }); break;
            case 'title': query = query.order('title', { ascending: true }); break;
            default: if (!filters.q) query = query.order('title', { ascending: true }); break;
          }

          if (filters.source === 'Featured Items') {
            query = query.eq('is_featured', true);
          }
          
          query = query.range(currentOffset, currentOffset + LIMIT - 1);
          const result = await query;
          if (result.error) throw result.error;
          dbData = transformBooks(result.data);
          dbCount = result.count || 0;
        }
      }

      // 2. Fetch from Local OER Catalog
      if (filters.source === 'All' || filters.source === 'Partner Resources' || filters.source === 'Featured Items') {
        if (!filters.zimAuthored && !filters.africanContext && !filters.isbn) {
          let filteredOER = ALL_LOCAL_OER;
          
          // Filter by source
          if (filters.source === 'Featured Items') {
            filteredOER = filteredOER.filter(b => b.featured === true || b.is_featured === true);
          }
          
          // Filter by faculty
          if (filters.faculty !== 'All') {
            filteredOER = filteredOER.filter(b => b.faculty?.toLowerCase() === filters.faculty.toLowerCase());
          }
          
          // Filter by query
          if (filters.q) {
            const q = filters.q.toLowerCase();
            filteredOER = filteredOER.filter(b => 
              b.title.toLowerCase().includes(q) || 
              b.author_names.toLowerCase().includes(q)
            );
          }
          
          // Handle pagination for OER
          const start = currentOffset;
          const end = start + LIMIT;
          openStaxData = filteredOER.slice(start, end);
          openStaxCount = filteredOER.length;
        }
      }

      // 3. Merge Results
      let combinedData = [];
      if (filters.source === 'Partner Resources') {
        combinedData = openStaxData;
        setTotalCount(openStaxCount);
      } else if (filters.source === 'Dare Library') {
        combinedData = dbData;
        setTotalCount(dbCount);
      } else if (filters.source === 'Featured Items') {
        combinedData = [...dbData, ...openStaxData];
        setTotalCount(dbCount + openStaxCount);
      } else {
        // When merging, we use the sum of counts as a reasonable estimate
        const seenTitles = new Set(dbData.map(b => b.title?.toLowerCase()));
        const uniqueOpenStax = openStaxData.filter(b => !seenTitles.has(b.title?.toLowerCase()));
        combinedData = [...dbData, ...uniqueOpenStax];
        
        // Only update total count on initial load to avoid jumping numbers
        if (!isLoadMore) {
          setTotalCount(dbCount + openStaxCount);
        }
      }

      if (isLoadMore) {
        setPublications(prev => [...prev, ...combinedData]);
        offsetRef.current += LIMIT;
        setOffset(offsetRef.current);
      } else {
        setPublications(combinedData);
        offsetRef.current = LIMIT;
        setOffset(LIMIT);
      }

    } catch (err) {
      console.error('Error fetching publications:', err);
      setError('Unable to load publications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy]);

  // Update sort when query changes
  useEffect(() => {
    if (filters.q && sortBy === 'title') {
      setSortBy('relevance');
    } else if (!filters.q && sortBy === 'relevance') {
      setSortBy('title');
    }
  }, [filters.q, sortBy]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && publications.length < totalCount) {
          fetchPublications(true);
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loading, publications.length, totalCount, fetchPublications]);

  // Initial Fetch & Filter Change
  useEffect(() => {
    offsetRef.current = 0;
    setOffset(0);
    fetchPublications(false);
  }, [fetchPublications]);

  // Fetch Suggestions
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

  // Sync filters to URL
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
      
      // Update filters based on AI response
      setSemanticResults(null);
      setFilters(prev => ({
        ...prev,
        q: result.keywords.join(' '),
        faculty: result.faculty !== 'All' ? result.faculty : 'All',
        level: result.level !== 'All' ? result.level : 'All'
      }));
      
      // Switch back to standard search view to show results
      setIsAiSearch(false);
      setAiQuery('');
    } catch (err) {
      console.error('AI Search Error:', err);
      setError('AI Search failed. Please try again.');
    } finally {
      setAiThinking(false);
    }
  };

  return (
    <div className={styles.libraryContainer}>
      {/* SIDEBAR FILTERS */}
      <aside className={`${styles.sidebar} ${isMobileFiltersOpen ? styles.mobileOpen : ''}`}>
        <FilterPanel 
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          onRequestDigitization={() => setIsDigitizationModalOpen(true)}
        />
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.main}>
        <DigitizationRequestModal 
          isOpen={isDigitizationModalOpen} 
          onClose={() => setIsDigitizationModalOpen(false)} 
        />
        {/* Mobile Filter Toggle */}
        <button 
          className={styles.mobileFilterToggle}
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
        >
          <Filter size={18} /> Filters
        </button>

        {/* Modern Tabs for Source Filtering */}
        <div className="flex items-center gap-2 mb-8 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-fit">
          {['All', 'Featured Items', 'Dare Library', 'Partner Resources', 'Buku'].map((source) => (
            <button
              key={source}
              onClick={() => handleFilterChange('source', source)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                filters.source === source 
                  ? 'bg-white dark:bg-slate-700 text-[#C8861A] shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {source}
            </button>
          ))}
        </div>

        {/* Search Header */}
        <div className={styles.searchHeader}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Library</h1>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button 
                  onClick={() => setUseSemanticSearch(false)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${!useSemanticSearch ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Keyword
                </button>
                <button 
                  onClick={() => setUseSemanticSearch(true)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${useSemanticSearch ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
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
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
              >
                Clear AI Results
              </button>
            )}
          </div>
          <SearchBar 
            value={isAiSearch ? aiQuery : filters.q}
            onChange={(val) => isAiSearch ? setAiQuery(val) : handleFilterChange('q', val)}
            onSearch={isAiSearch ? handleAiSearch : () => fetchPublications(false)}
            isAiMode={isAiSearch}
            onToggleAi={() => setIsAiSearch(!isAiSearch)}
            aiThinking={aiThinking}
            suggestions={suggestions}
            onSelectSuggestion={(term) => {
              if (isAiSearch) setAiQuery(term);
              else handleFilterChange('q', term);
              setSuggestions([]);
            }}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
          />
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
            <button onClick={() => fetchPublications(false)}>Try Again</button>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
              {totalCount} Titles Found
            </span>
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-2">
              <button 
                className={`p-2 rounded-lg transition-all ${viewMode === 'tile' ? 'bg-[#3D3028] text-white' : 'text-slate-400 hover:bg-slate-100'}`}
                onClick={() => setViewMode('tile')}
                title="Modern Tile View"
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#3D3028] text-white' : 'text-slate-400 hover:bg-slate-100'}`}
                onClick={() => setViewMode('grid')}
                title="Compact Grid View"
              >
                <Sparkles size={18} />
              </button>
              <button 
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#3D3028] text-white' : 'text-slate-400 hover:bg-slate-100'}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <ListIcon size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sort By</span>
            <select 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-[#C8861A] transition-all"
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

        {/* Results */}
        <div className={
          viewMode === 'tile' ? styles.resultsTiles : 
          viewMode === 'grid' ? styles.resultsGrid : 
          styles.resultsList
        }>
          {loading && publications.length === 0 ? (
            // Skeletons
            Array(6).fill(0).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonCover} />
                <div className={styles.skeletonInfo}>
                  <div className={`${styles.skeletonLine} ${styles.w80}`} />
                  <div className={`${styles.skeletonLine} ${styles.w60}`} />
                  <div className={`${styles.skeletonLine} ${styles.w40}`} />
                </div>
              </div>
            ))
          ) : (
            publications.map(book => (
              <BookCard 
                key={book.id} 
                publication={book} 
                variant={viewMode} 
              />
            ))
          )}
        </div>

        {/* Infinite Scroll Sentinel */}
        <div ref={loadMoreRef} className={styles.loadMoreContainer}>
          {loading && publications.length > 0 && (
            <div className={styles.loadingMore}>
              <div className={styles.spinnerSmall} />
              <span>Loading more titles...</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
