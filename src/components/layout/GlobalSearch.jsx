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
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    const searchAll = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const like = `%${query}%`;
        
        // Search books and documents (DSpace)
        const [booksRes, docsRes] = await Promise.all([
          supabase
            .from('books')
            .select('id, title, author, cover_url, resource_type')
            .or(`title.ilike.${like},author.ilike.${like}`)
            .limit(3),
          supabase
            .from('documents')
            .select('id, title, creator, institution')
            .not('synced_from_dspace_at', 'is', null)
            .or(`title.ilike.${like},creator.ilike.${like}`)
            .limit(3)
        ]);

        const combinedResults = [
          ...(booksRes.data || []).map(b => ({ ...b, type: 'book' })),
          ...(docsRes.data || []).map(d => ({ 
            id: d.id, 
            title: d.title, 
            author: d.creator, 
            resource_type: 'Research', 
            type: 'research',
            institution: d.institution
          }))
        ];

        setResults(combinedResults);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchAll, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (result) => {
    if (result.type === 'book') {
      navigate(`/book/${result.id}`);
    } else {
      navigate(`/research/${result.id}`);
    }
    setIsOpen(false);
    setQuery('');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.searchContainer} ref={searchRef}>
      <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
        <Search size={18} className={styles.searchIcon} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search books, research, authors..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={styles.searchInput}
        />
        {!query && (
          <div className={styles.shortcutHint}>
            <kbd>⌘</kbd> <kbd>K</kbd>
          </div>
        )}
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
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  className={styles.resultItem}
                >
                  <div className={styles.bookCover}>
                    {result.cover_url ? (
                      <img src={result.cover_url} alt={result.title} referrerPolicy="no-referrer" />
                    ) : (
                      <Book size={20} />
                    )}
                  </div>
                  <div className={styles.bookInfo}>
                    <p className={styles.bookTitle}>{result.title}</p>
                    <p className={styles.bookAuthor}>{result.author}</p>
                    <div className="flex gap-2 items-center">
                      <span className={styles.resourceType}>{result.resource_type}</span>
                      {result.institution && (
                        <span className="text-[10px] text-slate-400 italic">({result.institution})</span>
                      )}
                    </div>
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
              No results found matching "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
