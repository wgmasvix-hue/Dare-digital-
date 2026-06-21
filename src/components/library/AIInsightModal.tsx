import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { Book } from '../../types';
import { geminiService } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AIInsightModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
}

export default function AIInsightModal({ isOpen, onClose, book }: AIInsightModalProps) {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && book && !insight) {
      const fetchInsight = async () => {
        setLoading(true);
        setError(null);
        try {
          const prompt = `Provide an instant AI summary for the book "${book.title}" by ${book.author_names || 'Unknown Author'}. 
Please structure the response with:
1. A brief summary (2-3 sentences)
2. Key research takeaways
3. Education 5.0 industrialization and innovation context (how it applies to practical Zimbabwe use).
4. Reading Complexity score (e.g., 1-10 or Beginner/Intermediate/Advanced)
5. Time to Mastery estimate (e.g., hours or weeks of study)

Keep it concise and format exactly using Markdown.
Description context if available: ${book.description || 'No description available.'}`;
          
          const response = await geminiService.generateBookAction(`Book Title: ${book.title}`, prompt);
          setInsight(response);
        } catch (err) {
          setError("Failed to generate AI insights. Please try again later.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchInsight();
    }
  }, [isOpen, book, insight]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-6 text-white flex justify-between items-start overflow-hidden relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={20} className="text-amber-300" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-teal-50">BAKO AI Insight</h2>
                </div>
                <h3 className="text-2xl font-serif font-bold line-clamp-2 leading-tight">
                  {book?.title}
                </h3>
                <p className="text-teal-100 mt-1 font-medium text-sm">
                  {book?.author_names}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md relative z-10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-slate-50">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-teal-600">
                  <Loader2 size={48} className="animate-spin mb-4" />
                  <p className="text-lg font-bold">Analyzing Book Dimensions...</p>
                  <p className="text-sm text-slate-500 mt-2 text-center max-w-xs">
                    Extracting key takeaways and Education 5.0 industrialization context.
                  </p>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-rose-500">
                  <p>{error}</p>
                </div>
              ) : (
                <div className="prose prose-slate prose-teal max-w-none text-slate-700">
                  <ReactMarkdown>{insight || ''}</ReactMarkdown>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
               <button 
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors active:scale-95 shadow-sm"
               >
                 Close Insight
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
