import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { School, MapPin, ArrowRight, Building2, Search, GraduationCap, Cog, Sprout } from "lucide-react";
import { Institution } from "../types";
import { ZIMBABWE_INSTITUTIONS } from "../data/zimbabweInstitutions";

export default function Institutions() {
  const [dbInstitutions, setDbInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const navigate = useNavigate();

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("institutions").select("*");
      if (error) throw error;
      setDbInstitutions(data || []);
    } catch (error) {
      console.error("Error fetching institutions from DB:", error);
    } finally {
      setLoading(false);
    }
  };

  // Merge DB institutions with static institutions
  // Use a Map to avoid duplicates by name
  const allInstitutionsMap = new Map();
  
  // Add static ones first
  ZIMBABWE_INSTITUTIONS.forEach(inst => {
    allInstitutionsMap.set(inst.name.toLowerCase(), {
      id: inst.id,
      name: inst.name,
      type: inst.type,
      location: inst.location,
      description: inst.focus.join(", "),
      isStatic: true
    });
  });

  // Add DB ones (they might overwrite static ones if names match, which is fine)
  dbInstitutions.forEach(inst => {
    allInstitutionsMap.set(inst.name.toLowerCase(), {
      ...inst,
      isStatic: false
    });
  });

  const allInstitutions = Array.from(allInstitutionsMap.values());

  const types = ["All", "Public University", "Private University", "Polytechnic", "Vocational Training Centre", "Specialized Training College"];

  const filteredInstitutions = allInstitutions.filter(inst => {
    const matchesSearch = inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inst.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inst.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === "All" || inst.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    if (type?.includes('University')) return <Building2 size={24} />;
    if (type?.includes('Polytechnic')) return <Cog size={24} />;
    if (type?.includes('Vocational')) return <School size={24} />;
    if (type?.includes('Agricultural')) return <Sprout size={24} />;
    return <GraduationCap size={24} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 p-12 rounded-[40px] relative overflow-hidden bg-slate-900 text-white shadow-2xl">
          {/* Real Book Background Image */}
          <div className="absolute inset-0 z-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000" 
              alt="Institutions Background" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-3">
                Institutional Portals
              </h1>
              <p className="text-slate-300 max-w-2xl text-lg">
                Access specialized resources from Zimbabwe's leading universities, polytechnics, and vocational training centres.
              </p>
            </div>
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input
                type="text"
                placeholder="Search institutions or focus areas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder:text-white/40 focus:bg-white focus:text-slate-900 focus:outline-none transition-all shadow-xl"
              />
            </div>
          </div>
        </header>

        {/* Type Filters */}
        <div className="flex flex-wrap gap-3 mb-12">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                selectedType === type 
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {loading && allInstitutions.length === 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-white dark:bg-slate-900 rounded-[2rem] animate-pulse border border-slate-100 dark:border-slate-800" />
            ))}
          </div>
        ) : filteredInstitutions.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstitutions.map((inst) => (
              <motion.div
                key={inst.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/institution/${inst.id}`)}
                className="group relative p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-premium hover:shadow-premium-hover hover:border-amber-500/40 cursor-pointer transition-all duration-300 flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                    {getTypeIcon(inst.type)}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-amber-500 transition-colors">
                      {inst.type || 'Institution'}
                    </span>
                    {inst.isStatic && (
                      <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
                        Directory
                      </span>
                    )}
                  </div>
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-amber-600 transition-colors line-clamp-2">
                  {inst.name}
                </h2>
                
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                  <MapPin size={14} className="shrink-0" />
                  <span className="truncate">{inst.location || 'Zimbabwe'}</span>
                </div>

                {inst.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 italic">
                    Focus: {inst.description}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800/50">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-amber-500 transition-colors">
                    Explore Portal
                  </span>
                  <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No institutions found</h3>
            <p className="text-slate-500">Try adjusting your search query or filters to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
}
