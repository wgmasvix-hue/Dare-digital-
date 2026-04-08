import { useState } from "react";
import { geminiService } from "../services/geminiService";
import { Sparkles, FileText, HelpCircle, Lightbulb, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

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
    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
      <div className="flex flex-wrap gap-2 mb-4">
        <button 
          onClick={() => askAI("summary")} 
          disabled={loading}
          className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
            activeType === 'summary' 
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
              : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-amber-600 border border-slate-100 dark:border-slate-800'
          }`}
        >
          <FileText size={14} />
          Summarize
        </button>

        <button 
          onClick={() => askAI("explain")} 
          disabled={loading}
          className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
            activeType === 'explain' 
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
              : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-amber-600 border border-slate-100 dark:border-slate-800'
          }`}
        >
          <Lightbulb size={14} />
          Explain
        </button>

        <button 
          onClick={() => askAI("quiz")} 
          disabled={loading}
          className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
            activeType === 'quiz' 
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
              : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-amber-600 border border-slate-100 dark:border-slate-800'
          }`}
        >
          <HelpCircle size={14} />
          Quiz
        </button>
      </div>

      <div className="relative min-h-[60px]">
        {loading ? (
          <div className="flex items-center gap-3 text-slate-400 py-4">
            <Loader2 size={18} className="animate-spin text-amber-500" />
            <span className="text-sm font-medium italic">DARA is thinking...</span>
          </div>
        ) : response ? (
          <div className="prose prose-sm dark:prose-invert max-w-none animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400">
              <Sparkles size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">AI Insight</span>
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 py-2">
            <Sparkles size={14} className="opacity-50" />
            <p className="text-xs italic">Select an option above to generate AI insights for this resource.</p>
          </div>
        )}
      </div>
    </div>
  );
}
