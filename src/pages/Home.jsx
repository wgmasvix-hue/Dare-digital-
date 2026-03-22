import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  BookOpen, 
  Library, 
  Sprout, 
  Stethoscope, 
  Briefcase, 
  GraduationCap, 
  Cog, 
  Scale, 
  Feather, 
  Microscope,
  Search,
  WifiOff,
  Database,
  AlertCircle,
  Cpu,
  Sparkles,
  Clock,
  Zap,
  Wrench,
  Building2,
  Upload,
  MessageSquare,
  Bookmark,
  ChevronRight,
  Globe,
  Star,
  ZapOff,
  ShieldCheck,
  Users,
  X
} from 'lucide-react';
import DaraChatModal from '../components/library/DaraChatModal';
import DemoTour from '../components/ui/DemoTour';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { geminiService } from '../services/geminiService';
import { transformBooks, transformBook, BOOK_SELECT, OPENSTAX_CURATED } from '../lib/transformBook';
import { getFeaturedPipeline, getRecentlyAddedPipeline } from '../lib/featuredPipeline';
import { ALL_ADDITIONAL_OER, ANDREWS_OER } from '../lib/oerCatalog';
import BookCard from '../components/library/BookCard';

const FACULTIES = [
  { name: 'STEM', icon: Microscope, id: 'stem', color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'Agriculture', icon: Sprout, id: 'agriculture', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { name: 'Health', icon: Stethoscope, id: 'health', color: 'text-rose-600', bg: 'bg-rose-50' },
  { name: 'Business', icon: Briefcase, id: 'business', color: 'text-amber-600', bg: 'bg-amber-50' },
  { name: 'Education', icon: GraduationCap, id: 'education', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { name: 'Teachers Colleges', icon: GraduationCap, id: 'teachers-colleges', path: '/teachers-colleges', color: 'text-teal-600', bg: 'bg-teal-50' },
  { name: 'Engineering', icon: Cog, id: 'engineering', color: 'text-slate-600', bg: 'bg-slate-50' },
  { name: 'Law', icon: Scale, id: 'law', color: 'text-purple-600', bg: 'bg-purple-50' },
  { name: 'Humanities', icon: Feather, id: 'humanities', color: 'text-orange-600', bg: 'bg-orange-50' },
  { name: 'AI & Future Tech', icon: Cpu, id: 'ai-future-tech', color: 'text-cyan-600', bg: 'bg-cyan-50' },
];

const FEATURES = [
  { label: 'NDS2 (2026-2030) Aligned', icon: Globe, color: 'text-emerald-600' },
  { label: 'Education 5.0 Pillars', icon: GraduationCap, color: 'text-indigo-600' },
  { label: 'ZIMCHE Aligned', icon: ShieldCheck, color: 'text-blue-500' },
  { label: 'AI Search', icon: Sparkles, color: 'text-purple-500' },
  { label: 'Zimbabwe Research', icon: Database, color: 'text-rose-500' },
  { label: 'Offline-First', icon: WifiOff, color: 'text-slate-500' },
];

const PILLARS = [
  { 
    name: 'Teaching', 
    description: 'Delivering high-quality, relevant education.', 
    longDescription: 'Education 5.0 shifts the focus from traditional theory-based learning to a more practical, skills-oriented approach. It aims to produce graduates who are not just job seekers, but job creators equipped with the knowledge to solve real-world Zimbabwean challenges.',
    icon: GraduationCap, 
    color: 'bg-blue-500' 
  },
  { 
    name: 'Research', 
    description: 'Generating new knowledge for national growth.', 
    longDescription: 'Research in Education 5.0 is strategic and solution-oriented. It focuses on addressing national priority areas defined in NDS2, ensuring that academic inquiry directly contributes to the socio-economic transformation of Zimbabwe.',
    icon: Microscope, 
    color: 'bg-emerald-500' 
  },
  { 
    name: 'Community Engagement', 
    description: 'Solving local problems with academic expertise.', 
    longDescription: 'This pillar bridges the gap between the ivory tower and the community. Universities actively partner with local communities to apply academic knowledge to solve pressing social, economic, and environmental issues at the grassroots level.',
    icon: Users, 
    color: 'bg-amber-500' 
  },
  { 
    name: 'Innovation', 
    description: 'Transforming ideas into practical solutions.', 
    longDescription: 'Innovation is the process of turning research findings into tangible prototypes, patents, and new technologies. It encourages a culture of creativity and problem-solving that leads to the development of unique Zimbabwean solutions.',
    icon: Zap, 
    color: 'bg-purple-500' 
  },
  { 
    name: 'Industrialisation', 
    description: 'Driving economic growth through production.', 
    longDescription: 'The ultimate goal of Education 5.0 is to move from innovation to full-scale production. This involves setting up university-led industries, innovation hubs, and industrial parks that manufacture goods and provide services, creating wealth and employment.',
    icon: Building2, 
    color: 'bg-rose-500' 
  },
];

const INSTITUTIONS = [
  { id: 'all', name: 'All Resources', icon: Library, type: 'all', description: 'Complete library access' },
  { id: 'belvedere', name: 'Belvedere Technical Teachers College', icon: GraduationCap, type: 'teachers', description: 'Technical education focus' },
  { id: 'mkoba', name: 'Mkoba Teachers College', icon: GraduationCap, type: 'teachers', description: 'Primary & Secondary education' },
  { id: 'morgenster', name: 'Morgenster Teachers College', icon: GraduationCap, type: 'teachers', description: 'Mission-based excellence' },
  { id: 'hararepoly', name: 'Harare Polytechnic', icon: Building2, type: 'polytechnic', description: 'Engineering & Applied Arts' },
  { id: 'bulawayopoly', name: 'Bulawayo Polytechnic', icon: Building2, type: 'polytechnic', description: 'Mechanical & Hospitality' },
  { id: 'kwekwe', name: 'Kwekwe Polytechnic', icon: Building2, type: 'polytechnic', description: 'Mining & Heavy Engineering' },
  { id: 'mutare', name: 'Mutare Polytechnic', icon: Building2, type: 'polytechnic', description: 'Civil Engineering & Tourism' },
  { id: 'mupfure', name: 'Mupfure Self-Help College', icon: Wrench, type: 'vocational', description: 'Entrepreneurial skills' },
  { id: 'kaguvi', name: 'Kaguvi VTC', icon: Wrench, type: 'vocational', description: 'Practical trades training' },
];

export default function Home() {
  const { user, profile } = { user: { id: 'guest' }, profile: { first_name: 'Scholar', role: 'student' } };
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [recentlyAddedBooks, setRecentlyAddedBooks] = useState([]);
  const [africanBooks, setAfricanBooks] = useState([]);
  const [vocationalSchools, setVocationalSchools] = useState([]);
  const [isDaraModalOpen, setIsDaraModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [daraInitialMessage, setDaraInitialMessage] = useState("");
  const [recentReads, setRecentReads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [selectedInstitution, setSelectedInstitution] = useState('all');
  const [libraryResources, setLibraryResources] = useState([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);

  const fetchLibraryResources = useCallback(async () => {
    setIsLibraryLoading(true);
    try {
      let query = supabase
        .from('books')
        .select(BOOK_SELECT)
        .eq('status', 'published')
        .limit(12);

      if (selectedInstitution !== 'all') {
        const inst = INSTITUTIONS.find(i => i.id === selectedInstitution);
        if (inst) {
          query = query.or(`institution_id.eq.${inst.id},description.ilike.%${inst.name}%,title.ilike.%${inst.name}%`);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setLibraryResources(transformBooks(data || []));
    } catch (err) {
      console.error("Error fetching library resources:", err);
    } finally {
      setIsLibraryLoading(false);
    }
  }, [selectedInstitution]);

  useEffect(() => {
    fetchLibraryResources();
  }, [fetchLibraryResources]);

  const fetchFeaturedBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let fData = [], pData = [], resData = [], vData = [], aData = [];

      // 1. Fetch Featured Books (General)
      try {
        const { data, error: fError } = await supabase
          .from('books')
          .select(BOOK_SELECT)
          .eq('status', 'published')
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(6);
        if (!fError) fData = data || [];
      } catch (e) { console.error("Featured fetch failed", e); }

      // 2. Fetch Partner Resources (OpenStax)
      try {
        const { data } = await supabase
          .from('books')
          .select(BOOK_SELECT)
          .eq('status', 'published')
          .eq('publisher_name', 'OpenStax')
          .limit(4);
        pData = data || [];
      } catch (e) { console.error("Partner fetch failed", e); }

      // 3. Fetch Featured Research (IDR)
      try {
        const { data } = await supabase
          .from('local_research')
          .select('*')
          .eq('status', 'approved')
          .order('publication_date', { ascending: false })
          .limit(4);
        resData = data || [];
      } catch (e) { console.error("Research fetch failed", e); }

      // 4. Fetch Vocational Partners
      try {
        const { data } = await supabase
          .from('vocational')
          .select('*')
          .limit(4);
        if (data) {
          vData = data;
          setVocationalSchools(data);
        }
      } catch (e) { console.error("Vocational fetch failed", e); }
      
      // 5. Fetch African
      try {
        const { data, error: aError } = await supabase
          .from('books')
          .select(BOOK_SELECT)
          .eq('status', 'published')
          .eq('is_african', true)
          .order('created_at', { ascending: false })
          .limit(4);
        if (!aError) aData = data || [];
      } catch (e) { console.error("African fetch failed", e); }

      let transformedAfrican = transformBooks(aData);
      
      // Fallback if no African books in DB
      if (transformedAfrican.length === 0) {
        transformedAfrican = getRecentlyAddedPipeline(4);
      }
      setAfricanBooks(transformedAfrican);

      // 6. Fetch Recently Added
      try {
        const { data, error: rError } = await supabase
          .from('books')
          .select(BOOK_SELECT)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(16);
        
        if (!rError && data && data.length > 0) {
          setRecentlyAddedBooks(transformBooks(data));
        } else {
          setRecentlyAddedBooks(getRecentlyAddedPipeline(16));
        }
      } catch (e) { 
        console.error("Recently added fetch failed", e);
        setRecentlyAddedBooks(getRecentlyAddedPipeline(16));
      }

      // Fetch Recent Reads if user logged in
      if (user) {
        try {
          const { data: rData } = await supabase
            .from('reading_sessions')
            .select(`
              last_read_at,
              books (*)
            `)
            .eq('user_id', user.id)
            .order('last_read_at', { ascending: false })
            .limit(3);
          
          if (rData) {
            setRecentReads(rData.map(r => transformBook(r.books)));
          }
        } catch (e) { console.error("Recent reads fetch failed", e); }
      }

      // Combine and Transform
      let combinedFeatured = [];
      
      // Add general featured
      if (fData.length > 0) {
        combinedFeatured = [...combinedFeatured, ...transformBooks(fData)];
      }

      // Add partner resources
      if (pData.length > 0) {
        combinedFeatured = [...combinedFeatured, ...transformBooks(pData)];
      }

      // PIPELINE FALLBACK: If we have less than 6 featured items, pull from our priority pipeline
      if (combinedFeatured.length < 6) {
        const pipelineItems = getFeaturedPipeline(6 - combinedFeatured.length);
        // Avoid duplicates
        const existingIds = new Set(combinedFeatured.map(b => b.id));
        const uniquePipeline = pipelineItems.filter(b => !existingIds.has(b.id));
        combinedFeatured = [...combinedFeatured, ...uniquePipeline];
      }

      // Add research papers (IDR)
      if (resData.length > 0) {
        const transformedRes = resData.map(res => transformBook({
          ...res,
          publisher_name: res.institution,
          year_published: res.publication_date ? new Date(res.publication_date).getFullYear() : null,
          description: res.abstract,
          type: 'research' // Flag for special handling if needed
        }));
        combinedFeatured = [...combinedFeatured, ...transformedRes];
      }

      // Fallback to OER if we still have very few items
      if (combinedFeatured.length < 4) {
        const otherOer = [...OPENSTAX_CURATED, ...ALL_ADDITIONAL_OER]
          .filter(b => b.id !== 'andrews-rev-1')
          .sort(() => 0.5 - Math.random());
        combinedFeatured = [...combinedFeatured, ...transformBooks(otherOer)];
      }

      // Shuffle a bit but keep some order
      combinedFeatured = combinedFeatured.sort(() => 0.5 - Math.random());

      // Always ensure the requested "Revelation of Jesus Christ" book is at the front
      const hasBook = combinedFeatured.some(b => b.id === 'andrews-rev-1');
      if (!hasBook) {
        combinedFeatured = [transformBook(ANDREWS_OER[0]), ...combinedFeatured];
      } else {
        const book = combinedFeatured.find(b => b.id === 'andrews-rev-1');
        combinedFeatured = [book, ...combinedFeatured.filter(b => b.id !== 'andrews-rev-1')];
      }

      setFeaturedBooks(combinedFeatured.slice(0, 16)); // Show more items now
    } catch (err) {
      console.error('Error fetching books:', err);
      // Only set error if we really have NO books to show
      if (featuredBooks.length === 0) {
        setError('Unable to load resources. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedBooks();
  }, []);

  const studentActions = [
    { title: 'Find Books', icon: <Search size={20} />, link: '/library', color: '#00C853' },
    { title: 'Upload Paper', icon: <Upload size={20} />, link: '/author', color: '#2196F3' },
    { title: 'Reading List', icon: <Bookmark size={20} />, link: '/dashboard', color: '#FF9800' },
    { title: 'DARA AI Tutor', icon: <MessageSquare size={20} />, action: () => {
      setDaraInitialMessage("Hi DARA! I'm ready to learn. Can you help me with my studies?");
      setIsDaraModalOpen(true);
    }, color: '#9C27B0' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white pt-24 pb-24 lg:pt-32 lg:pb-32">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-50/50 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50/50 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div 
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-6 border border-emerald-100"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Sparkles size={14} />
                <span>Zimbabwe's Premier Digital Library</span>
              </motion.div>
              
              <motion.h1 
                className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.2,
                      delayChildren: 0.4
                    }
                  }
                }}
              >
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
                    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
                  }}
                >
                  <span className="text-emerald-600">DARE</span> TO PRESERVE,
                </motion.div>
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
                    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
                  }}
                >
                  <span className="text-blue-600">DARE</span> TO SHARE
                </motion.div>
              </motion.h1>
              
              <motion.p 
                className="text-lg lg:text-xl text-slate-600 mb-10 max-w-xl leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                Empowering academic excellence through open access. 
                Aligned with <strong>NDS2 (2026-2030)</strong> and the five pillars of 
                <strong> Education 5.0</strong> to drive Zimbabwe's knowledge-based economy.
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-4 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                <Link 
                  to="/library" 
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-200 flex items-center gap-2 group"
                >
                  Explore Library
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/institutions" 
                  className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-semibold transition-all flex items-center gap-2"
                >
                  For Institutions
                </Link>
              </motion.div>

              <motion.div 
                className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
              >
                <div>
                  <div className="text-3xl font-bold text-slate-900">10+</div>
                  <div className="text-sm text-slate-500">Skill Tracks</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">2.5k+</div>
                  <div className="text-sm text-slate-500">Resources</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">44</div>
                  <div className="text-sm text-slate-500">Subjects</div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              className="relative hidden lg:block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative z-10 grid grid-cols-2 gap-4">
                <motion.div 
                  className="space-y-4 pt-12"
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="aspect-[3/4] rounded-2xl bg-emerald-100 overflow-hidden shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                    <img src="https://picsum.photos/seed/edu1/600/800" alt="Academic" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="aspect-square rounded-2xl bg-blue-100 overflow-hidden shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                    <img src="https://picsum.photos/seed/edu2/600/600" alt="Study" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                </motion.div>
                <motion.div 
                  className="space-y-4"
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <div className="aspect-square rounded-2xl bg-amber-100 overflow-hidden shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <img src="https://picsum.photos/seed/edu3/600/600" alt="Research" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="aspect-[3/4] rounded-2xl bg-rose-100 overflow-hidden shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                    <img src="https://picsum.photos/seed/edu4/600/800" alt="Library" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                </motion.div>
              </div>

              {/* Floating Badge */}
              <motion.div 
                className="absolute -bottom-6 -left-6 z-20 bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-4"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Unyanzvi</div>
                  <div className="text-xs text-slate-500">Practical Skills Focus</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES STRIP */}
      <div className="bg-slate-900 py-6 overflow-hidden border-y border-slate-800">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...FEATURES, ...FEATURES].map((feature, index) => (
            <div key={index} className="inline-flex items-center gap-3 px-8 text-slate-400 font-medium">
              <feature.icon size={18} className={feature.color} />
              <span>{feature.label}</span>
              <span className="mx-4 text-slate-700">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2.1 STRATEGIC ALIGNMENT SECTION */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Strategic Alignment</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Dare is built to support Zimbabwe's national vision, directly contributing to 
              <strong> NDS2 (2026-2030)</strong> and the <strong>Education 5.0</strong> framework.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {PILLARS.map((pillar, idx) => (
              <motion.button 
                key={pillar.name}
                onClick={() => setSelectedPillar(pillar)}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all text-left group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className={`w-12 h-12 ${pillar.color} text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <pillar.icon size={24} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">{pillar.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{pillar.description}</p>
                <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More <ChevronRight size={14} />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* PILLAR DETAIL MODAL */}
      <AnimatePresence>
        {selectedPillar && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPillar(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className={`h-32 ${selectedPillar.color} relative`}>
                <div className="absolute -bottom-8 left-8 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                  <selectedPillar.icon size={40} className={selectedPillar.color.replace('bg-', 'text-')} />
                </div>
                <button 
                  onClick={() => setSelectedPillar(null)}
                  className="absolute top-6 right-6 p-2 bg-black/10 hover:bg-black/20 rounded-full text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-10 pt-12">
                <h3 className="text-3xl font-bold text-slate-900 mb-4">{selectedPillar.name}</h3>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold mb-6">
                  Education 5.0 Pillar
                </div>
                <p className="text-slate-600 text-lg leading-relaxed mb-8">
                  {selectedPillar.longDescription}
                </p>
                <button 
                  onClick={() => setSelectedPillar(null)}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                >
                  Got it, thanks!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2.5 PERSONALIZED STUDY HUB */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-emerald-600 font-semibold mb-2">
                <Sparkles size={20} />
                <span>Study Hub</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Welcome, Scholar</h2>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
              <Zap size={16} />
              <span>Data Saver Mode Active</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Continue Reading - Bento Card */}
            <div className="lg:col-span-2 bg-slate-50 rounded-3xl p-8 border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Clock size={20} className="text-slate-400" />
                  Continue Reading
                </h3>
                <Link to="/dashboard" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">View All</Link>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {recentReads.length > 0 ? (
                  recentReads.map(book => (
                    <Link 
                      key={book.id} 
                      to={`/reader/${book.id}`} 
                      className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all flex gap-4"
                    >
                      <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                        {book.cover_url ? (
                          <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold">{book.title[0]}</div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <h4 className="font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">{book.title}</h4>
                        <p className="text-xs text-slate-500 truncate">{book.author_names}</p>
                        <div className="mt-2 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-1/3" />
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-2 py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                    <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">Your reading history will appear here.</p>
                    <Link to="/library" className="text-emerald-600 font-medium mt-2 inline-block">Explore Library</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions - Bento Card */}
            <div className="bg-emerald-900 text-white rounded-3xl p-8 shadow-xl shadow-emerald-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Cpu size={120} />
              </div>
              
              <h3 className="text-xl font-bold mb-6 relative z-10 flex items-center gap-2">
                <Zap size={20} className="text-emerald-400" />
                Quick Actions
              </h3>
              
              <div className="grid grid-cols-2 gap-3 relative z-10">
                {studentActions.map((action, idx) => (
                  action.link ? (
                    <Link 
                      key={idx} 
                      to={action.link} 
                      className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors flex flex-col items-center text-center gap-2"
                    >
                      <div className="p-2 rounded-lg bg-white/10">
                        {action.icon}
                      </div>
                      <span className="text-xs font-medium">{action.title}</span>
                    </Link>
                  ) : (
                    <button 
                      key={idx} 
                      onClick={action.action} 
                      className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors flex flex-col items-center text-center gap-2"
                    >
                      <div className="p-2 rounded-lg bg-white/10">
                        {action.icon}
                      </div>
                      <span className="text-xs font-medium">{action.title}</span>
                    </button>
                  )
                ))}
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-emerald-800/50 border border-emerald-700/50 relative z-10">
                <p className="text-sm text-emerald-100 mb-4">
                  Need a study plan for <strong>your studies</strong>?
                </p>
                <button 
                  onClick={() => {
                    setDaraInitialMessage("Can you help me create a study plan for my studies?");
                    setIsDaraModalOpen(true);
                  }}
                  className="w-full py-3 bg-white text-emerald-900 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} />
                  DARA AI Tutor
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED BOOKS */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured Academic Resources</h2>
              <p className="text-slate-600">Hand-picked high-quality textbooks and research papers.</p>
            </div>
            <Link to="/library" className="hidden md:flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all">
              View All Library <ArrowRight size={18} />
            </Link>
          </div>
          
          {error && (
            <div className="mb-8 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
              <button onClick={fetchFeaturedBooks} className="px-4 py-2 bg-rose-100 hover:bg-rose-200 rounded-lg font-bold transition-colors">Try Again</button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse">
                  <div className="aspect-[3/4] bg-slate-100 rounded-xl mb-4" />
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              ))
            ) : featuredBooks.length > 0 ? (
              featuredBooks.map(book => (
                <motion.div 
                  key={book.id} 
                  className="group relative"
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm group-hover:shadow-xl group-hover:border-emerald-200 transition-all h-full flex flex-col">
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-4 shadow-inner bg-slate-100">
                      <BookCard publication={book} />
                      <div className="absolute inset-0 bg-emerald-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Link 
                          to={`/book/${book.id}`} 
                          className="px-6 py-3 bg-white text-emerald-900 rounded-xl font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : !error && (
              <div className="col-span-full py-20 text-center">
                <p className="text-slate-500">No featured resources available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* RECENTLY ADDED BOOKS */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold mb-2">
                <Clock size={20} />
                <span>New Arrivals</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Recently Added Books</h2>
              <p className="text-slate-600">The latest additions to our growing digital collection.</p>
            </div>
            <Link to="/library?sort=newest" className="hidden md:flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all">
              See All New <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 animate-pulse">
                  <div className="aspect-[3/4] bg-slate-200 rounded-xl mb-4" />
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              ))
            ) : recentlyAddedBooks.length > 0 ? (
              recentlyAddedBooks.map(book => (
                <motion.div 
                  key={book.id} 
                  className="group relative"
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-sm group-hover:shadow-xl group-hover:border-indigo-200 transition-all h-full flex flex-col">
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-4 shadow-inner bg-slate-200">
                      <BookCard publication={book} />
                      <div className="absolute inset-0 bg-indigo-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Link 
                          to={`/book/${book.id}`} 
                          className="px-6 py-3 bg-white text-indigo-900 rounded-xl font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-slate-500">No new resources added recently.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3.5 INSTITUTIONAL LIBRARY EXPLORER */}
      <section id="library-explorer" className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar: Institutional Guide */}
            <aside className="lg:w-1/3 xl:w-1/4">
              <div className="sticky top-32 bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Institutional Guide</h3>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Filter by Relevance</p>
                  </div>
                </div>

                <nav className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {INSTITUTIONS.map((inst) => (
                    <button
                      key={inst.id}
                      onClick={() => {
                        setSelectedInstitution(inst.id);
                        document.getElementById('library-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className={`w-full flex items-start gap-4 p-4 rounded-2xl transition-all text-left group ${
                        selectedInstitution === inst.id
                          ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 scale-[1.02]'
                          : 'hover:bg-slate-50 text-slate-600 hover:text-emerald-600'
                      }`}
                    >
                      <div className={`mt-1 p-2 rounded-xl transition-colors ${
                        selectedInstitution === inst.id ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-emerald-100'
                      }`}>
                        <inst.icon size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-sm leading-tight mb-1">{inst.name}</div>
                        <div className={`text-[10px] font-medium uppercase tracking-tighter opacity-70 ${
                          selectedInstitution === inst.id ? 'text-emerald-50' : 'text-slate-400'
                        }`}>
                          {inst.type}
                        </div>
                      </div>
                    </button>
                  ))}
                </nav>

                <div className="mt-8 pt-8 border-t border-slate-100">
                  <div className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                      <Sparkles size={80} />
                    </div>
                    <p className="text-xs font-medium text-slate-400 mb-2">Need custom access?</p>
                    <h4 className="font-bold text-sm mb-4">Partner with DARE for your institution.</h4>
                    <button 
                      onClick={() => setIsTourOpen(true)}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-bold transition-colors"
                    >
                      Request Integration
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div id="library-content" className="lg:w-2/3 xl:w-3/4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    {INSTITUTIONS.find(i => i.id === selectedInstitution)?.name}
                  </h2>
                  <p className="text-slate-600">
                    {INSTITUTIONS.find(i => i.id === selectedInstitution)?.description}
                  </p>
                </div>
                <Link to="/library" className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all">
                  View Full Library <ArrowRight size={20} />
                </Link>
              </div>

              {isLibraryLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-pulse">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-slate-200 rounded-[2rem] aspect-[3/4]" />
                  ))}
                </div>
              ) : libraryResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {libraryResources.map((book, idx) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <BookCard publication={book} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-200">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                    <Library size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">No resources found</h3>
                  <p className="text-slate-500 max-w-md mx-auto">
                    We couldn't find any resources specifically tagged for this institution yet. 
                    Try browsing our general collection.
                  </p>
                  <button 
                    onClick={() => setSelectedInstitution('all')}
                    className="mt-8 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Show All Resources
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. SPECIALIZED PORTALS - BENTO GRID */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Specialized Academic Portals</h2>
            <p className="text-lg text-slate-600">Tailored resources for specific academic tracks and institutional partners.</p>
          </div>

          <div className="grid md:grid-cols-12 gap-6 auto-rows-[240px]">
            {/* AI & Future Tech - Large Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-8 md:row-span-2 bg-slate-900 rounded-[2.5rem] p-10 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-12 opacity-20 group-hover:scale-110 transition-transform duration-700">
                <Cpu size={300} strokeWidth={0.5} className="text-emerald-500" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-6 border border-emerald-500/20">
                    <Sparkles size={14} />
                    <span>Cutting Edge</span>
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-4">AI & Future Tech</h3>
                  <p className="text-slate-400 max-w-md text-lg leading-relaxed">
                    Stay ahead of the curve with our curated collection of Artificial Intelligence, 
                    Robotics, and Machine Learning resources.
                  </p>
                </div>
                <Link to="/ai-textbooks" className="inline-flex items-center gap-2 text-emerald-400 font-bold hover:gap-3 transition-all text-lg">
                  Browse Collection <ArrowRight size={20} />
                </Link>
              </div>
            </motion.div>

            {/* Partner Resources - Medium Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-4 md:row-span-1 bg-amber-500 rounded-[2.5rem] p-8 relative overflow-hidden group"
            >
              <div className="absolute -bottom-4 -right-4 opacity-20 group-hover:rotate-12 transition-transform">
                <Library size={120} />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-amber-950 mb-2">Partner Resources</h3>
                <p className="text-amber-900/70 text-sm mb-6">Peer-reviewed, openly licensed textbooks.</p>
                <Link to="/openstax" className="inline-flex items-center gap-2 text-amber-950 font-bold text-sm">
                  Explore <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>

            {/* Vocational - Medium Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-4 md:row-span-1 bg-blue-600 rounded-[2.5rem] p-8 relative overflow-hidden group text-white"
            >
              <div className="absolute -bottom-4 -right-4 opacity-20 group-hover:-rotate-12 transition-transform">
                <Wrench size={120} />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">Vocational Portal</h3>
                <p className="text-blue-100 text-sm mb-6">Practical skills for the modern economy.</p>
                <Link to="/vocational" className="inline-flex items-center gap-2 text-white font-bold text-sm">
                  Browse Skills <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>

            {/* Teachers Colleges - Long Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-12 md:row-span-1 bg-emerald-600 rounded-[2.5rem] p-10 relative overflow-hidden group text-white"
            >
              <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                <GraduationCap size={200} />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-xl">
                  <h3 className="text-3xl font-bold mb-3">Teachers Colleges Portal</h3>
                  <p className="text-emerald-50 text-lg">
                    Specialized tools for Zimbabwe's future educators. MoPSE-aligned lesson planners 
                    and ZIMCHE accreditation reports.
                  </p>
                </div>
                <Link to="/teachers-colleges" className="px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold hover:bg-emerald-50 transition-colors whitespace-nowrap">
                  Explore Portal
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. FACULTY BROWSE */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Browse by Faculty</h2>
              <p className="text-slate-600">Find resources categorized by your area of study.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {FACULTIES.map((faculty) => (
              <Link 
                key={faculty.id} 
                to={faculty.path || `/library?faculty=${faculty.id}`}
                className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-200 hover:shadow-xl transition-all text-center"
              >
                <div className={`w-16 h-16 mx-auto rounded-2xl ${faculty.bg} ${faculty.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <faculty.icon size={32} />
                </div>
                <span className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{faculty.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. WHY DARE */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-8 leading-tight">
                Bridging the Gap in <br />
                <span className="text-emerald-600">Zimbabwean Education</span>
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                DARE Digital Library is more than just a repository. It's a mission-driven platform 
                designed to ensure that every student and researcher in Zimbabwe has access to 
                world-class academic materials, regardless of their location or bandwidth.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">ZIMCHE Standards</h4>
                    <p className="text-slate-500 text-sm">All content is curated to align with national accreditation requirements.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <WifiOff size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Offline-First Design</h4>
                    <p className="text-slate-500 text-sm">Optimized for low-bandwidth environments with robust offline reading capabilities.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Global & Local</h4>
                    <p className="text-slate-500 text-sm">Integrating global OER with local research from Zimbabwean institutions.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative z-10 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                  <Database size={200} />
                </div>
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium mb-6">
                    <Database size={14} />
                    <span>Research Spotlight</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-6">Zimbabwe Institutional Repository (IDR)</h3>
                  <p className="text-slate-300 mb-8 leading-relaxed">
                    Discover groundbreaking research from local institutions. We integrate with 
                    OpenAlex and local repositories to bring Zimbabwean knowledge to the global stage.
                  </p>
                  <Link 
                    to="/research" 
                    className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold transition-all"
                  >
                    Browse Local Research <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* 7. INSTITUTION CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="bg-emerald-600 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-900/20">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
            </div>
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Empower Your Institution</h2>
              <p className="text-xl text-emerald-50 mb-10 leading-relaxed">
                Join the network of leading Zimbabwean universities and colleges 
                transforming education through digital access and knowledge sharing.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => setIsTourOpen(true)} 
                  className="px-10 py-5 bg-white text-emerald-600 rounded-2xl font-bold text-lg hover:bg-emerald-50 transition-all shadow-xl"
                >
                  Request a Demo
                </button>
                <Link 
                  to="/institutions" 
                  className="px-10 py-5 bg-emerald-700 text-white rounded-2xl font-bold text-lg hover:bg-emerald-800 transition-all border border-emerald-500"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DaraChatModal 
        isOpen={isDaraModalOpen} 
        onClose={() => setIsDaraModalOpen(false)} 
        initialMessage={daraInitialMessage}
      />

      <DemoTour 
        isOpen={isTourOpen} 
        onClose={() => setIsTourOpen(false)} 
      />
    </div>
  );
}
