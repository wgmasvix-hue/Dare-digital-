import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, X, FileText, Key, BrainCircuit, Loader2 } from 'lucide-react';
import { geminiService } from '../../services/geminiService';

export default function AiInsightsDrawer({ isOpen, onClose, bookTitle, chapterTitle, pageContent }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);

  // We should pass down the current chapter or context
  const targetContext = chapterTitle || "Current Section";
  const bookContext = bookTitle ? `Book: ${bookTitle}\nSection: ${targetContext}\n\nContent:\n${pageContent?.slice(0, 5000)}` : "No context available";

  const fetchInsight = async (type) => {
    setLoading(true);
    setContent(null);
    try {
      let prompt = "";
      if (type === 'summary') {
         prompt = `Summarize the following chapter/section concisely. Focus on the main narrative or educational takeaways.\n\n${bookContext}`;
      } else if (type === 'key-points') {
         prompt = `Extract the 5 most important key points or concepts from the following section. Format as a bulleted list.\n\n${bookContext}`;
      } else if (type === 'explain') {
         prompt = `Explain the core concepts in this section as if you were explaining them to a student. Make it easy to understand.\n\n${bookContext}`;
      }
      
      const response = await geminiService.askQuestion(prompt, bookContext);
      setContent(response);
    } catch (e) {
      setContent("I'm sorry, I encountered an error while analyzing this content.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchInsight(activeTab);
    } else {
      setContent(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchInsight(tab);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
          />

          {/* Drawer */}
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl z-50 flex flex-col md:w-3/4 lg:w-1/2 md:mx-auto md:border md:border-b-0 md:border-slate-200 dark:border-slate-800"
          >
            {/* Handle / Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <Sparkles size={20} />
                <h3 className="font-bold font-serif text-lg text-slate-800 dark:text-white flex items-center gap-2">
                  AI Chapter Insights
                  {chapterTitle && <span className="text-sm font-sans font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{chapterTitle}</span>}
                </h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex px-4 py-3 gap-2 overflow-x-auto border-b border-slate-100 dark:border-slate-800 hide-scrollbar">
              <button 
                onClick={() => handleTabChange('summary')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'summary' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800'}`}
              >
                <FileText size={16} /> Chapter Summary
              </button>
              <button 
                onClick={() => handleTabChange('key-points')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'key-points' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800'}`}
              >
                <Key size={16} /> Key Points
              </button>
              <button 
                onClick={() => handleTabChange('explain')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'explain' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800'}`}
              >
                <BrainCircuit size={16} /> Explain Like a Teacher
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="p-6 overflow-y-auto flex-1 min-h-[30vh]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 py-10">
                  <Loader2 size={32} className="animate-spin text-purple-500" />
                  <p className="text-sm font-medium">Analyzing chapter text...</p>
                </div>
              ) : content ? (
                <div className="prose prose-slate dark:prose-invert max-w-none text-base leading-relaxed">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
