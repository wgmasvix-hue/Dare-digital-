import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, Download, Share2, Bookmark, ExternalLink, Copy, Check, 
  Loader2, Moon, Sun, Filter, ChevronLeft, ChevronRight, Search,
  Grid, List, LayoutGrid, Info, ShieldCheck, Globe, Sparkles,
  Zap, AlertCircle
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Toast from '../components/ui/Toast';

import SearchBar from '../components/library/SearchBar';
import FilterPanel from '../components/library/FilterPanel';
import BookCard from '../components/library/BookCard';
import { supabase } from '../lib/supabase';
import { transformBook, transformBooks, BOOK_SELECT, OPENSTAX_CURATED } from '../lib/transformBook';
import { ALL_ADDITIONAL_OER } from '../lib/oerCatalog';

const ALL_LOCAL_OER = [...OPENSTAX_CURATED, ...ALL_ADDITIONAL_OER];

// ── Design System ─────────────────────────────────────────────
// Styles moved to global index.css

// ── Data ─────────────────────────────────────────────────────
const DOMAINS = [
  { code: "D1",  name: "Foundations of Education",     segment: "teachers", icon: "🎓" },
  { code: "D2",  name: "Curriculum & Instruction",     segment: "teachers", icon: "📚"  },
  { code: "D3",  name: "Educational Management",       segment: "teachers", icon: "🏫"  },
  { code: "D4",  name: "Agriculture & Natural Resources", segment: "vocational", icon: "🌱" },
  { code: "D5",  name: "Food Technology & Nutrition",  segment: "vocational", icon: "🧪" },
  { code: "D6",  name: "Construction & Built Environment", segment: "vocational", icon: "🏗️"  },
  { code: "D7",  name: "Business & Entrepreneurship",  segment: "vocational", icon: "💼"  },
  { code: "D8",  name: "ICT & Digital Skills",         segment: "vocational", icon: "💻"  },
  { code: "D9",  name: "Health Sciences",              segment: "vocational", icon: "🩺"  },
  { code: "D10", name: "Research & Academic Skills",   segment: "both",      icon: "🔬" },
];

const RESOURCE_TYPES = [
  { code: "textbook",         label: "Textbook",          color: "#2563EB" }, // Blue 600
  { code: "journal_article",  label: "Journal Article",   color: "#0D9488" }, // Teal 600
  { code: "curriculum_guide", label: "Curriculum Guide",  color: "#B45309" }, // Amber 700
  { code: "practical_manual", label: "Practical Manual",  color: "#059669" }, // Emerald 600
  { code: "case_study",       label: "Case Study",        color: "#7C3AED" }, // Violet 600
  { code: "policy_document",  label: "Policy Document",   color: "#DC2626" }, // Red 600
  { code: "multimedia",       label: "Multimedia",        color: "#0284C7" }, // Sky 600
  { code: "african_context",  label: "African Context",   color: "#D97706" }, // Amber 600
];

const SOURCES = [
  "OpenAlex", "CORE", "AJOL", "African Minds", "OpenStax",
  "PubMed Central", "arXiv", "Zenodo", "Research4Life", "MIT OCW"
];

const SKILLS = [
  "Critical Thinking", "Data Analysis", "Curriculum Design", "Digital Literacy",
  "Entrepreneurship", "Project Management", "Research Methods", "Communication",
  "Problem Solving", "Technical Writing"
];

// Helper to map OER faculty/subject to Domains
// Moved to lib/transformBook.js

// Transform OER data to Mock Resource format
// Moved to lib/transformBook.js

// ── Sub-components ────────────────────────────────────────────

const Badge = ({ text, color = "#475569", small = false }) => (
  <span 
    className="inline-flex items-center rounded-md font-bold uppercase tracking-wider whitespace-nowrap backdrop-blur-md"
    style={{
      padding: small ? "2px 7px" : "4px 10px",
      fontSize: small ? "10px" : "11px",
      backgroundColor: `${color}15`,
      color: color,
      border: `1px solid ${color}30`,
      fontFamily: "var(--font-body)",
    }}
  >
    {text}
  </span>
);

const TagDot = ({ color }) => (
  <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
);

