import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  Filter,
  AlertCircle,
  History,
  Globe,
  ArrowRight,
  Database,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { transformBooks, BOOK_SELECT, OPENSTAX_CURATED } from '../lib/transformBook';
import { ALL_ADDITIONAL_OER } from '../lib/oerCatalog';
import { useGamification } from '../context/GamificationContext';
import BookCard from '../components/library/BookCard';
import DigitizationRequestModal from '../components/library/DigitizationRequestModal';
import FilterPanel from '../components/library/FilterPanel';
import SearchBar from '../components/library/SearchBar';

const ALL_LOCAL_OER = (() => {
  const combined = [...OPENSTAX_CURATED, ...ALL_ADDITIONAL_OER];
  const seenIds = new Set();
  return combined.filter(book => {
    if (!book.id || seenIds.has(book.id)) return false;
    seenIds.add(book.id);
    return true;
  });
})();
if (typeof window !== 'undefined') {
  window.ALL_LOCAL_OER = ALL_LOCAL_OER;
}

import { openStaxService } from '../services/openStaxService';
import { geminiService } from '../services/geminiService';
import { gutenbergService } from '../services/gutenbergService';
import { openLibraryService } from '../services/openLibraryService';
import { arxivService } from '../services/arxivService';
import { openAlexService } from '../services/openAlexService';
import { dspaceService } from '../services/dspaceService';
import { useNavigate } from 'react-router-dom';
import { BookOpen as BookOpenIcon, Download as DownloadIcon, Sparkles as SparklesIcon, ExternalLink as ExternalLinkIcon, ChevronDown as ChevronDownIcon, ChevronUp as ChevronUpIcon } from 'lucide-react';

const SOURCE_PILL_LIB = {
  'OpenStax': 'bg-blue-50 text-blue-700 border-blue-200',
  'Project Gutenberg': 'bg-amber-50 text-amber-700 border-amber-200',
  'Open Library': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'arXiv': 'bg-purple-50 text-purple-700 border-purple-200',
  'OpenAlex': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'DSpace': 'bg-orange-50 text-orange-700 border-orange-200',
  'Research': 'bg-slate-100 text-slate-600 border-slate-200',
};

