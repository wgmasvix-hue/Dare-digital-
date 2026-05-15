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
import { geminiService } from '../services/geminiService';
import { offlineStorage } from '../lib/offlineStorage';
import { useAuth } from '../hooks/useAuth';
import BookCard from '../components/library/BookCard';
import Toast from '../components/ui/Toast';

const ALL_OER = [...OPENSTAX_CURATED, ...ALL_ADDITIONAL_OER];

const FACULTY_COLORS = {
  stem: '#3b82f6', // blue-500
  agriculture: '#10b981', // emerald-500
  health: '#ef4444', // red-500
  business: '#f59e0b', // amber-500
  education: '#eab308', // yellow-500
  engineering: '#0f172a', // slate-900
  law: '#8b5cf6', // violet-500
  humanities: '#f97316', // orange-500
  default: '#64748b' // slate-500
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
      if (id.startsWith('openstax-') || id.startsWith('fao-') || id.startsWith('who-') || id.startsWith('andrews-') || id.startsWith('ai-') || id.startsWith('gutenberg-') || id.startsWith('ol-') || id.startsWith('olb-') || id.startsWith('arxiv-')) {
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

            const text = proxyResponse.data;
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 pt-24 pb-32">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Loading book details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 pt-24 pb-32 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 border border-red-100 flex items-center justify-center rounded-3xl mb-6 shadow-sm">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Error Loading Book</h2>
        <p className="text-slate-500 max-w-md mb-8">{error}</p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button onClick={fetchBookData} className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-all active:scale-95">Try Again</button>
          <Link to="/library" className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl shadow-sm transition-all active:scale-95">Return to Library</Link>
          <Link to="/ai-tools" className="w-full sm:w-auto px-6 py-3 bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-100 font-bold rounded-xl shadow-sm transition-all active:scale-95">Explore AI Tools</Link>
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
    <div className="relative min-h-screen bg-slate-50 pb-32 pt-24 lg:pt-32 selection:bg-teal-500/30">
      {/* Background Decor */}
      <div className="absolute inset-x-0 top-0 h-[60vh] z-0 overflow-hidden pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=2000" 
          alt="Book Detail Background" 
          className="w-full h-full object-cover opacity-[0.03] mix-blend-overlay"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
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
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors py-2 group"
          >
            <div className="p-1 rounded-md group-hover:bg-slate-200 transition-colors">
              <ArrowLeft size={16} /> 
            </div>
            Back to Library
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* LEFT COLUMN: Cover */}
          <div className="lg:col-span-3">
            <div className="sticky top-32">
              <div 
                className="relative aspect-[3/4] w-full max-w-sm mx-auto lg:mx-0 rounded-r-3xl rounded-l-md shadow-2xl shadow-slate-900/20 overflow-hidden transform transition-all duration-500 hover:-translate-y-2 group"
                style={{ borderLeft: `8px solid ${facultyColor}` }}
              >
                <img src={displayCover} alt={book.title} className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/opacity-0 group-hover:bg-black/10 transition-colors duration-500" />
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN: Info */}
          <div className="lg:col-span-6 space-y-12">
            <div className="space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-slate-900 leading-[1.1] tracking-tight">{book.title}</h1>
              
              <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
                <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                  by <span className="text-slate-900 ml-1">{book.author_names}</span>
                </span>
                <span className="text-slate-300 mx-2 hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        fill={i < Math.round(book.average_rating || 4.5) ? "currentColor" : "none"} 
                        stroke={i < Math.round(book.average_rating || 4.5) ? "none" : "currentColor"}
                        className={i >= Math.round(book.average_rating || 4.5) ? "text-amber-200" : ""}
                      />
                    ))}
                  </div>
                  <span className="text-amber-700 font-bold text-xs ml-1">
                    {(book.average_rating || 4.5).toFixed(1)} <span className="opacity-70">({book.ratings_count || 12})</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-600 shadow-sm" style={{ color: facultyColor }}>
                  {book.faculty}
                </span>
                {book.ai_level && (
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-violet-50 border border-violet-200 text-violet-700 shadow-sm">
                    AI Level {book.ai_level}
                  </span>
                )}
                {(book.zimche_programme_codes?.length > 0 || book.zimche_code) && (
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm">
                    ZIMCHE: {book.zimche_code || book.zimche_programme_codes?.[0]}
                  </span>
                )}
                <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-900 border border-slate-900 text-white shadow-sm">
                  {book.level || book.target_level || 'General'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px] p-5 rounded-2xl bg-teal-50 border-2 border-teal-500 relative overflow-hidden group">
                <div className="relative z-10">
                  <span className="block text-xs font-black text-teal-600 uppercase tracking-widest mb-1">Digital Edition</span>
                  <span className="block text-xl font-black text-slate-900">Institutional Access</span>
                </div>
                <div className="absolute right-0 bottom-0 p-4 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform">
                   <ShieldCheck size={64} className="text-teal-600" />
                </div>
              </div>
              {book.file_url && book.file_url.endsWith('.epub') && (
                <div className="flex-1 min-w-[200px] p-5 rounded-2xl bg-white border border-slate-200 relative overflow-hidden group">
                  <div className="relative z-10">
                    <span className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">EPUB</span>
                    <span className="block text-xl font-black text-slate-900">Included</span>
                  </div>
                </div>
              )}
            </div>

            <div className="prose prose-slate max-w-none prose-lg">
              <h2 className="font-serif font-black text-2xl text-slate-900 mb-6 border-b border-slate-200 pb-4">Synopsis</h2>
              <p className="text-slate-600 leading-relaxed font-medium">{book.description || 'No description available.'}</p>
              
              {/* ZIMBABWEAN REMIX SECTION */}
              {remixedData && (
                <div className="mt-12 p-8 bg-amber-50 border border-amber-200 rounded-3xl relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Sparkles size={120} className="text-amber-500" />
                  </div>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl text-white shadow-lg shadow-amber-500/30 flex items-center justify-center transform -rotate-6">
                      <Zap size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight m-0">Zim-Curriculum Remix</h3>
                      <p className="text-xs font-black text-amber-600 uppercase tracking-widest m-0 mt-1">Heritage-Based Alignment (HBC)</p>
                    </div>
                  </div>

                  <div className="space-y-8 relative z-10">
                    <div className="bg-white/60 p-6 rounded-2xl border border-white">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 m-0">Curriculum Summary</h4>
                      <p className="text-base font-medium leading-relaxed text-slate-800 m-0">{remixedData.zimSummary}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 m-0">Local Context</h4>
                        <p className="text-sm font-medium leading-relaxed text-slate-700 m-0">{remixedData.localInsights}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 m-0">Heritage Connection</h4>
                        <p className="text-sm font-medium leading-relaxed text-slate-700 m-0">{remixedData.heritageConnection}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 m-0">HBC Learning Objectives</h4>
                      <ul className="grid md:grid-cols-2 gap-4 m-0 p-0 list-none">
                        {remixedData.hbcObjectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-700 m-0">
                            <div className="mt-0.5 w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                              <Check size={12} strokeWidth={3} />
                            </div>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-6 border-t border-amber-200/50 flex items-center gap-2 text-xs font-black text-amber-600/80 uppercase tracking-widest">
                      <WifiOff size={16} />
                      <span>Available Offline</span>
                    </div>
                  </div>
                </div>
              )}

              {/* AI ANALYSIS SECTION */}
              {(book.ai_summary || book.ai_topics?.length > 0) && (
                <div className="mt-12 p-8 bg-slate-900 rounded-3xl relative overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-white) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                  
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                        <Sparkles size={24} />
                      </div>
                      <h3 className="text-xl font-black text-white m-0 tracking-wide">AI Insights</h3>
                    </div>
                    {user && (user.id === book.creator_id || user.email === 'wgmasvix@gmail.com') && (
                      <button 
                        onClick={handleRegenerateAi} 
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2 border border-white/10"
                        disabled={isAnalyzing}
                      >
                        <RefreshCw size={16} className={isAnalyzing ? "animate-spin" : ""} />
                        {isAnalyzing ? 'Analyzing...' : 'Regenerate'}
                      </button>
                    )}
                  </div>
                  
                  {book.ai_summary && (
                    <div className="mb-8">
                      <p className="text-slate-300 leading-relaxed font-medium m-0">{book.ai_summary}</p>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-6 bg-white/5 border border-white/10 rounded-2xl p-6">
                    {book.ai_difficulty && (
                      <div>
                        <span className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Complexity</span>
                        <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${
                          book.ai_difficulty === 'introductory' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          book.ai_difficulty === 'intermediate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {book.ai_difficulty.charAt(0).toUpperCase() + book.ai_difficulty.slice(1)}
                        </span>
                      </div>
                    )}
                    {book.ai_topics?.length > 0 && (
                      <div>
                        <span className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Key Topics</span>
                        <div className="flex flex-wrap gap-2">
                          {book.ai_topics.map((topic, i) => (
                            <span key={i} className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-md text-xs font-bold">{topic}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {book.learning_objectives && (
                <div className="mt-12">
                  <h3 className="font-serif font-black text-2xl text-slate-900 mb-6 border-b border-slate-200 pb-4 m-0">What you'll learn</h3>
                  <ul className="grid sm:grid-cols-2 gap-4 m-0 p-0 list-none">
                    {book.learning_objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-3 text-base text-slate-700 m-0">
                        <div className="mt-1 w-6 h-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                           <Check size={14} strokeWidth={3} />
                        </div>
                        <span className="font-medium">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-12">
              <h2 className="font-serif font-black text-2xl text-slate-900 mb-6 border-b border-slate-200 pb-4">Product Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Publisher</span>
                  <span className="block text-sm font-bold text-slate-900">{book.publisher_name || 'Independent'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Publication Year</span>
                  <span className="block text-sm font-bold text-slate-900">{book.year_published || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Format</span>
                  <span className="block text-sm font-bold text-slate-900">{book.format?.toUpperCase() || 'PDF'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pages</span>
                  <span className="block text-sm font-bold text-slate-900">{book.page_count || 'Varies'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Language</span>
                  <span className="block text-sm font-bold text-slate-900">English</span>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">License</span>
                  <span className="block text-sm font-bold text-slate-900">{book.license_type || 'Standard'}</span>
                </div>
              </div>
            </div>

            <div className="pt-12 border-t border-slate-200">
              <h2 className="font-serif font-black text-2xl text-slate-900 mb-6 border-b border-slate-200 pb-4">Table of Contents</h2>
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                {(book.table_of_contents && Array.isArray(book.table_of_contents) && book.table_of_contents.length > 0) ? (
                  <ul className="divide-y divide-slate-100 m-0 p-0 list-none">
                    {book.table_of_contents.map((chapter, index) => (
                      <li key={index} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group">
                        <span className="text-xl font-black text-slate-200 group-hover:text-teal-200 transition-colors w-8 text-right">{String(index + 1).padStart(2, '0')}</span>
                        <span className="flex-1 font-bold text-slate-700 group-hover:text-slate-900">{chapter}</span>
                        <span className="text-xs font-bold text-slate-400">p. {10 + (index * 25)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="divide-y divide-slate-100 m-0 p-0 list-none">
                    {['Introduction & Foundations', 'Core Principles & Frameworks', 'Case Studies in Zimbabwe', 'Advanced Methodologies', 'Future Perspectives & Innovation'].map((chapter, index) => (
                      <li key={index} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group">
                        <span className="text-2xl font-black text-slate-200 group-hover:text-teal-200 transition-colors w-10 text-right">{String(index + 1).padStart(2, '0')}</span>
                        <span className="flex-1 font-bold text-slate-700 group-hover:text-slate-900 text-lg">{chapter}</span>
                        <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">p. {10 + (index * 30)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="pt-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif font-black text-2xl text-slate-900 m-0">Reader Reviews</h2>
                <button className="px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-900 text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95">Write a Review</button>
              </div>
              
              <div className="space-y-4">
                {reviews.length > 0 ? reviews.map(review => (
                  <div key={review.id} className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-black flex items-center justify-center text-lg">{review.user[0]}</div>
                        <div>
                          <p className="font-bold text-slate-900 leading-none mb-1">{review.user}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            fill={i < review.rating ? "currentColor" : "none"} 
                            stroke={i < review.rating ? "none" : "currentColor"}
                            className={i >= review.rating ? "text-slate-200" : ""}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 font-medium">{review.comment}</p>
                  </div>
                )) : (
                  <div className="p-12 border-2 border-dashed border-slate-200 rounded-3xl text-center bg-white">
                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Star size={32} />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mb-2">No reviews yet</h4>
                    <p className="text-sm font-medium text-slate-500">Be the first to review this book and help other readers!</p>
                  </div>
                )}
              </div>
            </div>

            {relatedBooks.length > 0 && (
              <div className="pt-12">
                <h2 className="font-serif font-black text-2xl text-slate-900 mb-8 border-b border-slate-200 pb-4">Readers who viewed this item also viewed</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {relatedBooks.map(related => (
                    <div key={related.id} className="h-full">
                       <BookCard publication={related} variant="grid" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Actions Panel (Buy Box) */}
          <aside className="lg:col-span-3">
            <div className="sticky top-32 bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-6">
              
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                {accessStatus === 'granted' && (
                  <>
                    <div className="text-teal-500">
                      <BookOpen size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                       <span className="block text-sm font-black text-slate-900">Access Granted</span>
                       <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Read unlimited</span>
                    </div>
                  </>
                )}
                {accessStatus === 'preview' && (
                  <>
                    <div className="text-amber-500">
                      <Lock size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                       <span className="block text-sm font-black text-slate-900">Preview Only</span>
                       <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Limited access</span>
                    </div>
                  </>
                )}
                {accessStatus === 'denied' && (
                  <>
                    <div className="text-red-500">
                      <ShieldCheck size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                       <span className="block text-sm font-black text-slate-900">Access Denied</span>
                       <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">License required</span>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-3">
                {accessStatus === 'granted' ? (
                  <>
                    <Link to={`/book-action/${book.id}`} state={{ book }} className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95">
                      <BookOpen size={18} /> Read Now
                    </Link>
                    <button 
                      onClick={handleRemix} 
                      className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95"
                      disabled={isRemixing}
                    >
                      <Zap size={18} className={isRemixing ? "animate-bounce" : ""} />
                      {isRemixing ? 'Remixing...' : 'Remix for Zimbabwe (HBC)'}
                    </button>
                    <button 
                      onClick={handleSaveOffline} 
                      className="w-full py-4 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <WifiOff size={18} /> Save for Offline
                    </button>
                  </>
                ) : accessStatus === 'preview' ? (
                  <>
                    <Link to={`/reader/${book.id}?preview=true`} className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95">
                      Preview First 25 Pages
                    </Link>
                    <div className="text-center pt-2">
                      <p className="text-xs font-bold text-slate-500 mb-2">Full access requires an institutional license.</p>
                      <Link to="/institutions" className="text-sm font-black text-teal-600 hover:underline">Learn more</Link>
                    </div>
                  </>
                ) : (
                  <div className="text-center pt-2">
                    <p className="text-sm font-bold text-slate-600 mb-4">Your institution does not have a license for this title.</p>
                    <button className="w-full py-3 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-900 rounded-xl text-sm font-bold transition-all active:scale-95">Request Access</button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                <button className="py-3 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2" onClick={handleAddToList}>
                  <Plus size={16} /> Add to List
                </button>
                <button className="py-3 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2" onClick={handleShare}>
                  {isCopied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />} 
                  {isCopied ? 'Copied!' : 'Share'}
                </button>
              </div>

              <div className="pt-6">
                <div className="flex items-center gap-2 text-slate-400 mb-3">
                  <ShieldCheck size={14} />
                  <span className="text-xs font-bold uppercase tracking-widest">Secure Environment</span>
                </div>

                <div className="text-xs font-bold text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="mb-2">License: {book.license_type || 'All Rights Reserved'}</p>
                  {book.source_url && (
                    <a href={book.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-teal-600 hover:underline">
                      View Original Source <Globe size={12} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}