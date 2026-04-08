import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
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
  Brain,
  Zap,
  WifiOff
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { transformBook, transformBooks, BOOK_SELECT, OPENSTAX_CURATED } from '../lib/transformBook';
import { ALL_ADDITIONAL_OER } from '../lib/oerCatalog';
import { oerService } from '../services/oerService';
import { gutenbergService } from '../services/gutenbergService';
import { geminiService } from '../services/geminiService';
import { offlineStorage } from '../lib/offlineStorage';
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
  const [isRemixing, setIsRemixing] = useState(false);
  const [remixedData, setRemixedData] = useState(null);

  useEffect(() => {
    fetchBookData();
    // Check for existing remix
    const existingRemix = offlineStorage.getRemix(id);
    if (existingRemix) {
      setRemixedData(existingRemix);
    }
  }, [id, user, institution]);

  const fetchBookData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Check for Static/Mock Books (OpenStax, etc.)
      if (id.startsWith('openstax-') || id.startsWith('fao-') || id.startsWith('who-') || id.startsWith('andrews-') || id.startsWith('ai-') || id.startsWith('gutenberg-')) {
        const osBook = ALL_OER.find(b => b.id === id);
        
        if (osBook) {
          setBook({
            ...osBook,
            cover_path: osBook.cover_image_url,
            file_path: osBook.file_url,
            access_model: 'open_access',
            license_type: osBook.license_type || 'CC BY 4.0',
            source_url: `https://openstax.org`,
            table_of_contents: [],
            learning_objectives: []
          });
          setAccessStatus('granted');
        } else if (id.startsWith('openstax-')) {
          const identifier = id.replace('openstax-', '');
          try {
            const targetUrl = `https://archive.org/metadata/${identifier}`;
            const { data: proxyResponse, error: proxyError } = await supabase.functions.invoke('external-proxy', {
              body: { url: targetUrl }
            });
            if (proxyError) throw proxyError;
            
            const data = proxyResponse.data;
            if (data.metadata) {
              const meta = data.metadata;
              const transformed = {
                id: `openstax-${identifier}`,
                title: meta.title,
                author_names: Array.isArray(meta.creator) ? meta.creator.join(', ') : meta.creator || 'OpenStax',
                description: meta.description || 'No description available.',
                cover_path: `https://archive.org/services/img/${identifier}`,
                file_url: `https://archive.org/download/${identifier}/${identifier}.pdf`,
                file_path: `https://archive.org/download/${identifier}/${identifier}.pdf`,
                language: meta.language || 'English',
                source: 'OpenStax',
                access_model: 'open_access',
                license_type: 'CC BY',
                table_of_contents: [],
                learning_objectives: []
              };
              setBook(transformed);
              setAccessStatus('granted');
              setLoading(false);
              return;
            }
          } catch (err) {
            console.error('Error fetching OpenStax metadata:', err);
          }
        } else if (id.startsWith('gutenberg-')) {
          const gId = id.replace('gutenberg-', '');
          try {
            const targetUrl = `https://gutendex.com/books/?ids=${gId}`;
            const { data: proxyResponse, error: proxyError } = await supabase.functions.invoke('external-proxy', {
              body: { url: targetUrl }
            });
            if (proxyError) throw proxyError;

            const data = proxyResponse.data;
            if (data.results && data.results.length > 0) {
              const gBook = data.results[0];
              const transformed = {
                id: `gutenberg-${gBook.id}`,
                title: gBook.title,
                author_names: gBook.authors.map(a => a.name).join(', ') || 'Unknown Author',
                description: `Digitized by Project Gutenberg. Subjects: ${gBook.subjects.join(', ')}`,
                cover_path: gBook.formats['image/jpeg'] || 'https://picsum.photos/seed/book/400/600',
                file_url: gBook.formats['application/epub+zip'] || gBook.formats['text/html'] || gBook.formats['application/pdf'],
                file_path: gBook.formats['application/epub+zip'] || gBook.formats['text/html'] || gBook.formats['application/pdf'],
                language: gBook.languages[0] || 'English',
                source: 'Project Gutenberg',
                access_model: 'public_domain',
                license_type: 'Public Domain',
                table_of_contents: [],
                learning_objectives: []
              };
              setBook(transformed);
              setAccessStatus('granted');
              setLoading(false);
              return;
            }
          } catch (err) {
            console.error('Error fetching Gutenberg book:', err);
          }
        } else if (id.startsWith('ol-') || id.startsWith('olb-')) {
          const identifier = id.startsWith('ol-') ? id.replace('ol-', '/works/') : id.replace('olb-', '/books/');
          try {
            const targetUrl = `https://openlibrary.org${identifier}.json`;
            const { data: proxyResponse, error: proxyError } = await supabase.functions.invoke('external-proxy', {
              body: { url: targetUrl }
            });
            if (proxyError) throw proxyError;

            const data = proxyResponse.data;
            if (data) {
              const transformed = {
                id: id,
                title: data.title,
                author_names: 'Open Library Author',
                description: data.description?.value || data.description || 'No description available.',
                cover_path: data.covers ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg` : `https://picsum.photos/seed/${id}/400/600`,
                file_url: `https://openlibrary.org${identifier}`,
                file_path: `https://openlibrary.org${identifier}`,
                language: 'English',
                source: 'Open Library',
                access_model: 'open_access',
                license_type: 'Dare Access',
                table_of_contents: [],
                learning_objectives: []
              };
              setBook(transformed);
              setAccessStatus('granted');
              setLoading(false);
              return;
            }
          } catch (err) {
            console.error('Error fetching Open Library metadata:', err);
          }
        } else if (id.startsWith('arxiv-')) {
          const identifier = id.replace('arxiv-', '');
          try {
            const targetUrl = `https://export.arxiv.org/api/query?id_list=${identifier}`;
            const { data: proxyResponse, error: proxyError } = await supabase.functions.invoke('external-proxy', {
              body: { url: targetUrl }
            });
            if (proxyError) throw proxyError;

            const text = proxyResponse.data as string;
            const entryMatch = text.match(/<entry>([\s\S]*?)<\/entry>/);
            if (entryMatch) {
              const entry = entryMatch[1];
              const titleMatch = entry.match(/<title>(.*?)<\/title>/);
              const summaryMatch = entry.match(/<summary>(.*?)<\/summary>/);
              const authorMatch = [...entry.matchAll(/<name>(.*?)<\/name>/g)];
              const pdfMatch = entry.match(/<link title="pdf" href="(.*?)"/);
              
              const transformed = {
                id: id,
                title: titleMatch ? titleMatch[1].replace(/\n/g, ' ').trim() : 'Unknown Title',
                author_names: authorMatch.map(m => m[1]).join(', ') || 'Unknown Author',
                description: summaryMatch ? summaryMatch[1].replace(/\n/g, ' ').trim() : 'No summary available.',
                cover_path: `https://picsum.photos/seed/${id}/400/600`,
                file_url: pdfMatch ? pdfMatch[1] : `https://arxiv.org/pdf/${identifier}.pdf`,
                file_path: pdfMatch ? pdfMatch[1] : `https://arxiv.org/pdf/${identifier}.pdf`,
                language: 'English',
                source: 'arXiv Research',
                access_model: 'open_access',
                license_type: 'Dare Access',
                table_of_contents: [],
                learning_objectives: []
              };
              setBook(transformed);
              setAccessStatus('granted');
              setLoading(false);
              return;
            }
          } catch (err) {
            console.error('Error fetching arXiv metadata:', err);
          }
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
      const fetchRelatedBooks = async () => {
        try {
          // Try to use the recommendation edge function if ddc_code exists
          if (pubData.ddc_code) {
            const { data: recData, error: recError } = await supabase.functions.invoke('recommendations', {
              body: { resource_id: id }
            });

            if (!recError && recData?.recommendations?.length > 0) {
              setRelatedBooks(transformBooks(recData.recommendations));
              return;
            }
          }

          // Fallback to existing faculty/subject based logic
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
        } catch (e) {
          console.warn('Failed to fetch related books:', e);
        }
      };
      
      fetchRelatedBooks();

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

  const handleRemix = async () => {
    if (!book || isRemixing) return;

    try {
      setIsRemixing(true);
      setToast({ message: "Remixing content for Zimbabwean Curriculum (HBC)...", type: "info" });

      const context = `
        Title: ${book.title}
        Author: ${book.author_names}
        Description: ${book.description}
        Subject: ${book.faculty || book.subject}
      `;

      const prompt = `
        You are an expert in the Zimbabwean Heritage-Based Curriculum (HBC). 
        Remix the following book metadata to align perfectly with Zimbabwean educational standards, cultural context, and local heritage.
        
        Provide:
        1. A "Zim-Curriculum Summary" (how this book fits into specific Zim subjects/levels).
        2. "Local Contextual Insights" (how the concepts apply to Zimbabwe's economy, history, or environment).
        3. 5 "HBC Learning Objectives" tailored for Zimbabwean students.
        4. A "Heritage Connection" (linking the content to Zimbabwean values/Unhu/Ubuntu).

        Return the response as a JSON object with keys: zimSummary, localInsights, hbcObjectives (array), heritageConnection.
      `;

      const response = await geminiService.chat(prompt, [], { responseMimeType: 'application/json' });
      const remixResult = JSON.parse(response);
      
      // Save for offline access
      offlineStorage.saveRemix(book.id, remixResult);
      setRemixedData(remixResult);
      
      setToast({ message: "Content remixed successfully and saved for offline access!", type: "success" });
    } catch (err) {
      console.error('Failed to remix content:', err);
      setToast({ message: "Failed to remix content. Please check your connection.", type: "error" });
    } finally {
      setIsRemixing(false);
    }
  };

  const handleSaveOffline = () => {
    if (!book) return;
    const success = offlineStorage.saveBookOffline(book.id, book);
    if (success) {
      setToast({ message: "Book metadata saved for offline access!", type: "success" });
    } else {
      setToast({ message: "Failed to save for offline.", type: "error" });
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
          <Link to="/ai-tools" className={styles.backLink}>Explore AI Tools</Link>
        </div>
      </div>
    );
  }

  if (!book) {
    return <Navigate to="/premium" replace />;
  }

  const facultyColor = FACULTY_COLORS[book.faculty?.toLowerCase()] || FACULTY_COLORS.default;
  const defaultCover = "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=1000&auto=format&fit=crop";
  const displayCover = book.cover_path || defaultCover;

  return (
    <div className={`${styles.container} relative`}>
      {/* Real Book Background Image (Subtle) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden h-[500px]">
        <img 
          src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=2000" 
          alt="Book Detail Background" 
          className="w-full h-full object-cover opacity-5"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-base" />
      </div>

      <div className={`${styles.backBreadcrumb} relative z-10`}>
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
              
              {/* ZIMBABWEAN REMIX SECTION */}
              {remixedData && (
                <div className="mt-8 p-6 bg-soil/10 border border-soil/20 rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles size={64} className="text-soil" />
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-soil rounded-xl text-white">
                      <Zap size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-black text-soil uppercase tracking-tight">Zim-Curriculum Remix</h3>
                      <p className="text-[10px] font-bold text-soil/60 uppercase tracking-widest">Heritage-Based Alignment (HBC)</p>
                    </div>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-soil/70 mb-2">Curriculum Summary</h4>
                      <p className="text-sm leading-relaxed text-soil/90 italic">{remixedData.zimSummary}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-soil/70 mb-2">Local Context</h4>
                        <p className="text-sm leading-relaxed text-soil/90">{remixedData.localInsights}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-soil/70 mb-2">Heritage Connection</h4>
                        <p className="text-sm leading-relaxed text-soil/90">{remixedData.heritageConnection}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-soil/70 mb-2">HBC Learning Objectives</h4>
                      <ul className="grid md:grid-cols-2 gap-2">
                        {remixedData.hbcObjectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-soil/80">
                            <Check size={14} className="mt-1 flex-shrink-0 text-soil" />
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-4 flex items-center gap-2 text-[10px] font-bold text-soil/50 uppercase tracking-widest">
                      <WifiOff size={12} />
                      <span>Available Offline</span>
                    </div>
                  </div>
                </div>
              )}

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
              <h2 className={styles.sectionTitle}>Reader Reviews</h2>
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
              <h2 className={styles.sectionTitle}>Readers who viewed this item also viewed</h2>
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
                <div className="flex flex-col gap-3">
                  <Link to={`/book-action/${book.id}`} state={{ book }} className={styles.readBtn}>
                    <BookOpen size={20} /> Read Now
                  </Link>
                  <button 
                    onClick={handleRemix} 
                    className="w-full py-4 bg-soil text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg shadow-soil/20"
                    disabled={isRemixing}
                  >
                    <Sparkles size={16} className={isRemixing ? "animate-spin" : ""} />
                    {isRemixing ? 'Remixing...' : 'Remix for Zimbabwe (HBC)'}
                  </button>
                  <button 
                    onClick={handleSaveOffline} 
                    className="w-full py-3 bg-bg-subtle border border-border text-text-main rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-border transition-all flex items-center justify-center gap-2"
                  >
                    <WifiOff size={16} /> Save for Offline
                  </button>
                </div>
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
