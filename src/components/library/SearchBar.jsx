import { Search, Sparkles, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * SearchBar Component
 * 
 * Props:
 * - value: string - The current value of the search input.
 * - onChange: (value: string) => void - Callback when input changes.
 * - onSearch: (value: string) => void - Callback when search is triggered.
 * - placeholder: string - Placeholder text.
 * - className: string - Additional CSS classes.
 * - isAiMode: boolean - Whether AI search mode is active.
 * - onToggleAi: () => void - Callback to toggle AI mode.
 * - aiThinking: boolean - Whether AI is currently processing.
 * - suggestions: string[] - List of search suggestions.
 * - onSelectSuggestion: (term: string) => void - Callback when a suggestion is clicked.
 */
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
  setShowSuggestions
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
          relative flex items-center transition-all duration-300 rounded-2xl border-2 overflow-hidden
          ${isAiMode 
            ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 shadow-lg shadow-amber-500/10' 
            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm group-focus-within:border-amber-500/50 group-focus-within:shadow-md'}
        `}>
          
          <div className="pl-5 pr-3 text-slate-400">
            {isAiMode ? (
              <Sparkles className="text-amber-500 animate-pulse" size={20} />
            ) : (
              <Search size={20} className="group-focus-within:text-amber-500 transition-colors" />
            )}
          </div>
          
          <input 
            type="text" 
            placeholder={isAiMode ? "Ask the AI Librarian (e.g. 'I need a book on sustainable farming')" : placeholder}
            className="w-full py-4 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
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
                className="p-2 mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                onClick={() => onChange('')}
                aria-label="Clear search"
              >
                <X size={18} />
              </motion.button>
            )}
          </AnimatePresence>
          
          {isAiMode && (
            <div className="flex items-center gap-2 mr-2">
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold border border-emerald-500/20 whitespace-nowrap">
                <Sparkles size={10} />
                <span>DATA SAVER</span>
              </div>
              <button 
                onClick={() => onSearch(value)}
                disabled={aiThinking || !value.trim()}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white rounded-xl font-bold transition-all flex items-center gap-2"
              >
                {aiThinking ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
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
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-2">
                {suggestions.map((term, idx) => (
                  <button 
                    key={idx} 
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors group"
                    onClick={() => onSelectSuggestion && onSelectSuggestion(term)}
                  >
                    <Search size={14} className="text-slate-400 group-hover:text-amber-500" />
                    <span className="font-medium">{term}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {onToggleAi && (
        <div className="mt-3 flex justify-center">
          <button 
            className={`
              flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all
              ${isAiMode 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700' 
                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50'}
            `}
            onClick={onToggleAi}
          >
            <Sparkles size={14} className={isAiMode ? "text-slate-400" : "text-amber-500"} />
            <span>{isAiMode ? 'Switch to Standard Search' : 'Try AI Librarian Search'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
