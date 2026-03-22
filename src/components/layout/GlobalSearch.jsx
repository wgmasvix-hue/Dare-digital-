import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Book, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import styles from './GlobalSearch.module.css';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchBooks = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('books')
          .select('id, title, author, cover_url, resource_type')
          .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
          .limit(5);

        if (error) throw error;
        setResults(data || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchBooks, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (bookId) => {
    navigate(`/book/${bookId}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/openstax?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.searchContainer} ref={searchRef}>
      <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search books, authors..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={styles.searchInput}
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} className={styles.clearButton}>
            <X size={16} />
          </button>
        )}
      </form>

      {isOpen && (query.trim().length >= 2 || isLoading) && (
        <div className={styles.resultsDropdown}>
          {isLoading ? (
            <div className={styles.loading}>
              <Loader2 size={20} className={styles.spinner} />
              <span>Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <div className={styles.resultsList}>
              {results.map((book) => (
                <button
                  key={book.id}
                  onClick={() => handleSelect(book.id)}
                  className={styles.resultItem}
                >
                  <div className={styles.bookCover}>
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} referrerPolicy="no-referrer" />
                    ) : (
                      <Book size={20} />
                    )}
                  </div>
                  <div className={styles.bookInfo}>
                    <p className={styles.bookTitle}>{book.title}</p>
                    <p className={styles.bookAuthor}>{book.author}</p>
                    <span className={styles.resourceType}>{book.resource_type}</span>
                  </div>
                </button>
              ))}
              <button
                onClick={handleSearchSubmit}
                className={styles.seeAll}
              >
                See all results for "{query}"
              </button>
            </div>
          ) : query.trim().length >= 2 ? (
            <div className={styles.noResults}>
              No books found matching "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