const ResourceDetail = ({ resource, onClose, onToast, aiDataSaverActive }) => {
  if (!resource) return null;
  const typeInfo = RESOURCE_TYPES.find(t => t.code === resource.type) || RESOURCE_TYPES[0];
  const domainInfo = DOMAINS.find(d => d.code === resource.domain);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiSummary, setAiSummary] = useState(resource.dara_summary || null);
  const [error, setError] = useState(null);

  // Auto-generate if _showAiInsight is true and summary is missing
  useEffect(() => {
    if (resource._showAiInsight && !aiSummary && !generating) {
      handleGenerateSummary();
    }
  }, [resource._showAiInsight]);

  const handleGenerateSummary = async () => {
    if (generating) return;
    setGenerating(true);
    setError(null);
    
    try {
      const prompt = `You are an expert academic librarian. Provide a concise, high-impact summary (max 100 words) for the following book/resource. 
      Focus on key takeaways and why it's important for students in the field of ${domainInfo?.name || 'Education'}.
      
      Title: ${resource.title}
      Authors: ${resource.authors.join(", ")}
      Abstract: ${resource.abstract}
      
      Format the response as a single paragraph of text.`;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      const text = response.text;
      setAiSummary(text);
      onToast("AI Insight generated successfully", "success");
    } catch (err) {
      console.error("Error generating AI summary:", err);
      setError("Failed to generate AI insight. Please try again.");
      onToast("AI generation failed", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCitation = () => {
    const citation = `${resource.authors.join(", ")} (${resource.year}). ${resource.title}. ${resource.journal || resource.publisher_name}.`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    onToast("Citation copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToCollection = () => {
    onToast("Resource added to 'My Collection'");
  };

  const defaultCover = "https://ais-pre-u75ndaxnqrzxvc2lbelr6a-10195607233.europe-west1.run.app/dare-theme.jpg";
  const displayCover = resource.cover_image_url || defaultCover;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 shadow-2xl rounded-[2rem] overflow-hidden flex flex-col max-w-5xl w-full max-h-[90vh]"
      >
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          {/* Left Panel - Visual/Meta */}
          <div className="md:w-1/3 bg-slate-50 dark:bg-slate-800/50 p-8 border-r border-slate-100 dark:border-slate-800 flex flex-col overflow-y-auto">
            <div className="w-full aspect-[3/4] bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 mb-8 overflow-hidden group relative">
              <img src={displayCover} alt={resource.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge text={typeInfo.label} color={typeInfo.color} />
                {resource.isZimbabwe && <Badge text="🇿🇼 Zimbabwe" color="#C5973A" />}
                {resource.isPeerReviewed && <Badge text="Peer Reviewed" color="#1A7A4A" />}
              </div>
              
              <div className="space-y-4 pt-4">
                {[
                  { label: "Year", val: resource.year, icon: Globe },
                  { label: "Source", val: resource.source, icon: ExternalLink },
                  { label: "Citations", val: resource.citations, icon: BookOpen },
                  { label: "Access", val: resource.isOpenAccess ? "Dare Access" : "Licensed", icon: ShieldCheck },
                ].map(({ label, val, icon: Icon }) => (
                  <div key={label} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-slate-400 font-medium">
                      <Icon size={14} />
                      <span>{label}</span>
                    </div>
                    <span className="text-slate-900 dark:text-white font-bold">{val}</span>
                  </div>
                ))}
              </div>

              {resource.zimche_programme_codes?.length > 0 && (
                <div className="pt-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">ZIMCHE Programmes</h4>
                  <div className="flex flex-wrap gap-2">
                    {resource.zimche_programme_codes.map(code => (
                      <span key={code} className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded text-[10px] font-bold border border-amber-100 dark:border-amber-900/30">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto pt-8">
               <button 
                onClick={onClose}
                className="w-full py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
              >
                Close Details
              </button>
            </div>
          </div>

          {/* Right Panel - Content */}
          <div className="md:w-2/3 p-8 md:p-12 overflow-y-auto flex flex-col bg-white dark:bg-slate-900">
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-[0.2em]">
                  <span className="w-8 h-px bg-amber-500" />
                  {domainInfo?.name || "General Resource"}
                </div>
                {(aiDataSaverActive || resource._showAiInsight) && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold border border-emerald-100 dark:border-emerald-900/30">
                    <Sparkles size={10} />
                    <span>AI DATA SAVER ACTIVE</span>
                  </div>
                )}
              </div>
              
              <h2 className="font-serif text-4xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
                {resource.title}
              </h2>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="text-slate-900 dark:text-white font-bold">{resource.authors.join(", ")}</p>
                  <p className="text-slate-400 text-xs">{resource.publisher_name || resource.source}</p>
                </div>
              </div>
              
              {/* AI Summary Section - Prominent to save data */}
              <div className={`bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 mb-8 border border-slate-100 dark:border-slate-800 relative overflow-hidden group transition-all ${generating ? 'animate-pulse' : ''}`}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles size={64} className="text-amber-500" />
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-amber-500 rounded-lg text-white">
                    <Sparkles size={16} />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">AI Quick Insight</h4>
                  {aiSummary && (
                    <span className="ml-auto text-[10px] font-medium text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                      Saves ~95% Data
                    </span>
                  )}
                </div>

                {generating ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <Loader2 size={24} className="animate-spin text-amber-500" />
                    <p className="text-sm text-slate-500 font-medium">DARA AI is analyzing this resource...</p>
                  </div>
                ) : aiSummary ? (
                  <>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg font-serif italic">
                      "{aiSummary}"
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Key Takeaway</span>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Essential for {domainInfo?.name || 'this field'}.</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Reading Time</span>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">~2 min summary</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 gap-4">
                    <p className="text-sm text-slate-500 text-center max-w-xs">
                      No AI summary available yet. Generate one now to save data and get a quick overview.
                    </p>
                    <button 
                      onClick={handleGenerateSummary}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95"
                    >
                      <Zap size={14} /> Generate AI Insight
                    </button>
                    {error && (
                      <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase">
                        <AlertCircle size={12} />
                        {error}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {resource.learning_objectives?.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Key Learning Objectives</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {resource.learning_objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Check size={14} className="text-emerald-500 mt-1 flex-shrink-0" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-auto pt-10 flex flex-col sm:flex-row gap-4">
              <Link 
                to={`/reader/${resource.id}`}
                className={`flex-[2] py-5 rounded-2xl font-bold text-center transition-all flex items-center justify-center gap-3 no-underline active:scale-[0.98] ${aiDataSaverActive ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700' : 'bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/20'}`}
              >
                <BookOpen size={22} /> 
                <span className="text-lg">Read Full Text</span>
                {aiDataSaverActive && <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full ml-2">DATA INTENSIVE</span>}
              </Link>
              <div className="flex gap-3">
                <button 
                  onClick={handleAddToCollection}
                  className="flex-1 sm:flex-none px-8 py-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95"
                  title="Save to Collection"
                >
                  <Bookmark size={22} />
                </button>
                <button 
                  onClick={handleCopyCitation}
                  className="flex-1 sm:flex-none px-8 py-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95"
                  title="Copy Citation"
                >
                  {copied ? <Check size={22} className="text-emerald-500" /> : <Copy size={22} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Main App ──────────────────────────────────────────────────
export default function DareLibrary() {
  // ── State with Persistence ──
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const [activeDomain, setActiveDomain] = useState(null); // Legacy support
  const [activeSkill, setActiveSkill] = useState(null); // Legacy support
  
  const [searchQuery, setSearchQuery] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('dare_searchQuery')) || ""; } catch { return ""; }
  });
  
  const [activeFilters, setActiveFilters] = useState(() => {
    try { 
      return JSON.parse(sessionStorage.getItem('dare_activeFilters')) || {
        q: "",
        subjects: [],
        level: "All",
        access: "All",
        format: "PDF",
        yearFrom: "",
        yearTo: "",
        isbn: "",
        zimAuthored: false,
        africanContext: false,
        peerReviewed: false,
        university: "All",
        source: "All"
      }; 
    } catch { 
      return {
        q: "",
        subjects: [],
        level: "All",
        access: "Purchased",
        format: "PDF",
        yearFrom: "",
        yearTo: "",
        isbn: "",
        zimAuthored: false,
        africanContext: false,
        peerReviewed: false,
        university: "All",
        source: "All"
      }; 
    }
  });
  
  const [activeView, setActiveView] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('dare_activeView')) || "browse"; } catch { return "browse"; }
  });

  const [isAiMode, setIsAiMode] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef(null);

  const [selectedResource, setSelectedResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [resources, setResources] = useState([]);
  const [collections, setCollections] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({ domainStats: [], typeStats: [] });

  const filteredResources = resources.filter(r => {
    // 1. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches = r.title.toLowerCase().includes(q) ||
                      r.authors.some(a => a.toLowerCase().includes(q)) ||
                      r.abstract.toLowerCase().includes(q);
      if (!matches) return false;
    }

    // 2. Sidebar Filters (FilterPanel)
    if (activeFilters.subjects && activeFilters.subjects.length > 0) {
      // Check if resource domain matches any of the selected subjects (which are domain names)
      // We need to map domain names back to codes or check against domain name
      // r.domain is a code (e.g. D1). DOMAINS has code and name.
      // activeFilters.subjects contains names (e.g. "Foundations of Education")
      const domainInfo = DOMAINS.find(d => d.code === r.domain);
      const subjectMatch = activeFilters.subjects.includes(domainInfo?.name) || activeFilters.subjects.includes(r.subject);
      if (!subjectMatch) return false;
    }

    if (activeFilters.level !== 'All' && r.level !== activeFilters.level) return false;
    if (activeFilters.access !== 'All') {
       if (activeFilters.access === 'Dare Access' && !r.isOpenAccess) return false;
       if (activeFilters.access === 'Purchased' && r.isOpenAccess) return false;
       if (activeFilters.access === 'Free' && r.access_model !== 'free') return false;
    }
    if (activeFilters.format !== 'All' && r.format !== activeFilters.format.toLowerCase()) return false;
    
    if (activeFilters.yearFrom && r.year < parseInt(activeFilters.yearFrom)) return false;
    if (activeFilters.yearTo && r.year > parseInt(activeFilters.yearTo)) return false;
    
    if (activeFilters.isbn && (!r.isbn || !r.isbn.includes(activeFilters.isbn))) return false;
    if (activeFilters.university !== 'All' && r.institution_id !== activeFilters.university) return false;
    
    if (activeFilters.zimAuthored && !r.isZimbabwe) return false;
    if (activeFilters.africanContext && !r.isAfrican) return false;
    if (activeFilters.peerReviewed && !r.isPeerReviewed) return false;

    if (activeFilters.source !== 'All') {
      if (activeFilters.source === 'Dare Library') {
        if (!r.source.includes('Dare')) return false;
      } else if (activeFilters.source === 'Partner Resources') {
        if (r.source.includes('Dare')) return false;
      } else if (activeFilters.source === 'Buku') {
        if (!r.source.includes('Buku')) return false;
      } else {
        if (!r.source.toLowerCase().includes(activeFilters.source.toLowerCase())) return false;
      }
    }

    return true;
  });

  // Infinite Scroll Observer
  useEffect(() => {
    if (activeView !== 'browse') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          setCurrentPage(p => p + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loading, hasMore, activeView]);

  useEffect(() => {
    if (currentPage * itemsPerPage >= filteredResources.length) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  }, [currentPage, filteredResources.length]);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    const facultyParam = params.get('faculty');
    
    if (filterParam === 'african') {
      setActiveFilters(prev => ({ ...prev, africanContext: true }));
      setActiveView('browse');
    }
    
    if (facultyParam) {
      // Map faculty param to subject name if needed, or just set it
      // For now, let's just set the subject filter
      const facultyMap = {
        'stem': 'ICT & Digital Skills',
        'agriculture': 'Agriculture & Natural Resources',
        'health': 'Health Sciences',
        'business': 'Business & Entrepreneurship',
        'education': 'Foundations of Education',
        'engineering': 'Construction & Built Environment',
        'law': 'Business & Entrepreneurship',
        'humanities': 'Research & Academic Skills',
        'ai-future-tech': 'ICT & Digital Skills'
      };
      
      const mappedSubject = facultyMap[facultyParam];
      if (mappedSubject) {
        setActiveFilters(prev => ({ ...prev, subjects: [mappedSubject] }));
        setActiveView('browse');
      }
    }
  }, [location.search]);

  useEffect(() => {
    async function fetchLibraryData() {
      try {
        setLoading(true);
        
        // 1. Fetch Books
        const { data: dbBooks, error } = await supabase
          .from('books')
          .select(BOOK_SELECT)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const dbTransformed = (dbBooks || []).map(transformBook).filter(Boolean);
        
        // Merge with local OER (Partner Resources)
        const seenTitles = new Set(dbTransformed.map(b => b.title?.toLowerCase()));
        const uniqueLocalOER = ALL_LOCAL_OER
          .filter(b => !seenTitles.has(b.title?.toLowerCase()))
          .map(transformBook);
        
        const transformed = [...dbTransformed, ...uniqueLocalOER];
        setResources(transformed);

        // 2. Generate Collections from Subjects
        const subjects = {};
        transformed.forEach(b => {
          subjects[b.domain] = (subjects[b.domain] || 0) + 1;
        });
        
        const generatedCollections = Object.entries(subjects).map(([domainId, count], i) => {
          const domain = DOMAINS.find(d => d.code === domainId);
          return {
            id: `c${i}`,
            name: `${domain?.name || 'General'} Collection`,
            domain: domainId,
            count,
            isFeature: i < 3
          };
        });
        setCollections(generatedCollections);

        // 3. Analytics Data
        const domainStats = DOMAINS.map(d => ({
          name: d.name,
          count: transformed.filter(r => r.domain === d.code).length
        })).filter(d => d.count > 0);

        const typeStats = RESOURCE_TYPES.map(t => ({
          name: t.label,
          value: transformed.filter(r => r.type === t.code).length
        })).filter(t => t.value > 0);

        setAnalyticsData({ domainStats, typeStats });

      } catch (err) {
        console.error('Error fetching library data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLibraryData();
  }, []);

  // ── Persistence Effects ──
  useEffect(() => { 
    sessionStorage.setItem('dare_searchQuery', JSON.stringify(searchQuery)); 
    setCurrentPage(1);
  }, [searchQuery]);
  useEffect(() => { 
    sessionStorage.setItem('dare_activeFilters', JSON.stringify(activeFilters)); 
    setCurrentPage(1);
  }, [activeFilters]);
  useEffect(() => { sessionStorage.setItem('dare_activeView', JSON.stringify(activeView)); }, [activeView]);

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
  };

  const handleFilterChange = (key, value) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setActiveFilters({
      q: "",
      subjects: [],
      level: "All",
      access: "All",
      format: "PDF",
      yearFrom: "",
      yearTo: "",
      isbn: "",
      zimAuthored: false,
      africanContext: false,
      peerReviewed: false,
      university: "All",
      source: "All"
    });
    setSearchQuery("");
  };

  const handleRequestDigitization = () => {
    console.log("Request digitization");
    showToast("Digitization request feature coming soon!");
  };

  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const paginatedResources = filteredResources.slice(0, currentPage * itemsPerPage);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleAiSearch = async (query) => {
    if (!query.trim()) return;
    setAiThinking(true);
    setAiResponse(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are the DARA AI Librarian for a Zimbabwean educational library. 
        A user is asking: "${query}"
        
        Based on your knowledge of educational resources, provide a helpful, concise answer. 
        If they are looking for specific topics, suggest what they should look for in our library.
        Our library focuses on: ${DOMAINS.map(d => d.name).join(", ")}.
        
        Keep the response under 150 words and focus on saving the user's data by providing the most essential information directly.`,
      });
      
      setAiResponse(response.text);
      showToast("AI Librarian has an answer for you", "success");
    } catch (err) {
      console.error("AI Search Error:", err);
      showToast("AI Search failed", "error");
    } finally {
      setAiThinking(false);
    }
  };

  const stats = {
    total: resources.length,
    african: resources.filter(r => r.isAfrican).length,
    zimbabwe: resources.filter(r => r.isZimbabwe).length,
    purchased: resources.filter(r => r.access_model === 'licensed').length,
  };

  const filterCount = Object.values(activeFilters).filter(v => 
    Array.isArray(v) ? v.length > 0 : (v !== "All" && v !== "" && v !== false)
  ).length;

  return (
    <div className="dare-library-wrapper" style={{ background: 'var(--color-bg-base)', color: 'var(--text-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── TOP NAV ── */}
      <nav 
        aria-label="Main Navigation"
        style={{
          height: 56, background: "var(--navy)", display: "flex", alignItems: "center",
          padding: "0 20px", gap: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          position: "relative", zIndex: 100, flexShrink: 0,
        }}
      >
        {/* Hamburger */}
        <button 
          onClick={() => setSidebarOpen(s => !s)} 
          aria-expanded={sidebarOpen}
          aria-label="Toggle Sidebar"
          style={{
            background: "none", border: "none", cursor: "pointer", color: "white",
            display: "flex", flexDirection: "column", gap: 4, padding: 4,
          }}
        >
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 20, height: 2, background: sidebarOpen && i === 1 ? "var(--gold-light)" : "white",
              borderRadius: 1, transition: "background 0.2s",
            }} />
          ))}
        </button>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: "linear-gradient(135deg, var(--teal), var(--teal-light))",
            borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "white", fontFamily: "'Playfair Display', serif",
            letterSpacing: "0.5px",
          }}>D</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "white", fontFamily: "'Playfair Display', serif", letterSpacing: "0.02em", lineHeight: 1.1 }}>
              Dare
            </div>
            <div style={{ fontSize: 9, color: "#8BB4D8", letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: 1 }}>
              Local PDF Library
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div style={{
          flex: 1, maxWidth: 560, position: "relative",
          margin: "0 auto",
        }}>
          <SearchBar 
            value={searchQuery}
            onChange={handleSearch}
            onSearch={isAiMode ? handleAiSearch : handleSearch}
            placeholder="Search resources, authors, subjects…"
            className="navbar-search"
            variant="dark"
            isAiMode={isAiMode}
            onToggleAi={() => setIsAiMode(!isAiMode)}
            aiThinking={aiThinking}
          />
        </div>

        {/* Nav items - Hidden on mobile */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 8, marginLeft: "auto", alignItems: "center" }}>
            <Link to="/teachers-colleges" style={{
              color: "#A8C4E0", fontSize: 13, fontWeight: 500, textDecoration: 'none',
              padding: "6px 12px", borderRadius: "var(--radius-sm)", transition: "all 0.2s"
            }} className="hover:text-white hover:bg-white/10">Teachers Colleges</Link>
            <Link to="/research" style={{
              color: "#A8C4E0", fontSize: 13, fontWeight: 500, textDecoration: 'none',
              padding: "6px 12px", borderRadius: "var(--radius-sm)", transition: "all 0.2s"
            }} className="hover:text-white hover:bg-white/10">Zim Research</Link>
          </div>
        )}

        {/* Avatar */}
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--gold), var(--teal))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer",
          flexShrink: 0, border: "2px solid rgba(255,255,255,0.2)",
        }}>W</div>
      </nav>

      {/* ── BODY ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── SIDEBAR ── */}
        <FilterPanel 
          filters={activeFilters}
          subjects={DOMAINS.map(d => d.name)} // Pass domain names as subjects
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onRequestDigitization={handleRequestDigitization}
          isOpen={sidebarOpen}
          onToggle={setSidebarOpen}
          className={isMobile ? "mobile-sidebar" : ""}
        />

        {/* ── MAIN CONTENT ── */}
        <main style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }} className="bg-slate-50/30 dark:bg-slate-900/30">
          
          {activeView === "browse" && (
            <>
              {/* Hero Section */}
              <div className="relative overflow-hidden bg-slate-900 py-20 sm:py-32">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px] animate-pulse" />
                  <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:32px_32px]" />
                </div>
                
                <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
                      <Sparkles size={12} />
                      <span>The Future of Learning</span>
                    </div>
                    
                    <h1 className="font-serif text-5xl sm:text-7xl font-bold text-white tracking-tight mb-8 leading-[1.1]">
                      DARE Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Library</span>
                    </h1>
                    
                    <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-12 font-medium leading-relaxed opacity-90">
                      Learn Smarter. Anywhere. <br className="hidden sm:block" />
                      Access a curated collection of premium research, textbooks, and interactive resources tailored for the African context.
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-6 mb-16">
                      <div className="flex items-center gap-3 text-slate-400">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                          <Globe size={20} />
                        </div>
                        <div className="text-left">
                          <div className="text-white text-sm font-bold">Global Reach</div>
                          <div className="text-[10px] uppercase tracking-wider">OER Resources</div>
                        </div>
                      </div>
                      <div className="w-px h-10 bg-white/10 hidden sm:block" />
                      <div className="flex items-center gap-3 text-slate-400">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-amber-400">
                          <Sparkles size={20} />
                        </div>
                        <div className="text-left">
                          <div className="text-white text-sm font-bold">AI Powered</div>
                          <div className="text-[10px] uppercase tracking-wider">Smart Summaries</div>
                        </div>
                      </div>
                      <div className="w-px h-10 bg-white/10 hidden sm:block" />
                      <div className="flex items-center gap-3 text-slate-400">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
                          <ShieldCheck size={20} />
                        </div>
                        <div className="text-left">
                          <div className="text-white text-sm font-bold">Verified</div>
                          <div className="text-[10px] uppercase tracking-wider">Peer Reviewed</div>
                        </div>
                      </div>
                    </div>

                    {/* Search Bar Integration */}
                    <div className="max-w-3xl mx-auto relative z-30">
                      <SearchBar 
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onSearch={handleSearch}
                        isAiMode={isAiMode}
                        onToggleAi={() => setIsAiMode(!isAiMode)}
                        aiThinking={aiThinking}
                        suggestions={searchSuggestions}
                        onSelectSuggestion={(term) => {
                          setSearchQuery(term);
                          handleSearch(term);
                        }}
                        showSuggestions={showSuggestions}
                        setShowSuggestions={setShowSuggestions}
                      />
                    </div>
                  </motion.div>
                </div>
                
                {/* Decorative bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50/50 dark:from-slate-900/50 to-transparent pointer-events-none" />
              </div>

              {/* Horizontal Tabs (Moved below Hero) */}
              <div style={{ 
                padding: "0 24px", 
                borderBottom: "1px solid var(--color-border)",
                background: "transparent",
                position: "sticky",
                top: 0,
                zIndex: 50
              }} className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70">
                <div className="tabs-pill py-4 max-w-7xl mx-auto">
                  {[
                    { id: "browse", label: "Browse Library" },
                    { id: "collections", label: "Subject Collections" },
                    { id: "analytics", label: "Usage Analytics" },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveView(tab.id)}
                      className={`tab-pill ${activeView === tab.id ? 'active' : ''}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* AI Search Response */}
              <AnimatePresence>
                {aiResponse && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mx-6 mt-6 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-3xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Sparkles size={120} className="text-amber-500" />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-amber-500 rounded-lg text-white">
                          <Sparkles size={16} />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-amber-900 dark:text-amber-100">AI Librarian Response</h4>
                      </div>
                      <button 
                        onClick={() => setAiResponse(null)}
                        className="text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-serif italic text-lg">
                      {aiResponse}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      <Zap size={12} />
                      <span>AI ASSISTANCE ACTIVE • DATA SAVED</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stats bar */}
              <div style={{
                background: "var(--color-bg-subtle)", borderBottom: "1px solid var(--color-border)",
                padding: isMobile ? "16px" : "20px 24px", 
                display: "flex", gap: isMobile ? 16 : 32, 
                alignItems: isMobile ? "flex-start" : "center", 
                flexDirection: isMobile ? "column" : "row",
                flexShrink: 0,
              }}>
                <div style={{ display: "flex", gap: isMobile ? 16 : 32, flexWrap: "wrap", flex: 1 }}>
                  {[
                    { label: "Total Resources", value: stats.total.toLocaleString(), color: "var(--text-main)", icon: "📚" },
                    { label: "Purchased PDFs", value: stats.purchased.toLocaleString(), color: "var(--color-teal)", icon: "📄" },
                    { label: "Zimbabwe Specific", value: stats.zimbabwe.toLocaleString(), color: "var(--color-gold)", icon: "🇿🇼" },
                    { label: "African Context", value: stats.african.toLocaleString(), color: "var(--color-teal-light)", icon: "🌍" },
                  ].map(stat => (
                    <div key={stat.label} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-black/5 text-lg">
                        {stat.icon}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-main)", fontFamily: "var(--font-display)", lineHeight: 1 }}>
                          {stat.value}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{stat.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                  {/* Active filters pills */}
                  {searchQuery && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6,
                      background: "var(--color-teal)", borderRadius: 20, padding: "4px 10px",
                      fontSize: 12, color: "white",
                    }}>
                      🔍 "{searchQuery}"
                      <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 12, padding: 0, lineHeight: 1 }}>✕</button>
                    </div>
                  )}
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {loading ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{
                          width: 12, height: 12,
                          borderWidth: "2px", borderStyle: "solid",
                          borderRightColor: "var(--color-border)", borderBottomColor: "var(--color-border)", borderLeftColor: "var(--color-border)",
                          borderTopColor: "var(--color-teal)",
                          borderRadius: "50%", animation: "spin 0.8s linear infinite"
                        }} />
                        Searching…
                      </span>
                    ) : (
                      `${filteredResources.length} result${filteredResources.length !== 1 ? "s" : ""}`
                    )}
                  </span>
                </div>
              </div>

              {/* Resource grid */}
              <div className="p-6 flex-1">
                {filteredResources.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <div className="text-5xl mb-4">📭</div>
                    <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white mb-2">No resources found</h3>
                    <p className="text-sm">Try adjusting your filters or search query</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                      <AnimatePresence mode="popLayout">
                        {paginatedResources.map((r, index) => (
                          <BookCard
                            key={`${r.id}-${index}`}
                            publication={r}
                            onOpen={setSelectedResource}
                            isSelected={selectedResource?.id === r.id}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                    
                    {/* Infinite Scroll Sentinel */}
                    <div ref={loadMoreRef} className="flex justify-center items-center py-12">
                      {hasMore && (
                        <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                          <Loader2 size={20} className="animate-spin text-amber-500" />
                          <span>Loading more resources...</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {activeView === "collections" && (
            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "var(--navy)", marginBottom: 6 }}>Purchased PDF Collections</h2>
                <p style={{ fontSize: 14, color: "var(--text-light)" }}>Locally purchased and licensed PDF resources for Zimbabwean institutions</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {collections.map(col => {
                  const domain = DOMAINS.find(d => d.code === col.domain);
                  return (
                    <div key={col.id} className="fade-in" style={{
                      background: "white", borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--border-light)",
                      overflow: "hidden", cursor: "pointer",
                      boxShadow: "var(--shadow-sm)",
                      transition: "box-shadow 0.2s, transform 0.2s",
                    }}
                    onClick={() => {
                      setActiveDomain(col.domain);
                      setActiveView("browse");
                      showToast(`Viewing collection: ${col.name}`);
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = "none"; }}
                    >
                      <div style={{ height: 6, background: `linear-gradient(90deg, var(--navy), var(--teal))` }} />
                      <div style={{ padding: "18px 18px 16px" }}>
                        {col.isFeature && <Badge text="Featured" color="#C5973A" small />}
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: "var(--navy)", margin: "10px 0 6px" }}>{col.name}</div>
                        <div style={{ fontSize: 13, color: "var(--text-light)", marginBottom: 14 }}>{domain?.icon} {domain?.name}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--teal)" }}>{col.count} resources</span>
                          <button style={{ background: "var(--navy)", color: "white", border: "none", borderRadius: "var(--radius)", padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>Open →</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Add collection CTA */}
                <div style={{
                  background: "transparent", borderRadius: "var(--radius-lg)",
                  border: "2px dashed var(--border)", padding: "32px 18px",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", cursor: "pointer", gap: 8,
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--navy)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  <div style={{ fontSize: 28 }}>＋</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-light)" }}>Create Collection</div>
                  <div style={{ fontSize: 12, color: "var(--text-light)", textAlign: "center" }}>Curate resources for your students</div>
                </div>
              </div>
            </div>
          )}

          {activeView === "analytics" && (
            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "var(--navy)", marginBottom: 6 }}>Content Analytics</h2>
                <p style={{ fontSize: 14, color: "var(--text-light)" }}>Harvest status, domain coverage, and usage insights</p>
              </div>

              {/* Harvest status cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
                {analyticsData.typeStats.map(src => (
                  <div key={src.name} style={{
                    background: "white", borderRadius: "var(--radius)",
                    border: "1px solid var(--border-light)", padding: "14px 16px",
                    boxShadow: "var(--shadow-sm)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)" }}>{src.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#1A7A4A", animation: "pulse 2s infinite" }} />
                        <span style={{ fontSize: 10, color: "#1A7A4A", fontWeight: 600, textTransform: "uppercase" }}>active</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "var(--navy)", marginBottom: 4 }}>{src.value.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: "var(--text-light)" }}>Total Records</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24 }}>
                {/* Domain coverage bar chart */}
                <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", padding: "20px 24px", boxShadow: "var(--shadow-sm)", height: 400 }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: "var(--navy)", marginBottom: 20 }}>
                    Resource Coverage by Competency Area
                  </div>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={analyticsData.domainStats} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 10}} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        cursor={{fill: 'transparent'}}
                      />
                      <Bar dataKey="count" fill="var(--navy)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Resource Types Pie Chart */}
                <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", padding: "20px 24px", boxShadow: "var(--shadow-sm)", height: 400 }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: "var(--navy)", marginBottom: 20 }}>
                    Distribution by Resource Type
                  </div>
                  <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                      <Pie
                        data={analyticsData.typeStats}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analyticsData.typeStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={RESOURCE_TYPES[index % RESOURCE_TYPES.length].color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── RESOURCE DETAIL PANEL ── */}
      {selectedResource && (
        <ResourceDetail 
          resource={selectedResource} 
          onClose={() => setSelectedResource(null)} 
          onToast={showToast}
          aiDataSaverActive={activeFilters.aiDataSaver}
        />
      )}

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
