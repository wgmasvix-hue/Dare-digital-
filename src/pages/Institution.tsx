import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Building2, MapPin, BookOpen, Sparkles, ArrowLeft, Globe, ShieldCheck, Search, Eye, FileText, Download, ExternalLink } from "lucide-react";
import UploadContent from "../components/UploadContent";
import AIViewer from "../components/AIViewer";
import PDFViewer from "../components/PDFViewer";
import { Institution as InstitutionType, InstitutionalContent } from "../types";
import { AnimatePresence } from "motion/react";
import { ZIMBABWE_INSTITUTIONS } from "../data/zimbabweInstitutions";

export default function Institution() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [institution, setInstitution] = useState<InstitutionType | null>(null);
  const [content, setContent] = useState<InstitutionalContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<{url: string, title: string, id: string} | null>(null);

  const fetchInstitution = useCallback(async () => {
    try {
      // First check Supabase
      const { data } = await supabase
        .from("institutions")
        .select("*")
        .eq("id", id)
        .single();
      
      if (data) {
        setInstitution(data);
        return;
      }

      // If not in Supabase, check static data
      const staticInst = ZIMBABWE_INSTITUTIONS.find(inst => inst.id === id);
      if (staticInst) {
        setInstitution({
          id: staticInst.id,
          name: staticInst.name,
          type: staticInst.type,
          location: staticInst.location || 'Zimbabwe',
          description: staticInst.focus.join(", "),
          created_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error fetching institution:", error);
      // Fallback to static data on error too
      const staticInst = ZIMBABWE_INSTITUTIONS.find(inst => inst.id === id);
      if (staticInst) {
        setInstitution({
          id: staticInst.id,
          name: staticInst.name,
          type: staticInst.type,
          location: staticInst.location || 'Zimbabwe',
          description: staticInst.focus.join(", "),
          created_at: new Date().toISOString()
        });
      }
    }
  }, [id]);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("institutional_content")
        .select("*")
        .eq("institution_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchInstitution();
      fetchContent();
    }
  }, [id, fetchInstitution, fetchContent]);

  const filteredContent = content.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/institutions')}
          className="flex items-center gap-2 text-slate-500 hover:text-amber-600 transition-colors mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to Institutions</span>
        </button>

        {institution && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 p-12 rounded-[40px] relative overflow-hidden bg-slate-900 text-white shadow-2xl"
          >
            {/* Real Book Background Image */}
            <div className="absolute inset-0 z-0 opacity-20">
              <img 
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=2000" 
                alt="Institution Background" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 shadow-premium flex items-center justify-center text-amber-500">
                    <Building2 size={40} />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                      {institution.name}
                    </h1>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-sm text-slate-300">
                        <MapPin size={16} />
                        <span>{institution.location || 'Zimbabwe'}</span>
                      </div>
                      <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                      <div className="flex items-center gap-1.5 text-sm text-slate-300">
                        <Globe size={16} />
                        <span>{institution.type || 'Institution'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate(`/library?search=${encodeURIComponent(institution.name)}`)}
                  className="px-6 py-3 bg-white text-slate-900 rounded-2xl text-sm font-bold hover:bg-amber-500 hover:text-white transition-all flex items-center gap-2 shadow-xl active:scale-95"
                >
                  <ExternalLink size={18} />
                  Search in Library
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-sm font-bold text-white hover:bg-white/20 transition-all flex items-center gap-2 shadow-sm">
                  <ShieldCheck size={18} className="text-amber-500" />
                  Verified Partner
                </button>
                <button className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-sm font-bold transition-all flex items-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95">
                  <Sparkles size={18} />
                  Ask AI about this institution
                </button>
                {institution.koha_url && (
                  <a 
                    href={institution.koha_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold transition-all flex items-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95"
                  >
                    <BookOpen size={18} />
                    Browse Library (Koha)
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Upload Section */}
        {id && <UploadContent institutionId={id} onUpload={fetchContent} />}

        {/* Content Section */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <BookOpen size={24} className="text-amber-500" />
              Institutional Resources
            </h2>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-white dark:bg-slate-900 rounded-[2rem] animate-pulse border border-slate-100 dark:border-slate-800" />
              ))}
            </div>
          ) : filteredContent.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredContent.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-premium overflow-hidden group hover:shadow-premium-hover transition-all duration-500 flex flex-col"
                >
                  <div className="p-8 flex-1">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-500">
                        <FileText size={28} />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-amber-500/10 text-amber-600 rounded-lg">
                          {item.file_type || 'PDF'}
                        </span>
                        {item.level && (
                          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-indigo-500/10 text-indigo-600 rounded-lg">
                            {item.level}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                      {item.title}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium mb-6">
                      <span className="flex items-center gap-1">
                        <Building2 size={12} />
                        {item.subject || 'General Resource'}
                      </span>
                      <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                      <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently added'}</span>
                    </div>

                    <div className="flex gap-3 mb-6">
                      <button 
                        onClick={() => {
                          if (item.file_url) {
                            setSelectedFile({ url: item.file_url, title: item.title, id: item.id });
                          }
                        }}
                        disabled={!item.file_url}
                        className="flex-1 py-3 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-500 transition-all active:scale-95 shadow-lg disabled:opacity-50"
                      >
                        <Eye size={16} />
                        View Resource
                      </button>
                      {item.file_url && (
                        <a 
                          href={item.file_url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-amber-600 rounded-2xl transition-all"
                        >
                          <Download size={18} />
                        </a>
                      )}
                    </div>

                    {/* AI Insights Section */}
                    <AIViewer content={item} />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-12 text-center border border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <BookOpen size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No resources found</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                This institution hasn't uploaded any public resources yet. Check back later for updates.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* 📘 PDF VIEWER MODAL */}
      <AnimatePresence>
        {selectedFile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFile(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <div className="relative w-full max-w-5xl max-h-full flex flex-col z-10">
              <PDFViewer 
                url={selectedFile.url} 
                title={selectedFile.title}
                contentId={selectedFile.id}
                onClose={() => setSelectedFile(null)} 
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
