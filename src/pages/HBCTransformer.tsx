import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  Copy, 
  Check, 
  History,
  FileText,
  Loader2,
  AlertCircle,
  Info
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { geminiService } from '../services/geminiService';

export default function HBCTransformer() {
  const [content, setContent] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTransform = async () => {
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const transformed = await geminiService.transformToHBC(content);
      setResult(transformed || null);
    } catch (err) {
      console.error(err);
      setError('Failed to transform content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] pt-24 pb-12 px-4 font-serif">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5A5A40] text-white text-sm mb-4"
          >
            <History size={16} />
            <span>Zimbabwean Heritage-Based Curriculum</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4"
          >
            HBC Content Transformer
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[#5A5A40] max-w-2xl mx-auto italic"
          >
            Transform standard textbook content into structured, student-friendly learning material aligned with Zimbabwe's Heritage-Based Curriculum.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[32px] p-8 shadow-sm border border-[#e5e5df]"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#f5f5f0] flex items-center justify-center text-[#5A5A40]">
                <BookOpen size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#1a1a1a]">Input Content</h2>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste textbook content, notes, or raw text here..."
              className="w-full h-[400px] p-6 rounded-2xl bg-[#fcfcfb] border border-[#e5e5df] focus:border-[#5A5A40] outline-none transition-all resize-none font-sans text-soil"
            />

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleTransform}
                disabled={isLoading || !content.trim()}
                className="flex items-center gap-2 px-8 py-4 bg-[#5A5A40] text-white rounded-full font-bold hover:bg-[#4a4a35] disabled:opacity-50 transition-all shadow-lg shadow-[#5A5A40]/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Transforming...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Transform to HBC</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Output Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[32px] p-8 shadow-sm border border-[#e5e5df] min-h-[500px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f5f5f0] flex items-center justify-center text-[#5A5A40]">
                  <FileText size={20} />
                </div>
                <h2 className="text-xl font-bold text-[#1a1a1a]">HBC Material</h2>
              </div>
              
              {result && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-full hover:bg-[#f5f5f0] text-[#5A5A40] transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center p-12"
                  >
                    <div className="relative mb-6">
                      <Loader2 size={48} className="animate-spin text-[#5A5A40]" />
                      <Sparkles size={20} className="absolute -top-2 -right-2 text-amber animate-pulse" />
                    </div>
                    <p className="text-soil font-medium italic">
                      DARA is analyzing the content and aligning it with Zimbabwe's Heritage-Based Curriculum...
                    </p>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center p-12 text-red-600"
                  >
                    <AlertCircle size={48} className="mb-4" />
                    <p className="font-bold">{error}</p>
                  </motion.div>
                ) : result ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="prose prose-stone max-w-none font-sans"
                  >
                    <div className="markdown-body">
                      <ReactMarkdown>{result}</ReactMarkdown>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center p-12 text-clay border-2 border-dashed border-[#e5e5df] rounded-[24px]"
                  >
                    <BookOpen size={48} className="mb-4 opacity-20" />
                    <p className="italic">
                      Your transformed HBC material will appear here. Paste content in the left panel to begin.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-8 bg-[#5A5A40]/5 rounded-[32px] border border-[#5A5A40]/10"
        >
          <h3 className="text-lg font-bold text-[#5A5A40] mb-4 flex items-center gap-2">
            <Info size={20} />
            About HBC Transformation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-soil leading-relaxed">
            <div>
              <p className="font-bold mb-1">ZIMSEC Alignment</p>
              <p>Ensures content matches the latest syllabus requirements and exam patterns used in Zimbabwe.</p>
            </div>
            <div>
              <p className="font-bold mb-1">Heritage Integration</p>
              <p>Automatically identifies and incorporates local Zimbabwean examples and cultural context.</p>
            </div>
            <div>
              <p className="font-bold mb-1">Unhu/Ubuntu Focus</p>
              <p>Frames learning within the core values of Zimbabwean society, promoting character development.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
