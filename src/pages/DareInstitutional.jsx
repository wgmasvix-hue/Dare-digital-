import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  LayoutDashboard, Settings, Users, FileText, Bot, Bell, Search,
  Plus, Download, ChevronRight, ChevronDown, Check, AlertCircle,
  BookOpen, GraduationCap, Building2, Globe, Mail, Phone, ExternalLink,
  MoreHorizontal, Filter, ArrowRight, X, Loader2, Upload
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

// ── CONSTANTS & DATA ────────────────────────────────────────────────────────

const COLORS = {
  navy: '#0F2340',
  navyMid: '#1B3A6B',
  teal: '#0B6E6E',
  gold: '#C5973A',
  cream: '#FAF8F4',
  creamDark: '#F0EDE6',
  border: '#D8D3C8',
  textDark: '#1A1A2E',
  textMid: '#3D4466',
  textLight: '#6B7280',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B'
};

const DOMAINS = [
  { id: 'D1', name: 'Foundations of Education', relevant: 'teachers' },
  { id: 'D2', name: 'Curriculum & Instruction', relevant: 'teachers' },
  { id: 'D3', name: 'Educational Management', relevant: 'teachers' },
  { id: 'D4', name: 'Agriculture & Natural Resources', relevant: 'vocational' },
  { id: 'D5', name: 'Food Technology & Nutrition', relevant: 'vocational' },
  { id: 'D6', name: 'Construction & Built Environment', relevant: 'vocational' },
  { id: 'D7', name: 'Business & Entrepreneurship', relevant: 'vocational' },
  { id: 'D8', name: 'ICT & Digital Skills', relevant: 'vocational' },
  { id: 'D9', name: 'Health Sciences', relevant: 'vocational' },
  { id: 'D10', name: 'Research & Academic Skills', relevant: 'both' }
];

const STUDENTS_DATA = [
  { email: 'student1@mkoba.ac.zw', name: 'Tafadzwa Moyo', status: 'Active', lastActive: '2 mins ago', sessions: 12, focus: 'Education' },
  { email: 'student2@mkoba.ac.zw', name: 'Chipo Dube', status: 'Active', lastActive: '1 hour ago', sessions: 8, focus: 'Science' },
  { email: 'student3@mkoba.ac.zw', name: 'Farai Gumbo', status: 'Pending', lastActive: '2 days ago', sessions: 0, focus: 'Arts' },
  { email: 'student4@mkoba.ac.zw', name: 'Nyasha Zvomuya', status: 'Suspended', lastActive: '1 week ago', sessions: 5, focus: 'Math' },
  { email: 'student5@mkoba.ac.zw', name: 'Simbarashe Phiri', status: 'Active', lastActive: '5 mins ago', sessions: 20, focus: 'History' },
];

const USAGE_TRENDS_DATA = [
  { week: 'Week 1', sessions: 120, users: 50 },
  { week: 'Week 2', sessions: 150, users: 60 },
  { week: 'Week 3', sessions: 180, users: 70 },
  { week: 'Week 4', sessions: 200, users: 80 },
];

const TOP_RESOURCES_DATA = [
  { rank: 1, title: 'Introduction to Pedagogy', domain: 'Education', accesses: 500, time: '15m', zim: true },
  { rank: 2, title: 'Advanced Curriculum Design', domain: 'Curriculum', accesses: 450, time: '20m', zim: false },
  { rank: 3, title: 'Classroom Management', domain: 'Management', accesses: 400, time: '10m', zim: true },
  { rank: 4, title: 'Educational Psychology', domain: 'Psychology', accesses: 350, time: '25m', zim: false },
  { rank: 5, title: 'Special Needs Education', domain: 'Special Needs', accesses: 300, time: '30m', zim: true },
];

const DOMAIN_COVERAGE_DATA = [
  { name: 'Education', count: 120 },
  { name: 'Science', count: 98 },
  { name: 'Arts', count: 86 },
  { name: 'Math', count: 99 },
  { name: 'History', count: 85 },
  { name: 'Geography', count: 65 },
];

const ENGAGEMENT_DATA = [
  { name: 'Active', value: 400, color: COLORS.teal },
  { name: 'Inactive', value: 300, color: COLORS.navy },
  { name: 'Pending', value: 300, color: COLORS.gold },
];

const SCHEDULED_REPORTS = [
  { type: 'Weekly Usage', freq: 'Weekly', recipients: 'admin@mkoba.ac.zw', last: '2023-10-01', next: '2023-10-08' },
  { type: 'Monthly Summary', freq: 'Monthly', recipients: 'principal@mkoba.ac.zw', last: '2023-09-01', next: '2023-10-01' },
];

// ── COMPONENTS ──────────────────────────────────────────────────────────────

const Card = ({ children, className = '', style = {} }) => (
  <div className={`rounded-xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow duration-300 bg-white ${className}`} style={style}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-200 text-gray-700',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    navy: 'bg-indigo-50 text-[var(--navy)]',
    teal: 'bg-teal-50 text-[var(--teal)]'
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
};

