import { useState } from "react";
import { geminiService } from "../services/geminiService";
import { Sparkles, FileText, HelpCircle, Lightbulb, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";

import { InstitutionalContent } from "../types";

export default function AIViewer({ content }: { content: InstitutionalContent }) {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState<string | null>(null);

  const askAI = async (type: string) => {
    setLoading(true);
    setActiveType(type);
    setResponse("");

    try {
      // Using the frontend geminiService instead of a backend fetch to comply with guidelines
      const result = await geminiService.processInstitutionalContent(content.title, type);
      setResponse(result || "No response from AI.");
    } catch (error) {
      console.error("AI Viewer Error:", error);
      setResponse("Sorry, I encountered an error while processing your request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 p-6 bg-white/40 backdrop-blur-md rounded-3xl border border-white/50 shadow-inner">
      <div className="flex flex-wrap gap-3 mb-6">
        <button 
          onClick={() => askAI("summary")} 
          disabled={loading}
          className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all duration-300 ${
            activeType === 'summary' 
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 -translate-y-0.5' 
              : 'bg-white text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-100 shadow-sm'
          }`}
        >
          <FileText size={16} />
          Summarize
        </button>

        <button 
          onClick={() => askAI("explain")} 
          disabled={loading}
          className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all duration-300 ${
            activeType === 'explain' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 -translate-y-0.5' 
              : 'bg-white text-slate-500 hover:text-blue-700 hover:bg-blue-50 border border-slate-100 shadow-sm'
          }`}
        >
          <Lightbulb size={16} />
          Explain
        </button>

        <button 
          onClick={() => askAI("quiz")} 
          disabled={loading}
          className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all duration-300 ${
            activeType === 'quiz' 
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 -translate-y-0.5' 
              : 'bg-white text-slate-500 hover:text-amber-700 hover:bg-amber-50 border border-slate-100 shadow-sm'
          }`}
        >
          <HelpCircle size={16} />
          Quiz
        </button>
      </div>

      <div className="relative min-h-[80px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-4 text-emerald-700/60 py-6"
            >
              <div className="relative">
                <Loader2 size={24} className="animate-spin" />
                <div className="absolute inset-0 bg-emerald-500 blur-md opacity-20 animate-pulse" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest animate-pulse">DARA is analyzing...</span>
            </motion.div>
          ) : response ? (
            <motion.div 
              key="response"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="prose prose-emerald max-w-none bg-white/60 p-6 rounded-2xl border border-white/80 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Sparkles size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Digital Insights Output</span>
                </div>
                <div className="text-[9px] font-mono text-slate-400">Education 5.0 Core: {activeType?.toUpperCase()}</div>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed font-sans">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-slate-200 rounded-3xl"
            >
              <Sparkles size={24} className="text-slate-300" />
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Select an objective above to begin</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
