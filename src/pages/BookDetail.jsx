import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
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
  ArrowLeft,
  AlertCircle,
  Download,
  Check,
  Sparkles,
  RefreshCw,
  Brain
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { transformBook, transformBooks, BOOK_SELECT, OPENSTAX_CURATED } from '../lib/transformBook';
import { ALL_ADDITIONAL_OER } from '../lib/oerCatalog';
import { oerService } from '../services/oerService';
import { useAuth } from '../hooks/useAuth';
import BookCard from '../components/library/BookCard';
import Toast from '../components/ui/Toast';
import styles from './BookDetail.module.css';

const ALL_OER = [...OPENSTAX_CURATED, ...ALL_ADDITIONAL_OER];

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
  const navigate = useNavigate();
  
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessStatus, setAccessStatus] = useState('checking'); // checking, granted, denied, preview
  const [isCopied, setIsCopied] = useState(false);
  const [toast, setToast] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchBookData();
  }, [id, user, institution]);

  const fetchBookData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Check for Static/Mock Books (OpenStax, etc.)
      if (id.startsWith('openstax-') || id.startsWith('fao-') || id.startsWith('who-') || id.startsWith('andrews-') || id.startsWith('ai-')) {
        const osBook = ALL_OER.find(b => b.id === id);
        
        if (osBook) {
          setBook({
            ...osBook,
            cover_path: osBook.cover_image_url,
            file_path: osBook.file_url,
            access_model: 'dare_access',
            license_type: osBook.license_type || 'CC BY 4.0',
            source_url: `https://openstax.org`,
            table_of_contents: [],
            learning_objectives: []
          });
          setAccessStatus('granted');
        } else {
          // Fallback: Try fetching from API or handle error
           // For now, if not in static list, try DB or error
           // But let's assume if it starts with these prefixes it SHOULD be there or we handle it
        }
        // If found, return early? No, we might want related books.
        // But for static books, related logic is different.
        // Let's just return for now to keep it simple.
        if (osBook) {
            setLoading(false);
            return;
        }
      }

      // 2. Fetch Publication from Supabase
      const { data: pubData, error: pubError } = await supabase
        .from('books')
        .select(BOOK_SELECT)
        .eq('id', id)
        .single();

      if (pubError) {
        // Check if it's a research paper ID
        if (id.startsWith('res-')) {
          const { data: resData, error: resError } = await supabase
            .from('local_research')
            .select('*')
            .eq('id', id)
            .single();
          
          if (!resError && resData) {
            const transformedRes = {
              ...resData,
              author_names: resData.author_names,
              publisher_name: resData.institution,
              year_published: resData.publication_date?.split('-')[0],
              faculty: resData.subject,
              access_model: 'dare_access',
              cover_path: null // Research papers usually don't have covers
            };
            setBook(transformedRes);
            setAccessStatus('granted');
            setLoading(false);
            return;
          }
        }
        throw pubError;
      }
      
      // Transform data
      const transformedBook = transformBook(pubData);
      setBook(transformedBook);

      // 3. Increment View Count (Non-blocking)
      const incrementViews = async () => {
        try {
          await supabase.rpc('increment_publication_views', { pub_id: id });
        } catch (e) {
          console.warn('Failed to increment view count:', e);
        }
      };
      incrementViews();

      // 4. Check Access
      // For now, we grant access to everything. Real implementation would check subscription.
      setAccessStatus('granted');

      // 5. Fetch Related Books
      const filterField = pubData.faculty ? 'faculty' : 'subject';
      const filterValue = pubData.faculty || pubData.subject;

      if (filterValue) {
        const { data: relatedData } = await supabase
          .from('books')
          .select(BOOK_SELECT)
          .eq(filterField, filterValue)
          .neq('id', id)
          .limit(4);
          
        setRelatedBooks(transformBooks(relatedData || []));
      }

    } catch (err) {
      console.error('Error fetching book details:', err);
      setError('Unable to load book details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setToast({ message: "Link copied to clipboard", type: "success" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleAddToList = () => {
    setToast({ message: "Added to your reading list", type: "success" });
  };

  const handleRegenerateAi = async () => {
    if (!book || isAnalyzing) return;
    
    try {
      setIsAnalyzing(true);
      setToast({ message: "AI Analysis started. This may take a few moments.", type: "info" });
      
      await oerService.triggerAnalysis(book);
      
      // Poll for changes or just inform user
      setToast({ message: "AI Analysis triggered! Please refresh in a moment to see updates.", type: "success" });
    } catch (err) {
      console.error('Failed to trigger AI analysis:', err);
      setToast({ message: "Failed to start AI analysis.", type: "error" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading book details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={48} color="var(--amber)" />
        <h2>Error Loading Book</h2>
        <p>{error}</p>
        <div className={styles.errorActions}>
          <button onClick={fetchBookData} className={styles.retryBtn}>Try Again</button>
          <Link to="/library" className={styles.backLink}>Return to Library</Link>
        </div>
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
  const defaultCover = "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=1000&auto=format&fit=crop";
  const displayCover = book.cover_path || defaultCover;

  return (
    <div className={styles.container}>
      <div className={styles.backBreadcrumb}>
        <button 
          onClick={() => {
            if (book?.publisher_name === 'OpenStax' || book?.source === 'OpenStax') {
              navigate('/library');
            } else if (book?.id?.startsWith('res-')) {
              navigate('/research');
            } else if (book?.subject?.toLowerCase().includes('artificial intelligence') || book?.id?.startsWith('ai-')) {
              navigate('/ai-textbooks');
            } else {
              navigate('/library');
            }
          }}
          className={styles.backBtnLink}
        >
          <ArrowLeft size={16} /> Back to Library
        </button>
      </div>

      <div className={styles.grid}>
        {/* LEFT COLUMN: Cover */}
        <div className={styles.leftColumn}>
          <div 
            className={styles.coverWrapper}
            style={{ '--spine-color': facultyColor }}
          >
            <img src={displayCover} alt={book.title} className={styles.coverImage} />
          </div>
        </div>

        {/* MIDDLE COLUMN: Info */}
        <div className={styles.middleColumn}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>{book.title}</h1>
            
            <div className={styles.metaRow}>
              <span className={styles.author}>
                by <span className={styles.authorName}>{book.author_names}</span> (Author)
              </span>
            </div>

            <div className={styles.rating}>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < Math.round(book.average_rating || 4.5) ? "var(--amber)" : "none"} 
                    stroke={i < Math.round(book.average_rating || 4.5) ? "none" : "var(--clay)"}
                  />
                ))}
              </div>
              <span className={styles.ratingCount}>
                {(book.average_rating || 4.5).toFixed(1)} <span className={styles.ratingLink}>({book.ratings_count || 12} ratings)</span>
              </span>
            </div>

            <div className={styles.badges}>
              <span className={styles.badge} style={{ borderColor: facultyColor, color: facultyColor }}>
                {book.faculty}
              </span>
              {book.ai_level && (
                <span className={styles.badge} style={{ borderColor: '#8e44ad', color: '#8e44ad' }}>
                  AI Level {book.ai_level}
                </span>
              )}
              {(book.zimche_programme_codes?.length > 0 || book.zimche_code) && (
                <span className={styles.badge} style={{ borderColor: '#27ae60', color: '#27ae60' }}>
                  ZIMCHE: {book.zimche_code || book.zimche_programme_codes?.[0]}
                </span>
              )}
              <span className={styles.badge}>{book.level || book.target_level || 'General'}</span>
            </div>
          </div>

          <div className={styles.formatSelector}>
            <div className={`${styles.formatBox} ${styles.formatActive}`}>
              <span className={styles.formatType}>Digital Edition</span>
              <span className={styles.formatPrice}>Institutional Access</span>
            </div>
            {book.file_url && book.file_url.endsWith('.epub') && (
              <div className={styles.formatBox}>
                <span className={styles.formatType}>EPUB</span>
                <span className={styles.formatPrice}>Included</span>
              </div>
            )}
          </div>

          <div className={styles.section}>
            <div className={styles.synopsisContent}>
              <p className={styles.description}>{book.description || 'No description available.'}</p>
              
              {/* AI ANALYSIS SECTION */}
              {(book.ai_summary || book.ai_topics?.length > 0) && (
                <div className={styles.aiAnalysisSection}>
                  <div className={styles.aiHeader}>
                    <div className={styles.aiTitle}>
                      <Sparkles size={18} className={styles.aiIcon} />
                      <h3>AI Analysis & Insights</h3>
                    </div>
                    {user && (user.id === book.creator_id || user.email === 'wgmasvix@gmail.com') && (
                      <button 
                        onClick={handleRegenerateAi} 
                        className={styles.regenerateBtn}
                        disabled={isAnalyzing}
                      >
                        <RefreshCw size={14} className={isAnalyzing ? styles.spin : ''} />
                        {isAnalyzing ? 'Analyzing...' : 'Regenerate'}
                      </button>
                    )}
                  </div>
                  
                  {book.ai_summary && (
                    <div className={styles.aiSummary}>
                      <p>{book.ai_summary}</p>
                    </div>
                  )}

                  <div className={styles.aiMetaGrid}>
                    {book.ai_difficulty && (
                      <div className={styles.aiMetaItem}>
                        <span className={styles.aiLabel}>Complexity</span>
                        <span className={`${styles.aiValue} ${styles[`difficulty${book.ai_difficulty}`]}`}>
                          {book.ai_difficulty.charAt(0).toUpperCase() + book.ai_difficulty.slice(1)}
                        </span>
                      </div>
                    )}
                    {book.ai_topics?.length > 0 && (
                      <div className={styles.aiMetaItem}>
                        <span className={styles.aiLabel}>Key Topics</span>
                        <div className={styles.aiTags}>
                          {book.ai_topics.map((topic, i) => (
                            <span key={i} className={styles.aiTag}>{topic}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {book.learning_objectives && (
                <div className={styles.highlights}>
                  <h3 className={styles.subTitle}>What you'll learn</h3>
                  <ul className={styles.highlightsList}>
                    {book.learning_objectives.map((obj, i) => (
                      <li key={i}><Check size={14} /> {obj}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Product Details</h2>
            <div className={styles.productDetailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Publisher</span>
                <span className={styles.detailValue}>{book.publisher_name || 'Independent'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Publication Year</span>
                <span className={styles.detailValue}>{book.year_published || 'N/A'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Format</span>
                <span className={styles.detailValue}>{book.format?.toUpperCase() || 'PDF'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Pages</span>
                <span className={styles.detailValue}>{book.page_count || 'Varies'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Language</span>
                <span className={styles.detailValue}>English</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>License</span>
                <span className={styles.detailValue}>{book.license_type || 'Standard'}</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Table of Contents</h2>
            <div className={styles.tocContainer}>
              {(book.table_of_contents && Array.isArray(book.table_of_contents) && book.table_of_contents.length > 0) ? (
                <ul className={styles.tocList}>
                  {book.table_of_contents.map((chapter, index) => (
                    <li key={index} className={styles.tocItem}>
                      <span className={styles.chapterNum}>{String(index + 1).padStart(2, '0')}</span>
                      <span className={styles.chapterTitle}>{chapter}</span>
                      <span className={styles.chapterPage}>p. {10 + (index * 25)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className={styles.tocList}>
                  {['Introduction & Foundations', 'Core Principles & Frameworks', 'Case Studies in Zimbabwe', 'Advanced Methodologies', 'Future Perspectives & Innovation'].map((chapter, index) => (
                    <li key={index} className={styles.tocItem}>
                      <span className={styles.chapterNum}>{String(index + 1).padStart(2, '0')}</span>
                      <span className={styles.chapterTitle}>{chapter}</span>
                      <span className={styles.chapterPage}>p. {10 + (index * 30)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Customer Reviews</h2>
              <button className={styles.writeReviewBtn}>Write a Review</button>
            </div>
            
            <div className={styles.reviewsList}>
              {reviews.length > 0 ? reviews.map(review => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewUser}>
                      <div className={styles.userAvatar}>{review.user[0]}</div>
                      <div>
                        <p className={styles.userName}>{review.user}</p>
                        <p className={styles.reviewDate}>{review.date}</p>
                      </div>
                    </div>
                    <div className={styles.reviewStars}>
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          fill={i < review.rating ? "var(--amber)" : "none"} 
                          stroke={i < review.rating ? "none" : "var(--clay)"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className={styles.reviewComment}>{review.comment}</p>
                </div>
              )) : (
                <p className={styles.noReviews}>No reviews yet. Be the first to review this book!</p>
              )}
            </div>
          </div>

          {relatedBooks.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Customers who viewed this item also viewed</h2>
              <div className={styles.relatedGrid}>
                {relatedBooks.map(related => (
                  <BookCard key={related.id} publication={related} variant="grid" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Actions Panel (Buy Box) */}
        <aside className={styles.rightColumn}>
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
                <Link to={`/reader/${book.id}`} className={styles.readBtn}>
                  <BookOpen size={20} /> Read Now
                </Link>
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
              <button className={styles.actionBtn} onClick={handleAddToList}>
                <Plus size={18} /> Add to List
              </button>
              <button className={styles.actionBtn} onClick={handleShare}>
                {isCopied ? <Check size={18} color="var(--green)" /> : <Share2 size={18} />} 
                {isCopied ? 'Copied!' : 'Share'}
              </button>
            </div>

            <div className={styles.secureTransaction}>
              <ShieldCheck size={14} />
              <span>Secure transaction</span>
            </div>

            <div className={styles.attribution}>
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
