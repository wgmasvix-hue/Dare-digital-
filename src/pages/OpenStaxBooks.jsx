import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Library, 
  Search, 
  BookOpen, 
  Database,
  ExternalLink,
  Cpu,
  Globe,
  Lock,
  PenTool,
  Sprout,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Users,
  Scale,
  LayoutDashboard,
  Settings
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { transformBook } from '../lib/transformBook';
import BookCard from '../components/library/BookCard';
import styles from './OpenStaxBooks.module.css';
import { oerService } from '../services/oerService';
import { supabase } from '../lib/supabase';
import { OPENSTAX_BOOKS } from '../data/openStaxBooks';
import UploadResourceModal from '../components/library/UploadResourceModal';
import PublishingDashboard from '../components/library/PublishingDashboard';

const FACULTIES = [
  { id: 'all', label: 'All', icon: Library },
  { id: 'agriculture', label: 'Agriculture', icon: Sprout },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'engineering', label: 'Engineering', icon: Settings },
  { id: 'health', label: 'Health', icon: HeartPulse },
  { id: 'humanities', label: 'Humanities', icon: Users },
  { id: 'law', label: 'Law', icon: Scale },
  { id: 'stem', label: 'STEM', icon: Cpu }
];

export default function OpenStaxBooks() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaculty, setActiveFaculty] = useState('all');
  const [ingesting, setIngesting] = useState(false);
  const [activeTab, setActiveTab] = useState('resources'); // 'resources' | 'buku'
  const [trialMode, setTrialMode] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const loadMoreRef = useRef(null);
  const PAGE_SIZE = 12;

  // Handle URL Query Params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    const faculty = params.get('faculty');
    if (search) setSearchQuery(search);
    if (faculty) setActiveFaculty(faculty);
  }, [location.search]);

  // Infinite Scroll Observer
  useEffect(() => {
    if (activeTab !== 'resources') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchOERBooks(nextPage, true);
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loading, hasMore, page, activeTab]);

  const isDeveloper = profile?.role === 'developer';
  const isPartner = profile?.role === 'partner' || profile?.role === 'institution' || isDeveloper; // Allow partners and devs

  const fetchOERBooks = async (pageNumber = 0, shouldAppend = false) => {
    try {
      setLoading(true);
      let query = supabase
        .from('books')
        .select('*')
        .eq('access_model', 'dare_access');

      if (activeFaculty !== 'all') {
        query = query.ilike('faculty', activeFaculty);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,author_names.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%`);
      }

      const from = pageNumber * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const transformedBooks = (data || []).map(transformBook);
      
      if (shouldAppend) {
        setBooks(prev => [...prev, ...transformedBooks]);
      } else {
        setBooks(transformedBooks);
      }

      setHasMore(transformedBooks.length === PAGE_SIZE);
    } catch (err) {
      console.error('Error fetching OER books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchOERBooks(0, false);
  }, [searchQuery, activeFaculty]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchOERBooks(nextPage, true);
  };

  const handleIngest = async (book) => {
    if (!isDeveloper) return;
    setIngesting(true);
    try {
      // Prepare content for ingest
      const content = {
        title: book.title,
        authors: book.author_names.split(', '),
        content_summary: book.description,
        original_url: book.file_url, // Use file URL as original for now
        file_url: book.file_url,
        subject_code: book.subject,
        license_type: book.license_type,
        cover_image_url: book.cover_image_url,
        publication_year: book.year_published,
        page_count: book.page_count,
        creator_id: user.id,
        ai_level: null, // OpenStax books don't have explicit AI level
        is_peer_reviewed: true
      };

      await oerService.insertOER(content);
      alert(`${book.title} ingested successfully!`);
    } catch (error) {
      console.error('Ingest error:', error);
      alert(`Ingest failed: ${error.message}`);
    } finally {
      setIngesting(false);
    }
  };

  const handleSeed = async () => {
    if (!confirm('This will populate the database with OpenStax books. Continue?')) return;
    setLoading(true);
    try {
      // Ensure we have a user ID
      const userId = user?.id || (await supabase.auth.getUser()).data.user?.id;
      
      if (!userId) {
        alert("You must be logged in to seed the library.");
        setLoading(false);
        return;
      }

      let count = 0;
      let errors = [];

      for (const book of OPENSTAX_BOOKS) {
        // Check if book already exists
        const { data } = await supabase
          .from('books')
          .select('id')
          .eq('title', book.title)
          .maybeSingle();
        
        if (!data) {
           try {
               // Pass creator_id explicitly
               await oerService.insertOER({ ...book, creator_id: userId });
               count++;
           } catch (err) {
               console.error(`Failed to insert ${book.title}:`, err);
               errors.push(`${book.title}: ${err.message}`);
           }
        }
      }
      
      if (errors.length > 0) {
          alert(`Seeding completed with ${count} added, but ${errors.length} errors.\nFirst error: ${errors[0]}`);
      } else {
          alert(`Library seeded! Added ${count} new books.`);
      }
      
      // Force refresh
      await fetchOERBooks();
    } catch (error) {
      console.error('Seeding error:', error);
      alert(`Failed to seed library: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleGroup}>
            <div className={styles.iconWrapper}>
              <Library size={32} />
            </div>
            <div>
              <h1 className={styles.title}>Partner Resources</h1>
              <p className={styles.subtitle}>Peer-reviewed, openly licensed textbooks from our Partner Resources</p>
            </div>
          </div>
          
          {(isDeveloper || books.length === 0) && !loading && (
            <div style={{ display: 'flex', gap: '12px' }}>
              {isPartner && (
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className={styles.ingestBtn}
                  style={{ padding: '12px 24px', background: 'var(--soil)' }}
                >
                  <Database size={20} /> Upload Resource
                </button>
              )}
              <button 
                onClick={handleSeed}
                className={styles.ingestBtn}
                style={{ padding: '12px 24px' }}
              >
                <Database size={20} /> Initialize Library
              </button>
            </div>
          )}
        </div>
      </header>

      <UploadResourceModal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          setPage(0);
          fetchOERBooks(0, false);
        }}
      />

      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'resources' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          <BookOpen size={20} /> Open Resources
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'buku' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('buku')}
        >
          <Globe size={20} /> Buku Platform
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'publishing' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('publishing')}
        >
          <PenTool size={20} /> Editorial Platform
        </button>
      </div>

      {activeTab === 'resources' ? (
        <>
          {/* Subject Dashboard */}
          <section className={styles.subjectDashboard}>
            <div className={styles.dashboardHeader}>
              <LayoutDashboard size={20} className={styles.dashboardIcon} />
              <h3>Browse by Subject</h3>
            </div>
            <div className={styles.subjectGrid}>
              {FACULTIES.map(faculty => (
                <button
                  key={faculty.id}
                  className={`${styles.subjectCard} ${activeFaculty === faculty.id ? styles.activeSubjectCard : ''}`}
                  onClick={() => setActiveFaculty(faculty.id)}
                >
                  <div className={styles.subjectIcon}>
                    <faculty.icon size={24} />
                  </div>
                  <span className={styles.subjectLabel}>{faculty.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Search & Filters */}
          <div className={styles.controls}>
            <div className={styles.searchWrapper}>
              <Search size={20} className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search by title, author, subject, or publisher..." 
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Grid */}
          <div className={styles.grid}>
            {loading && books.length === 0 ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className={styles.skeletonCard} />
              ))
            ) : books.length > 0 ? (
              <>
                {books.map((book, index) => (
                  <div key={`${book.id}-${index}`} className={styles.bookGridItem}>
                    <BookCard publication={book} variant="tile" />
                    
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center', justifyContent: 'center' }}>
                      <Link 
                        to={`/book/${book.id}`} 
                        className={styles.gridDetailsLink}
                      >
                        View Details
                      </Link>
                      
                      {isDeveloper && (
                        <button 
                          className={styles.ingestBtn}
                          onClick={() => handleIngest(book)}
                          disabled={ingesting}
                          title="Ingest to Local DB"
                          style={{ marginLeft: 'auto' }}
                        >
                          <Database size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Infinite Scroll Sentinel */}
                <div ref={loadMoreRef} style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', marginTop: '24px', minHeight: '50px' }}>
                  {loading && books.length > 0 && (
                    <div className={styles.loadingMore}>
                      <div className={styles.spinnerSmall} />
                      <span>Loading more books...</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <Library size={48} />
                <h3>No books found</h3>
                <p>Try adjusting your search terms.</p>
              </div>
            )}
          </div>
        </>
      ) : activeTab === 'buku' ? (
        /* Buku Embed */
        <div className={styles.bukuContainer}>
          <div className={styles.trialBanner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Globe size={20} />
              <span style={{ fontWeight: 600 }}>Buku Partner Integration</span>
            </div>
            {trialMode && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button 
                  onClick={() => window.open('https://buku.app/login', '_blank')}
                  className={styles.loginBtn}
                >
                  <Lock size={14} />
                  Login to Buku
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Trial Version Active</span>
                  <span className={styles.trialBadge}>
                    <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Limited Access
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className={styles.iframeWrapper}>
            <iframe 
              src="https://buku.app/" 
              title="Buku App"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <PublishingDashboard />
      )}
    </div>
  );
}
