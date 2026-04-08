import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  ExternalLink, 
  BookMarked,
  Globe
} from 'lucide-react';
import { Book } from '../types';
import { gutenbergService } from '../services/gutenbergService';
import BookCard from '../components/library/BookCard';
import styles from './OpenStaxBooks.module.css'; // Reusing styles for consistency

export default function GutenbergBooks() {
  const location = useLocation();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Handle URL Query Params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    if (search) setSearchQuery(search);
  }, [location.search]);

  const fetchBooks = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const data = await gutenbergService.searchBooks(searchQuery, pageNum);
      setBooks(data.books);
      setTotalCount(data.count);
      setHasMore(!!data.next);
    } catch (err) {
      console.error('Error fetching Gutenberg books:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
    fetchBooks(1);
  }, [fetchBooks]);

  const handleNextPage = () => {
    if (hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBooks(nextPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      const prevPage = page - 1;
      setPage(prevPage);
      fetchBooks(prevPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        {/* Real Book Background Image */}
        <div className="absolute inset-0 z-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&q=80&w=2000" 
            alt="Header Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-base via-transparent to-bg-base" />
        </div>

        <div className={`${styles.headerContent} relative z-10`}>
          <div className={styles.titleGroup}>
            <div className={styles.iconWrapper} style={{ background: 'var(--amber)' }}>
              <Globe size={32} />
            </div>
            <div>
              <h1 className={styles.title}>Project Gutenberg</h1>
              <p className={styles.subtitle}>Over 70,000 free eBooks in the public domain</p>
            </div>
          </div>
        </div>
      </header>

      {/* Search & Filters */}
      <div className={styles.controls} style={{ marginTop: '24px' }}>
        <div className={styles.searchWrapper}>
          <Search size={20} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by title, author, or subject..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '0 20px', marginBottom: '16px', color: 'var(--clay)', fontSize: '0.9rem' }}>
        {totalCount > 0 && `Showing ${books.length} of ${totalCount.toLocaleString()} results`}
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {loading ? (
          Array(12).fill(0).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))
        ) : books.length > 0 ? (
          books.map((book) => (
            <div key={book.id} className={styles.bookGridItem}>
              <BookCard publication={book} variant="tile" />
              
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center', justifyContent: 'center' }}>
                <a 
                  href={book.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.gridDetailsLink}
                  style={{ background: 'var(--soil)', color: 'white' }}
                >
                  <Download size={14} style={{ marginRight: '6px' }} />
                  Read Online
                </a>
                <button 
                  className={styles.ingestBtn}
                  onClick={() => window.open(`https://www.gutenberg.org/ebooks/${book.gutenbergId}`, '_blank')}
                  title="View on Gutenberg"
                >
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <BookMarked size={48} />
            <h3>No books found</h3>
            <p>Try adjusting your search terms.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalCount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', marginTop: '48px', paddingBottom: '48px' }}>
          <button 
            onClick={handlePrevPage}
            disabled={page === 1}
            className={styles.ingestBtn}
            style={{ padding: '10px 20px', opacity: page === 1 ? 0.5 : 1 }}
          >
            <ChevronLeft size={20} /> Previous
          </button>
          <span style={{ fontWeight: 600, color: 'var(--soil)' }}>Page {page}</span>
          <button 
            onClick={handleNextPage}
            disabled={!hasMore}
            className={styles.ingestBtn}
            style={{ padding: '10px 20px', opacity: !hasMore ? 0.5 : 1 }}
          >
            Next <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
