import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Sparkles, 
  LayoutGrid, 
  List as ListIcon, 
  Filter, 
  AlertCircle,
  History
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
import styles from './Library.module.css';

import { openStaxService } from '../services/openStaxService';
import { geminiService } from '../services/geminiService';
import { gutenbergService } from '../services/gutenbergService';
import { openLibraryService } from '../services/openLibraryService';
import { arxivService } from '../services/arxivService';

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { bookProgress } = useGamification();
  
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
      let gutenbergData = [];
      let openStaxApiData = [];
      let openLibraryData = [];
      let arxivData = [];
      let dbCount = 0;
      let openStaxCount = 0;
      let gutenbergCount = 0;
      let openStaxApiCount = 0;
      let openLibraryCount = 0;
      let arxivCount = 0;

      // 1. Fetch from Supabase (Internal DB - Books)
      if (filters.source === 'All' || filters.source === 'Dare Library' || filters.source === 'Project Gutenberg' || filters.source === 'Partner Resources') {
        const needsDirectQuery = filters.isbn || filters.yearFrom || filters.yearTo || 
          filters.zimAuthored || filters.africanContext || filters.source === 'Project Gutenberg' ||
          filters.source === 'Partner Resources' ||
          (sortBy !== 'relevance' && sortBy !== 'title' && filters.q);

        if (!needsDirectQuery) {
          const rpcParams = {
            p_query: filters.q || null,
            p_faculty: filters.faculty === 'All' ? null : filters.faculty,
            p_level: filters.level === 'All' ? null : filters.level,
            p_limit: LIMIT,
            p_offset: currentOffset,
            p_sort: sortBy
          };
          const { data, count, error } = await supabase.rpc('search_publications', rpcParams, { count: 'exact' });
          if (!error) {
            dbData = data || [];
            dbCount = count || 0;
          }
        }

        if (dbData.length === 0 && (needsDirectQuery || dbCount === 0)) {
          let query = supabase
            .from('books')
            .select(BOOK_SELECT, { count: 'exact' });

          if (filters.source === 'Project Gutenberg') {
            query = query.eq('source', 'Project Gutenberg');
          } else if (filters.source === 'Partner Resources') {
            query = query.in('source', ['LibreTexts', 'OpenStax', 'Project Gutenberg']);
          }

          if (filters.faculty !== 'All') {
            const facultyLower = filters.faculty.toLowerCase();
            // Use a more flexible ILIKE pattern for faculty matching
            query = query.or(`subject.ilike.%${filters.faculty}%,faculty.ilike.%${filters.faculty}%,subject.ilike.%${facultyLower.split(' ')[0]}%,faculty.ilike.%${facultyLower.split(' ')[0]}%`);
          }
          if (filters.level !== 'All') query = query.ilike('programme', `%${filters.level}%`);
          if (filters.pillar !== 'All') query = query.contains('ai_topics', [filters.pillar]);
          if (filters.university !== 'All') query = query.ilike('institution_id', `%${filters.university}%`);
          if (filters.access !== 'All') {
            if (filters.access === 'Dare Access') {
              query = query.in('access_model', ['dare_access', 'open_access']);
            } else if (filters.access === 'Licensed') {
              query = query.eq('access_model', 'licensed');
            } else if (filters.access === 'Purchased') {
              query = query.eq('is_purchased', true);
            }
          }
          if (filters.isbn) query = query.or(`description.ilike.%${filters.isbn}%,title.ilike.%${filters.isbn}%`);
          if (filters.q) {
            query = query.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%,author_names.ilike.%${filters.q}%`);
          }
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

      // 1.5 Fetch from DSpace Documents (Research)
      let dspaceData = [];
      let dspaceCount = 0;
      if (filters.source === 'All' || filters.source === 'Research' || filters.source === 'Dare Library') {
        let docQuery = supabase
          .from('documents')
          .select('*', { count: 'exact' })
          .not('synced_from_dspace_at', 'is', null);

        if (filters.q) {
          docQuery = docQuery.or(`title.ilike.%${filters.q}%,creator.ilike.%${filters.q}%,description.ilike.%${filters.q}%`);
        }
        
        if (filters.faculty !== 'All') {
           docQuery = docQuery.or(`description.ilike.%${filters.faculty}%,title.ilike.%${filters.faculty}%`);
        }

        docQuery = docQuery.range(currentOffset, currentOffset + LIMIT - 1);
        const { data, count, error } = await docQuery;
        if (!error) {
          dspaceData = (data || []).map(doc => ({
            id: doc.id,
            title: doc.title,
            author_names: doc.creator || 'Unknown Author',
            description: doc.description,
            publisher_name: doc.institution || doc.publisher || 'DSpace Repository',
            year_published: doc.date ? new Date(doc.date).getFullYear() : null,
            format: doc.format || 'pdf',
            access_model: 'open_access',
            source: 'Research',
            resource_type: 'Research',
            file_url: doc.url,
            is_dspace: true,
            cover_image_url: null
          }));
          dspaceCount = count || 0;
        }
      }

      // 2. Fetch from Local OER Catalog
      if ((filters.source === 'All' || filters.source === 'Partner Resources' || filters.source === 'Featured Items') && 
          (filters.access === 'All' || filters.access === 'Dare Access')) {
        if (!filters.zimAuthored && !filters.africanContext && !filters.isbn) {
          let filteredOER = ALL_LOCAL_OER;
          
          // Filter by source
          if (filters.source === 'Featured Items') {
            filteredOER = filteredOER.filter(b => b.featured === true || b.is_featured === true);
          }
          
          // Filter by faculty
          if (filters.faculty !== 'All') {
            const facultyLower = filters.faculty.toLowerCase();
            filteredOER = filteredOER.filter(b => {
              const bFaculty = (b.faculty || "").toLowerCase();
              const bSubject = (b.subject || "").toLowerCase();
              // Flexible matching for faculty names (e.g., "Agriculture" matches "Agriculture & Environmental")
              return bFaculty.includes(facultyLower) || 
                     facultyLower.includes(bFaculty) ||
                     bSubject.includes(facultyLower) ||
                     facultyLower.includes(bSubject);
            });
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

      // 3. Fetch from Gutenberg API
      if ((filters.source === 'All' || filters.source === 'Partner Resources' || filters.source === 'Gutenberg' || filters.source === 'Project Gutenberg') && 
          (filters.access === 'All' || filters.access === 'Dare Access')) {
        try {
          const page = Math.floor(currentOffset / LIMIT) + 1;
          const gData = await gutenbergService.searchBooks(filters.q, page);
          gutenbergData = gData.books;
          gutenbergCount = gData.count;
        } catch (gErr) {
          console.error('Gutenberg fetch error:', gErr);
          setError('Gutenberg library is currently unavailable. Please try again or explore our AI tools for alternative resources.');
        }
      }

      // 4. Fetch from OpenStax API
      if ((filters.source === 'All' || filters.source === 'Partner Resources') && 
          (filters.access === 'All' || filters.access === 'Dare Access')) {
        try {
          const page = Math.floor(currentOffset / LIMIT) + 1;
          const osData = await openStaxService.searchBooks({ 
            query: filters.q, 
            page, 
            limit: LIMIT 
          });
          openStaxApiData = osData.data;
          openStaxApiCount = osData.total;
        } catch (osErr) {
          console.error('OpenStax fetch error:', osErr);
        }
      }

      // 5. Fetch from Open Library API
      if ((filters.source === 'All' || filters.source === 'Partner Resources' || filters.source === 'Open Library') && 
          (filters.access === 'All' || filters.access === 'Dare Access')) {
        try {
          const page = Math.floor(currentOffset / LIMIT) + 1;
          const olData = await openLibraryService.searchBooks(filters.q || 'Zimbabwe', page);
          openLibraryData = olData.books;
          openLibraryCount = olData.numFound;
        } catch (olErr) {
          console.error('Open Library fetch error:', olErr);
        }
      }

      // 6. Fetch from arXiv API
      if ((filters.source === 'All' || filters.source === 'Partner Resources' || filters.source === 'arXiv Research') && 
          (filters.access === 'All' || filters.access === 'Dare Access')) {
        try {
          const page = Math.floor(currentOffset / LIMIT) + 1;
          const axData = await arxivService.searchResearch(filters.q || 'Zimbabwe', page);
          arxivData = axData.books;
          arxivCount = axData.totalResults;
        } catch (axErr) {
          console.error('arXiv fetch error:', axErr);
        }
      }

      // 7. Merge Results
      let combinedData = [];
      if (filters.source === 'Partner Resources') {
        combinedData = [...dbData, ...openStaxData, ...gutenbergData, ...openStaxApiData, ...openLibraryData, ...arxivData];
        setTotalCount(dbCount + openStaxCount + gutenbergCount + openStaxApiCount + openLibraryCount + arxivCount);
      } else if (filters.source === 'Research') {
        combinedData = dspaceData;
        setTotalCount(dspaceCount);
      } else if (filters.source === 'Gutenberg' || filters.source === 'Project Gutenberg') {
        combinedData = gutenbergData;
        setTotalCount(gutenbergCount);
      } else if (filters.source === 'Open Library') {
        combinedData = openLibraryData;
        setTotalCount(openLibraryCount);
      } else if (filters.source === 'arXiv Research') {
        combinedData = arxivData;
        setTotalCount(arxivCount);
      } else if (filters.source === 'Dare Library') {
        combinedData = [...dbData, ...dspaceData];
        setTotalCount(dbCount + dspaceCount);
      } else if (filters.source === 'Featured Items') {
        combinedData = [...dbData, ...openStaxData];
        setTotalCount(dbCount + openStaxCount);
      } else {
        // When merging, we use the sum of counts as a reasonable estimate
        const seenTitles = new Set(dbData.map(b => b.title?.toLowerCase()));
        const uniqueDSpace = dspaceData.filter(b => !seenTitles.has(b.title?.toLowerCase()));
        const uniqueOpenStax = openStaxData.filter(b => !seenTitles.has(b.title?.toLowerCase()));
        const uniqueGutenberg = gutenbergData.filter(b => !seenTitles.has(b.title?.toLowerCase()));
        const uniqueOpenStaxApi = openStaxApiData.filter(b => !seenTitles.has(b.title?.toLowerCase()));
        const uniqueOpenLibrary = openLibraryData.filter(b => !seenTitles.has(b.title?.toLowerCase()));
        const uniqueArxiv = arxivData.filter(b => !seenTitles.has(b.title?.toLowerCase()));
        
        combinedData = [...dbData, ...uniqueDSpace, ...uniqueOpenStax, ...uniqueGutenberg, ...uniqueOpenStaxApi, ...uniqueOpenLibrary, ...uniqueArxiv];
        
        // Only update total count on initial load to avoid jumping numbers
        if (!isLoadMore) {
          setTotalCount(dbCount + dspaceCount + openStaxCount + gutenbergCount + openStaxApiCount + openLibraryCount + arxivCount);
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

  // Local filtering logic
  const filteredPublications = publications.filter(pub => {
    const matchesCategory = localCategory === 'All' || 
      pub.category?.toLowerCase() === localCategory.toLowerCase() ||
      pub.subject?.toLowerCase().includes(localCategory.toLowerCase()) ||
      pub.faculty?.toLowerCase().includes(localCategory.toLowerCase());
    
    return matchesCategory;
  });

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
        <div className="flex overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <div className="flex items-center gap-2 p-1 bg-bg-subtle rounded-2xl w-fit whitespace-nowrap">
            {['All', 'Featured Items', 'Dare Library', 'Research', 'Partner Resources', 'Project Gutenberg'].map((source) => (
              <button
                key={source}
                onClick={() => handleFilterChange('source', source)}
                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  filters.source === source 
                    ? 'bg-bg-base text-primary shadow-sm' 
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {source}
              </button>
            ))}
          </div>
        </div>

        {/* Continue Learning Section */}
        {Object.keys(bookProgress).length > 0 && filters.source === 'All' && !filters.q && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <History size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-main">Continue Learning</h2>
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Pick up where you left off</p>
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
                  ? 'bg-primary border-primary text-white shadow-md'
                  : 'bg-bg-base border-border text-text-muted hover:border-primary/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Header */}
        <div className={`${styles.searchHeader} relative overflow-hidden rounded-3xl p-8 mb-8`}>
          {/* Real Book Background Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=2000" 
              alt="Library Search Background" 
              className="w-full h-full object-cover opacity-10"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-bg-subtle/90 via-bg-subtle/80 to-bg-subtle/90" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-text-main">Library</h1>
              <div className="flex items-center gap-2 bg-bg-subtle p-1 rounded-lg">
                <button 
                  onClick={() => setUseSemanticSearch(false)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${!useSemanticSearch ? 'bg-bg-base text-secondary shadow-sm' : 'text-text-muted'}`}
                >
                  Keyword
                </button>
                <button 
                  onClick={() => setUseSemanticSearch(true)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${useSemanticSearch ? 'bg-bg-base text-secondary shadow-sm' : 'text-text-muted'}`}
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
                className="text-xs font-bold text-secondary hover:underline"
              >
                Clear AI Results
              </button>
            )}
          </div>
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
          />
          </div>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
            <button onClick={() => fetchPublications(false)}>Try Again</button>
            {error.includes('Gutenberg') && <Link to="/ai-tools" className={styles.backLink}>Explore AI Tools</Link>}
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono font-bold text-text-muted uppercase tracking-widest">
              {totalCount} Titles Found
            </span>
            <div className="h-4 w-[1px] bg-border" />
            <div className="flex items-center gap-2">
              <button 
                className={`p-2 rounded-lg transition-all ${viewMode === 'tile' ? 'bg-primary text-white' : 'text-text-muted hover:bg-bg-subtle'}`}
                onClick={() => setViewMode('tile')}
                title="Modern Tile View"
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-muted hover:bg-bg-subtle'}`}
                onClick={() => setViewMode('grid')}
                title="Compact Grid View"
              >
                <Sparkles size={18} />
              </button>
              <button 
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'text-text-muted hover:bg-bg-subtle'}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <ListIcon size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Sort By</span>
            <select 
              className="bg-bg-base border border-border rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-primary transition-all text-text-main"
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
            Array(12).fill(0).map((_, i) => (
              <BookCard key={i} loading={true} variant={viewMode} />
            ))
          ) : filteredPublications.length > 0 ? (
            filteredPublications.map(book => (
              <BookCard 
                key={book.id} 
                publication={book} 
                variant={viewMode} 
                progress={bookProgress[book.id] || 0}
              />
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-bg-subtle rounded-3xl border-2 border-dashed border-border">
              <div className="w-16 h-16 bg-bg-base rounded-2xl shadow-sm flex items-center justify-center text-text-muted mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-lg font-bold text-text-main mb-1">No books found</h3>
              <p className="text-text-muted max-w-xs">
                We couldn't find any books matching your current search or filters.
              </p>
              <button 
                onClick={() => {
                  setLocalSearch('');
                  setLocalCategory('All');
                  clearFilters();
                }}
                className="mt-6 px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:scale-105 transition-all"
              >
                Clear All Filters
              </button>
            </div>
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