const Button = ({ children, variant = 'primary', className = '', onClick, disabled, icon: Icon }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleClick = async (e) => {
    if (onClick) {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API
      onClick(e);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  const baseStyle = "px-4 py-2 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2";
  const variants = {
    primary: 'bg-[var(--navy)] text-white hover:bg-[var(--navy-mid)]',
    secondary: 'bg-white text-[var(--navy)] border border-[var(--navy)] hover:bg-gray-50',
    teal: 'bg-[var(--teal)] text-white hover:bg-[var(--teal-light)]',
    outline: 'bg-transparent text-[var(--text-mid)] border border-[var(--border)] hover:bg-gray-50',
    ghost: 'bg-transparent text-[var(--text-mid)] hover:bg-gray-100'
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${className} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : success ? <Check className="w-4 h-4" /> : Icon ? <Icon className="w-4 h-4" /> : null}
      {children}
    </button>
  );
};

// ── SECTIONS ────────────────────────────────────────────────────────────────

const Overview = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    resourcesAccessed: 0,
    mostActiveDomain: '—',
    studentGrowth: '+0%',
    resourceGrowth: '+0%'
  });
  const [weeklyUsage, setWeeklyUsage] = useState([]);
  const [topSubjects, setTopSubjects] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [domainCoverage, setDomainCoverage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOverviewData() {
      try {
        setLoading(true);
        
        // 1. Fetch Stats
        const { count: studentCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student');
        
        const { count: resourceCount } = await supabase
          .from('books')
          .select('*', { count: 'exact', head: true });

        const { data: sessions } = await supabase
          .from('reading_sessions')
          .select('id, last_read_at');

        // 2. Weekly Usage Data (Last 7 days)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const usageMap = {};
        days.forEach(d => usageMap[d] = 0);
        
        sessions?.forEach(s => {
          const date = new Date(s.last_read_at);
          const dayName = days[date.getDay()];
          usageMap[dayName]++;
        });

        const weeklyData = days.map(day => ({ day, sessions: usageMap[day] }));
        setWeeklyUsage(weeklyData);

        // 3. Top Subjects (Proxy for searches)
        const { data: popularBooks } = await supabase
          .from('books')
          .select('subject, total_reads')
          .order('total_reads', { ascending: false })
          .limit(5);
        
        const subjects = popularBooks?.map((b, i) => ({
          rank: i + 1,
          subject: b.subject || 'General',
          searches: b.total_reads || 0,
          trend: 'up'
        })) || [];
        setTopSubjects(subjects);

        // 4. Recent Activity
        const { data: recentSessions } = await supabase
          .from('reading_sessions')
          .select(`*, user:profiles(first_name, last_name), book:books(title)`)
          .order('last_read_at', { ascending: false })
          .limit(5);
        
        const activity = recentSessions?.map(s => ({
          id: s.id,
          text: `${s.user?.first_name || 'A student'} read "${s.book?.title || 'a book'}"`,
          time: new Date(s.last_read_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })) || [];
        setRecentActivity(activity);

        // 5. Domain Coverage
        const domainCounts = {};
        const { data: allBooks } = await supabase.from('books').select('subject');
        allBooks?.forEach(b => {
          const sub = b.subject || 'Other';
          domainCounts[sub] = (domainCounts[sub] || 0) + 1;
        });

        const coverage = Object.entries(domainCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setDomainCoverage(coverage);

        setStats({
          totalStudents: studentCount || 0,
          resourcesAccessed: resourceCount || 0,
          mostActiveDomain: coverage[0]?.name || '—',
          studentGrowth: '+0%',
          resourceGrowth: '+0%'
        });

      } catch (error) {
        console.error('Error fetching dashboard overview:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOverviewData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--navy)]" />
        <p className="text-gray-500 font-medium">Loading Mkoba Teachers College Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[var(--navy)] via-[var(--navy-mid)] to-[var(--teal)] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-serif font-bold mb-2 tracking-tight">Welcome back, Library Officer</h2>
          <p className="text-blue-100 max-w-2xl text-lg opacity-90">Here's what's happening at Mkoba Teachers College today. Student engagement is up this week.</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 mix-blend-overlay">
          <BookOpen size={400} className="-mr-20 -mt-20" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Active Students', value: stats.totalStudents, sub: stats.studentGrowth, icon: Users, color: '#0F2340', bg: 'bg-blue-50' },
          { label: 'Resources Accessed', value: stats.resourcesAccessed, sub: stats.resourceGrowth, icon: BookOpen, color: '#0B6E6E', bg: 'bg-teal-50' },
          { label: 'Most Active Domain', value: stats.mostActiveDomain, sub: 'High Engagement', icon: GraduationCap, color: '#C5973A', bg: 'bg-amber-50' },
          { label: 'Subscription Status', value: 'Active', sub: 'Expires 31 Dec 2026', icon: Check, color: '#10B981', bg: 'bg-green-50' }
        ].map((stat, i) => (
          <Card key={i} className="p-6 border-l-4" style={{ borderLeftColor: stat.color }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold mb-2 text-gray-900">{stat.value}</h3>
                <div className="flex items-center gap-1 text-xs font-medium">
                  {stat.sub.includes('+') && stat.sub !== '+0%' ? 
                    <span className="bg-green-100 px-2 py-0.5 rounded-full text-green-700 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-green-600"></span>
                      {stat.sub}
                    </span> 
                    : <span className="text-gray-500">{stat.sub}</span>}
                </div>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} shadow-sm`}>
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-[var(--navy)]">Student Sessions This Week</h3>
                <p className="text-sm text-gray-500">Daily active sessions across all domains</p>
              </div>
              <select className="text-sm border-gray-200 rounded-lg p-2 bg-gray-50 text-gray-600 outline-none focus:ring-2 focus:ring-navy/20">
                <option>This Week</option>
                <option>Last Week</option>
              </select>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyUsage} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.navy} stopOpacity={0.15}/>
                      <stop offset="95%" stopColor={COLORS.navy} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)' }}
                    cursor={{ stroke: COLORS.navy, strokeWidth: 1, strokeDasharray: '5 5' }}
                  />
                  <Area type="monotone" dataKey="sessions" stroke={COLORS.navy} strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-serif font-bold text-[var(--navy)]">Top Popular Subjects</h3>
              <Button variant="ghost" className="text-xs h-8">View All</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase text-gray-500 font-semibold tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 pl-8">Rank</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Reads</th>
                    <th className="px-6 py-4">Trend</th>
                    <th className="px-6 py-4 text-right pr-8">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topSubjects.map((row) => (
                    <tr key={row.rank} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4 pl-8 font-bold text-gray-400">#{row.rank}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{row.subject}</td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{row.searches}</td>
                      <td className="px-6 py-4">
                        {row.trend === 'up' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">Trending Up</span>}
                        {row.trend === 'down' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">Trending Down</span>}
                        {row.trend === 'flat' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-100">Stable</span>}
                      </td>
                      <td className="px-6 py-4 text-right pr-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-[#0F2340] hover:text-[#0B6E6E] font-medium text-xs underline decoration-2 underline-offset-2">View Resources</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <Card className="p-0 h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-serif font-bold text-[var(--navy)]">Recent Activity</h3>
            </div>
            <div className="p-6 space-y-8 flex-1">
              {recentActivity.length > 0 ? recentActivity.map((act, i) => (
                <div key={act.id} className="flex gap-4 relative group">
                  {i !== recentActivity.length - 1 && <div className="absolute left-[7px] top-8 bottom-[-32px] w-0.5 bg-gray-100 group-hover:bg-gray-200 transition-colors" />}
                  <div className={`mt-1.5 w-4 h-4 rounded-full shrink-0 border-2 border-white shadow-md z-10 transition-transform group-hover:scale-110 ${i === 0 ? 'bg-[var(--teal)]' : 'bg-gray-200'}`} />
                  <div className="pb-2">
                    <p className="text-sm text-gray-900 font-medium leading-snug group-hover:text-[#0F2340] transition-colors">{act.text}</p>
                    <p className="text-xs text-gray-400 mt-1.5 font-medium uppercase tracking-wide">{act.time}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-500 text-center py-8">No recent activity found.</p>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50/30">
              <Button variant="outline" className="w-full justify-center">View All Activity</Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Row */}
      <Card className="p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-xl font-serif font-bold text-[var(--navy)]">Domain Coverage</h3>
            <p className="text-sm text-gray-500">Resource distribution across key academic domains</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="navy">Teachers College Scope</Badge>
          </div>
        </div>
        <div className="h-80 w-full">
          {domainCoverage.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainCoverage} layout="vertical" margin={{ left: 100, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F3F4F6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={180} tick={{ fill: COLORS.textDark, fontSize: 13, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill={COLORS.navyMid} radius={[0, 6, 6, 0]} barSize={40}>
                  {domainCoverage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? COLORS.navy : COLORS.navyMid} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">No domain data available.</div>
          )}
        </div>
      </Card>
    </div>
  );
};

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: 'Mkoba Teachers College',
    type: 'Teachers College',
    province: 'Midlands',
    city: 'Gweru',
    students: 1247,
    email: 'library@mkoba.ac.zw',
    website: '',
    tier: 'Standard',
    domains: ['D1', 'D2', 'D3', 'D10'],
    zimPriority: 80,
    accessMethod: 'email',
    emailDomain: '@mkoba.ac.zw',
    reqReg: true,
    guest: false,
    download: true,
    dara: true
  });

  const next = () => setStep(s => Math.min(s + 1, 4));
  const back = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Stepper */}
      <div className="flex justify-between items-center relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10" />
        {['Institution Profile', 'Domain Config', 'Student Access', 'Go Live'].map((label, i) => {
          const s = i + 1;
          const active = s === step;
          const completed = s < step;
          return (
            <div key={s} className="flex flex-col items-center gap-2 bg-white px-2 cursor-pointer" onClick={() => setStep(s)}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                active ? 'bg-[var(--navy)] text-white' : completed ? 'bg-[var(--teal)] text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {completed ? <Check size={16} /> : s}
              </div>
              <span className={`text-xs font-medium ${active ? 'text-[var(--navy)]' : 'text-gray-500'}`}>{label}</span>
            </div>
          );
        })}
      </div>

      <Card className="p-8 min-h-[500px]">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-[var(--navy)]">Institution Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Institution Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--navy)] focus:border-[var(--navy)] outline-none bg-[var(--cream)] border-[var(--border)]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Institution Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--navy)] focus:border-[var(--navy)] outline-none bg-[var(--cream)] border-[var(--border)]">
                  <option>Teachers College</option>
                  <option>Vocational Institute</option>
                  <option>Polytechnic</option>
                  <option>University College</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Province</label>
                <select value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--navy)] focus:border-[var(--navy)] outline-none bg-[var(--cream)] border-[var(--border)]">
                  <option>Midlands</option>
                  <option>Harare</option>
                  <option>Bulawayo</option>
                  <option>Manicaland</option>
                  {/* ... others */}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">City/Town</label>
                <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--navy)] focus:border-[var(--navy)] outline-none bg-[var(--cream)] border-[var(--border)]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Student Enrollment</label>
                <input type="number" value={formData.students} onChange={e => setFormData({...formData, students: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--navy)] focus:border-[var(--navy)] outline-none bg-[var(--cream)] border-[var(--border)]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Primary Contact Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--navy)] focus:border-[var(--navy)] outline-none bg-[var(--cream)] border-[var(--border)]" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Subscription Tier</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Starter', 'Standard', 'Premium'].map(tier => (
                  <div key={tier} 
                    onClick={() => setFormData({...formData, tier})}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${formData.tier === tier ? 'ring-2 ring-[var(--navy)] bg-blue-50 border-[var(--navy)]' : 'hover:bg-gray-50 border-[var(--border)]'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-[var(--navy)]">{tier}</span>
                      {formData.tier === tier && <Check size={16} className="text-[var(--navy)]" />}
                    </div>
                    <p className="text-xs text-gray-500">
                      {tier === 'Starter' ? '$1,200/yr' : tier === 'Standard' ? '$2,800/yr' : '$5,500/yr'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-[var(--navy)]">Domain Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DOMAINS.map(dom => {
                const active = formData.domains.includes(dom.id);
                return (
                  <div key={dom.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${active ? 'bg-[var(--navy)] text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {dom.id}
                      </div>
                      <span className="font-medium text-sm">{dom.name}</span>
                    </div>
                    <button 
                      onClick={() => {
                        const newDomains = active 
                          ? formData.domains.filter(d => d !== dom.id)
                          : [...formData.domains, dom.id];
                        setFormData({...formData, domains: newDomains});
                      }}
                      className={`w-10 h-6 rounded-full p-1 transition-colors ${active ? 'bg-[var(--teal)]' : 'bg-gray-300'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${active ? 'translate-x-4' : ''}`} />
                    </button>
                  </div>
                );
              })}
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <label className="text-sm font-medium text-gray-700 mb-4 block">Zimbabwe Content Priority: {formData.zimPriority}%</label>
              <input 
                type="range" min="0" max="100" value={formData.zimPriority} 
                onChange={e => setFormData({...formData, zimPriority: e.target.value})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--navy)]"
              />
              <p className="text-xs text-gray-500 mt-2">Prioritise Zimbabwe-specific resources in search results</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-[var(--navy)]">Student Access</h2>
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">Access Method</label>
              {['Email Domain Whitelist', 'CSV Upload', 'Manual Entry'].map(method => (
                <div key={method} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer" onClick={() => setFormData({...formData, accessMethod: method.toLowerCase().split(' ')[0]})}>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.accessMethod === method.toLowerCase().split(' ')[0] ? 'border-[var(--navy)]' : 'border-gray-400'}`}>
                    {formData.accessMethod === method.toLowerCase().split(' ')[0] && <div className="w-2 h-2 rounded-full bg-[var(--navy)]" />}
                  </div>
                  <span>{method}</span>
                </div>
              ))}
              {formData.accessMethod === 'email' && (
                <input type="text" value={formData.emailDomain} onChange={e => setFormData({...formData, emailDomain: e.target.value})} className="w-full p-2 border rounded bg-[var(--cream)]" />
              )}
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-[var(--navy)]">Access Settings</h3>
              {[
                { key: 'reqReg', label: 'Require student registration' },
                { key: 'guest', label: 'Allow guest browsing' },
                { key: 'download', label: 'Student can download resources' },
                { key: 'dara', label: 'DARA AI available to students' }
              ].map(setting => (
                <div key={setting.key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{setting.label}</span>
                  <button 
                    onClick={() => setFormData({...formData, [setting.key]: !formData[setting.key]})}
                    className={`w-10 h-6 rounded-full p-1 transition-colors ${formData[setting.key] ? 'bg-[var(--navy)]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${formData[setting.key] ? 'translate-x-4' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 text-center py-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-green-600" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-[var(--navy)]">Ready to Launch</h2>
            <div className="max-w-md mx-auto space-y-3 text-left bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 text-sm"><Check size={16} className="text-green-600" /> Institution profile complete</div>
              <div className="flex items-center gap-3 text-sm"><Check size={16} className="text-green-600" /> Domains configured ({formData.domains.length} selected)</div>
              <div className="flex items-center gap-3 text-sm"><Check size={16} className="text-green-600" /> Student access configured</div>
              <div className="flex items-center gap-3 text-sm"><Check size={16} className="text-green-600" /> {formData.students} student records ready</div>
              <div className="flex items-center gap-3 text-sm text-amber-600"><AlertCircle size={16} /> Payment confirmation pending</div>
            </div>
            <Button variant="primary" className="w-full max-w-md mx-auto py-3 text-lg" onClick={() => alert("Launched!")}>
              Launch Dare for {formData.name}
            </Button>
            <p className="text-sm text-gray-500">Your library will be live within 2 hours of payment confirmation</p>
          </div>
        )}
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={back} disabled={step === 1}>Back</Button>
        {step < 4 && <Button variant="primary" onClick={next}>Save & Continue <ArrowRight size={16} /></Button>}
      </div>
    </div>
  );
};

const Students = () => {
  const [filter, setFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  
  const filteredStudents = STUDENTS_DATA.filter(s => filter === 'All' || s.status === filter);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold text-[var(--navy)]">Student Access Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" icon={Download}>Import CSV</Button>
          <Button variant="primary" icon={Plus} onClick={() => setShowAdd(true)}>Add Student</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 text-center"><p className="text-xs text-gray-500">Total Students</p><p className="text-xl font-bold">0</p></Card>
        <Card className="p-4 text-center"><p className="text-xs text-gray-500">Active</p><p className="text-xl font-bold text-green-600">0</p></Card>
        <Card className="p-4 text-center"><p className="text-xs text-gray-500">Pending</p><p className="text-xl font-bold text-amber-600">0</p></Card>
        <Card className="p-4 text-center"><p className="text-xs text-gray-500">Suspended</p><p className="text-xl font-bold text-red-600">0</p></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 border-b border-gray-200 pb-1">
        {['All', 'Active', 'Pending', 'Suspended'].map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${filter === f ? 'border-[var(--navy)] text-[var(--navy)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase text-gray-500 font-semibold tracking-wider border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 pl-8">Student Email</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Active</th>
              <th className="px-6 py-4">Sessions</th>
              <th className="px-6 py-4">Domain Focus</th>
              <th className="px-6 py-4 text-right pr-8">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredStudents.map((s, i) => (
              <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-6 py-4 pl-8 font-medium">{s.email}</td>
                <td className="px-6 py-4">{s.name}</td>
                <td className="px-6 py-4">
                  <Badge variant={s.status === 'Active' ? 'success' : s.status === 'Pending' ? 'warning' : 'danger'}>{s.status}</Badge>
                </td>
                <td className="px-6 py-4 text-gray-500">{s.lastActive}</td>
                <td className="px-6 py-4">{s.sessions}</td>
                <td className="px-6 py-4">{s.focus}</td>
                <td className="px-6 py-4 text-right pr-8 flex justify-end gap-2">
                  <button className="text-[#0F2340] hover:text-[#0B6E6E] text-xs font-medium underline decoration-2 underline-offset-2">View</button>
                  <button className="text-red-600 hover:text-red-800 text-xs font-medium underline decoration-2 underline-offset-2">Suspend</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500 bg-gray-50/30">
          <span className="pl-4">Showing 1-{filteredStudents.length} of 1,247 students</span>
          <div className="flex gap-2 pr-4">
            <Button variant="outline" className="py-1 px-3 text-xs">Prev</Button>
            <Button variant="outline" className="py-1 px-3 text-xs">Next</Button>
          </div>
        </div>
      </Card>

      {/* Add Student Slide-in */}
      {showAdd && (
        <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 p-6 z-10 animate-in slide-in-from-right">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[var(--navy)]">Add Student</h3>
            <button onClick={() => setShowAdd(false)}><X size={20} /></button>
          </div>
          <div className="space-y-4">
            <div className="space-y-1"><label className="text-sm font-medium">Email</label><input className="w-full p-2 border rounded" /></div>
            <div className="space-y-1"><label className="text-sm font-medium">Full Name</label><input className="w-full p-2 border rounded" /></div>
            <div className="space-y-1"><label className="text-sm font-medium">Year</label><select className="w-full p-2 border rounded"><option>1</option><option>2</option></select></div>
            <div className="space-y-1"><label className="text-sm font-medium">Department</label><input className="w-full p-2 border rounded" /></div>
            <div className="flex items-center gap-2 pt-2"><input type="checkbox" defaultChecked /><span className="text-sm">Send Activation Email</span></div>
            <Button variant="primary" className="w-full mt-4" onClick={() => setShowAdd(false)}>Add Student</Button>
          </div>
        </div>
      )}
    </div>
  );
};

const Reports = () => {
  const [tab, setTab] = useState('trends');
  const [showPDF, setShowPDF] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold text-[var(--navy)]">Usage Reports & Analytics</h2>
        <div className="flex gap-3">
          <select className="p-2 border rounded text-sm bg-white"><option>This Month</option><option>This Week</option></select>
          <Button variant="teal" icon={FileText} onClick={() => setShowPDF(true)}>Generate PDF Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4"><p className="text-xs text-gray-500">Total Sessions</p><h3 className="text-2xl font-bold">0</h3></Card>
        <Card className="p-4"><p className="text-xs text-gray-500">Unique Students</p><h3 className="text-2xl font-bold">0</h3></Card>
        <Card className="p-4"><p className="text-xs text-gray-500">Resources Accessed</p><h3 className="text-2xl font-bold">0</h3></Card>
        <Card className="p-4"><p className="text-xs text-gray-500">DARA AI Queries</p><h3 className="text-2xl font-bold">0</h3></Card>
      </div>

      <div className="border-b border-gray-200">
        {['Usage Trends', 'Top Resources', 'Domain Activity', 'Student Engagement'].map(t => {
          const key = t.toLowerCase().split(' ')[0];
          return (
            <button key={key} onClick={() => setTab(key)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-[var(--navy)] text-[var(--navy)]' : 'border-transparent text-gray-500'}`}>{t}</button>
          );
        })}
      </div>

      <Card className="p-6 min-h-[400px]">
        {tab === 'trends' && (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={USAGE_TRENDS_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sessions" stroke={COLORS.navy} strokeWidth={2} />
                <Line type="monotone" dataKey="users" stroke={COLORS.teal} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {tab === 'top' && (
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase text-gray-500 font-semibold tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 pl-8">Rank</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Domain</th>
                <th className="px-6 py-4">Accesses</th>
                <th className="px-6 py-4">Avg Time</th>
                <th className="px-6 py-4 text-right pr-8">Zimbabwe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {TOP_RESOURCES_DATA.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 pl-8 text-gray-400 font-bold">{r.rank}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{r.title}</td>
                  <td className="px-6 py-4"><Badge variant="navy">{r.domain}</Badge></td>
                  <td className="px-6 py-4 text-gray-600">{r.accesses}</td>
                  <td className="px-6 py-4 text-gray-600">{r.time}</td>
                  <td className="px-6 py-4 text-right pr-8">{r.zim ? '🇿🇼 Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === 'domain' && (
          <div className="h-80 w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={DOMAIN_COVERAGE_DATA}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis />
                <Radar name="Activity" dataKey="count" stroke={COLORS.navy} fill={COLORS.navy} fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
        {tab === 'student' && (
          <div className="h-80 w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ENGAGEMENT_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {ENGAGEMENT_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="font-bold text-[var(--navy)] mb-4">Scheduled Reports</h3>
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs"><tr><th>Report Type</th><th>Frequency</th><th>Recipients</th><th>Last Sent</th><th>Next Send</th></tr></thead>
          <tbody>
            {SCHEDULED_REPORTS.map((r, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{r.type}</td>
                <td className="px-4 py-3">{r.freq}</td>
                <td className="px-4 py-3 text-gray-500">{r.recipients}</td>
                <td className="px-4 py-3">{r.last}</td>
                <td className="px-4 py-3">{r.next}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* PDF Modal */}
      {showPDF && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
          <Card className="w-[600px] p-8 relative bg-white">
            <button onClick={() => setShowPDF(false)} className="absolute top-4 right-4"><X size={20} /></button>
            <div className="text-center mb-8 border-b pb-6">
              <h2 className="text-2xl font-serif font-bold text-[var(--navy)]">Usage Report</h2>
              <p className="text-gray-500">March 2026 • Mkoba Teachers College</p>
            </div>
            <div className="space-y-6 mb-8">
              <div className="bg-gray-100 h-32 rounded flex items-center justify-center text-gray-400">Chart Placeholder</div>
              <div className="space-y-2">
                <h4 className="font-bold text-sm">Executive Summary</h4>
                <p className="text-sm text-gray-600">Student engagement has increased by 12% this month. Top performing domain is Foundations of Education.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" className="flex-1" onClick={() => setShowPDF(false)}>Download PDF</Button>
              <Button variant="secondary" className="flex-1" onClick={() => setShowPDF(false)}>Email Report</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const DaraAI = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Mhoro! 👋 I'm DARA, your institutional AI assistant for Mkoba Teachers College. I can help you understand your curriculum, find resources, and much more. What are you working on today?" }
  ]);
  const [input, setInput] = useState('');
  const [configOpen, setConfigOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await geminiService.chat(input, messages);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (error) {
      console.error('DARA AI Error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I encountered an error. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6 animate-in fade-in duration-500">
      <div className="flex-1 flex flex-col h-full">
        {/* Config Panel */}
        <Card className="mb-4 overflow-hidden">
          <div className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer" onClick={() => setConfigOpen(!configOpen)}>
            <div className="flex items-center gap-2">
              <Bot size={20} color={COLORS.navy} />
              <span className="font-bold text-[var(--navy)]">DARA Configuration</span>
              <Badge variant="navy">Scoped to Mkoba Teachers College</Badge>
            </div>
            {configOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>
          {configOpen && (
            <div className="p-4 border-t border-gray-200 grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Curriculum Scope</h4>
                <div className="space-y-1">
                  {['D1 Foundations of Education', 'D2 Curriculum & Instruction', 'D3 Educational Management', 'D10 Research & Academic Skills'].map(d => (
                    <div key={d} className="flex items-center gap-2 text-sm"><Check size={14} className="text-green-600" /> {d}</div>
                  ))}
                  <div className="flex items-center gap-2 text-sm text-gray-400"><div className="w-3.5 h-3.5 border rounded" /> D4 Agriculture (N/A)</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Zimbabwe Context Priority</span>
                  <div className="w-10 h-5 bg-[var(--navy)] rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute right-1 top-1" /></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Language</span>
                  <span className="text-sm text-gray-500">English (Shona coming soon)</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--cream)]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-lg text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-[var(--navy)] text-white rounded-br-none' : 'bg-white border border-gray-200 rounded-bl-none shadow-sm'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none p-4 shadow-sm">
                  <Loader2 className="w-5 h-5 animate-spin text-[var(--navy)]" />
                </div>
              </div>
            )}
          </div>
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input 
                value={input} 
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                disabled={loading}
                placeholder={loading ? "DARA is thinking..." : "Ask DARA anything about your curriculum..."} 
                className="flex-1 p-3 border border-[var(--border)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--navy)] disabled:bg-gray-50"
              />
              <Button variant="primary" onClick={send} icon={loading ? Loader2 : ArrowRight} disabled={loading}>
                {loading ? 'Thinking...' : 'Send'}
              </Button>
            </div>
            <p className="text-xs text-center text-gray-400 mt-2">DARA searches 11,240 resources scoped to Mkoba Teachers College · Powered by Dare Digital Library</p>
          </div>
        </Card>
      </div>

      {/* Sidebar Stats */}
      <div className="w-64 space-y-4">
        <Card className="p-4">
          <h4 className="font-bold text-[var(--navy)] mb-3">DARA Stats</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span>Questions today</span><span className="font-bold">0</span></div>
            <div className="flex justify-between"><span>Avg response</span><span className="font-bold">—</span></div>
            <div className="flex justify-between"><span>Most asked</span><span className="font-bold">—</span></div>
            <div className="flex justify-between"><span>Satisfaction</span><span className="font-bold text-yellow-500">—</span></div>
            <div className="flex justify-between"><span>Citations</span><span className="font-bold">0</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── MAIN APP LAYOUT ─────────────────────────────────────────────────────────

const Buku = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBukuResources() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .ilike('publisher_name', '%Buku%')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setResources(data || []);
      } catch (error) {
        console.error('Error fetching Buku resources:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBukuResources();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--navy)]" />
        <p className="text-gray-500 font-medium">Loading Buku resources...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[var(--navy)]">Buku Resources</h2>
          <p className="text-gray-500">Manage and monitor Buku content performance</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            icon={Lock}
            onClick={() => window.open('https://buku.app/login', '_blank')}
          >
            Login to Buku
          </Button>
          <Button variant="primary" icon={Download}>Export Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-l-4 border-l-[var(--navy)]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-1">Total Resources</h3>
            <p className="text-3xl font-bold text-[var(--text-dark)]">{resources.length}</p>
        </Card>
        <Card className="p-6 border-l-4 border-l-[var(--teal)]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-1">Total Reads</h3>
            <p className="text-3xl font-bold text-[var(--text-dark)]">{resources.reduce((acc, r) => acc + (r.total_reads || 0), 0)}</p>
        </Card>
        <Card className="p-6 border-l-4 border-l-[var(--gold)]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-1">Avg Rating</h3>
            <p className="text-3xl font-bold text-[var(--text-dark)]">
                {resources.length ? (resources.reduce((acc, r) => acc + (r.average_rating || 0), 0) / resources.length).toFixed(1) : '0.0'}
            </p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-[var(--navy)]">Resource List</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase text-gray-500 font-semibold tracking-wider border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 pl-8">Title</th>
                        <th className="px-6 py-4">Author</th>
                        <th className="px-6 py-4">Subject</th>
                        <th className="px-6 py-4">Year</th>
                        <th className="px-6 py-4 text-right pr-8">Reads</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {resources.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-6 py-4 pl-8 font-medium text-gray-900">{r.title}</td>
                            <td className="px-6 py-4 text-gray-500">{r.author_names || 'Unknown'}</td>
                            <td className="px-6 py-4"><Badge variant="navy">{r.subject || 'General'}</Badge></td>
                            <td className="px-6 py-4">{r.year_published || r.publication_year}</td>
                            <td className="px-6 py-4 text-right pr-8">{r.total_reads || 0}</td>
                        </tr>
                    ))}
                    {resources.length === 0 && (
                        <tr>
                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No Buku resources found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </Card>
    </div>
  );
};

const Deposits = () => {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newDeposit, setNewDeposit] = useState({
    title: '',
    author_names: '',
    subject: 'Education',
    abstract: '',
    institution: 'Mkoba Teachers College'
  });

  useEffect(() => {
    fetchDeposits();
  }, []);

  async function fetchDeposits() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('local_research')
        .select('*')
        .eq('institution', 'Mkoba Teachers College')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeposits(data || []);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('local_research')
        .insert([{
          ...newDeposit,
          user_id: user?.id,
          status: 'pending',
          publication_date: new Date().toISOString().split('T')[0]
        }]);

      if (error) throw error;
      
      setShowModal(false);
      setNewDeposit({
        title: '',
        author_names: '',
        subject: 'Education',
        abstract: '',
        institution: 'Mkoba Teachers College'
      });
      fetchDeposits();
    } catch (error) {
      console.error('Error submitting deposit:', error);
      alert('Failed to submit deposit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--navy)]" />
        <p className="text-gray-500 font-medium">Loading institutional deposits...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[var(--navy)]">Institutional Repository</h2>
          <p className="text-gray-500">Deposit and manage research from Mkoba Teachers College</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>New Deposit</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Total Deposits</h3>
          <p className="text-3xl font-bold">{deposits.length}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Approved</h3>
          <p className="text-3xl font-bold text-green-600">{deposits.filter(d => d.status === 'approved').length}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Pending Review</h3>
          <p className="text-3xl font-bold text-amber-600">{deposits.filter(d => d.status === 'pending').length}</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase text-gray-500 font-semibold tracking-wider border-b border-gray-100 bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 pl-8">Title</th>
              <th className="px-6 py-4">Author</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right pr-8">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {deposits.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-6 py-4 pl-8 font-medium text-gray-900">{d.title}</td>
                <td className="px-6 py-4 text-gray-500">{d.author_names}</td>
                <td className="px-6 py-4"><Badge variant="navy">{d.subject}</Badge></td>
                <td className="px-6 py-4">
                  <Badge variant={d.status === 'approved' ? 'success' : 'warning'}>
                    {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right pr-8 text-gray-400">
                  {new Date(d.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {deposits.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <FileText size={40} className="text-gray-200" />
                    <p>No deposits found for your institution.</p>
                    <Button variant="outline" className="mt-2" onClick={() => setShowModal(true)}>Make your first deposit</Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl bg-white overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-serif font-bold text-[var(--navy)]">New Institutional Deposit</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Paper Title</label>
                  <input 
                    required
                    type="text" 
                    value={newDeposit.title}
                    onChange={e => setNewDeposit({...newDeposit, title: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[var(--navy)] outline-none"
                    placeholder="e.g. Modern Pedagogy in Zimbabwe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Author(s)</label>
                  <input 
                    required
                    type="text" 
                    value={newDeposit.author_names}
                    onChange={e => setNewDeposit({...newDeposit, author_names: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[var(--navy)] outline-none"
                    placeholder="e.g. Dr. T. Moyo, Prof. J. Gumbo"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Subject / Domain</label>
                <select 
                  value={newDeposit.subject}
                  onChange={e => setNewDeposit({...newDeposit, subject: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[var(--navy)] outline-none"
                >
                  {DOMAINS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Abstract</label>
                <textarea 
                  required
                  rows={4}
                  value={newDeposit.abstract}
                  onChange={e => setNewDeposit({...newDeposit, abstract: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[var(--navy)] outline-none resize-none"
                  placeholder="Brief summary of the research..."
                />
              </div>

              <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center hover:border-[var(--teal)] transition-colors cursor-pointer group">
                <div className="flex flex-col items-center gap-2">
                  <Upload size={32} className="text-gray-400 group-hover:text-[var(--teal)] transition-colors" />
                  <p className="text-sm font-medium text-gray-600">Click to upload PDF or drag and drop</p>
                  <p className="text-xs text-gray-400">Maximum file size: 20MB</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="flex-1"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Deposit'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default function DareInstitutional() {
  const [view, setView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'onboarding', label: 'Onboarding', icon: Settings },
    { id: 'deposits', label: 'Deposits', icon: Upload },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'buku', label: 'Buku', icon: Globe },
    { id: 'dara', label: 'DARA AI', icon: Bot }
  ];

  return (
    <div className="flex h-[calc(100vh-90px)] mt-[90px] bg-[var(--cream)] font-sans text-[var(--text-dark)]">
      {/* Sidebar Overlay for Mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`bg-[var(--navy)] border-r border-gray-800 transition-all duration-300 flex flex-col z-50 shadow-xl ${
          isMobile 
            ? `fixed inset-y-0 left-0 ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}` 
            : (sidebarOpen ? 'w-64' : 'w-20')
        }`}
        aria-label="Institutional Navigation"
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-800 h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-teal-500 to-teal-300 flex items-center justify-center text-white font-serif font-bold shrink-0 shadow-lg shadow-teal-900/20">D</div>
            {(sidebarOpen || isMobile) && (
              <div>
                <h1 className="font-serif font-bold text-white leading-none tracking-wide">Dare</h1>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Digital Library</p>
              </div>
            )}
          </div>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-gray-400">
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id);
                if (isMobile) setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                view === item.id 
                  ? 'bg-[var(--teal)] text-white shadow-lg shadow-teal-900/20 font-medium' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
              aria-current={view === item.id ? 'page' : undefined}
            >
              <item.icon size={20} className={`transition-colors ${view === item.id ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
              {(sidebarOpen || isMobile) && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        {!isMobile && (
          <div className="p-4 border-t border-gray-800">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 hover:bg-white/5 rounded-lg text-gray-400 w-full flex justify-center transition-colors"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? <ChevronRight className="rotate-180" /> : <ChevronRight />}
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-[var(--border)] flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-2 md:gap-4">
            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                aria-label="Open navigation menu"
              >
                <LayoutDashboard size={20} />
              </button>
            )}
            <h2 className="font-serif font-bold text-lg md:text-xl text-[var(--navy)] truncate">
              {NAV_ITEMS.find(n => n.id === view)?.label}
            </h2>
            <div className="hidden sm:block h-4 w-px bg-gray-300" />
            <div className="hidden sm:flex items-center gap-2">
              <Building2 size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-600 truncate max-w-[150px]">Mkoba Teachers College</span>
              <Badge variant="teal">Library Officer</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="hidden md:block text-xs text-gray-400">Last sync: 10:42 AM</span>
            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 relative" aria-label="Notifications">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[var(--navy)] text-white flex items-center justify-center font-bold text-xs">LO</div>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-auto p-6">
          {view === 'overview' && <Overview />}
          {view === 'onboarding' && <Onboarding />}
          {view === 'deposits' && <Deposits />}
          {view === 'students' && <Students />}
          {view === 'reports' && <Reports />}
          {view === 'buku' && <Buku />}
          {view === 'dara' && <DaraAI />}
        </main>
      </div>
    </div>
  );
}
