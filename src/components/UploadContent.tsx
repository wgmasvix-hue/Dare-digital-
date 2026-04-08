import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Upload, FileText, CheckCircle2, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface UploadContentProps {
  institutionId: string;
  onUpload?: () => void;
}

export default function UploadContent({ institutionId, onUpload }: UploadContentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  const handleUpload = async () => {
    // Security check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setStatus('error');
      setErrorMessage("You must be logged in to upload resources.");
      return;
    }

    if (!file || !title) {
      setStatus('error');
      setErrorMessage("Please provide at least a title and a file.");
      return;
    }

    setLoading(true);
    setStatus('idle');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${institutionId}/${fileName}`;

      // 1. Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("institutional-content")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: urlData } = supabase.storage
        .from("institutional-content")
        .getPublicUrl(filePath);

      const fileUrl = urlData.publicUrl;

      // 3. Save metadata to DB
      const { error: dbError } = await supabase
        .from("institutional_content")
        .insert({
          institution_id: institutionId,
          title,
          subject,
          level,
          file_url: fileUrl,
          file_type: file.type,
          file_size: file.size,
          author: user.user_metadata?.full_name || user.email
        });

      if (dbError) throw dbError;

      setStatus('success');
      setTitle("");
      setSubject("");
      setLevel("");
      setFile(null);
      
      if (onUpload) onUpload();
      
      // Close after delay
      setTimeout(() => {
        setIsOpen(false);
        setStatus('idle');
      }, 2000);

    } catch (error) {
      const err = error as Error;
      console.error("Upload error:", err);
      setStatus('error');
      setErrorMessage(err.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-12">
      {!isOpen ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(true)}
          className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex items-center justify-center gap-3 text-slate-500 hover:text-amber-600 hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all group"
        >
          <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-sm">Upload New Resource</span>
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-premium relative"
        >
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Upload size={20} className="text-amber-500" />
            Upload Institutional Resource
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Introduction to Zimbabwean Law"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">
                  Subject / Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. Faculty of Law"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">
                  Academic Level
                </label>
                <input
                  type="text"
                  placeholder="e.g. Undergraduate Year 1"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">
                Resource File *
              </label>
              <div className="flex-1 relative group">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 transition-all ${file ? 'border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-800 group-hover:border-amber-500/50'}`}>
                  {file ? (
                    <>
                      <FileText size={40} className="text-emerald-500 mb-2" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 text-center line-clamp-1">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload size={32} className="text-slate-300 dark:text-slate-700 mb-2 group-hover:text-amber-500 transition-colors" />
                      <span className="text-sm text-slate-500 text-center">
                        Click or drag to select file
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">
                        PDF, DOCX, or Media
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {status !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                  status === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20' : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20'
                }`}
              >
                {status === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span className="text-sm font-medium">
                  {status === 'success' ? 'Resource uploaded successfully! Refreshing...' : errorMessage}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={loading}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-amber-500/20 active:scale-95 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload Resource
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
