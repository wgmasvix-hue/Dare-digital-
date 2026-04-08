import { useState, useEffect, useCallback, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Loader2, Download, X, Sparkles, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import { geminiService } from "../services/geminiService";
import ReactMarkdown from "react-markdown";

// Required for PDF rendering
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  url: string;
  onClose?: () => void;
  title?: string;
  contentId?: string;
}

export default function PDFViewer({ url, onClose, title, contentId }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState<number>(600);
  
  // PDF Options
  const pdfOptions = useMemo(() => ({
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
  }), []);

  // AI State
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth;
      if (width < 640) setContainerWidth(width - 48);
      else if (width < 768) setContainerWidth(width - 80);
      else if (width < 1024) setContainerWidth(600);
      else setContainerWidth(800);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Track reading progress
  const trackProgress = useCallback(async () => {
    if (!contentId) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await supabase.from('reading_sessions').upsert({
        user_id: user.id,
        book_id: contentId,
        last_read_at: new Date().toISOString()
      }, { onConflict: 'user_id,book_id' });
    } catch (error) {
      console.error('Error tracking progress:', error);
    }
  }, [contentId]);

  useEffect(() => {
    if (pageNumber > 0) {
      const timeoutId = setTimeout(() => {
        trackProgress();
      }, 2000); // 2 second debounce
      return () => clearTimeout(timeoutId);
    }
  }, [pageNumber, trackProgress]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  const handleDownload = () => {
    window.open(url, '_blank');
  };

  const explainPage = async () => {
    setAiLoading(true);
    setShowAiPanel(true);
    setAiResponse(null);
    
    try {
      // For now, we use the title and page number as context
      // In a real app, we'd extract text from the current page
      const response = await geminiService.processInstitutionalContent(
        title || "This document",
        "explain"
      );
      setAiResponse(response || "No explanation available.");
    } catch {
      setAiResponse("Sorry, I couldn't analyze this page right now.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full h-full max-h-[90vh] bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-premium overflow-hidden flex flex-col"
    >
      {/* 🔵 HEADER */}
      <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Maximize2 size={20} />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white line-clamp-1">
              {title || "Institutional Resource Viewer"}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Page {pageNumber} of {numPages || "?"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={explainPage}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl text-xs font-bold hover:bg-purple-600 hover:text-white transition-all shadow-sm"
          >
            <Sparkles size={16} />
            Explain Page
          </button>

          <div className="hidden md:flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-1">
            <button 
              onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
              className="p-2 text-slate-500 hover:text-amber-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-all"
            >
              <ZoomOut size={18} />
            </button>
            <span className="px-3 text-xs font-bold text-slate-600 dark:text-slate-300 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button 
              onClick={() => setScale(prev => Math.min(2.0, prev + 0.1))}
              className="p-2 text-slate-500 hover:text-amber-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-all"
            >
              <ZoomIn size={18} />
            </button>
          </div>

          <button 
            onClick={handleDownload}
            className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-amber-600 rounded-xl transition-all shadow-sm"
            title="Download PDF"
          >
            <Download size={20} />
          </button>

          {onClose && (
            <button 
              onClick={onClose}
              className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* 📄 PDF CONTENT + AI PANEL */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 overflow-auto bg-slate-100/50 dark:bg-slate-950/50 p-8 flex justify-center min-h-[500px] relative">
          <AnimatePresence>
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 z-20 backdrop-blur-sm"
              >
                <Loader2 size={48} className="text-amber-500 animate-spin mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Loading Document...</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="shadow-2xl bg-white dark:bg-slate-900 rounded-lg overflow-hidden h-fit">
            <Document 
              file={url} 
              onLoadSuccess={onDocumentLoadSuccess}
              loading={null}
              options={pdfOptions}
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale}
                width={containerWidth}
                className="animate-in fade-in duration-500"
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          </div>
        </div>

        {/* 🧠 AI INSIGHT PANEL */}
        <AnimatePresence>
          {showAiPanel && (
            <motion.div 
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-80 border-l border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-slate-50 dark:border-slate-800/50 flex items-center justify-between bg-purple-50/30 dark:bg-purple-900/10">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <Sparkles size={18} />
                  <span className="font-serif font-bold">DARA Insight</span>
                </div>
                <button 
                  onClick={() => setShowAiPanel(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="flex-1 overflow-auto p-6">
                {aiLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Loader2 size={32} className="text-purple-500 animate-spin" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 text-center">
                      Analyzing page {pageNumber}...
                    </p>
                  </div>
                ) : aiResponse ? (
                  <div className="prose prose-sm dark:prose-invert prose-purple max-w-none">
                    <ReactMarkdown>{aiResponse}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                      <MessageSquare size={24} />
                    </div>
                    <p className="text-sm text-slate-500">
                      Click "Explain Page" to get AI-powered insights for this section.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🔢 CONTROLS */}
      <div className="px-8 py-6 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-center gap-6">
        <button
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber(prev => prev - 1)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-sm font-bold hover:bg-amber-500 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-slate-600 transition-all active:scale-95"
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-700">
          <span className="text-sm font-black text-amber-600">{pageNumber}</span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">of</span>
          <span className="text-sm font-black text-slate-700 dark:text-slate-200">{numPages || "?"}</span>
        </div>

        <button
          disabled={pageNumber >= numPages}
          onClick={() => setPageNumber(prev => prev + 1)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-sm font-bold hover:bg-amber-500 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-slate-600 transition-all active:scale-95"
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}
