import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BookOpen, 
  Download, 
  Share2, 
  Plus, 
  Star, 
  ShieldCheck, 
  Globe, 
  Lock, 
  FileText, 
  Calendar, 
  User,
  Building,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import BookCard from '../components/library/BookCard';
import styles from './BookDetail.module.css';

const FACULTY_COLORS = {
  stem: 'var(--soil)',
  agriculture: 'var(--leaf)',
  health: 'var(--clay)',
  business: 'var(--amber)',
  education: 'var(--gold)',
  engineering: '#2c3e50',
  law: '#8e44ad',
  humanities: '#d35400',
  default: 'var(--bark)'
};

export default function BookDetail() {
  const { id } = useParams();
  const { user, institution } = useAuth();
  
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessStatus, setAccessStatus] = useState('checking'); // checking, granted, denied, preview
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    async function fetchBookData() {
      try {
        setLoading(true);
        
        // 1. Fetch Publication
        const { data: pubData, error: pubError } = await supabase
          .from('publications')
          .select('*')
          .eq('id', id)
          .single();

        if (pubError) throw pubError;
        setBook(pubData);

        // 2. Increment View Count
        await supabase.rpc('increment_publication_views', { pub_id: id });

        // 3. Check Access
        checkAccess(pubData);

        // 4. Fetch Related Books
        if (pubData.subject_id) {
          const { data: relatedData } = await supabase
            .from('publications')
            .select('*')
            .eq('subject_id', pubData.subject_id)
            .neq('id', id)
            .limit(4);
          setRelatedBooks(relatedData || []);
        } else {
          // Fallback to faculty if no subject_id
          const { data: relatedData } = await supabase
            .from('publications')
            .select('*')
            .eq('faculty', pubData.faculty)
            .neq('id', id)
            .limit(4);
          setRelatedBooks(relatedData || []);
        }

      } catch (err) {
        console.error('Error fetching book details:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBookData();
  }, [id, user, institution]);

  const checkAccess = async (publication) => {
    // Logic:
    // 1. If access_model is 'free' or 'open_access' -> GRANTED
    // 2. If user is logged in AND institution has active license -> GRANTED
    // 3. Else -> PREVIEW or DENIED

    if (['free', 'open_access'].includes(publication.access_model)) {
      setAccessStatus('granted');
      return;
    }

    if (user && institution) {
      // Check for institution license
      const { data: license } = await supabase
        .from('licenses')
        .select('*')
        .eq('institution_id', institution.id)
        .eq('publication_id', publication.id)
        .eq('status', 'active')
        .single();

      if (license) {
        setAccessStatus('granted');
        return;
      }
    }

    // Default to preview if available, otherwise denied
    setAccessStatus(publication.has_preview ? 'preview' : 'denied');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading book details...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className={styles.errorContainer}>
        <h2>Book not found</h2>
        <Link to="/library" className={styles.backLink}>Return to Library</Link>
      </div>
    );
  }

  const facultyColor = FACULTY_COLORS[book.faculty?.toLowerCase()] || FACULTY_COLORS.default;

  return (
    <div className={styles.container}>
      <Link to="/library" className={styles.backBreadcrumb}>
        <ArrowLeft size={16} /> Back to Library
      </Link>

      <div className={styles.grid}>
        {/* LEFT COLUMN: Book Info */}
        <div className={styles.mainContent}>
          <div className={styles.header}>
            <div 
              className={styles.coverWrapper}
              style={{ '--spine-color': facultyColor }}
            >
              {book.cover_path ? (
                <img src={book.cover_path} alt={book.title} className={styles.coverImage} />
              ) : (
                <div 
                  className={styles.placeholderCover}
                  style={{ background: `linear-gradient(135deg, ${facultyColor}, var(--soil))` }}
                >
                  <div className={styles.spine} />
                  <span className={styles.placeholderTitle}>{book.title}</span>
                </div>
              )}
            </div>

            <div className={styles.headerInfo}>
              <h1 className={styles.title}>{book.title}</h1>
              
              <div className={styles.metaRow}>
                <span className={styles.author}>
                  <User size={14} /> {book.author_names}
                </span>
                {book.publisher_name && (
                  <span className={styles.publisher}>
                    <Building size={14} /> {book.publisher_name}
                  </span>
                )}
                <span className={styles.year}>
                  <Calendar size={14} /> {book.year_published}
                </span>
              </div>

              {book.average_rating > 0 && (
                <div className={styles.rating}>
                  <div className={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        fill={i < Math.round(book.average_rating) ? "var(--amber)" : "none"} 
                        stroke={i < Math.round(book.average_rating) ? "none" : "var(--clay)"}
                      />
                    ))}
                  </div>
                  <span className={styles.ratingCount}>
                    {book.average_rating.toFixed(1)} ({book.ratings_count || 0} reviews)
                  </span>
                </div>
              )}

              <div className={styles.badges}>
                <span className={styles.badge} style={{ borderColor: facultyColor, color: facultyColor }}>
                  {book.faculty}
                </span>
                {book.zimche_code && (
                  <span className={styles.badge}>ZIMCHE: {book.zimche_code}</span>
                )}
                <span className={styles.badge}>{book.level}</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Description</h2>
            <p className={styles.description}>{book.description || 'No description available.'}</p>
          </div>

          {book.table_of_contents && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Table of Contents</h2>
              <ul className={styles.tocList}>
                {book.table_of_contents.map((chapter, index) => (
                  <li key={index} className={styles.tocItem}>
                    <span className={styles.chapterNum}>{index + 1}.</span>
                    <span className={styles.chapterTitle}>{chapter}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {relatedBooks.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Related Titles</h2>
              <div className={styles.relatedGrid}>
                {relatedBooks.map(related => (
                  <BookCard key={related.id} publication={related} variant="grid" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Actions Panel */}
        <aside className={styles.sidebar}>
          <div className={styles.actionCard}>
            <div className={styles.accessStatus}>
              {accessStatus === 'granted' && (
                <div className={styles.statusGranted}>
                  <BookOpen size={20} />
                  <span>Access Granted</span>
                </div>
              )}
              {accessStatus === 'preview' && (
                <div className={styles.statusPreview}>
                  <Lock size={20} />
                  <span>Preview Only</span>
                </div>
              )}
              {accessStatus === 'denied' && (
                <div className={styles.statusDenied}>
                  <ShieldCheck size={20} />
                  <span>Institution Access Required</span>
                </div>
              )}
            </div>

            <div className={styles.mainActions}>
              {accessStatus === 'granted' ? (
                <>
                  <Link to={`/reader/${book.id}`} className={styles.readBtn}>
                    Read Now
                  </Link>
                  <button className={styles.downloadBtn}>
                    <Download size={18} /> Download for Offline
                  </button>
                </>
              ) : accessStatus === 'preview' ? (
                <>
                  <Link to={`/reader/${book.id}?preview=true`} className={styles.previewBtn}>
                    Preview First 25 Pages
                  </Link>
                  <div className={styles.upgradePrompt}>
                    <p>Full access requires an institutional license.</p>
                    <Link to="/institutions" className={styles.upgradeLink}>Learn more</Link>
                  </div>
                </>
              ) : (
                <div className={styles.deniedMessage}>
                  <p>Your institution does not have a license for this title.</p>
                  <button className={styles.requestBtn}>Request Access</button>
                </div>
              )}
            </div>

            <div className={styles.secondaryActions}>
              <button className={styles.actionBtn}>
                <Plus size={18} /> Add to List
              </button>
              <button className={styles.actionBtn} onClick={handleShare}>
                <Share2 size={18} /> {isCopied ? 'Copied!' : 'Share'}
              </button>
            </div>

            <div className={styles.attribution}>
              <h4 className={styles.attrTitle}>Attribution</h4>
              <p className={styles.attrText}>
                License: {book.license_type || 'All Rights Reserved'}
              </p>
              {book.source_url && (
                <a href={book.source_url} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
                  View Source <Globe size={12} />
                </a>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
