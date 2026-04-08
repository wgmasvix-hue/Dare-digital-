import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import { Sparkles, HelpCircle, Lightbulb, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const InteractiveMarkdown = ({ content, onAction, bookTitle }) => {
  const [userAnswers, setUserAnswers] = useState({});
  const [activeQuestion, setActiveQuestion] = useState(null);

  // Sanitize content for security
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(content || '');
  }, [content]);

  const handleAnswerSubmit = (questionText, answer) => {
    onAction('check_answer', { question: questionText, userAnswer: answer });
    setActiveQuestion(null);
  };

  const components = {
    p: ({ children, ...props }) => {
      const text = children?.toString() || '';
      const isQuestion = text.trim().endsWith('?') || text.toLowerCase().includes('question:');
      const isAnswering = activeQuestion === text;

      return (
        <div className="group relative mb-6">
          <p {...props} className="leading-relaxed text-slate-200">
            {children}
          </p>
          
          <AnimatePresence>
            {isAnswering && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700"
              >
                <textarea 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  placeholder="Type your answer here..."
                  rows={3}
                  value={userAnswers[text] || ''}
                  onChange={(e) => setUserAnswers(prev => ({ ...prev, [text]: e.target.value }))}
                />
                <div className="mt-3 flex justify-end gap-2">
                  <button 
                    onClick={() => setActiveQuestion(null)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleAnswerSubmit(text, userAnswers[text])}
                    disabled={!userAnswers[text]?.trim()}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    Submit Answer
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-2 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {isQuestion ? (
              <>
                <ActionButton 
                  icon={<MessageCircle size={12} />} 
                  label={isAnswering ? "Answering..." : "Try Answering"} 
                  onClick={() => setActiveQuestion(isAnswering ? null : text)} 
                  color="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                />
                <ActionButton 
                  icon={<Lightbulb size={12} />} 
                  label="Hint" 
                  onClick={() => onAction('hint', text)}
                  color="bg-amber-500/20 text-amber-400 border-amber-500/30"
                />
                <ActionButton 
                  icon={<Sparkles size={12} />} 
                  label="Ask AI" 
                  onClick={() => onAction('ask', text)}
                  color="bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                />
              </>
            ) : (
              <>
                <ActionButton 
                  icon={<HelpCircle size={12} />} 
                  label="Explain" 
                  onClick={() => onAction('explain', text)}
                  color="bg-slate-700/50 text-slate-300 border-slate-600/50"
                />
                <ActionButton 
                  icon={<Sparkles size={12} />} 
                  label="Simplify" 
                  onClick={() => onAction('simplify', text)}
                  color="bg-slate-700/50 text-slate-300 border-slate-600/50"
                />
                <ActionButton 
                  icon={<MessageCircle size={12} />} 
                  label="Quiz" 
                  onClick={() => onAction('quiz', text)}
                  color="bg-slate-700/50 text-slate-300 border-slate-600/50"
                />
              </>
            )}
          </div>
        </div>
      );
    },
    h1: ({ children, ...props }) => (
      <h1 {...props} className="text-3xl font-bold text-white mt-8 mb-4 border-b border-slate-800 pb-2">
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 {...props} className="text-2xl font-semibold text-white mt-6 mb-3">
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 {...props} className="text-xl font-medium text-slate-100 mt-4 mb-2">
        {children}
      </h3>
    ),
    li: ({ children, ...props }) => {
      const text = children?.toString() || '';
      return (
        <li {...props} className="mb-2 text-slate-300 list-disc ml-4">
          {children}
          <div className="inline-flex ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
             <button 
               onClick={() => onAction('explain', text)}
               className="text-[10px] text-slate-500 hover:text-amber-400 transition-colors"
             >
               Explain
             </button>
          </div>
        </li>
      );
    }
  };

  return (
    <div className="interactive-markdown">
      <ReactMarkdown components={components}>
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  );
};

const ActionButton = ({ icon, label, onClick, color }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all hover:scale-105 active:scale-95 ${color}`}
  >
    {icon}
    {label}
  </button>
);

export default InteractiveMarkdown;
