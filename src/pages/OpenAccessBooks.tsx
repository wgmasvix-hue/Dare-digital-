import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  BookMarked,
  Globe,
  Database,
  Info
} from 'lucide-react';
import { Book } from '../types';
import { gutenbergService } from '../services/gutenbergService';
import { openLibraryService } from '../services/openLibraryService';
import { arxivService } from '../services/arxivService';
import { internetArchiveService } from '../services/internetArchiveService';
import { standardEbooksService } from '../services/standardEbooksService';
import { oapenService } from '../services/oapenService';
import { librivoxService } from '../services/librivoxService';
import { openTextbookService } from '../services/openTextbookService';
import { useGamification } from '../context/GamificationContext';
import AIInsightModal from '../components/library/AIInsightModal';

// Visual stats for open-source scale
const SCALE_STATS = [
  { label: 'Open Library', count: '20M+', desc: 'Digital books & archive scans', color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'arXiv Papers', count: '2.3M+', desc: 'Research & university prep preprints', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Project Gutenberg', count: '70,000+', desc: 'Classic literature & masterworks', color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'OpenStax & OER', count: '10,000+', desc: 'Peer-reviewed higher-ed textbooks', color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Internet Archive', count: '30M+', desc: 'Scanned books, texts & historical documents', color: 'text-rose-600', bg: 'bg-rose-50' },
  { label: 'LibriVox', count: '15,000+', desc: 'Free public domain audiobooks', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Standard Ebooks', count: '700+', desc: 'Curated, beautifully formatted classics', color: 'text-teal-600', bg: 'bg-teal-50' },
  { label: 'OAPEN', count: '20,000+', desc: 'Peer-reviewed open access academic books', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { label: 'Open Textbook Library', count: '1,200+', desc: 'Peer-reviewed higher education textbooks', color: 'text-orange-600', bg: 'bg-orange-50' },
];

const PRESET_QUERIES = [
  { label: 'Physics', query: 'Physics', icon: '⚛️' },
  { label: 'Agriculture', query: 'Agriculture soil crops', icon: '🌾' },
  { label: 'Machine Learning', query: 'Artificial Intelligence Machine Learning', icon: '🤖' },
  { label: 'Economics', query: 'Economics', icon: '📈' },
  { label: 'African History', query: 'Zimbabwe African History', icon: '🌍' },
  { label: 'Mathematics', query: 'Calculus Algebra', icon: '🧮' },
];

type SourceFilter =
  | 'all'
  | 'open_library'
  | 'gutenberg'
  | 'arxiv'
  | 'internet_archive'
  | 'librivox'
  | 'standard_ebooks'
  | 'oapen'
  | 'open_textbooks';

export default function OpenAccessBooks() {
  const location = useLocation();
  const { gainXp } = useGamification();

  const [showInsightModal, setShowInsightModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');

  // Reader and AI Interaction states
  const [showXPReward, setShowXPReward] = useState(false);

  // Parse URL Search Query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    const source = params.get('source');
    if (search) {
      setSearchQuery(search);
    }
    const validSources: SourceFilter[] = [
      'open_library', 'gutenberg', 'arxiv',
      'internet_archive', 'librivox', 'standard_ebooks', 'oapen', 'open_textbooks'
    ];
    if (source && validSources.includes(source as SourceFilter)) {
      setSourceFilter(source as SourceFilter);
    }
  }, [location.search]);

  // Primary Unified Multi-API Resolver Fetcher
  const fetchOpenAccessBooks = useCallback(async (queryToUse: string, pageNum = 1, source = sourceFilter) => {
    setLoading(true);
    try {
      // If query is completely empty, use a smart scholarly default search term representing Zimbabwe / Scientific works to populate the homepage
      const query = queryToUse.trim() || 'Zimbabwe';
      let results: Book[] = [];
      let count = 0;

      if (source === 'all') {
        // Query all sources in parallel
        const [
          olResponse,
          gutResponse,
          iaResponse,
          seResponse,
          oapenResponse,
          librivoxResponse,
          otlResponse,
        ] = await Promise.allSettled([
          openLibraryService.searchBooks(query, pageNum).catch(() => ({ books: [], numFound: 0 })),
          gutenbergService.searchBooks(query, pageNum).catch(() => ({ books: [], count: 0 })),
          internetArchiveService.searchBooks(query, pageNum),
          standardEbooksService.searchBooks(query, pageNum),
          oapenService.searchBooks(query, pageNum),
          librivoxService.searchBooks(query, pageNum),
          openTextbookService.searchBooks(query, pageNum),
        ]);

        const olBooks = olResponse.status === 'fulfilled' ? olResponse.value.books : [];
        const olCount = olResponse.status === 'fulfilled' ? olResponse.value.numFound : 0;

        const gutBooks = gutResponse.status === 'fulfilled' ? gutResponse.value.books : [];
        const gutCount = gutResponse.status === 'fulfilled' ? gutResponse.value.count : 0;

        const iaBooks = iaResponse.status === 'fulfilled' ? iaResponse.value.books : [];
        const iaCount = iaResponse.status === 'fulfilled' ? iaResponse.value.totalResults : 0;

        const seBooks = seResponse.status === 'fulfilled' ? seResponse.value.books : [];
        const seCount = seResponse.status === 'fulfilled' ? seResponse.value.totalResults : 0;

        const oapenBooks = oapenResponse.status === 'fulfilled' ? oapenResponse.value.books : [];
        const oapenCount = oapenResponse.status === 'fulfilled' ? oapenResponse.value.totalResults : 0;

        const librivoxBooks = librivoxResponse.status === 'fulfilled' ? librivoxResponse.value.books : [];
        const librivoxCount = librivoxResponse.status === 'fulfilled' ? librivoxResponse.value.totalResults : 0;

        const otlBooks = otlResponse.status === 'fulfilled' ? otlResponse.value.books : [];
        const otlCount = otlResponse.status === 'fulfilled' ? otlResponse.value.totalResults : 0;

        // Interleave results from all sources for variety
        const allSources = [olBooks, gutBooks, iaBooks, seBooks, oapenBooks, librivoxBooks, otlBooks];
        const maxLen = Math.max(...allSources.map((s) => s.length));
        for (let i = 0; i < maxLen; i++) {
          for (const src of allSources) {
            if (i < src.length) results.push(src[i]);
          }
        }

        count = olCount + gutCount + iaCount + seCount + oapenCount + librivoxCount + otlCount;
      }
      else if (source === 'open_library') {
        const data = await openLibraryService.searchBooks(query, pageNum);
        results = data.books;
        count = data.numFound;
      }
      else if (source === 'gutenberg') {
        const data = await gutenbergService.searchBooks(query, pageNum);
        results = data.books;
        count = data.count;
      }
      else if (source === 'arxiv') {
        const data = await arxivService.searchResearch(query, pageNum);
        results = data.books;
        count = data.totalResults;
      }
      else if (source === 'internet_archive') {
        const data = await internetArchiveService.searchBooks(query, pageNum);
        results = data.books;
        count = data.totalResults;
      }
      else if (source === 'standard_ebooks') {
        const data = await standardEbooksService.searchBooks(query, pageNum);
        results = data.books;
        count = data.totalResults;
      }
      else if (source === 'oapen') {
        const data = await oapenService.searchBooks(query, pageNum);
        results = data.books;
        count = data.totalResults;
      }
      else if (source === 'librivox') {
        const data = await librivoxService.searchBooks(query, pageNum);
        results = data.books;
        count = data.totalResults;
      }
      else if (source === 'open_textbooks') {
        const data = await openTextbookService.searchBooks(query, pageNum);
        results = data.books;
        count = data.totalResults;
      }

      setBooks(results);
      setTotalCount(count);
    } catch (err) {
      console.error('Unified Book Search Error:', err);
    } finally {
      setLoading(false);
    }
  }, [sourceFilter]);

  // Trigger search on debounce or direct change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchOpenAccessBooks(searchQuery, 1);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, sourceFilter, fetchOpenAccessBooks]);

  const handleNextPage = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchOpenAccessBooks(searchQuery, nextPage);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (page > 1) {
      const prevPage = page - 1;
      setPage(prevPage);
      fetchOpenAccessBooks(searchQuery, prevPage);
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }
  };

  // Gamification & Reading rewards
  const handleReadOnline = (book: Book) => {
    // Open in separate secure tab without referrer leak
    window.open(book.file_url || book.url, '_blank', 'noopener,noreferrer');

    // Award daily educational XP
    gainXp(25);
    setShowXPReward(true);
    setTimeout(() => setShowXPReward(false), 3500);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 font-sans text-slate-900 selection:bg-teal-200 selection:text-teal-900">

      {/* 1. Header Hero Panel */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-16 px-6 lg:px-12 mb-12">
        {/* Unsplash Academic Aesthetic */}
        <div className="absolute inset-0 opacity-15 mix-blend-overlay">
          <img
            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000"
            alt="Library Archive Background"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-xs font-bold leading-none tracking-widest uppercase mb-6">
            <Globe size={14} className="animate-spin-slow" /> Unified Open Repositories
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-2xl mb-4">
            1,000,000+ <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Open Source</span> Scholar Library
          </h1>
          <p className="text-lg text-slate-300 max-w-xl font-medium leading-relaxed">
            Search scientific preprints, curriculum reference textbooks, and classic literature dynamically. All fully licensed for Zimbabwe Education 5.0 scholar training.
          </p>

          {/* Preset Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Quick Curations:</span>
            {PRESET_QUERIES.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setSearchQuery(p.query);
                  setActivePreset(p.label);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                  activePreset === p.label
                    ? 'bg-teal-500 text-slate-900 border-teal-500 shadow-md'
                    : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:border-slate-500'
                }`}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Floating Reward Animation */}
        <AnimatePresence>
          {showXPReward && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed bottom-10 right-10 bg-slate-900 text-white border border-teal-500/30 px-6 py-4 rounded-2xl shadow-[0_15px_50px_-10px_rgba(0,0,0,0.3)] z-50 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-slate-900 font-extrabold text-sm shadow">
                +25
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Experience Points Earned!</h4>
                <p className="text-xs text-teal-400 font-medium">For exploring unified open learning materials</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. Scale Statistics Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
          {SCALE_STATS.map((s) => (
            <div key={s.label} className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className={`p-3 rounded-2xl ${s.bg}`}>
                <Database size={24} className={s.color} />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{s.count}</p>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">{s.label}</h4>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{s.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* 3. Search Bar and Navigation Panels */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Main Content Pane */}
          <div className="flex-1 w-full order-1 lg:order-none">

            {/* Control Panel: Filters, Sorter, Search */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 mb-8 shadow-sm">
              <div className="flex flex-col gap-4">

                {/* Search query input */}
                <div className="relative w-full">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search size={18} />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setActivePreset(null);
                    }}
                    placeholder="Search over 1M scientific and OER books..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Directory Selector tabs — scrollable on small screens */}
                <div className="overflow-x-auto">
                  <div className="flex items-center gap-1.5 min-w-max">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0">Repository Scope:</span>
                    {[
                      { id: 'all', label: 'All Sources' },
                      { id: 'open_library', label: 'Open Library' },
                      { id: 'gutenberg', label: 'Gutenberg' },
                      { id: 'arxiv', label: 'arXiv Papers' },
                      { id: 'internet_archive', label: 'Internet Archive' },
                      { id: 'librivox', label: 'LibriVox' },
                      { id: 'standard_ebooks', label: 'Standard Ebooks' },
                      { id: 'oapen', label: 'OAPEN' },
                      { id: 'open_textbooks', label: 'Open Textbooks' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSourceFilter(tab.id as SourceFilter)}
                        className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          sourceFilter === tab.id
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Results Counters */}
            <div className="flex items-center justify-between px-2 mb-6 text-slate-500 font-mono text-xs">
              <div>
                {totalCount > 0 ? (
                  <span>Dynamic search results returned: <strong className="text-slate-800 font-bold">{totalCount.toLocaleString()}</strong> index links</span>
                ) : (
                  <span>Ingested digital repository scan status: <strong className="text-emerald-600">Active</strong></span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Info size={12} /> Click Read Online to open secure ebook targets
              </div>
            </div>

            {/* Main Books Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl border border-slate-200/60 p-6 flex gap-4 animate-pulse">
                    <div className="w-1/3 aspect-[3/4] bg-slate-100 rounded-2xl" />
                    <div className="flex-1 flex flex-col gap-3 py-2">
                      <div className="h-6 bg-slate-100 rounded-md w-3/4" />
                      <div className="h-4 bg-slate-100 rounded-md w-1/2" />
                      <div className="h-10 bg-slate-100 rounded-md mt-auto" />
                    </div>
                  </div>
                ))
              ) : books.length > 0 ? (
                books.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => {
                      setSelectedBook(book);
                      setShowInsightModal(true);
                    }}
                    className="cursor-pointer bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col md:flex-row gap-5 relative group scale-98 hover:scale-100"
                  >
                    {/* Cover Frame */}
                    <div className="md:w-1/3 aspect-[3/4] bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden relative shadow-inner shrink-0">
                      <img
                        src={book.cover_image_url || `https://picsum.photos/seed/${book.id}/200/300`}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400`;
                        }}
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur text-[8px] font-black text-white uppercase tracking-wider">
                        {book.source}
                      </div>
                      {book.source === 'LibriVox' && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-indigo-600/90 backdrop-blur text-[8px] font-black text-white uppercase tracking-wider">
                          🎧 Audiobook
                        </div>
                      )}
                    </div>

                    {/* Meta Data */}
                    <div className="flex flex-col flex-1 py-1">
                      <h3 className="font-serif font-black text-slate-900 leading-tight mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-sm font-bold text-slate-600 mb-4 line-clamp-1">By {book.author_names}</p>
                      <p className="text-xs text-slate-400 font-medium line-clamp-3 mb-4 leading-relaxed">
                        {book.description || 'Digitized open access repository document. Click Read Online to load.'}
                      </p>

                      {/* CTA Panel */}
                      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReadOnline(book);
                          }}
                          className="flex-1 py-2 rounded-xl bg-slate-950 text-white hover:bg-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
                        >
                          <Download size={13} />
                          {book.source === 'LibriVox' ? 'Listen Now' : 'Read Online'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-200/60 p-8">
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookMarked size={28} />
                  </div>
                  <h3 className="font-serif font-black text-lg text-slate-800 mb-1">No Books Matched</h3>
                  <p className="text-slate-400 text-sm font-medium mb-6">Try broadening your search term or selecting "All Sources" scope.</p>
                  <button
                    onClick={() => { setSearchQuery(''); setSourceFilter('all'); }}
                    className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white shadow"
                  >
                    Clear Search Filters
                  </button>
                </div>
              )}
            </div>

            {/* Pagination panel */}
            {!loading && books.length > 0 && (
              <div className="flex justify-center items-center gap-16 mt-12 mb-6">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-600 flex items-center gap-1 hover:border-slate-400 active:scale-95 disabled:opacity-40"
                >
                  <ChevronLeft size={16} /> Prior Page
                </button>
                <div className="text-xs font-mono font-bold text-slate-500">
                  CURRENT PAGE {page}
                </div>
                <button
                  onClick={handleNextPage}
                  className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-600 flex items-center gap-1 hover:border-slate-400 active:scale-95"
                >
                  Next Page <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <AIInsightModal
        isOpen={showInsightModal}
        onClose={() => setShowInsightModal(false)}
        book={selectedBook}
      />
    </div>
  );
}
