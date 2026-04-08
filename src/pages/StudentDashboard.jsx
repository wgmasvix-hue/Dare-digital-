import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  ChevronRight, 
  Flame,
  Bookmark,
  PlayCircle,
  AlertCircle,
  User,
  Settings,
  Activity,
  Sprout,
  Briefcase,
  GraduationCap,
  Cpu,
  Sparkles,
  PlusCircle,
  Search,
  BookMarked,
  ArrowUpRight,
  History,
  Upload,
  Library,
  MessageSquare,
  Target,
  Zap,
  Award,
  Globe,
  Trophy
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  CartesianGrid,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { motion } from 'motion/react';
import DaraChatModal from '../components/library/DaraChatModal';
import BadgeDisplay from '../components/gamification/BadgeDisplay';
import { supabase } from '../lib/supabase';
import { transformBooks, BOOK_SELECT } from '../lib/transformBook';
import { getRecommendedByFaculty, getRecentlyAddedPipeline } from '../lib/featuredPipeline';
import { useAuth } from '../hooks/useAuth';
import { useGamification } from '../context/GamificationContext';
import { getLeaderboardData, getMotivationalMessage } from '../services/leaderboardService';
import BookCard from '../components/library/BookCard';

export default function StudentDashboard() {
  const { user, profile, institution } = useAuth();
  const { xp, streak, level, getLevelInfo, unlockBadge } = useGamification();
  
  useEffect(() => {
    unlockBadge('first_search');
  }, [unlockBadge]);
  
  const [continueReading, setContinueReading] = useState([]);
  const [readingLists, setReadingLists] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [myUploads, setMyUploads] = useState([]);
  const [studyData, setStudyData] = useState([]);
  const [skillData, setSkillData] = useState([]);
  const [leaderboardRank, setLeaderboardRank] = useState(null);
  const [stats, setStats] = useState({ booksStarted: 0, pagesRead: 0, hoursRead: 0, totalUploads: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDaraModalOpen, setIsDaraModalOpen] = useState(false);
  const [daraInitialMessage, setDaraInitialMessage] = useState("");

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      // Fetch Leaderboard Position
      const lbData = getLeaderboardData('weekly', xp, streak, user, profile);
      const userRank = lbData.findIndex(u => u.isCurrentUser) + 1;
      setLeaderboardRank({
        rank: userRank,
        message: getMotivationalMessage(userRank, lbData.length)
      });

      // 0. My Uploads
      const { data: uploads } = await supabase
        .from('books')
        .select(BOOK_SELECT)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4);
      
      setMyUploads(transformBooks(uploads));

      // 1.5 Recent Activity
      const { data: activity } = await supabase
        .from('reading_sessions')
        .select(`*, book:books(title)`)
        .eq('user_id', user.id)
        .order('last_read_at', { ascending: false })
        .limit(5);
      setRecentActivity(activity || []);

      // 1. Continue Reading
      const { data: sessions, error: sessionsError } = await supabase
        .from('reading_sessions')
        .select(`*, book:books(*)`)
        .eq('user_id', user.id)
        .lt('completion_percentage', 100)
        .order('last_read_at', { ascending: false })
        .limit(3);
      
      if (sessionsError) {
        const { data: fallbackSessions } = await supabase
          .from('reading_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('last_read_at', { ascending: false })
          .limit(3);
        setContinueReading(fallbackSessions || []);
      } else {
        const transformedSessions = (sessions || []).map(s => ({
            ...s,
            book: s.book ? {
                ...s.book,
                cover_path: s.book.cover_image_url
            } : null
        }));
        setContinueReading(transformedSessions);
      }

      // 2. Reading Lists
      const { data: lists } = await supabase
        .from('reading_lists')
        .select('*, reading_list_items(count)')
        .or(`created_by.eq.${user.id},is_public.eq.true`)
        .limit(4);
      
      setReadingLists(lists || []);

      // 3. Recommended
      let recsData = [];
      if (profile?.faculty) {
        const { data: facultyRecs } = await supabase
          .from('books')
          .select(BOOK_SELECT)
          .ilike('subject', `%${profile.faculty}%`)
          .limit(4);
        recsData = facultyRecs || [];
      }

      if (recsData.length < 4) {
        const { data: fallbackRecs } = await supabase
          .from('books')
          .select(BOOK_SELECT)
          .eq('status', 'published')
          .order('total_reads', { ascending: false })
          .limit(4 - recsData.length);
        
        if (fallbackRecs) {
          const existingIds = new Set(recsData.map(r => r.id));
          const uniqueFallbacks = fallbackRecs.filter(r => !existingIds.has(r.id));
          recsData = [...recsData, ...uniqueFallbacks];
        }
      }
      
      let transformedRecs = transformBooks(recsData);

      if (transformedRecs.length < 4) {
        const pipelineRecs = getRecommendedByFaculty(profile?.faculty || 'General', 4 - transformedRecs.length);
        const existingIds = new Set(transformedRecs.map(r => r.id));
        const uniquePipeline = pipelineRecs.filter(r => !existingIds.has(r.id));
        transformedRecs = [...transformedRecs, ...uniquePipeline];
      }
      
      setRecommended(transformedRecs);

      // 4. Recently Added
      const { data: recent } = await supabase
        .from('books')
        .select(BOOK_SELECT)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(4);
      
      let transformedRecent = transformBooks(recent);
      
      if (transformedRecent.length < 4) {
        const pipelineRecent = getRecentlyAddedPipeline(4 - transformedRecent.length);
        const existingIds = new Set(transformedRecent.map(r => r.id));
        const uniquePipeline = pipelineRecent.filter(r => !existingIds.has(r.id));
        transformedRecent = [...transformedRecent, ...uniquePipeline];
      }
      
      setRecentlyAdded(transformedRecent);

      // 5. Reading Stats
      const totalPages = sessions?.reduce((acc, s) => acc + (s.last_page || 0), 0) || 0;
      const estimatedHours = Math.max(1, Math.round(totalPages * 2 / 60));

      setStats({
        booksStarted: sessions?.length || 0,
        pagesRead: totalPages,
        hoursRead: estimatedHours,
        totalUploads: uploads?.length || 0
      });

      // 6. Study Progress Data
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const mockStudyData = days.map(day => ({
        name: day,
        pages: Math.floor(Math.random() * 20) + 5
      }));
      setStudyData(mockStudyData);

      // 7. Skill Data (Radar)
      const mockSkillData = [
        { subject: 'AI Foundations', A: 85, fullMark: 100 },
        { subject: 'Data Science', A: 65, fullMark: 100 },
        { subject: 'Ethics', A: 90, fullMark: 100 },
        { subject: 'Research', A: 45, fullMark: 100 },
        { subject: 'Programming', A: 75, fullMark: 100 },
        { subject: 'Mathematics', A: 60, fullMark: 100 },
      ];
      setSkillData(mockSkillData);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

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
        <p className="text-[#8E8271] font-medium animate-pulse">Preparing your library...</p>
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
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between text-red-800">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span>{error}</span>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-red-800 text-white rounded-lg text-sm font-semibold hover:bg-red-900 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Welcome Header */}
      <motion.header 
        variants={itemVariants} 
        className="relative overflow-hidden bg-primary p-12 rounded-[2.5rem] mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 shadow-premium"
      >
        {/* Real Book Background Image */}
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=2000" 
            alt="Dashboard Header Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-accent font-semibold mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs uppercase tracking-[0.2em] font-bold">Student Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-4 leading-tight">
            {getGreeting()}, <br />
            <span className="text-accent italic">{profile?.first_name || 'Scholar'}</span>
          </h1>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 pr-4 rounded-full border border-white/20 w-fit">
            {institution?.logo_url ? (
              <img src={institution.logo_url} alt={institution.name} className="w-8 h-8 object-contain rounded-full border border-white/20 p-0.5 bg-white" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white">
                <GraduationCap size={16} />
              </div>
            )}
            <p className="text-white/80 text-sm font-medium">
              {institution?.name || 'Independent Scholar'} • {profile?.programme || 'General Studies'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400">
              <Flame className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] text-white/50 uppercase font-black tracking-widest mb-1">Current Streak</p>
              <p className="text-2xl font-mono font-bold text-white leading-none">{streak} Days</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] text-white/50 uppercase font-black tracking-widest mb-1">Total XP</p>
              <p className="text-2xl font-mono font-bold text-white leading-none">{xp}</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        
        {/* Leaderboard Rank - Bento Item */}
        <motion.div variants={itemVariants} className="lg:col-span-3 bg-[#3D3028] text-white p-8 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy className="w-24 h-24" />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-[#C8861A] flex items-center justify-center mb-4 shadow-lg rotate-3">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <p className="text-[10px] uppercase font-bold opacity-60 tracking-widest mb-1">Weekly Rank</p>
            <h3 className="text-5xl font-mono font-bold mb-2">#{leaderboardRank?.rank || '??'}</h3>
            <p className="text-center text-sm font-serif italic mb-6 px-2">
              "{leaderboardRank?.message || 'Keep pushing, scholar!'}"
            </p>
            <Link to="/leaderboard" className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors text-center">
              View Leaderboard
            </Link>
          </div>
        </motion.div>

        {/* Continue Reading - Bento Item */}
        <motion.div variants={itemVariants} className="lg:col-span-6 bg-white border border-[#E8DFD0] rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#C8861A]">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-serif text-[#3D3028]">Continue Reading</h2>
            </div>
            <Link to="/history" className="text-sm font-semibold text-[#C8861A] hover:underline flex items-center gap-1">
              View History <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {continueReading.length > 0 ? (
              continueReading.map((session) => (
                <div key={session.id} className="group flex gap-4 p-4 rounded-2xl hover:bg-[#FDFCF9] transition-colors border border-transparent hover:border-[#E8DFD0]">
                  <div className="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden shadow-md bg-[#E8DFD0]">
                    {session.book?.cover_path ? (
                      <img src={session.book.cover_path} alt={session.book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#3D3028] text-white font-serif text-xl">
                        {session.book?.title?.charAt(0) || 'B'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-serif text-lg text-[#3D3028] line-clamp-1 mb-1">{session.book?.title || 'Untitled Book'}</h3>
                      <div className="flex items-center gap-2 text-xs text-[#8E8271]">
                        <Clock className="w-3 h-3" />
                        <span className="font-mono">Page {session.last_page} / {session.book?.page_count || '?'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-1 bg-[#E8DFD0] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#C8861A] rounded-full transition-all duration-1000"
                          style={{ width: `${session.completion_percentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#3D3028]">{session.completion_percentage}%</span>
                      <Link 
                        to={`/reader/${session.book_id}?page=${session.last_page}`} 
                        className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#C8861A] hover:bg-[#C8861A] hover:text-white transition-colors"
                      >
                        <PlayCircle className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center bg-[#FDFCF9] rounded-2xl border border-dashed border-[#E8DFD0]">
                <p className="text-[#8E8271]">No books in progress.</p>
                <Link to="/openstax" className="inline-block mt-4 text-[#C8861A] font-semibold hover:underline">Browse Books</Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Skill Radar - Bento Item */}
        <motion.div variants={itemVariants} className="lg:col-span-3 bg-white border border-[#E8DFD0] rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-serif text-[#3D3028]">Skill Radar</h2>
          </div>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                <PolarGrid stroke="#E8DFD0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#8E8271', fontSize: 8, fontWeight: 600 }} />
                <Radar
                  name="Scholar"
                  dataKey="A"
                  stroke="#C8861A"
                  fill="#C8861A"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-[#E8DFD0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#C8861A]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8271]">
                {getLevelInfo().current?.title || 'Scholar'}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#3D3028]">{xp} XP</span>
          </div>
        </motion.div>
      </div>

      {/* Badges Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        <motion.div variants={itemVariants} className="lg:col-span-12">
          <BadgeDisplay />
        </motion.div>
      </div>

      {/* Quick Actions Bar */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Link to="/openstax" className="group bg-white border border-[#E8DFD0] p-6 rounded-3xl flex items-center gap-4 hover:border-[#C8861A] hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-[#3D3028] group-hover:bg-[#3D3028] group-hover:text-white transition-all">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <p className="font-serif font-bold text-[#3D3028]">Explore</p>
            <p className="text-[10px] text-[#8E8271] uppercase font-bold tracking-tighter">OER Catalog</p>
          </div>
        </Link>
        
        <Link to="/upload" className="group bg-white border border-[#E8DFD0] p-6 rounded-3xl flex items-center gap-4 hover:border-[#C8861A] hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#C8861A] group-hover:bg-[#C8861A] group-hover:text-white transition-all">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="font-serif font-bold text-[#3D3028]">Upload</p>
            <p className="text-[10px] text-[#8E8271] uppercase font-bold tracking-tighter">Share Resource</p>
          </div>
        </Link>

        <button 
          onClick={() => {
            setDaraInitialMessage("Hi DARA! I'd like to create a new reading list for my research.");
            setIsDaraModalOpen(true);
          }}
          className="group bg-white border border-[#E8DFD0] p-6 rounded-3xl flex items-center gap-4 hover:border-[#C8861A] hover:shadow-md transition-all text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <p className="font-serif font-bold text-[#3D3028]">New List</p>
            <p className="text-[10px] text-[#8E8271] uppercase font-bold tracking-tighter">Organize</p>
          </div>
        </button>

        <Link to="/settings" className="group bg-white border border-[#E8DFD0] p-6 rounded-3xl flex items-center gap-4 hover:border-[#C8861A] hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-600 group-hover:bg-stone-600 group-hover:text-white transition-all">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <p className="font-serif font-bold text-[#3D3028]">Settings</p>
            <p className="text-[10px] text-[#8E8271] uppercase font-bold tracking-tighter">Preferences</p>
          </div>
        </Link>
      </motion.div>

      {/* Stats & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        
        {/* Reading Stats Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-white border border-[#E8DFD0] rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-serif text-[#3D3028]">Study Progress</h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#8E8271] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#C8861A]"></span>
              Pages Read
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8E8271', fontSize: 10, fontFamily: 'monospace' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8E8271', fontSize: 10, fontFamily: 'monospace' }}
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
                <Bar dataKey="pages" radius={[6, 6, 0, 0]} barSize={32}>
                  {studyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 5 ? '#3D3028' : '#C8861A'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-[#E8DFD0]">
            <div>
              <p className="text-[10px] text-[#8E8271] uppercase font-bold tracking-wider mb-1">Books Started</p>
              <p className="text-2xl font-mono font-bold text-[#3D3028]">{stats.booksStarted}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#8E8271] uppercase font-bold tracking-wider mb-1">Time Reading</p>
              <p className="text-2xl font-mono font-bold text-[#3D3028]">{stats.hoursRead}h</p>
            </div>
            <div>
              <p className="text-[10px] text-[#8E8271] uppercase font-bold tracking-wider mb-1">Uploads</p>
              <p className="text-2xl font-mono font-bold text-[#3D3028]">{stats.totalUploads}</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-4 bg-white border border-[#E8DFD0] rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-600">
              <History className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-serif text-[#3D3028]">Activity</h2>
          </div>

          <div className="space-y-6">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FDFCF9] border border-[#E8DFD0] flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 text-[#C8861A]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#3D3028] leading-tight mb-1">
                      {activity.completion_percentage >= 100 ? 'Completed' : 'Read'} {activity.book?.title}
                    </p>
                    <p className="text-[10px] font-mono text-[#8E8271]">
                      {new Date(activity.last_read_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#8E8271] text-center py-8">No recent activity.</p>
            )}
          </div>

          <Link to="/history" className="block w-full mt-10 py-3 rounded-xl border border-[#E8DFD0] text-center text-sm font-bold text-[#3D3028] hover:bg-[#FDFCF9] transition-colors">
            View Full History
          </Link>
        </motion.div>
      </div>

      {/* Recommended For You */}
      <motion.section variants={itemVariants} className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-serif text-[#3D3028]">Recommended for {profile?.faculty || 'You'}</h2>
          </div>
          <Link to="/openstax" className="text-sm font-semibold text-[#C8861A] hover:underline flex items-center gap-1">
            Explore More <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {recommended.map((book) => (
            <BookCard key={book.id} publication={book} variant="grid" />
          ))}
        </div>
      </motion.section>

      {/* Reading Lists */}
      <motion.section variants={itemVariants} className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <BookMarked className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-serif text-[#3D3028]">Your Reading Lists</h2>
          </div>
          <Link to="/reading-lists" className="text-sm font-semibold text-[#C8861A] hover:underline flex items-center gap-1">
            Manage Lists <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {readingLists.length > 0 ? (
            readingLists.map((list) => (
              <Link 
                key={list.id} 
                to={`/reading-lists/${list.id}`}
                className="group bg-white border border-[#E8DFD0] p-5 rounded-2xl hover:border-[#C8861A] hover:shadow-md transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-[#C8861A] group-hover:bg-[#C8861A] group-hover:text-white transition-colors">
                  <Bookmark className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#3D3028] mb-0.5">{list.name}</h3>
                  <p className="text-xs text-[#8E8271] font-bold uppercase tracking-tighter">
                    {list.reading_list_items?.[0]?.count || 0} Books
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#E8DFD0] group-hover:text-[#C8861A] ml-auto" />
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-[#E8DFD0]">
              <p className="text-[#8E8271]">No reading lists yet.</p>
              <button 
                onClick={() => {
                  setDaraInitialMessage("Hi DARA! I'd like to create a new reading list for my research.");
                  setIsDaraModalOpen(true);
                }}
                className="mt-4 text-[#C8861A] font-semibold hover:underline flex items-center gap-2 mx-auto"
              >
                <PlusCircle className="w-4 h-4" /> Create your first list
              </button>
            </div>
          )}
        </div>
      </motion.section>

      {/* Partner Resources */}
      <motion.section variants={itemVariants} className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-600">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-serif text-[#3D3028]">Partner Resources</h2>
          </div>
          <Link to="/openstax" className="text-sm font-semibold text-[#C8861A] hover:underline flex items-center gap-1">
            Explore All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'agriculture', label: 'Agriculture', icon: Sprout, color: '#1B4332' },
            { id: 'business', label: 'Business', icon: Briefcase, color: '#C8861A' },
            { id: 'education', label: 'Education', icon: GraduationCap, color: '#D4AF37' },
            { id: 'stem', label: 'STEM', icon: Cpu, color: '#3D3028' }
          ].map(subject => (
            <Link 
              key={subject.id} 
              to={`/openstax?faculty=${subject.id}`} 
              className="flex flex-col items-center gap-4 p-6 bg-white border border-[#E8DFD0] rounded-2xl hover:border-[#C8861A] hover:shadow-md transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#FDFCF9] flex items-center justify-center text-[#8E8271] group-hover:bg-[#C8861A] group-hover:text-white transition-all">
                <subject.icon className="w-7 h-7" />
              </div>
              <span className="font-serif font-bold text-[#3D3028]">{subject.label}</span>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Floating Action Button - Dara AI */}
      <motion.button 
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setDaraInitialMessage("Mhoro DARA! I'm on my student dashboard. Can you help me organize my study schedule for this week?");
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
        programmeCode={profile?.programme}
        faculty={profile?.faculty}
        institutionId={institution?.id}
      />
    </motion.div>
  );
}
