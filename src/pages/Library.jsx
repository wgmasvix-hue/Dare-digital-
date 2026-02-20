import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  LayoutGrid, 
  List as ListIcon, 
  Filter, 
  ChevronDown,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import BookCard from '../components/library/BookCard';
import styles from './Library.module.css';

const FACULTIES = [
  'All', 'STEM', 'Agriculture', 'Health', 'Business', 
  'Education', 'Engineering', 'Law', 'Humanities'
];

const LEVELS = ['All', 'Certificate', 'Diploma', 'HND', 'Degree'];
const ACCESS_TYPES = ['All', 'Free', 'Open Access', 'Licensed'];
const SOURCES = ['All', 'OpenStax', 'FAO', 'WHO', 'African Minds', 'AJOL'];

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter States
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    faculty: searchParams.get('faculty') || 'All',
    level: searchParams.get('level') || 'All',
    access: searchParams.get('access') || 'All',
    source: searchParams.get('source') || 'All',
    yearFrom: searchParams.get('yearFrom') || '',
    yearTo: searchParams.get('yearTo') || '',
    zimAuthored: searchParams.get('zimAuthored') === 'true',
    africanContext: searchParams.get('africanContext') === 'true',
  });

  // UI States
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [sortBy, setSortBy] = useState('relevance');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  // Data States
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const LIMIT = 24;

  // Sync URL with filters
  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'All' && value !== false) {
        params[key] = value;
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Fetch Data
  const fetchPublications = useCallback(async (isLoadMore = false) => {
    try {
      setLoading(true);
      
      const currentOffset = isLoadMore ? offset : 0;
      
      // Prepare RPC params
      const rpcParams = {
        search_query: filters.q || null,
        p_faculty: filters.faculty === 'All' ? null : filters.faculty,
        p_level: filters.level === 'All' ? null : filters.level,
        p_limit: LIMIT,
        p_offset: currentOffset
      };

      // Call Supabase RPC
      // Note: If RPC doesn't exist, we fallback to standard query for demo purposes
      let data, error, count;

      try {
        const result = await supabase.rpc('search_publications', rpcParams);
        data = result.data;
        error = result.error;
        // Mock count for RPC if not returned
        count = 100; 
      } catch (e) {
        // Fallback to standard select if RPC fails/missing
        console.warn('RPC failed, falling back to standard select', e);
        let query = supabase
          .from('publications')
          .select('*', { count: 'exact' });

        if (filters.faculty !== 'All') query = query.eq('faculty', filters.faculty);
        if (filters.level !== 'All') query = query.eq('level', filters.level);
        if (filters.access !== 'All') query = query.eq('access_model', filters.access.toLowerCase().replace(' ', '_'));
        if (filters.q) query = query.ilike('title', `%${filters.q}%`);
        
        query = query.range(currentOffset, currentOffset + LIMIT - 1);
        
        const result = await query;
        data = result.data;
        error = result.error;
        count = result.count;
      }

      if (error) throw error;

      if (isLoadMore) {
        setPublications(prev => [...prev, ...data]);
        setOffset(prev => prev + LIMIT);
      } else {
        setPublications(data || []);
        setTotalCount(count || (data ? data.length : 0));
        setOffset(LIMIT);
      }

    } catch (err) {
      console.error('Error fetching publications:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, offset]);

  // Initial Fetch & Filter Change
  useEffect(() => {
    setOffset(0);
    fetchPublications(false);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      faculty: 'All',
      level: 'All',
      access: 'All',
      source: 'All',
      yearFrom: '',
      yearTo: '',
      zimAuthored: false,
      africanContext: false,
    });
  };

  return (
    <div className={styles.libraryContainer}>
      {/* SIDEBAR FILTERS */}
      <aside className={`${styles.sidebar} ${isMobileFiltersOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.filterSection}>
          <h3 className={styles.filterTitle}>Faculty</h3>
          <div className={styles.filterGroup}>
            {FACULTIES.map(faculty => (
              <label key={faculty} className={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="faculty" 
                  className={styles.radioInput}
                  checked={filters.faculty === faculty}
                  onChange={() => handleFilterChange('faculty', faculty)}
                />
                {faculty}
                {/* <span className={styles.count}>24</span> */}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.filterSection}>
          <h3 className={styles.filterTitle}>Level</h3>
          <div className={styles.filterGroup}>
            {LEVELS.map(level => (
              <label key={level} className={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="level" 
                  className={styles.radioInput}
                  checked={filters.level === level}
                  onChange={() => handleFilterChange('level', level)}
                />
                {level}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.filterSection}>
          <h3 className={styles.filterTitle}>Access Type</h3>
          <div className={styles.filterGroup}>
            {ACCESS_TYPES.map(type => (
              <label key={type} className={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="access" 
                  className={styles.radioInput}
                  checked={filters.access === type}
                  onChange={() => handleFilterChange('access', type)}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.filterSection}>
          <h3 className={styles.filterTitle}>Year Published</h3>
          <div className={styles.yearInputs}>
            <input 
              type="number" 
              placeholder="From" 
              className={styles.yearInput}
              value={filters.yearFrom}
              onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
            />
            <span>-</span>
            <input 
              type="number" 
              placeholder="To" 
              className={styles.yearInput}
              value={filters.yearTo}
              onChange={(e) => handleFilterChange('yearTo', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.filterSection}>
          <h3 className={styles.filterTitle}>Local Context</h3>
          <div className={styles.filterGroup}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                className={styles.checkboxInput}
                checked={filters.zimAuthored}
                onChange={(e) => handleFilterChange('zimAuthored', e.target.checked)}
              />
              Zimbabwe Authored
            </label>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                className={styles.checkboxInput}
                checked={filters.africanContext}
                onChange={(e) => handleFilterChange('africanContext', e.target.checked)}
              />
              African Context
            </label>
          </div>
        </div>

        <button onClick={clearFilters} className={styles.clearBtn}>
          Clear all filters
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.main}>
        {/* Mobile Filter Toggle */}
        <button 
          className={styles.mobileFilterToggle}
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
        >
          <Filter size={18} /> Filters
        </button>

        {/* Search Header */}
        <div className={styles.searchHeader}>
          <div className={styles.searchBarWrapper}>
            <Search className={styles.searchIcon} size={20} />
            <input 
              type="text" 
              placeholder="Search for titles, authors, or keywords..." 
              className={styles.searchInput}
              value={filters.q}
              onChange={(e) => handleFilterChange('q', e.target.value)}
            />
          </div>
          <div className={styles.aiHint}>
            <Sparkles size={14} className={styles.sparkleIcon} />
            <span>Try: 'crop disease management' or 'financial accounting basics'</span>
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controlsBar}>
          <span className={styles.resultsCount}>
            Showing {publications.length} of {totalCount} titles
          </span>
          
          <div className={styles.controlsRight}>
            <select 
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest</option>
              <option value="rating">Rating</option>
              <option value="downloads">Most Downloaded</option>
            </select>

            <div className={styles.viewToggles}>
              <button 
                className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
                onClick={() => setViewMode('list')}
              >
                <ListIcon size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className={viewMode === 'grid' ? styles.resultsGrid : styles.resultsList}>
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

        {/* Load More */}
        {publications.length < totalCount && (
          <div className={styles.loadMoreContainer}>
            <button 
              className={styles.loadMoreBtn}
              onClick={() => fetchPublications(true)}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More Titles'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
