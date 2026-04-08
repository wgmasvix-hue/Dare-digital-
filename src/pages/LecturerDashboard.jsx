import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  BarChart2, 
  Plus, 
  FileText, 
  Clock,
  AlertCircle,
  ChevronRight,
  Wand2,
  Wrench,
  TrendingUp,
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
  GraduationCap
} from 'lucide-react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import DaraChatModal from '../components/library/DaraChatModal';

export default function LecturerDashboard() {
  const { user, profile, institution } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeCourses: 0,
    totalStudents: 0,
    contentViews: 0
  });
  const [recentUploads, setRecentUploads] = useState([]);
  const [engagementData, setEngagementData] = useState([]);
  const [isDaraModalOpen, setIsDaraModalOpen] = useState(false);
  const [daraInitialMessage, setDaraInitialMessage] = useState("");

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      // 1. Fetch recent uploads by this lecturer
      const { data: uploads } = await supabase
        .from('books')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      setRecentUploads(uploads || []);
      
      // 2. Fetch Stats
      const subjects = new Set(uploads?.map(b => b.subject).filter(Boolean));
      const bookIds = uploads?.map(b => b.id) || [];
      let uniqueStudents = 0;
      let totalViews = 0;
      
      if (bookIds.length > 0) {
        const { data: sessions } = await supabase
          .from('reading_sessions')
          .select('user_id')
          .in('book_id', bookIds);
        
        uniqueStudents = new Set(sessions?.map(s => s.user_id)).size;
        totalViews = sessions?.length || 0;

        // 3. Engagement Chart Data (Last 7 days)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const usageMap = {};
        days.forEach(d => usageMap[d] = 0);
        
        const { data: recentSessions } = await supabase
          .from('reading_sessions')
          .select('last_read_at')
          .in('book_id', bookIds);
        
        recentSessions?.forEach(s => {
          const date = new Date(s.last_read_at);
          const dayName = days[date.getDay()];
          usageMap[dayName]++;
        });
        
        setEngagementData(days.map(name => ({ name, views: usageMap[name] })));
      } else {
        setEngagementData(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(name => ({ name, views: 0 })));
      }

      setStats({
        activeCourses: subjects.size || 0,
        totalStudents: uniqueStudents,
        contentViews: totalViews
      });
      
    } catch (error) {
      console.error('Error fetching lecturer data:', error);
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
        <p className="text-[#8E8271] font-medium animate-pulse">Loading lecturer portal...</p>
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
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=2000" 
            alt="Lecturer Dashboard Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#3D3028] via-[#3D3028]/80 to-transparent" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[#C8861A] font-semibold mb-2">
            <GraduationCap className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest">Lecturer Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-2">
            Welcome, {profile?.title || 'Dr.'} {profile?.last_name || 'Lecturer'}
          </h1>
          <div className="flex items-center gap-3">
            {institution?.logo_url && (
              <img src={institution.logo_url} alt={institution.name} className="w-8 h-8 object-contain rounded-md border border-white/20 p-0.5 bg-white" />
            )}
            <p className="text-white/70">
              {institution?.name || 'Academic Institution'} • {profile?.department || 'Faculty'}
            </p>
          </div>
        </div>
        
        <Link 
          to="/upload" 
          className="relative z-10 bg-[#C8861A] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#D8962A] transition-all shadow-xl shadow-black/20"
        >
          <Plus size={18} /> Upload Resource
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
              <p className="text-[#3D3028] font-serif text-3xl mb-1">{stats.activeCourses}</p>
              <p className="text-[#8E8271] text-xs font-bold uppercase tracking-wider">Active Courses</p>
            </div>
          </div>
          
          <div className="bg-white border border-[#E8DFD0] p-6 rounded-3xl flex flex-col justify-between shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-8">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[#3D3028] font-serif text-3xl mb-1">{stats.totalStudents}</p>
              <p className="text-[#8E8271] text-xs font-bold uppercase tracking-wider">Students Enrolled</p>
            </div>
          </div>

          <Link to="/teacher-tools" className="group bg-[#3D3028] p-6 rounded-3xl flex flex-col justify-between hover:bg-[#4D4038] transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Wand2 className="w-24 h-24 text-white" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white mb-8">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white font-serif text-xl mb-1">AI Planner</p>
              <p className="text-white/60 text-xs">Lesson & Assessment</p>
            </div>
          </Link>

          <Link to="/vocational-tools" className="group bg-[#C8861A] p-6 rounded-3xl flex flex-col justify-between hover:bg-[#D8962A] transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Wrench className="w-24 h-24 text-white" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white mb-8">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white font-serif text-xl mb-1">Skills Lab</p>
              <p className="text-white/60 text-xs">Practical Guides</p>
            </div>
          </Link>
        </motion.div>

        {/* Engagement Chart - Bento Item */}
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-white border border-[#E8DFD0] rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-serif text-[#3D3028]">Student Engagement</h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#8E8271] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#C8861A]"></span>
              Content Views
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis 
                  dataKey="name" 
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
                  cursor={{ fill: '#FDFCF9' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #E8DFD0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    fontFamily: 'Inter, sans-serif'
                  }}
                />
                <Bar dataKey="views" fill="#C8861A" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Uploads & Notifications Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        
        {/* Recent Uploads */}
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-white border border-[#E8DFD0] rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#C8861A]">
                <Upload className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-serif text-[#3D3028]">Recent Uploads</h2>
            </div>
            <Link to="/my-content" className="text-sm font-semibold text-[#C8861A] hover:underline flex items-center gap-1">
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
                  <th className="pb-4 font-serif text-[#8E8271] font-medium">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {recentUploads.length > 0 ? (
                  recentUploads.map(upload => (
                    <tr key={upload.id} className="group hover:bg-[#FDFCF9] transition-colors">
                      <td className="py-4 font-medium text-[#3D3028]">{upload.title}</td>
                      <td className="py-4 text-[#8E8271] text-sm">{new Date(upload.created_at).toLocaleDateString()}</td>
                      <td className="py-4">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider">Published</span>
                      </td>
                      <td className="py-4 text-[#3D3028] font-mono">{upload.total_reads || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-[#8E8271] italic">
                      No uploads yet. Start by uploading course materials.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={itemVariants} className="lg:col-span-4 bg-white border border-[#E8DFD0] rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-600">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-serif text-[#3D3028]">Notifications</h2>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 p-4 rounded-2xl bg-orange-50/50 border border-orange-100">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 text-orange-600">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#3D3028] mb-1">System Maintenance</p>
                <p className="text-xs text-[#8E8271]">Scheduled for Sat, 2 AM. Library will be offline for 1 hour.</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 text-emerald-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#3D3028] mb-1">New Enrollment</p>
                <p className="text-xs text-[#8E8271]">5 new students joined your "Intro to AI" course today.</p>
              </div>
            </div>
          </div>

          <button className="block w-full mt-10 py-3 rounded-xl border border-[#E8DFD0] text-center text-sm font-bold text-[#3D3028] hover:bg-[#FDFCF9] transition-colors">
            View All Notifications
          </button>
        </motion.div>
      </div>

      {/* Floating Action Button - Dara AI */}
      <motion.button 
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setDaraInitialMessage("Hi DARA! I'm on my lecturer dashboard. Can you help me analyze student engagement for my latest uploads?");
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
        institutionId={institution?.id}
      />
    </motion.div>
  );
}
