import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, useInView } from "motion/react"
import {
  ArrowRight,
  Sparkles,
  Globe,
  Cpu,
  GraduationCap,
  Building2,
  PlayCircle,
  CheckCircle2,
  BookOpen,
  FlaskConical,
  FileText,
  Headphones,
  Users,
  Award,
  BookMarked,
  Search,
  Brain,
  TrendingUp,
  Star,
  Quote,
  MapPin,
} from "lucide-react"
import { OPENSTAX_EXPANDED, AI_PRIORITY_OER } from "../lib/oerCatalog"
import SearchBar from "../components/library/SearchBar"

const fadeIn = {
  hidden:   { opacity: 0, y: 24 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}
const staggerContainer = {
  hidden:   { opacity: 0 },
  visible:  { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const STATS = [
  { value: "500M+",  label: "Global Papers",    icon: <FileText  size={18} /> },
  { value: "50M+",   label: "Open Books",       icon: <BookOpen  size={18} /> },
  { value: "15K+",   label: "Audiobooks",       icon: <Headphones size={18}/> },
  { value: "50K+",   label: "Zim Students",     icon: <Users     size={18} /> },
]

const FEATURES = [
  {
    icon:  <Globe size={28} />,
    color: "green",
    bg:    "bg-green-50",
    text:  "text-green-700",
    title: "Global Open Access",
    desc:  "Search across OpenAlex, Semantic Scholar, DSpace, OpenStax, and Project Gutenberg. One intelligent search — 500 million results.",
  },
  {
    icon:  <Sparkles size={28} />,
    color: "amber",
    bg:    "bg-amber-50",
    text:  "text-amber-600",
    title: "BAKO AI Tutor",
    desc:  "Powered by the latest AI, BAKO explains concepts, generates ZIMSEC-aligned quizzes, and speaks Shona and Ndebele.",
  },
  {
    icon:  <GraduationCap size={28} />,
    color: "orange",
    bg:    "bg-orange-50",
    text:  "text-orange-700",
    title: "Institutional Hubs",
    desc:  "Dedicated portals for UZ, NUST, MSU, teachers' colleges, and secondary schools — bridging local and global scholarship.",
  },
  {
    icon:  <FlaskConical size={28} />,
    color: "emerald",
    bg:    "bg-emerald-50",
    text:  "text-emerald-700",
    title: "Academic Research",
    desc:  "500M+ scholarly papers from Semantic Scholar, OpenAlex, Europe PMC, DOAJ and historical archives — ProQuest-level depth, free.",
  },
  {
    icon:  <Award size={28} />,
    color: "gold",
    bg:    "bg-yellow-50",
    text:  "text-yellow-700",
    title: "Gamified Learning",
    desc:  "Earn XP, climb the leaderboard, unlock achievement badges. Learning feels rewarding when progress is visible.",
  },
  {
    icon:  <BookMarked size={28} />,
    color: "rose",
    bg:    "bg-rose-50",
    text:  "text-rose-700",
    title: "AI Lesson Planner",
    desc:  "Teachers generate full Zimbabwe curriculum-aligned lesson plans, rubrics, and worksheets in seconds with AI.",
  },
]

const CATEGORIES = [
  { title: "Mathematics",    icon: "📐", bg: "from-blue-50 to-blue-100/60",   border: "border-blue-200",   text: "text-blue-700",   hover: "hover:shadow-blue-100" },
  { title: "Sciences",       icon: "🔬", bg: "from-green-50 to-green-100/60", border: "border-green-200",  text: "text-green-700",  hover: "hover:shadow-green-100" },
  { title: "Computer Sci",   icon: "💻", bg: "from-purple-50 to-purple-100/60",border:"border-purple-200", text: "text-purple-700", hover: "hover:shadow-purple-100" },
  { title: "Literature",     icon: "📖", bg: "from-amber-50 to-amber-100/60", border: "border-amber-200",  text: "text-amber-700",  hover: "hover:shadow-amber-100" },
  { title: "History",        icon: "🏛️", bg: "from-orange-50 to-orange-100/60",border:"border-orange-200", text: "text-orange-700", hover: "hover:shadow-orange-100" },
  { title: "Research",       icon: "🔭", bg: "from-rose-50 to-rose-100/60",   border: "border-rose-200",   text: "text-rose-700",   hover: "hover:shadow-rose-100" },
]

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: <Search size={28} />,
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    title: "Search Everything",
    desc: "One search across 500M+ papers, 50M+ books, OpenStax textbooks, and Zimbabwe institutional repositories — results in under a second.",
  },
  {
    step: "02",
    icon: <Brain size={28} />,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    title: "Learn with BAKO AI",
    desc: "Open any resource and BAKO becomes your personal tutor — summarising chapters, answering questions in Shona or English, generating quizzes.",
  },
  {
    step: "03",
    icon: <TrendingUp size={28} />,
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    title: "Track & Excel",
    desc: "Earn XP for reading, rise through levels, and unlock achievement badges. See your progress on the national leaderboard.",
  },
]

const TESTIMONIALS = [
  {
    quote: "DARE helped me research my thesis in weeks instead of months. The Academic Database alone saved me from paying for journal access.",
    name: "Tinashe M.",
    role: "MSc Student, University of Zimbabwe",
    initials: "TM",
    color: "bg-green-100 text-green-700",
  },
  {
    quote: "BAKO explained organic chemistry in Shona better than my textbook did in English. This platform is genuinely revolutionary.",
    name: "Rudo C.",
    role: "A-Level Student, Harare",
    initials: "RC",
    color: "bg-amber-100 text-amber-700",
  },
  {
    quote: "I use the Lesson Planner every week. What used to take me 3 hours now takes 15 minutes — fully aligned with the ZIMSEC syllabus.",
    name: "Mr. Moyo",
    role: "Secondary School Teacher, Bulawayo",
    initials: "MM",
    color: "bg-orange-100 text-orange-700",
  },
]

/* ── Ndebele-inspired geometric section divider ───────────────── */
const NdebeleDivider = ({ flip = false }) => {
  const palette = ['#166534','#D97706','#C2410C','#1C1917','#D97706','#166534','#FFFBF0','#1C1917'];
  return (
    <div className="w-full overflow-hidden" aria-hidden="true"
      style={{ transform: flip ? 'scaleY(-1)' : 'none' }}>
      <svg viewBox="0 0 1200 28" xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none" className="w-full" style={{ height: '28px', display: 'block' }}>
        <rect width="1200" height="28" fill="#1C1917" />
        {[...Array(60)].map((_, i) => {
          const fill = palette[i % palette.length];
          const x    = i * 20;
          const even = i % 2 === 0;
          return (
            <g key={i}>
              <rect x={x} y="0" width="20" height="28" fill={fill} />
              <polygon
                points={even ? `${x},0 ${x+10},28 ${x+20},0` : `${x},28 ${x+10},0 ${x+20},28`}
                fill="rgba(0,0,0,0.2)"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ── Baobab tree SVG silhouette ───────────────────────────────── */
const BaobabSvg = ({ className = '' }) => (
  <svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg"
    className={className} fill="currentColor" aria-hidden="true">
    <rect x="46" y="100" width="28" height="100" rx="6" />
    <ellipse cx="60" cy="198" rx="46" ry="9" opacity="0.5" />
    <line x1="60" y1="100" x2="18"  y2="58"  stroke="currentColor" strokeWidth="11" strokeLinecap="round" />
    <line x1="60" y1="100" x2="102" y2="58"  stroke="currentColor" strokeWidth="11" strokeLinecap="round" />
    <line x1="60" y1="100" x2="34"  y2="36"  stroke="currentColor" strokeWidth="8"  strokeLinecap="round" />
    <line x1="60" y1="100" x2="86"  y2="36"  stroke="currentColor" strokeWidth="8"  strokeLinecap="round" />
    <line x1="60" y1="100" x2="60"  y2="20"  stroke="currentColor" strokeWidth="9"  strokeLinecap="round" />
    <circle cx="18"  cy="48" r="22" />
    <circle cx="102" cy="48" r="22" />
    <circle cx="34"  cy="26" r="18" />
    <circle cx="86"  cy="26" r="18" />
    <circle cx="60"  cy="12" r="20" />
  </svg>
);

export default function Home() {
  const navigate = useNavigate()
  const [featuredBooks, setFeaturedBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const books = [...AI_PRIORITY_OER, ...OPENSTAX_EXPANDED].slice(0, 4)
    setFeaturedBooks(books)
    setLoading(false)
  }, [])

  return (
    <div className="min-h-screen bg-white font-sans text-stone-900 overflow-x-hidden pt-16"
         style={{ "--selection-bg": "rgba(217,119,6,0.25)" }}>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative py-20 lg:py-32 overflow-hidden px-6 lg:px-12 flex flex-col items-center">

        {/* Warm Afrocentric background blobs */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden opacity-60 dark:opacity-20 flex items-center justify-center">
          <div className="relative w-[100vw] h-[100vw] max-w-[1200px] max-h-[1200px]">
            <div className="absolute top-[10%] left-[15%] w-[50%] h-[50%] rounded-full bg-amber-200  mix-blend-multiply blur-[100px] sm:blur-[140px] animate-blob"></div>
            <div className="absolute top-[25%] right-[5%]  w-[55%] h-[55%] rounded-full bg-orange-200 mix-blend-multiply blur-[100px] sm:blur-[140px] animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[5%]  left-[25%] w-[45%] h-[45%] rounded-full bg-green-200  mix-blend-multiply blur-[100px] sm:blur-[140px] animate-blob animation-delay-4000"></div>
          </div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10"
        >
          {/* Live badge */}
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/90 border border-amber-200 shadow-md text-sm font-bold text-amber-900 mb-8 backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600"></span>
            </span>
            Zimbabwe's Premier Open Digital Library
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fadeIn}
            className="text-5xl sm:text-7xl lg:text-[6rem] font-black tracking-tighter leading-[1.05] text-stone-900 mb-6"
            style={{ fontFamily: 'var(--font-accent)' }}>
            Africa's knowledge,{" "}
            <br className="hidden lg:block"/>
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #166534 0%, #D97706 45%, #C2410C 100%)" }}>
              unbound.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeIn} className="text-xl lg:text-2xl text-stone-600 font-medium max-w-3xl mx-auto mb-10 leading-relaxed text-balance">
            DARE is Zimbabwe's Digital Academic Resource Engine — 50M+ open-access books,
            500M+ scholarly papers, and an AI tutor powered by indigenous context.
          </motion.p>

          {/* Search */}
          <motion.div variants={fadeIn} className="w-full max-w-3xl mx-auto mb-8">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={(val) => { if (val.trim()) navigate(`/library?q=${encodeURIComponent(val)}`) }}
              placeholder="Search books, papers, journals, research…"
            />
          </motion.div>

          {/* Quick navigation chips */}
          <motion.div variants={fadeIn} className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mr-1">Quick access:</span>
            {[
              { label: "DARE Institutional",  to: "/library?source=DARE%20Institutional" },
              { label: "OpenStax",            to: "/library?source=OpenStax" },
              { label: "500M+ Papers",         to: "/academic" },
              { label: "50M+ Open Books",      to: "/open-books" },
              { label: "Research Portal",     to: "/research" },
            ].map(l => (
              <Link key={l.label} to={l.to}
                className="px-4 py-2 bg-white border border-stone-200 rounded-full text-sm font-bold text-stone-700 hover:border-amber-400 hover:text-amber-800 hover:bg-amber-50 transition-all shadow-sm">
                {l.label}
              </Link>
            ))}
            <Link to="/library"
              className="px-4 py-2 bg-stone-900 border border-stone-900 rounded-full text-sm font-bold text-white hover:bg-stone-800 transition-all shadow-sm flex items-center gap-1.5">
              Browse All <ArrowRight size={14} />
            </Link>
          </motion.div>

          {/* Android download banner */}
          <motion.div variants={fadeIn} className="mt-6">
            <Link to="/download"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm transition-all hover:-translate-y-0.5 shadow-lg"
              style={{ background: 'linear-gradient(135deg,#1C1917,#292524)', color: '#fff' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 15.341c-.294.157-.637.157-.931 0l-4.592-2.65v-5.3l4.592-2.65c.294-.157.637-.157.931 0l4.592 2.65v5.3l-4.592 2.65zM12 17.5L7.408 14.85v-5.3L12 6.9l4.592 2.65v5.3L12 17.5zm-5.523-2.159c-.294.157-.637.157-.931 0L1 12.692v-5.3L5.546 4.74c.294-.157.637-.157.931 0L12 7.4 6.477 10.391v5.3z"/>
              </svg>
              <span>📱 Get the Android App — Free Download</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black" style={{ background: '#22c55e', color: '#fff' }}>NEW</span>
            </Link>
          </motion.div>

          {/* Stats bar */}
          <motion.div variants={fadeIn} className="mt-16 pt-10 border-t border-stone-200/60 w-full max-w-3xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STATS.map(s => (
                <div key={s.label} className="flex flex-col items-center gap-1.5 py-3">
                  <div className="text-amber-600">{s.icon}</div>
                  <div className="text-2xl font-black text-stone-900 tracking-tight">{s.value}</div>
                  <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Photo gallery strip — African education context */}
          <motion.div variants={fadeIn} className="mt-10 w-full max-w-4xl">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
              {[
                {
                  url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80",
                  alt: "African students studying together in a university library",
                  large: true,
                  badge: "🎓 Learning Together",
                },
                {
                  url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80",
                  alt: "Classroom learning in Africa",
                  badge: null,
                },
                {
                  url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80",
                  alt: "Library filled with knowledge and books",
                  badge: null,
                },
                {
                  url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80",
                  alt: "Open access books and research resources",
                  badge: null,
                },
                {
                  url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80",
                  alt: "Students collaborating on research",
                  badge: null,
                },
              ].map((img, i) => (
                <div key={i}
                  className={`relative overflow-hidden rounded-2xl bg-stone-100 ${i === 0 ? "col-span-2 row-span-2" : ""}`}
                  style={{ aspectRatio: "1/1" }}>
                  <img
                    src={img.url}
                    alt={img.alt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                  {/* Cultural gradient overlay */}
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(13,31,23,0.55) 0%, transparent 50%)' }} />
                  {/* Kente-stripe accent at bottom of large image */}
                  {img.large && (
                    <>
                      <div className="absolute bottom-0 left-0 right-0 h-1"
                        style={{ background: 'linear-gradient(90deg,#166534 0% 25%,#D97706 25% 50%,#C2410C 50% 75%,#1C1917 75% 100%)' }} />
                      <div className="absolute bottom-3 left-4">
                        <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">
                          {img.badge}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Trusted by */}
          <motion.div variants={fadeIn} className="mt-10 w-full max-w-3xl">
            <p className="text-xs font-bold text-stone-400 tracking-widest uppercase mb-5 text-center">Trusted by leading institutions</p>
            <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-14 opacity-50 grayscale hover:grayscale-0 hover:opacity-80 transition-all duration-500">
              <div className="flex items-center gap-2 font-black text-lg tracking-tight text-stone-800"><Building2 size={22}/> UZ Research</div>
              <div className="flex items-center gap-2 font-black text-lg tracking-tight text-stone-800"><Building2 size={22}/> NUST Library</div>
              <div className="flex items-center gap-2 font-black text-lg tracking-tight text-stone-800"><Building2 size={22}/> MSU Scholars</div>
              <div className="flex items-center gap-2 font-black text-lg tracking-tight text-stone-800"><Building2 size={22}/> GZU Portal</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Ndebele divider below hero */}
      <NdebeleDivider />

      {/* ── FEATURES 6-GRID ───────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12 border-y border-amber-100/80"
        style={{ background: "linear-gradient(180deg, #FFFBF0 0%, #FFFFFF 100%)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="kente-divider w-20 mx-auto mb-6 rounded-full"></div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-stone-900 mb-5"
              style={{ fontFamily: 'var(--font-accent)' }}>
              Everything a Zimbabwean scholar needs.
            </h2>
            <p className="text-xl text-stone-500 font-medium">
              From primary school to PhD — DARE equips every learner with world-class tools built for the African context.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title}
                className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center ${f.text} mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">{f.title}</h3>
                <p className="text-stone-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-800 text-xs font-black uppercase tracking-widest mb-5">
            Simple &amp; Powerful
          </div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-stone-900 mb-4"
            style={{ fontFamily: 'var(--font-accent)' }}>
            How DARE Works
          </h2>
          <p className="text-xl text-stone-500 font-medium">From search to mastery in minutes, not months.</p>
        </div>

        <div className="relative">
          {/* Connecting line — desktop only */}
          <div className="hidden lg:block absolute top-16 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-0.5 bg-gradient-to-r from-green-300 via-amber-300 to-orange-300 z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="bg-white rounded-3xl border border-stone-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* Step number */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 ${step.bg} ${step.border} border rounded-2xl flex items-center justify-center ${step.color} group-hover:scale-110 transition-transform duration-300`}>
                    {step.icon}
                  </div>
                  <span className="text-5xl font-black text-stone-100 leading-none select-none">{step.step}</span>
                </div>
                <h3 className="text-xl font-black text-stone-900 mb-3 tracking-tight">{step.title}</h3>
                <p className="text-stone-500 font-medium leading-relaxed text-[15px]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ndebele divider */}
      <NdebeleDivider />

      {/* ── ZIMBABWE HERITAGE ─────────────────────────────────── */}
      <section className="relative py-20 px-6 lg:px-12 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0A1A0F 0%, #0D1F17 60%, #1C1917 100%)' }}>

        {/* Diagonal hatching overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, rgba(217,119,6,1) 0, rgba(217,119,6,1) 1px, transparent 0, transparent 50%)',
            backgroundSize: '18px 18px',
          }} />

        {/* Decorative baobab */}
        <div className="absolute bottom-0 right-10 opacity-[0.06] pointer-events-none select-none"
          style={{ width: '160px' }}>
          <BaobabSvg className="text-green-300 w-full" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Cultural copy */}
            <div>
              <div className="badge-heritage mb-8 inline-flex">
                <span>🏛️</span> Proudly Zimbabwean
              </div>

              <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] mb-6"
                style={{ fontFamily: 'var(--font-accent)' }}>
                Rooted in African heritage.{' '}
                <span className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, #D97706 0%, #C2410C 100%)' }}>
                  Built for tomorrow.
                </span>
              </h2>

              <p className="text-stone-400 text-lg leading-relaxed mb-8">
                DARE is proudly Zimbabwean — serving the Heritage-Based Curriculum, supporting
                ZIMSEC students from O&#8209;Level to PhD, and championing indigenous knowledge
                alongside global scholarship. Every feature is designed with Africa in mind.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '🏛️', label: 'ZIMSEC Aligned',  desc: 'O-Level & A-Level' },
                  { icon: '🌳', label: 'Heritage-Based',   desc: 'HBC Curriculum'    },
                  { icon: '🗣️', label: 'Shona & Ndebele', desc: 'Native language AI' },
                  { icon: '🏫', label: '44 Institutions',  desc: 'Zim universities'  },
                ].map(item => (
                  <motion.div key={item.label}
                    initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.4 }}
                    className="card-dark-earth flex items-start gap-3 p-4 rounded-2xl">
                    <span className="text-2xl leading-none mt-0.5">{item.icon}</span>
                    <div>
                      <p className="font-black text-white text-sm mb-0.5">{item.label}</p>
                      <p className="text-stone-500 text-xs">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Stats visual */}
            <div className="relative">
              <div className="absolute -inset-8 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ background: 'linear-gradient(135deg, #166534, #D97706)' }} />
              <div className="relative grid grid-cols-2 gap-4">
                {[
                  { value: '50K+', label: 'Active Learners', color: '#22C55E', border: 'rgba(34,197,94,0.25)',  bg: 'rgba(34,197,94,0.07)'  },
                  { value: '87',   label: 'OER Textbooks',   color: '#F59E0B', border: 'rgba(245,158,11,0.25)', bg: 'rgba(245,158,11,0.07)' },
                  { value: '44',   label: 'Institutions',    color: '#C2410C', border: 'rgba(194,65,12,0.25)',  bg: 'rgba(194,65,12,0.07)'  },
                  { value: '#1',   label: 'Zim Platform',    color: '#D97706', border: 'rgba(217,119,6,0.25)',  bg: 'rgba(217,119,6,0.07)'  },
                ].map((stat, i) => (
                  <motion.div key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="rounded-2xl p-6 text-center border"
                    style={{ background: stat.bg, borderColor: stat.border }}>
                    <div className="text-4xl font-black mb-1 leading-none" style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                    <p className="text-stone-400 text-sm font-bold">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Baobab illustration */}
              <div className="mt-8 flex justify-center">
                <motion.div
                  initial={{ opacity: 0 }} whileInView={{ opacity: 0.25 }}
                  viewport={{ once: true }} transition={{ delay: 0.5, duration: 1 }}
                  className="animate-float-africa">
                  <BaobabSvg className="text-amber-400 w-24 h-auto" />
                </motion.div>
                <div className="ml-6 flex flex-col justify-center">
                  <p className="text-stone-500 text-sm font-bold italic">
                    "Like the baobab —<br/>ancient, vast, and life-giving."
                  </p>
                  <p className="text-amber-600 text-xs font-black mt-1 uppercase tracking-wider">
                    — BAKO AI
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Ndebele divider (flipped) */}
      <NdebeleDivider flip />

      {/* ── BROWSE CATEGORIES ─────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-stone-100">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-stone-900 mb-2"
              style={{ fontFamily: 'var(--font-accent)' }}>
              Browse by Subject
            </h2>
            <p className="text-lg text-stone-500 font-medium">Dive straight into what you need.</p>
          </div>
          <Link to="/library" className="shrink-0 text-sm font-bold text-green-700 hover:text-green-600 flex items-center gap-1.5">
            All subjects <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Link
                to={`/library?q=${encodeURIComponent(cat.title)}`}
                className={`bg-gradient-to-br ${cat.bg} border ${cat.border} rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300 group hover:shadow-lg hover:-translate-y-1 block`}>
                <div className="text-3xl group-hover:scale-125 transition-transform duration-300">{cat.icon}</div>
                <span className={`font-black text-sm ${cat.text}`}>{cat.title}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CURATED BOOKS ─────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto border-t border-stone-100">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-stone-900 mb-4"
              style={{ fontFamily: 'var(--font-accent)' }}>
              Curated Essentials
            </h2>
            <p className="text-xl text-stone-500 font-medium">Top-tier resources powering the next generation of African scholars.</p>
          </div>
          <Link to="/library"
            className="group shrink-0 inline-flex items-center gap-2 font-bold text-green-700 hover:text-green-800 transition-colors px-6 py-3 bg-green-50 rounded-full hover:bg-green-100 border border-green-200">
            Browse full catalog
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-4">
                <div className="aspect-[2/3] skeleton-shimmer rounded-3xl"></div>
                <div className="h-4 skeleton-shimmer rounded w-3/4"></div>
                <div className="h-4 skeleton-shimmer rounded w-1/2"></div>
              </div>
            ))
          ) : (
            featuredBooks.slice(0, 4).map(book => (
              <Link key={book.id} to={`/book/${book.id}`} className="group flex flex-col gap-4 focus:outline-none">
                <div className="relative aspect-[2/3] overflow-hidden rounded-[2rem] bg-stone-100 border border-stone-200 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 group-hover:border-amber-300 group-focus:ring-4 ring-amber-400/30">
                  <img
                    src={book.cover_image_url}
                    alt={book.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 p-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="inline-block px-4 py-1.5 bg-amber-400 rounded-full text-stone-900 text-xs font-black uppercase tracking-wider">
                      Read Book
                    </span>
                  </div>
                </div>
                <div className="px-1">
                  <h4 className="font-bold text-stone-900 text-lg leading-snug mb-1 group-hover:text-green-700 transition-colors line-clamp-2">
                    {book.title}
                  </h4>
                  <p className="text-sm text-stone-500 font-medium line-clamp-1">{book.author_names}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12 border-y border-amber-100/80 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #FFFBF0 0%, #FFF8E8 100%)" }}>

        {/* Subtle ndebele pattern overlay */}
        <div className="absolute inset-0 pattern-ndebele opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="kente-divider w-20 mx-auto mb-6 rounded-full"></div>
            <div className="flex justify-center gap-0.5 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} size={18} className="fill-amber-400 text-amber-400" />)}
            </div>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-stone-900 mb-3"
              style={{ fontFamily: 'var(--font-accent)' }}>
              What Zimbabwean scholars say
            </h2>
            <p className="text-lg text-stone-500 font-medium">Real students. Real results.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 flex flex-col gap-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                {/* Subtle kente stripe at top of card */}
                <div className="absolute top-0 left-0 right-0 h-[3px]"
                  style={{ background: 'linear-gradient(90deg,#166534 0% 33%,#D97706 33% 66%,#C2410C 66% 100%)' }} />

                <Quote size={28} className="text-amber-300 shrink-0" />
                <p className="text-stone-700 font-medium leading-relaxed text-[15px] flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
                  {/* Kente-pattern geometric avatar */}
                  <div className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center font-black text-sm text-white overflow-hidden relative"
                    style={{
                      background: i === 0
                        ? 'linear-gradient(135deg, #166534, #D97706)'
                        : i === 1
                        ? 'linear-gradient(135deg, #D97706, #C2410C)'
                        : 'linear-gradient(135deg, #C2410C, #166534)',
                    }}>
                    <span className="relative z-10">{t.initials}</span>
                    {/* Kente pattern overlay */}
                    <div className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.6) 0, rgba(255,255,255,0.6) 2px, transparent 2px, transparent 8px)',
                      }} />
                  </div>
                  <div>
                    <p className="font-bold text-stone-900 text-sm">{t.name}</p>
                    <p className="text-xs text-stone-500 font-medium">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Cultural photo strip */}
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-14 flex gap-3 overflow-hidden rounded-3xl shadow-sm"
            style={{ height: '120px' }}>
            {[
              { url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=75', alt: 'Students studying' },
              { url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=75', alt: 'Classroom' },
              { url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=75', alt: 'Library' },
              { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=75', alt: 'Group study' },
            ].map((img, i) => (
              <div key={i} className="flex-1 relative overflow-hidden min-w-0">
                <img src={img.url} alt={img.alt} referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" />
                <div className="absolute inset-0"
                  style={{ background: 'rgba(13,31,23,0.35)' }} />
              </div>
            ))}
            {/* Zimbabwe Heritage overlay */}
            <div className="flex-shrink-0 w-48 flex items-center justify-center text-center p-4"
              style={{ background: 'linear-gradient(135deg, #0D1F17, #1C1917)' }}>
              <div>
                <div className="text-3xl mb-1">🌍</div>
                <p className="text-white font-black text-xs uppercase tracking-wider leading-tight">
                  Empowering<br/>Zimbabwe
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── BAKO AI SECTION ───────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12 overflow-hidden relative border-y border-stone-800"
        style={{ background: "linear-gradient(135deg, #1C0A00 0%, #2D1400 50%, #1A0800 100%)" }}>

        {/* Amber glow */}
        <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] rounded-full blur-[130px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ background: "rgba(217,119,6,0.09)" }}></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
          style={{ background: "rgba(194,65,12,0.07)" }}></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
          {/* BAKO identity card */}
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -inset-2 rounded-[2.5rem] opacity-25 blur-xl pointer-events-none"
              style={{ background: "linear-gradient(135deg, #F59E0B, #C2410C)" }}></div>
            <div className="relative bg-stone-950/70 backdrop-blur-2xl rounded-[2.5rem] border border-amber-900/30 p-8 sm:p-10 shadow-2xl">
              {/* BAKO header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-amber-700/40"
                  style={{ background: "linear-gradient(135deg, #92400E, #B45309)" }}>
                  🌳
                </div>
                <div>
                  <h3 className="font-black text-xl text-white tracking-tight">BAKO AI</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[10px] text-amber-300/70 font-bold uppercase tracking-widest">Boundless African Knowledge Oracle</span>
                  </div>
                </div>
              </div>
              {/* Chat bubbles */}
              <div className="space-y-4">
                <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }} transition={{ delay: 0.2 }}
                  className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-stone-700 flex-shrink-0 flex items-center justify-center text-sm">👤</div>
                  <div className="px-4 py-3 bg-stone-700/50 rounded-2xl rounded-tl-none border border-stone-600/40 text-stone-200 text-sm leading-relaxed">
                    Ndinoda kunzwisisa photosynthesis — ndizvo chii?
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }} transition={{ delay: 0.7 }}
                  className="flex items-start gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-sm"
                    style={{ background: "linear-gradient(135deg, #92400E, #C2410C)" }}>🌳</div>
                  <div className="px-4 py-3 rounded-2xl rounded-tr-none border text-sm leading-relaxed"
                    style={{ background: "rgba(217,119,6,0.12)", borderColor: "rgba(217,119,6,0.3)", color: "#FEF3C7" }}>
                    Fikiridza muti une "solar panels" mumashizha ake — chlorophyll. Inobata chiedza chezuva
                    ichishandura mvura ne CO₂ kuita zuccheri ne oksijeni! 🌿☀️
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }} transition={{ delay: 1.1 }}
                  className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-stone-700 flex-shrink-0 flex items-center justify-center text-sm">👤</div>
                  <div className="px-4 py-3 bg-stone-700/50 rounded-2xl rounded-tl-none border border-stone-600/40 text-stone-200 text-sm leading-relaxed">
                    Can you make a ZIMSEC quiz on this?
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }} transition={{ delay: 1.5 }}
                  className="flex items-start gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-sm"
                    style={{ background: "linear-gradient(135deg, #92400E, #C2410C)" }}>🌳</div>
                  <div className="px-4 py-3 rounded-2xl rounded-tr-none border text-sm leading-relaxed"
                    style={{ background: "rgba(217,119,6,0.12)", borderColor: "rgba(217,119,6,0.3)", color: "#FEF3C7" }}>
                    Of course! Here's a 5-question O-Level Biology quiz on Photosynthesis, aligned with ZIMSEC… 📝
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Copy */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold mb-8 tracking-widest uppercase"
              style={{ background: "rgba(217,119,6,0.12)", borderColor: "rgba(217,119,6,0.3)", color: "#FCD34D" }}>
              <Cpu size={15} /> Indigenous Intelligence
            </div>
            <h2 className="text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-[1.1] text-white"
              style={{ fontFamily: 'var(--font-accent)' }}>
              Meet{" "}
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #F59E0B 0%, #C2410C 100%)" }}>
                BAKO
              </span>
              ,{" "}your AI learning companion.
            </h2>
            <p className="text-lg text-stone-400 font-medium mb-8 leading-relaxed">
              Like the baobab — ancient, vast, and life-giving. BAKO breaks down complex subjects,
              generates ZIMSEC-aligned quizzes, and is fluent in{" "}
              <strong className="text-stone-200">English, Shona, and Ndebele</strong>.
            </p>
            <ul className="space-y-3.5 mb-10">
              {[
                "Summarise any chapter in seconds",
                "Contextual Q&A within your documents",
                "Practice quizzes aligned with ZIMSEC",
                "Shona & Ndebele language support",
              ].map(item => (
                <li key={item} className="flex items-center gap-3 font-medium text-stone-200">
                  <CheckCircle2 className="shrink-0" size={20} style={{ color: "#F59E0B" }} /> {item}
                </li>
              ))}
            </ul>
            <Link to="/tutor"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all hover:-translate-y-1 active:translate-y-0 shadow-xl text-white"
              style={{ background: "linear-gradient(135deg, #B45309, #C2410C)" }}>
              Try BAKO Free
              <PlayCircle size={22} />
            </Link>
          </div>
        </div>
      </section>

      {/* Ndebele divider before CTA */}
      <NdebeleDivider />

      {/* ── FOOTER CTA ────────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #1C1917 0%, #0D1F17 100%)" }}>

        {/* Pattern overlay */}
        <div className="absolute inset-0 pattern-great-zimbabwe opacity-60 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] pointer-events-none"
          style={{ background: "rgba(217,119,6,0.10)" }} />

        {/* Baobab decorations */}
        <div className="absolute bottom-0 left-0 opacity-[0.07] pointer-events-none select-none" style={{ width: '180px' }}>
          <BaobabSvg className="text-green-300 w-full" />
        </div>
        <div className="absolute bottom-0 right-0 opacity-[0.07] pointer-events-none select-none"
          style={{ width: '140px', transform: 'scaleX(-1)' }}>
          <BaobabSvg className="text-amber-300 w-full" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="kente-divider w-24 mx-auto mb-8 rounded-full"></div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white mb-8 leading-tight"
            style={{ fontFamily: 'var(--font-accent)' }}>
            Shape the future<br className="hidden md:block"/> of African learning.
          </h2>
          <p className="text-xl lg:text-2xl text-stone-300 font-medium mb-12 max-w-2xl mx-auto text-balance">
            Join thousands of Zimbabwean students and educators transforming how Africa learns. Free, open, and incredibly smart.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup"
              className="inline-flex items-center justify-center px-10 py-4 rounded-full font-black text-xl text-white transition-all hover:-translate-y-1 active:translate-y-0 shadow-xl"
              style={{ background: "linear-gradient(135deg, #166534 0%, #15803D 100%)", boxShadow: "0 8px 32px rgba(21,128,61,0.30)" }}>
              Start Learning Free
            </Link>
            <Link to="/download"
              className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full font-black text-xl text-white transition-all hover:-translate-y-1 active:translate-y-0 shadow-xl"
              style={{ background: "linear-gradient(135deg, #D97706 0%, #C2410C 100%)", boxShadow: "0 8px 32px rgba(217,119,6,0.25)" }}>
              📱 Android App
            </Link>
            <Link to="/academic"
              className="inline-flex items-center justify-center px-10 py-4 rounded-full font-black text-xl transition-all hover:-translate-y-1"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '2px solid rgba(255,255,255,0.15)' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(217,119,6,0.15)'; e.currentTarget.style.borderColor='rgba(217,119,6,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; }}>
              Explore 500M+ Papers
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom Ndebele strip */}
      <NdebeleDivider flip />
    </div>
  )
}
