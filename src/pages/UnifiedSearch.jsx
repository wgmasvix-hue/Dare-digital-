import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Sparkles, Book, Library, Globe, X, Loader2, BrainCircuit, HelpCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { unifiedSearch } from '../lib/search';
import { explainTopic, generateQuiz, summarize } from '../lib/ai';
import UnifiedResourceCard from '../components/library/UnifiedResourceCard';
import ReactMarkdown from 'react-markdown';

const UnifiedSearch = () => {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ books: [], koha: [], resources: [], research: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [aiContent, setAiContent] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState('explain'); // 'explain', 'quiz', 'summary'
  const [eduLevel, setEduLevel] = useState('Form 4');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || params.get('search');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [location.search]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const searchResponse = await unifiedSearch(searchQuery);
      setResults(searchResponse);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    performSearch(query);
  };

  const handleAskAI = async (resource, mode = 'explain') => {
    setSelectedResource(resource);
    setAiMode(mode);
    setIsAiLoading(true);
    setAiContent(null);

    try {
      let response;
      const context = `${resource.title} by ${resource.author || resource.author_names || 'Unknown'}. ${resource.description || resource.abstract || ''}`;
      
      if (mode === 'explain') {
        response = (await explainTopic(context, eduLevel)).text;
      } else if (mode === 'quiz') {
        response = await generateQuiz(context);
      } else if (mode === 'summary') {
        response = await summarize(context);
      }
      
      setAiContent(response);
    } catch (error) {
      setAiContent("I'm sorry, I couldn't process that request right now. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="text-center mb-12 p-12 rounded-[40px] relative overflow-hidden bg-slate-900 text-white shadow-2xl">
          {/* Real Book Background Image */}
          <div className="absolute inset-0 z-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=2000" 
              alt="Knowledge Search Background" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900" />
          </div>

          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Zimbabwe National <span className="text-amber-500">Knowledge Search</span>
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto mb-10 text-lg">
              Unified access to DARE digital books, DSpace research, and global Dare Access resources.
            </p>
            
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, author, or subject (e.g., 'Zimbabwean History', 'Physics')..."
                className="w-full px-8 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-inner focus:ring-2 focus:ring-amber-500 focus:bg-white focus:text-slate-900 outline-none text-lg transition-all pr-20 text-white placeholder:text-white/50"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="absolute right-3 top-3 p-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg shadow-amber-900/20"
              >
                {isLoading ? <Loader2 className="animate-spin" size={28} /> : <Search size={28} />}
              </button>
            </form>
          </div>
        </div>

        {/* Results Sections */}
        <div className="space-y-12">
          {/* Digital Books */}
          {results.books.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
                <Book className="text-amber-600" size={24} />
                <h2 className="text-2xl font-bold text-slate-900">Digital Books (DARE)</h2>
                <span className="ml-auto text-sm font-medium text-slate-500">{results.books.length} results</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.books.map(book => (
                  <UnifiedResourceCard key={book.id} resource={book} onAskAI={handleAskAI} />
                ))}
              </div>
            </section>
          )}

          {/* Research & Archives */}
          {results.research && results.research.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
                <FileText className="text-amber-600" size={24} />
                <h2 className="text-2xl font-bold text-slate-900">Research & Archives (DSpace)</h2>
                <span className="ml-auto text-sm font-medium text-slate-500">{results.research.length} results</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.research.map(item => (
                  <UnifiedResourceCard key={item.id} resource={item} onAskAI={handleAskAI} />
                ))}
              </div>
            </section>
          )}

          {/* Physical Books */}
          {results.koha && results.koha.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
                <Library className="text-emerald-600" size={24} />
                <h2 className="text-2xl font-bold text-slate-900">Physical Library (Koha)</h2>
                <span className="ml-auto text-sm font-medium text-slate-500">{results.koha.length} results</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.koha.map(book => (
                  <UnifiedResourceCard key={book.id} resource={book} onAskAI={handleAskAI} />
                ))}
              </div>
            </section>
          )}

          {/* Open Resources */}
          {results.resources && results.resources.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
                <Globe className="text-blue-600" size={24} />
                <h2 className="text-2xl font-bold text-slate-900">Dare Access Resources</h2>
                <span className="ml-auto text-sm font-medium text-slate-500">{results.resources.length} results</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.resources.map(res => (
                  <UnifiedResourceCard key={res.id} resource={res} onAskAI={handleAskAI} />
                ))}
              </div>
            </section>
          )}

          {!isLoading && query && results.books.length === 0 && (!results.research || results.research.length === 0) && (!results.koha || results.koha.length === 0) && (!results.resources || results.resources.length === 0) && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
              <Search className="mx-auto text-slate-300 mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No results found for "{query}"</h3>
              <p className="text-slate-500">Try adjusting your search terms or check back later.</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Tutor Modal */}
      <AnimatePresence>
        {selectedResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <BrainCircuit className="text-amber-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">DARA AI Tutor</h2>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Analyzing: {selectedResource.title}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedResource(null)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8">
                {/* AI Controls */}
                <div className="flex flex-wrap gap-3 mb-8">
                  <button 
                    onClick={() => handleAskAI(selectedResource, 'explain')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${aiMode === 'explain' ? 'bg-amber-600 text-white shadow-lg shadow-amber-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <HelpCircle size={18} />
                    Explain Topic
                  </button>
                  <button 
                    onClick={() => handleAskAI(selectedResource, 'summary')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${aiMode === 'summary' ? 'bg-amber-600 text-white shadow-lg shadow-amber-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <FileText size={18} />
                    Summarize
                  </button>
                  <button 
                    onClick={() => handleAskAI(selectedResource, 'quiz')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${aiMode === 'quiz' ? 'bg-amber-600 text-white shadow-lg shadow-amber-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Sparkles size={18} />
                    Generate Quiz
                  </button>

                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Level:</span>
                    <select 
                      value={eduLevel}
                      onChange={(e) => setEduLevel(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-medium outline-none"
                    >
                      <option value="Form 1">Form 1</option>
                      <option value="Form 4">Form 4</option>
                      <option value="Form 6">Form 6</option>
                      <option value="University">University</option>
                    </select>
                  </div>
                </div>

                {/* AI Output */}
                <div className="prose prose-slate max-w-none">
                  {isAiLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <Loader2 className="animate-spin text-amber-600" size={48} />
                      <p className="text-slate-500 font-medium animate-pulse">DARA is thinking...</p>
                    </div>
                  ) : aiContent ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-slate-50 rounded-2xl p-6 border border-slate-100"
                    >
                      <ReactMarkdown>{aiContent}</ReactMarkdown>
                    </motion.div>
                  ) : (
                    <div className="text-center py-20 text-slate-400">
                      <Sparkles className="mx-auto mb-4 opacity-20" size={48} />
                      <p>Select an action above to start the AI session.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                <p className="text-xs text-slate-500 italic">
                  AI-generated content can occasionally be inaccurate. Please verify with the source material.
                </p>
                <button 
                  onClick={() => setSelectedResource(null)}
                  className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
                >
                  Close Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UnifiedSearch;
