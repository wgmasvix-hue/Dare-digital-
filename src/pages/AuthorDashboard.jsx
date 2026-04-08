import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Share2,
  ChevronRight,
  Award,
  Activity,
  Sparkles,
  PlusCircle,
  Search,
  BookMarked,
  ArrowUpRight,
  History,
  Upload,
  Library,
  MessageSquare,
  PenTool
} from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import DaraChatModal from '../components/library/DaraChatModal';

export default function AuthorDashboard() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReads: 0,
    royalties: 0,
    followers: 0
  });
  const [publications, setPublications] = useState([]);
  const [isDaraModalOpen, setIsDaraModalOpen] = useState(false);
  const [daraInitialMessage, setDaraInitialMessage] = useState("");
  
  // Mock Data for Charts
  const performanceData = [
    { month: 'Jan', reads: 120 },
    { month: 'Feb', reads: 180 },
    { month: 'Mar', reads: 250 },
    { month: 'Apr', reads: 310 },
    { month: 'May', reads: 280 },
    { month: 'Jun', reads: 420 },
  ];

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      // Fetch publications by this author
      const { data: books } = await supabase
        .from('books')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      setPublications(books || []);
      
      // Calculate total reads
      const totalReads = books?.reduce((acc, book) => acc + (book.total_reads || 0), 0) || 0;
      
      // Mock stats for now
      setStats({
        totalReads: totalReads + 1250, // Adding mock base
        royalties: 450.00,
        followers: 85
      });
      
    } catch (error) {
      console.error('Error fetching author data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF9] gap-4">
        <div className="w-12 h-12 border-4 border-[#E8DFD0] border-t-[#C8861A] rounded-full animate-spin"></div>
        <p className="text-[#8E8271] font-medium animate-pulse">Loading author portal...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 min-h-screen bg-[#FDFCF9]"
    >
      {/* HEADER */}
      <motion.header 
        variants={itemVariants} 
        className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 p-10 rounded-[32px] relative overflow-hidden bg-[#3D3028] text-white"
      >
        {/* Real Book Background Image */}
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=2000" 
            alt="Author Dashboard Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#3D3028] via-[#3D3028]/80 to-transparent" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[#C8861A] font-semibold mb-2">
            <PenTool className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest">Author Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-2">
            Hello, {profile?.first_name || 'Author'}
          </h1>
          <p className="text-white/70">
            Manage your publications and track your impact across the library.
          </p>
        </div>
        
        <Link 
          to="/author/upload" 
          className="relative z-10 bg-[#C8861A] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#D8962A] transition-all shadow-xl shadow-black/20"
        >
          <Plus size={18} /> New Publication
        </Link>
      </motion.header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        
        {/* Stats - Bento Item */}
        <motion.div variants={itemVariants} className="lg:col-span-4 grid grid-cols-2 gap-4">
          <div className="bg-white border border-[#E8DFD0] p-6 rounded-3xl flex flex-col justify-between shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#C8861A] mb-8">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[#3D3028] font-serif text-3xl mb-1">{stats.totalReads.toLocaleString()}</p>
              <p className="text-[#8E8271] text-xs font-bold uppercase tracking-wider">Total Reads</p>
            </div>
          </div>
          
          <div className="bg-white border border-[#E8DFD0] p-6 rounded-3xl flex flex-col justify-between shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-8">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[#3D3028] font-serif text-3xl mb-1">${stats.royalties.toFixed(2)}</p>
              <p className="text-[#8E8271] text-xs font-bold uppercase tracking-wider">Royalties Earned</p>
            </div>
          </div>

          <div className="bg-white border border-[#E8DFD0] p-6 rounded-3xl flex flex-col justify-between shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-8">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[#3D3028] font-serif text-3xl mb-1">{stats.followers}</p>
              <p className="text-[#8E8271] text-xs font-bold uppercase tracking-wider">Followers</p>
            </div>
          </div>

          <Link to="/author/works" className="group bg-[#C8861A] p-6 rounded-3xl flex flex-col justify-between hover:bg-[#D8962A] transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <BookMarked className="w-24 h-24 text-white" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white mb-8">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white font-serif text-xl mb-1">My Works</p>
              <p className="text-white/60 text-xs">Manage publications</p>
            </div>
          </Link>
        </motion.div>

        {/* Readership Growth Chart - Bento Item */}
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-white border border-[#E8DFD0] rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-serif text-[#3D3028]">Readership Growth</h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#8E8271] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#C8861A]"></span>
              Monthly Reads
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8861A" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#C8861A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8E8271', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8E8271', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ stroke: '#C8861A', strokeWidth: 2 }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #E8DFD0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    fontFamily: 'Inter, sans-serif'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="reads" 
                  stroke="#C8861A" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorReads)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Publications & Marketing Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        
        {/* Recent Publications */}
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-white border border-[#E8DFD0] rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#C8861A]">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-serif text-[#3D3028]">Recent Publications</h2>
            </div>
            <Link to="/author/works" className="text-sm font-semibold text-[#C8861A] hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E8DFD0]">
                  <th className="pb-4 font-serif text-[#8E8271] font-medium">Title</th>
                  <th className="pb-4 font-serif text-[#8E8271] font-medium">Date</th>
                  <th className="pb-4 font-serif text-[#8E8271] font-medium">Status</th>
                  <th className="pb-4 font-serif text-[#8E8271] font-medium">Reads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {publications.length > 0 ? (
                  publications.map(book => (
                    <tr key={book.id} className="group hover:bg-[#FDFCF9] transition-colors">
                      <td className="py-4 font-medium text-[#3D3028]">{book.title}</td>
                      <td className="py-4 text-[#8E8271] text-sm">{new Date(book.created_at).toLocaleDateString()}</td>
                      <td className="py-4">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider">Published</span>
                      </td>
                      <td className="py-4 text-[#3D3028] font-mono">{book.total_reads || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-[#8E8271] italic">
                      No publications yet. Start writing today!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Marketing Tools */}
        <motion.div variants={itemVariants} className="lg:col-span-4 bg-white border border-[#E8DFD0] rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-600">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-serif text-[#3D3028]">Marketing Tools</h2>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 p-4 rounded-2xl bg-orange-50/50 border border-orange-100 hover:border-orange-200 cursor-pointer transition-all">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 text-orange-600">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#3D3028] mb-1">Share Profile</p>
                <p className="text-xs text-[#8E8271]">Get your public author link to share on social media.</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 hover:border-emerald-200 cursor-pointer transition-all">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#3D3028] mb-1">Promote Work</p>
                <p className="text-xs text-[#8E8271]">Boost visibility for your latest work for 7 days.</p>
              </div>
            </div>
          </div>

          <button className="block w-full mt-10 py-3 rounded-xl border border-[#E8DFD0] text-center text-sm font-bold text-[#3D3028] hover:bg-[#FDFCF9] transition-colors">
            Explore All Tools
          </button>
        </motion.div>
      </div>

      {/* Floating Action Button - Dara AI */}
      <motion.button 
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setDaraInitialMessage("Hi DARA! I'm on my author dashboard. Can you help me brainstorm some marketing ideas for my books?");
          setIsDaraModalOpen(true);
        }}
        className="fixed bottom-8 right-8 bg-[#3D3028] text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 z-50 group hover:bg-[#4D4038] transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-[#C8861A] flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-sm tracking-tight">Ask Dara AI</span>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
      </motion.button>

      <DaraChatModal 
        isOpen={isDaraModalOpen} 
        onClose={() => setIsDaraModalOpen(false)} 
        initialMessage={daraInitialMessage}
      />
    </motion.div>
  );
}