function LibraryListRow({ book, progress }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const PREVIEW = 200;
  const desc = book.description || book.abstract || null;
  const hasLong = desc && desc.length > PREVIEW;
  const displayDesc = expanded ? desc : (desc?.slice(0, PREVIEW) + (hasLong ? '…' : ''));
  const sourcePill = SOURCE_PILL_LIB[book.source] || SOURCE_PILL_LIB['Research'];

  return (
    <div className="px-4 py-4 hover:bg-slate-50/70 transition-colors group border-b border-slate-100 last:border-0">
      <div className="flex gap-3">
        <div className="pt-0.5 shrink-0">
          <BookOpenIcon size={15} className="text-slate-300 group-hover:text-green-600 transition-colors mt-0.5" />
        </div>
        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            {book.source && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${sourcePill}`}>{book.source}</span>
            )}
            {book.access_model === 'open_access' || book.access_model === 'free' || book.access_model === 'public_domain' ? (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Open Access</span>
            ) : null}
            {book.year_published && <span className="text-[11px] text-slate-400 font-mono">{book.year_published}</span>}
            {book.format && <span className="text-[11px] text-slate-400 uppercase">{book.format}</span>}
          </div>
          {/* Title */}
          <h3 className="font-bold text-[15px] text-slate-900 leading-snug mb-0.5 group-hover:text-green-800 transition-colors line-clamp-2 cursor-pointer"
            onClick={() => navigate(`/reader/${book.id}`)}>
            {book.title}
          </h3>
          {/* Author */}
          {book.author_names && (
            <p className="text-sm text-slate-600 mb-0.5 truncate">{book.author_names}</p>
          )}
          {book.publisher_name && (
            <p className="text-xs text-slate-400 italic mb-1.5 truncate">{book.publisher_name}</p>
          )}
          {/* Progress bar */}
          {progress > 0 && (
            <div className="h-1 bg-slate-100 rounded-full mb-2 w-48 max-w-full">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          {/* Description */}
          {displayDesc && (
            <div className="mb-2">
              <p className="text-sm text-slate-600 leading-relaxed">{displayDesc}</p>
              {hasLong && (
                <button onClick={() => setExpanded(!expanded)} className="text-xs text-green-700 hover:text-green-600 mt-0.5 font-semibold flex items-center gap-0.5">
                  {expanded ? <><ChevronUpIcon size={12} /> Less</> : <><ChevronDownIcon size={12} /> More</>}
                </button>
              )}
            </div>
          )}
          {/* Subject tags */}
          {(book.faculty || book.subject) && (
            <div className="flex flex-wrap gap-1 mb-2">
              {[book.faculty, book.subject].filter(Boolean).slice(0,3).map(s => (
                <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">{s}</span>
              ))}
            </div>
          )}
          {/* Actions */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <button onClick={() => navigate(`/reader/${book.id}`)}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-700 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors">
              <BookOpenIcon size={11} /> Read
            </button>
            {book.file_url && (
              <a href={book.file_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors border border-slate-200">
                <DownloadIcon size={11} /> Download
              </a>
            )}
            {book.url && (
              <a href={book.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors border border-slate-200">
                <ExternalLinkIcon size={11} /> Source
              </a>
            )}
            <button onClick={() => navigate(`/book-action/${book.id}?action=edu5`, { state: { book } })}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg hover:bg-amber-100 transition-colors border border-amber-200">
              <SparklesIcon size={11} /> DARA Assist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { bookProgress } = useGamification();
  
  // Filter States
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    faculty: searchParams.get('faculty') || 'All',
    level: searchParams.get('level') || 'All',
    pillar: searchParams.get('pillar') || 'All',
    access: searchParams.get('access') || 'All',
    source: searchParams.get('source') || 'All',
    format: searchParams.get('format') || 'All',
    university: searchParams.get('university') || 'All',
    yearFrom: searchParams.get('yearFrom') || '',
    yearTo: searchParams.get('yearTo') || '',
    isbn: searchParams.get('isbn') || '',
    zimAuthored: searchParams.get('zimAuthored') === 'true',
    africanContext: searchParams.get('africanContext') === 'true',
  });

  // UI States
  const [viewMode, setViewMode] = useState(searchParams.get('view') || 'list'); // 'grid' | 'list' | 'tile'
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || (searchParams.get('q') ? 'relevance' : 'title'));
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isDigitizationModalOpen, setIsDigitizationModalOpen] = useState(false);
  
  // AI Search States
  const [isAiSearch, setIsAiSearch] = useState(false);
  const [useSemanticSearch, setUseSemanticSearch] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiThinking, setAiThinking] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Data States
  const [publications, setPublications] = useState([]);
  const [localSearch, setLocalSearch] = useState('');
  const [localCategory, setLocalCategory] = useState('All');
  const [semanticResults, setSemanticResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0);
  const loadMoreRef = useRef(null);
  const LIMIT = 40;

  // Fetch Data
  const fetchPublications = useCallback(async (isLoadMore = false) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useSemanticSearch && semanticResults) {
        if (!isLoadMore) {
          setPublications(semanticResults);
          setTotalCount(semanticResults.length);
        }
        setLoading(false);
        return;
      }

      const currentOffset = isLoadMore ? offsetRef.current : 0;
      const currentPage = Math.floor(currentOffset / LIMIT) + 1;
      
      let dbData = [];
      let openStaxData = [];
      let gutenbergData = [];
      let openStaxApiData = [];
      let openLibraryData = [];
      let arxivData = [];
      let openAlexData = [];
      let dspaceExtData = [];
      let dbCount = 0;
      let openStaxCount = 0;
      let gutenbergCount = 0;
      let openStaxApiCount = 0;
      let openLibraryCount = 0;
      let arxivCount = 0;
      let openAlexCount = 0;
      let dspaceExtCount = 0;

      // 1. Fetch from Supabase (non-fatal — other sources load regardless)
      if (filters.source === 'All' || filters.source === 'Dare Library' || filters.source === 'Project Gutenberg' || filters.source === 'Partner Resources') {
        try {
          const needsDirectQuery = filters.isbn || filters.yearFrom || filters.yearTo ||
            filters.zimAuthored || filters.africanContext || filters.source === 'Project Gutenberg' ||
            filters.source === 'Partner Resources' ||
            (sortBy !== 'relevance' && sortBy !== 'title' && filters.q);

          if (!needsDirectQuery) {
            const rpcParams = {
              p_query: filters.q || null,
              p_faculty: filters.faculty === 'All' ? null : filters.faculty,
              p_level: filters.level === 'All' ? null : filters.level,
              p_limit: LIMIT,
              p_offset: currentOffset,
              p_sort: sortBy
            };
            const { data, count, error } = await supabase.rpc('search_publications', rpcParams, { count: 'exact' });
            if (!error) {
              dbData = data || [];
              dbCount = count || 0;
            }
          }

          if (dbData.length === 0 && (needsDirectQuery || dbCount === 0)) {
            let query = supabase
              .from('books')
              .select(BOOK_SELECT, { count: 'exact' });

            if (filters.source === 'Project Gutenberg') {
              query = query.eq('source', 'Project Gutenberg');
            }

            if (filters.faculty !== 'All') {
              const facultyLower = filters.faculty.toLowerCase();
              query = query.or(`subject.ilike.%${filters.faculty}%,faculty.ilike.%${filters.faculty}%,subject.ilike.%${facultyLower.split(' ')[0]}%,faculty.ilike.%${facultyLower.split(' ')[0]}%`);
            }
            if (filters.level !== 'All') query = query.ilike('programme', `%${filters.level}%`);
            if (filters.pillar !== 'All') query = query.contains('ai_topics', [filters.pillar]);
            if (filters.university !== 'All') query = query.ilike('institution_id', `%${filters.university}%`);
            if (filters.access !== 'All') {
              if (filters.access === 'Dare Access') {
                query = query.in('access_model', ['dare_access', 'open_access']);
              } else if (filters.access === 'Licensed') {
                query = query.eq('access_model', 'licensed');
              } else if (filters.access === 'Purchased') {
                query = query.eq('is_purchased', true);
              }
            }
            if (filters.isbn) query = query.or(`description.ilike.%${filters.isbn}%,title.ilike.%${filters.isbn}%`);
            if (filters.q) {
              query = query.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%,author_names.ilike.%${filters.q}%`);
            }
            if (filters.yearFrom) query = query.gte('created_at', `${filters.yearFrom}-01-01`);
            if (filters.yearTo) query = query.lte('created_at', `${filters.yearTo}-12-31`);

            switch (sortBy) {
              case 'newest': query = query.order('created_at', { ascending: false }); break;
              case 'downloads': query = query.order('total_reads', { ascending: false }); break;
              case 'title': query = query.order('title', { ascending: true }); break;
              default: if (!filters.q) query = query.order('title', { ascending: true }); break;
            }

            if (filters.source === 'Featured Items') {
              query = query.eq('is_featured', true);
            }

            query = query.range(currentOffset, currentOffset + LIMIT - 1);
            const result = await query;
            if (!result.error) {
              dbData = transformBooks(result.data || []);
              dbCount = result.count || 0;
            }
          }
        } catch (supaErr) {
          console.warn('Supabase unavailable, showing open-access sources:', supaErr);
        }
      }

      // 1.5 Fetch from DSpace Documents (Research — non-fatal)
      let dspaceData = [];
      let dspaceCount = 0;
      if (filters.source === 'All' || filters.source === 'Research' || filters.source === 'Dare Library') {
        try {
          let docQuery = supabase
            .from('documents')
            .select('*', { count: 'exact' })
            .not('synced_from_dspace_at', 'is', null);

          if (filters.q) {
            docQuery = docQuery.or(`title.ilike.%${filters.q}%,creator.ilike.%${filters.q}%,description.ilike.%${filters.q}%`);
          }

          if (filters.faculty !== 'All') {
            docQuery = docQuery.or(`description.ilike.%${filters.faculty}%,title.ilike.%${filters.faculty}%`);
          }

          docQuery = docQuery.range(currentOffset, currentOffset + LIMIT - 1);
          const { data, count, error } = await docQuery;
          if (!error) {
            dspaceData = (data || []).map(doc => ({
              id: doc.id,
              title: doc.title,
              author_names: doc.creator || 'Unknown Author',
              description: doc.description,
              publisher_name: doc.institution || doc.publisher || 'DSpace Repository',
              year_published: doc.date ? new Date(doc.date).getFullYear() : null,
              format: doc.format || 'pdf',
              access_model: 'open_access',
              source: 'Research',
              resource_type: 'Research',
              file_url: doc.url,
              is_dspace: true,
              cover_image_url: null
            }));
            dspaceCount = count || 0;
          }
        } catch (dsDocErr) {
          console.warn('DSpace documents unavailable:', dsDocErr);
        }
      }

      // 2. Fetch from Local OER Catalog
      if ((filters.source === 'All' || filters.source === 'Partner Resources' || filters.source === 'Featured Items') && 
          (filters.access === 'All' || filters.access === 'Dare Access')) {
        if (!filters.zimAuthored && !filters.africanContext && !filters.isbn) {
          let filteredOER = ALL_LOCAL_OER;
          
          if (filters.source === 'Featured Items') {
            filteredOER = filteredOER.filter(b => b.featured === true || b.is_featured === true);
          }
          
          if (filters.faculty !== 'All') {
            const facultyLower = filters.faculty.toLowerCase();
            filteredOER = filteredOER.filter(b => {
              const bFaculty = (b.faculty || "").toLowerCase();
              const bSubject = (b.subject || "").toLowerCase();
              return bFaculty.includes(facultyLower) || 
                     facultyLower.includes(bFaculty) ||
                     bSubject.includes(facultyLower) ||
                     facultyLower.includes(bSubject);
            });
          }
          
          if (filters.q) {
            const q = filters.q.toLowerCase();
            filteredOER = filteredOER.filter(b => 
              b.title.toLowerCase().includes(q) || 
              b.author_names.toLowerCase().includes(q)
            );
          }
          
          const start = currentOffset;
          const end = start + LIMIT;
          openStaxData = filteredOER.slice(start, end);
          openStaxCount = filteredOER.length;
        }
      }

      // 3. Fetch from Gutenberg API
      if ((filters.source === 'All' || filters.source === 'Partner Resources' || filters.source === 'Gutenberg' || filters.source === 'Project Gutenberg') && 
          (filters.access === 'All' || filters.access === 'Dare Access')) {
        try {
          const page = Math.floor(currentOffset / LIMIT) + 1;
          const gData = await gutenbergService.searchBooks(filters.q, page);
          gutenbergData = gData.books;
          gutenbergCount = gData.count;
        } catch (gErr) {
          console.warn('Gutenberg fetch error:', gErr);
        }
      }

      // 4. Fetch from OpenStax API
      if ((filters.source === 'All' || filters.source === 'Partner Resources') && 
          (filters.access === 'All' || filters.access === 'Dare Access')) {
        try {
          const page = Math.floor(currentOffset / LIMIT) + 1;
          const osData = await openStaxService.searchBooks({ 
            query: filters.q, 
            page, 
            limit: LIMIT 
          });
          openStaxApiData = osData.data;
          openStaxApiCount = osData.total;
        } catch (osErr) {
          console.error('OpenStax fetch error:', osErr);
        }
      }

      // 5. Fetch from Open Library API
      if ((filters.source === 'All' || filters.source === 'Partner Resources' || filters.source === 'Open Library') && 
          (filters.access === 'All' || filters.access === 'Dare Access')) {
        try {
          const page = Math.floor(currentOffset / LIMIT) + 1;
          const olData = await openLibraryService.searchBooks(filters.q || 'Zimbabwe', page);
          openLibraryData = olData.books;
          openLibraryCount = olData.numFound;
        } catch (olErr) {
          console.error('Open Library fetch error:', olErr);
        }
      }

      // 6. Fetch from arXiv API
      if ((filters.source === 'All' || filters.source === 'Partner Resources' || filters.source === 'arXiv Research') && 
          (filters.access === 'All' || filters.access === 'Dare Access')) {
        try {
          const page = Math.floor(currentOffset / LIMIT) + 1;
          const axData = await arxivService.searchResearch(filters.q || 'Zimbabwe', page);
          arxivData = axData.books;
          arxivCount = axData.totalResults;
        } catch (axErr) {
          console.error('arXiv fetch error:', axErr);
        }
      }

      // 6.5 Fetch from OpenAlex API
      if ((filters.source === 'All' || filters.source === 'Partner Resources' || filters.source === 'OpenAlex') && 
          (filters.access === 'All' || filters.access === 'Dare Access')) {
        try {
          const page = Math.floor(currentOffset / LIMIT) + 1;
          const oaData = await openAlexService.searchResearch(filters.q || 'Zimbabwe', page);
          openAlexData = oaData.books;
          openAlexCount = oaData.totalResults;
        } catch (oaErr) {
          console.error('OpenAlex fetch error:', oaErr);
        }
      }

      // 6.6 Fetch from DSpace Bridge
      if ((filters.source === 'All' || filters.source === 'Partner Resources' || filters.source === 'DSpace') && 
          (filters.access === 'All' || filters.access === 'Dare Access')) {
        try {
          const page = Math.floor(currentOffset / LIMIT) + 1;
          const dsData = await dspaceService.searchRepository('https://sandbox.dspace.org', filters.q || 'Zimbabwe', page);
          dspaceExtData = dsData.books;
          dspaceExtCount = dsData.totalResults;
        } catch (dsErr) {
          console.error('DSpace fetch error:', dsErr);
        }
      }

      // 7. Merge Results
      let combinedData = [];
      if (filters.source === 'Partner Resources') {
        combinedData = [...dbData, ...openStaxData, ...gutenbergData, ...openStaxApiData, ...openLibraryData, ...arxivData, ...openAlexData, ...dspaceExtData];
        setTotalCount(dbCount + openStaxCount + gutenbergCount + openStaxApiCount + openLibraryCount + arxivCount + openAlexCount + dspaceExtCount);
      } else if (filters.source === 'Research') {
        combinedData = [...dspaceData, ...dspaceExtData];
        setTotalCount(dspaceCount + dspaceExtCount);
      } else if (filters.source === 'Gutenberg' || filters.source === 'Project Gutenberg') {
        combinedData = gutenbergData;
        setTotalCount(gutenbergCount);
      } else if (filters.source === 'Open Library') {
        combinedData = openLibraryData;
        setTotalCount(openLibraryCount);
      } else if (filters.source === 'arXiv Research') {
        combinedData = arxivData;
        setTotalCount(arxivCount);
      } else if (filters.source === 'OpenAlex') {
        combinedData = openAlexData;
        setTotalCount(openAlexCount);
      } else if (filters.source === 'DSpace') {
        combinedData = dspaceExtData;
        setTotalCount(dspaceExtCount);
      } else if (filters.source === 'Dare Library') {
        combinedData = [...dbData, ...dspaceData];
        setTotalCount(dbCount + dspaceCount);
      } else if (filters.source === 'Featured Items') {
        combinedData = [...dbData, ...openStaxData];
        setTotalCount(dbCount + openStaxCount);
      } else {
        const seenTitles = new Set(dbData.map(b => b.title?.toLowerCase()));
        const uniqueDSpace = dspaceData.filter(b => !seenTitles.has(b.title?.toLowerCase()));
        const uniqueOpenStax = openStaxData.filter(b => !seenTitles.has(b.title?.toLowerCase()));
        const uniqueGutenberg = gutenbergData.filter(b => !seenTitles.has(b.title?.toLowerCase()));
        const uniqueOpenStaxApi = openStaxApiData.filter(b => !seenTitles.has(b.title?.toLowerCase()));
        const uniqueOpenLibrary = openLibraryData.filter(b => !seenTitles.has(b.title?.toLowerCase()));
        const uniqueArxiv = arxivData.filter(b => !seenTitles.has(b.title?.toLowerCase()));
        const uniqueOpenAlex = openAlexData.filter(b => !seenTitles.has(b.title?.toLowerCase()));
        const uniqueDspaceExt = dspaceExtData.filter(b => !seenTitles.has(b.title?.toLowerCase()));
        
        combinedData = [...dbData, ...uniqueDSpace, ...uniqueOpenStax, ...uniqueGutenberg, ...uniqueOpenStaxApi, ...uniqueOpenLibrary, ...uniqueArxiv, ...uniqueOpenAlex, ...uniqueDspaceExt];
        
        if (!isLoadMore) {
          setTotalCount(dbCount + dspaceCount + openStaxCount + gutenbergCount + openStaxApiCount + openLibraryCount + arxivCount + openAlexCount + dspaceExtCount);
        }
      }

      if (isLoadMore) {
        setPublications(prev => [...prev, ...combinedData]);
        offsetRef.current += LIMIT;
        setOffset(offsetRef.current);
      } else {
        setPublications(combinedData);
        offsetRef.current = LIMIT;
        setOffset(LIMIT);
      }

    } catch (err) {
      console.error('Error fetching publications:', err);
      // Only surface the error if we have nothing to show
      setError(prev => prev);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy]);

  useEffect(() => {
    if (filters.q && sortBy === 'title') {
      setSortBy('relevance');
    } else if (!filters.q && sortBy === 'relevance') {
      setSortBy('title');
    }
  }, [filters.q, sortBy]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && publications.length < totalCount) {
          fetchPublications(true);
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loading, publications.length, totalCount, fetchPublications]);

  useEffect(() => {
    offsetRef.current = 0;
    setOffset(0);
    fetchPublications(false);
  }, [fetchPublications]);

  useEffect(() => {
    const query = isAiSearch ? aiQuery : filters.q;
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const terms = await geminiService.getSearchSuggestions(query);
        setSuggestions(terms);
      } catch (err) {
        console.error('Suggestions error:', err);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [filters.q, aiQuery, isAiSearch]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v && v !== 'All' && v !== false) {
        params[k] = String(v);
      }
    });
    params.view = viewMode;
    params.sort = sortBy;
    setSearchParams(params, { replace: true });
  }, [filters, viewMode, sortBy, setSearchParams]);

  const clearFilters = () => {
    const resetFilters = {
      q: '',
      faculty: 'All',
      level: 'All',
      access: 'All',
      source: 'All',
      format: 'All',
      university: 'All',
      yearFrom: '',
      yearTo: '',
      isbn: '',
      zimAuthored: false,
      africanContext: false,
    };
    setFilters(resetFilters);
  };

  const handleAiSearch = async () => {
    if (!aiQuery.trim() || aiThinking) return;
    
    setAiThinking(true);
    try {
      if (useSemanticSearch) {
        const results = await geminiService.semanticSearch(aiQuery);
        if (results && results.length > 0) {
          setSemanticResults(results);
          setPublications(results);
          setTotalCount(results.length);
          setIsAiSearch(false);
          setAiQuery('');
          return;
        }
      }

      const result = await geminiService.searchBooks(aiQuery);
      
      setSemanticResults(null);
      setFilters(prev => ({
        ...prev,
        q: result.keywords.join(' '),
        faculty: result.faculty !== 'All' ? result.faculty : 'All',
        level: result.level !== 'All' ? result.level : 'All'
      }));
      
      setIsAiSearch(false);
      setAiQuery('');
    } catch (err) {
      console.error('AI Search Error:', err);
      setError('AI Search failed. Please try again.');
    } finally {
      setAiThinking(false);
    }
  };

  const filteredPublications = publications.filter(pub => {
    const matchesCategory = localCategory === 'All' || 
      pub.category?.toLowerCase() === localCategory.toLowerCase() ||
      pub.subject?.toLowerCase().includes(localCategory.toLowerCase()) ||
      pub.faculty?.toLowerCase().includes(localCategory.toLowerCase());
    
    return matchesCategory;
  });

  return (
    <div className="relative pt-24 lg:pt-28 pb-32 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 w-full min-h-screen bg-slate-50 flex flex-col md:flex-row gap-8">
      {/* SIDEBAR FILTERS */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-slate-200 p-6 overflow-y-auto transform transition-transform duration-300 md:relative md:translate-x-0 md:bg-transparent md:border-none md:p-0 md:overflow-visible md:w-72 shrink-0 ${isMobileFiltersOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="md:hidden flex items-center justify-between mb-6">
          <h2 className="font-bold text-xl">Filters</h2>
          <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
             <AlertCircle size={20} />
          </button>
        </div>
        <FilterPanel 
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          onRequestDigitization={() => setIsDigitizationModalOpen(true)}
        />
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full min-w-0">
        <DigitizationRequestModal 
          isOpen={isDigitizationModalOpen} 
          onClose={() => setIsDigitizationModalOpen(false)} 
        />
        {/* Mobile Filter Toggle */}
        <button 
          className="md:hidden flex items-center justify-center gap-2 w-full py-3 bg-white border border-slate-200 rounded-xl mb-6 text-sm font-bold shadow-sm"
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
        >
          <Filter size={18} /> Filters
        </button>

        {/* Source Tabs */}
        <div className="flex overflow-x-auto pb-2 mb-5 scrollbar-hide -mx-1 px-1">
          <div className="flex items-center gap-1.5 p-1 bg-white border border-stone-200 rounded-2xl w-fit whitespace-nowrap shadow-sm">
            {[
              { label: 'All', icon: '✦' },
              { label: 'Featured Items', icon: '⭐' },
              { label: 'Dare Library', icon: '🏛' },
              { label: 'Research', icon: '🔬' },
              { label: 'Partner Resources', icon: '🌍' },
              { label: 'Project Gutenberg', icon: '📚' },
              { label: 'Open Library', icon: '📖' },
              { label: 'arXiv Research', icon: '🧪' },
            ].map(({ label, icon }) => (
              <button
                key={label}
                onClick={() => handleFilterChange('source', label)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filters.source === label
                    ? 'bg-green-800 text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <span className="text-[11px]">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Continue Learning Section */}
        {Object.keys(bookProgress).length > 0 && filters.source === 'All' && !filters.q && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600">
                <History size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Continue Learning</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pick up where you left off</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {publications
                .filter(p => bookProgress[p.id] > 0)
                .slice(0, 4)
                .map(book => (
                  <BookCard 
                    key={`continue-${book.id}`} 
                    publication={book} 
                    variant="tile" 
                    progress={bookProgress[book.id]}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Category Filters (Local) */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {[
            { label: 'All', emoji: '✦' },
            { label: 'Vocational', emoji: '🔧' },
            { label: 'Polytechnic', emoji: '⚙️' },
            { label: 'Science', emoji: '🔬' },
            { label: 'Mathematics', emoji: '📐' },
            { label: 'Business', emoji: '📊' },
            { label: 'Technology', emoji: '💻' },
            { label: 'Arts', emoji: '🎨' },
          ].map(({ label, emoji }) => (
            <button
              key={label}
              onClick={() => setLocalCategory(label)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                localCategory === label
                  ? 'bg-green-800 border-green-800 text-white shadow-md'
                  : 'bg-white border-stone-200 text-stone-500 hover:border-green-700/40 hover:text-green-800'
              }`}
            >
              <span>{emoji}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Open Books Spotlight Banner */}
        <div className="relative overflow-hidden rounded-2xl p-6 md:p-7 mb-8 border border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50/40 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="absolute top-0 right-0 w-64 h-full pointer-events-none opacity-5">
            <Globe size={220} className="absolute -top-8 -right-8 text-amber-600" />
          </div>
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest mb-2.5">
              <Globe size={10} />
              Global Open Access
            </div>
            <h3 className="text-lg md:text-xl font-black text-stone-900 tracking-tight mb-1.5">
              Peer-Reviewed & Classic Ebooks — Free
            </h3>
            <p className="text-stone-600 text-xs md:text-sm leading-relaxed">
              Open Library, Project Gutenberg, arXiv, and OpenAlex — all unified. Over 1 million titles at your fingertips.
            </p>
          </div>
          <div className="relative z-10 shrink-0 flex flex-wrap gap-2.5 w-full md:w-auto">
            <Link
              to="/open-books"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              Open Book Hub <ArrowRight size={13} />
            </Link>
            <button
              onClick={() => { handleFilterChange('source', 'Project Gutenberg'); setLocalSearch(''); handleFilterChange('q', ''); }}
              className="flex-1 md:flex-none inline-flex items-center justify-center px-4 py-3 bg-white hover:bg-stone-50 text-stone-700 rounded-xl font-bold text-xs border border-stone-200 shadow-sm transition-all active:scale-95 whitespace-nowrap"
            >
              Gutenberg Classics
            </button>
          </div>
        </div>

        {/* Search Header */}
        <div className="relative overflow-hidden rounded-3xl mb-8 bg-[#0D1F17] border border-green-900/40 shadow-2xl">
          {/* Decorative background */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-green-800/20 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-amber-700/10 blur-3xl" />
            <div className="absolute top-0 left-0 w-full h-1"
              style={{ background: 'linear-gradient(90deg, #166534 0% 25%, #D97706 25% 50%, #C2410C 50% 75%, #1C1917 75% 100%)' }}
            />
          </div>

          <div className="relative z-10 p-7 md:p-10">
            {/* Title row */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-green-900/60 border border-green-700/40 text-green-300 text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                  <Database size={11} />
                  500M+ Titles Indexed
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none">
                  DARE <span className="text-green-400">Library</span>
                </h1>
                <p className="text-stone-400 text-sm mt-1.5 font-medium">
                  Zimbabwe's largest open educational resource collection
                </p>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                {/* Search mode toggle */}
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl backdrop-blur-sm">
                  <button
                    onClick={() => setUseSemanticSearch(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!useSemanticSearch ? 'bg-white text-slate-900 shadow' : 'text-stone-400 hover:text-stone-200'}`}
                  >
                    Keyword
                  </button>
                  <button
                    onClick={() => setUseSemanticSearch(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${useSemanticSearch ? 'bg-amber-400 text-slate-900 shadow' : 'text-stone-400 hover:text-stone-200'}`}
                  >
                    <Sparkles size={11} /> AI Semantic
                  </button>
                </div>
                {semanticResults && (
                  <button
                    onClick={() => { setSemanticResults(null); fetchPublications(false); }}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    ✕ Clear AI Results
                  </button>
                )}
              </div>
            </div>

            {/* Search bar */}
            <div className="max-w-3xl">
              <SearchBar
                value={isAiSearch ? aiQuery : localSearch}
                onChange={(val) => isAiSearch ? setAiQuery(val) : setLocalSearch(val)}
                onSearch={isAiSearch ? handleAiSearch : () => {
                  handleFilterChange('q', localSearch);
                  fetchPublications(false);
                }}
                isAiMode={isAiSearch}
                onToggleAi={() => setIsAiSearch(!isAiSearch)}
                aiThinking={aiThinking}
                suggestions={suggestions}
                onSelectSuggestion={(term) => {
                  if (isAiSearch) {
                    setAiQuery(term);
                  } else {
                    setLocalSearch(term);
                    handleFilterChange('q', term);
                  }
                  setSuggestions([]);
                }}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
              />
            </div>

            {/* Quick stat pills */}
            <div className="flex flex-wrap gap-2 mt-5">
              {[
                { label: 'Open Access', color: 'bg-green-900/50 text-green-300 border-green-800/50' },
                { label: 'Gutenberg Classics', color: 'bg-amber-900/40 text-amber-300 border-amber-800/40' },
                { label: 'Peer-Reviewed', color: 'bg-purple-900/40 text-purple-300 border-purple-800/40' },
                { label: 'Zimbabwe Authored', color: 'bg-orange-900/40 text-orange-300 border-orange-800/40' },
              ].map(({ label, color }) => (
                <span key={label} className={`text-[11px] font-bold px-3 py-1 rounded-full border ${color}`}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle size={24} className="text-red-500" />
              <p className="font-medium">{error}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
               <button className="px-4 py-2 bg-white border border-red-200 text-red-700 font-bold hover:bg-red-50 rounded-xl transition-colors shadow-sm" onClick={() => fetchPublications(false)}>Try Again</button>
               {error.includes('Gutenberg') && <Link to="/ai-tools" className="px-4 py-2 bg-red-600 text-white font-bold hover:bg-red-700 rounded-xl transition-colors shadow-sm">Explore AI Tools</Link>}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 bg-white border border-stone-200 rounded-2xl px-5 py-3.5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-green-800 uppercase tracking-widest">
              {(1000000 + totalCount).toLocaleString()}
            </span>
            <span className="text-xs text-stone-400 font-medium">titles indexed</span>
            <div className="h-4 w-px bg-stone-200" />
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
              <button
                className={`p-1.5 rounded-md transition-all ${viewMode === 'tile' ? 'bg-white text-green-800 shadow-sm' : 'text-stone-400 hover:text-stone-700'}`}
                onClick={() => setViewMode('tile')} title="Tile View"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-green-800 shadow-sm' : 'text-stone-400 hover:text-stone-700'}`}
                onClick={() => setViewMode('grid')} title="Compact Grid"
              >
                <Sparkles size={15} />
              </button>
              <button
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-green-800 shadow-sm' : 'text-stone-400 hover:text-stone-700'}`}
                onClick={() => setViewMode('list')} title="List View"
              >
                <ListIcon size={15} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Sort</span>
            <select
              className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-bold text-stone-700 outline-none focus:border-green-700 focus:ring-2 ring-green-700/15 transition-all"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {filters.q && <option value="relevance">Relevance</option>}
              <option value="title">Title (A–Z)</option>
              <option value="newest">Newest</option>
              <option value="rating">Rating</option>
              <option value="downloads">Most Read</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {filters.source === 'Research' && !loading && publications.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 bg-white rounded-3xl border border-amber/20 overflow-hidden shadow-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber/10 text-amber font-bold text-[10px] uppercase tracking-widest rounded-full mb-4">
                  <Database size={12} />
                  Institutional Integration
                </div>
                <h3 className="text-2xl font-black text-soil mb-4 leading-tight">
                  No local research synced yet.
                </h3>
                <p className="text-clay mb-8 text-sm leading-relaxed">
                  Connect your institutional DSpace repository to automatically synchronize theses, journals, and local research papers with the DARE Open Access library.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link 
                    to="/dspace" 
                    className="px-6 py-3 bg-soil text-white font-bold rounded-xl hover:bg-soil/90 shadow-lg shadow-soil/20 transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={18} />
                    Connect DSpace
                  </Link>
                  <Link 
                    to="/help" 
                    className="px-6 py-3 bg-white border border-border text-soil font-bold rounded-xl hover:bg-bg-base transition-all"
                  >
                    Integration Guide
                  </Link>
                </div>
              </div>
              <div className="bg-bg-base p-8 flex items-center justify-center border-l border-border/50">
                 <div className="relative w-full max-w-xs aspect-square">
                    <div className="absolute inset-0 bg-amber/10 rounded-full animate-pulse" />
                    <div className="absolute inset-4 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center p-6 text-center">
                       <Database size={48} className="text-amber mb-4" />
                       <div className="h-2 w-24 bg-slate-100 rounded-full mb-2" />
                       <div className="h-2 w-16 bg-slate-100 rounded-full mb-6" />
                       <div className="flex gap-2">
                          <div className="w-8 h-8 bg-amber/20 rounded-lg" />
                          <div className="w-8 h-8 bg-amber/20 rounded-lg" />
                          <div className="w-8 h-8 bg-amber/20 rounded-lg" />
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {loading && publications.length === 0 ? (
          <div className={viewMode === 'list'
            ? "bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100"
            : `grid gap-4 ${viewMode === 'tile' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`
          }>
            {Array(viewMode === 'list' ? 8 : 12).fill(0).map((_, i) => (
              viewMode === 'list' ? (
                <div key={i} className="px-4 py-4 animate-pulse flex gap-4">
                  <div className="w-4 h-4 bg-slate-100 rounded mt-1 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-1/4" />
                    <div className="h-5 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-4/5" />
                  </div>
                </div>
              ) : (
                <BookCard key={i} loading={true} variant={viewMode} />
              )
            ))}
          </div>
        ) : filteredPublications.length > 0 ? (
          viewMode === 'list' ? (
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
              {filteredPublications.map(book => (
                <LibraryListRow
                  key={book.id}
                  book={book}
                  progress={bookProgress[book.id] || 0}
                />
              ))}
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === 'tile' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
              {filteredPublications.map(book => (
                <BookCard
                  key={book.id}
                  publication={book}
                  variant={viewMode}
                  progress={bookProgress[book.id] || 0}
                />
              ))}
            </div>
          )
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl shadow-inner flex items-center justify-center text-slate-400 mb-6 border border-slate-100">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No books found</h3>
            <p className="text-slate-500 max-w-sm text-base">
              We couldn't find any resources matching your current search or filters.
            </p>
            <button
              onClick={() => { setLocalSearch(''); setLocalCategory('All'); clearFilters(); }}
              className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-base hover:bg-slate-800 hover:-translate-y-0.5 transition-all shadow-md"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Infinite Scroll Sentinel */}
        <div ref={loadMoreRef} className="py-12 flex justify-center w-full">
          {loading && publications.length > 0 && (
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-full shadow-sm text-sm font-bold text-slate-600">
              <div className="w-4 h-4 border-2 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
              <span>Loading more titles...</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
