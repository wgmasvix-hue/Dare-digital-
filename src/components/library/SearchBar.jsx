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
          relative flex items-center transition-all duration-500 rounded-2xl border-2 overflow-hidden
          ${isAiMode 
            ? 'bg-bg-subtle border-primary shadow-premium shadow-primary/10' 
            : 'bg-bg-base border-border shadow-sm group-focus-within:border-primary group-focus-within:shadow-premium group-focus-within:ring-4 group-focus-within:ring-primary/10'}
        `}>
          
          <div className="pl-5 pr-3 text-text-muted">
            {isAiMode ? (
              <Sparkles className="text-primary animate-pulse" size={20} />
            ) : (
              <Search size={20} className="group-focus-within:text-primary transition-colors" />
            )}
          </div>
          
          <input 
            type="text" 
            placeholder={isAiMode ? "Ask the AI Librarian (e.g. 'Summarize education policy in Zimbabwe')" : "Search by title, author, or research topic..."}
            className="w-full py-4 bg-transparent border-none outline-none text-text-main placeholder:text-text-muted font-medium"
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
                className="p-2 mr-2 text-text-muted hover:text-text-main transition-colors"
                onClick={() => onChange('')}
                aria-label="Clear search"
              >
                <X size={18} />
              </motion.button>
            )}
          </AnimatePresence>
          
          {isAiMode && (
            <div className="flex items-center gap-2 mr-2">
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold border border-primary/20 whitespace-nowrap">
                <Sparkles size={10} />
                <span>DATA SAVER</span>
              </div>
              <button 
                onClick={() => onSearch(value)}
                disabled={aiThinking || !value.trim()}
                className="px-6 py-2 bg-primary hover:bg-primary-dark disabled:bg-bg-subtle text-white rounded-xl font-bold transition-all flex items-center gap-2"
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
              className="absolute top-full left-0 right-0 mt-2 bg-bg-base rounded-2xl border border-border shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-2">
                {suggestions.map((term, idx) => (
                  <button 
                    key={idx} 
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-text-main hover:bg-bg-subtle rounded-xl transition-colors group"
                    onClick={() => onSelectSuggestion && onSelectSuggestion(term)}
                  >
                    <Search size={14} className="text-text-muted group-hover:text-primary" />
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
                ? 'bg-bg-subtle text-text-muted hover:bg-border' 
                : 'bg-primary/10 text-primary hover:bg-primary/20'}
            `}
            onClick={onToggleAi}
          >
            <Sparkles size={14} className={isAiMode ? "text-text-muted" : "text-primary"} />
            <span>{isAiMode ? 'Switch to Standard Search' : 'Try AI Librarian Search'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
