import { Search, Sparkles, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search with AI to save data (e.g. 'summarize education policy')...",
  className = '',
  isAiMode = false,
  onToggleAi,
  aiThinking = false,
  suggestions = [],
  onSelectSuggestion,
  showSuggestions,
  setShowSuggestions,
  searchField = 'all',
  onSearchFieldChange,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className={`relative w-full max-w-3xl mx-auto ${className}`}>
      <div className="relative group">
        {/* Search Input Wrapper */}
        <div className={`
          relative flex items-center transition-all duration-300 rounded-2xl border-2 overflow-hidden bg-white shadow-sm focus-within:shadow-xl focus-within:-translate-y-1 focus-within:ring-4 ring-teal-500/20
          ${isAiMode 
            ? 'border-amber-400 focus-within:border-amber-400' 
            : 'border-slate-200 focus-within:border-teal-500'}
        `}>
          
          <div className="pl-5 pr-3 text-slate-400">
            {isAiMode ? (
              <Sparkles className="text-amber-500 animate-pulse" size={24} />
            ) : (
              <Search size={24} className="group-focus-within:text-teal-600 transition-colors" />
            )}
          </div>

          {!isAiMode && onSearchFieldChange && (
            <select
              value={searchField}
              onChange={e => onSearchFieldChange(e.target.value)}
              className="shrink-0 self-stretch bg-transparent text-xs font-bold text-slate-500 border-r border-slate-200 pr-3 mr-3 outline-none cursor-pointer hover:text-slate-700 transition-colors"
              onClick={e => e.stopPropagation()}
            >
              <option value="all">All Fields</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="subject">Subject</option>
            </select>
          )}

          <input
            type="text" 
            placeholder={isAiMode ? "Ask the AI Librarian (e.g. 'Summarize education policy in Zimbabwe')" : "Search by title, author, or research topic..."}
            className="w-full py-5 bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 font-medium text-lg"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setShowSuggestions && setShowSuggestions(true)}
            onBlur={() => setShowSuggestions && setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={handleKeyDown}
          />

          <AnimatePresence>
            {value && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="p-2 mr-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                onClick={() => onChange('')}
                aria-label="Clear search"
              >
                <X size={20} />
              </motion.button>
            )}
          </AnimatePresence>
          
          {isAiMode && (
            <div className="flex items-center gap-2 mr-2 pr-2">
              <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-black tracking-widest border border-amber-200 whitespace-nowrap">
                <Sparkles size={12} />
                <span>DATA SAVER</span>
              </div>
              <button 
                onClick={() => onSearch(value)}
                disabled={aiThinking || !value.trim()}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 disabled:text-slate-400 text-slate-900 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                {aiThinking ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Ask AI</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden"
            >
              <div className="p-2">
                {suggestions.map((term, idx) => (
                  <button 
                    key={idx} 
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 hover:bg-slate-50 hover:text-teal-600 rounded-xl transition-colors group font-medium"
                    onClick={() => onSelectSuggestion && onSelectSuggestion(term)}
                  >
                    <Search size={16} className="text-slate-400 group-hover:text-teal-500" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {onToggleAi && (
        <div className="mt-4 flex justify-center">
          <button 
            className={`
              flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest transition-all shadow-sm
              ${isAiMode 
                ? 'bg-slate-800 text-white hover:bg-slate-700' 
                : 'bg-white text-slate-700 border border-slate-200 hover:border-teal-500 hover:text-teal-600'}
            `}
            onClick={onToggleAi}
          >
            <Sparkles size={16} className={isAiMode ? "text-amber-400" : "text-amber-500"} />
            <span>{isAiMode ? 'Switch to Standard Search' : 'Try AI Librarian Search'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
