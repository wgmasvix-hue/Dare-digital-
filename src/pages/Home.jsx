import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "motion/react"
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
  { value: "250M+",  label: "Global Papers",    icon: <FileText  size={18} /> },
  { value: "10M+",   label: "Open Books",       icon: <BookOpen  size={18} /> },
  { value: "1M+",    label: "Audiobooks",       icon: <Headphones size={18}/> },
  { value: "50K+",   label: "Zim Students",     icon: <Users     size={18} /> },
]

const FEATURES = [
  {
    icon:  <Globe size={28} />,
    color: "green",
    bg:    "bg-green-50",
    text:  "text-green-700",
    title: "Global Open Access",
    desc:  "Search across OpenAlex, Semantic Scholar, DSpace, OpenStax, and Project Gutenberg. One intelligent search — 560 million results.",
  },
  {
    icon:  <Sparkles size={28} />,
    color: "amber",
    bg:    "bg-amber-50",
    text:  "text-amber-600",
    title: "DARA AI Tutor",
    desc:  "Powered by the latest AI, DARA explains concepts, generates ZIMSEC-aligned quizzes, and speaks Shona and Ndebele.",
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
    desc:  "560M+ scholarly papers from Semantic Scholar, Europe PMC, BASE, DOAJ and historical archives — ProQuest-level depth, free.",
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
  { title: "Mathematics",    icon: "📐", color: "hover:bg-blue-50   hover:border-blue-300  hover:text-blue-700" },
  { title: "Sciences",       icon: "🔬", color: "hover:bg-green-50  hover:border-green-300 hover:text-green-700" },
  { title: "Computer Sci",   icon: "💻", color: "hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700" },
  { title: "Literature",     icon: "📖", color: "hover:bg-amber-50  hover:border-amber-300 hover:text-amber-700" },
  { title: "History",        icon: "🏛️", color: "hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700" },
  { title: "Research",       icon: "🔭", color: "hover:bg-rose-50   hover:border-rose-300  hover:text-rose-700" },
]

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
            DARE is Zimbabwe's Digital Academic Resource Engine — millions of open-access books,
            560M+ scholarly papers, and an AI tutor powered by indigenous context.
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
              { label: "560M Papers",         to: "/academic" },
              { label: "1M+ Open Books",      to: "/open-books" },
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

      {/* ── FEATURES 6-GRID ───────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12 border-y border-amber-100/80"
        style={{ background: "linear-gradient(180deg, #FFFBF0 0%, #FFFFFF 100%)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="stripe-kente w-16 mx-auto mb-6 rounded-full"></div>
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

      {/* ── BROWSE CATEGORIES ─────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-stone-900 mb-2"
              style={{ fontFamily: 'var(--font-accent)' }}>
              Browse by Subject
            </h2>
            <p className="text-lg text-stone-500 font-medium">Dive straight into what you need.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.title}
              to={`/library?q=${encodeURIComponent(cat.title)}`}
              className={`bg-white border border-stone-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-200 group ${cat.color}`}>
              <div className="text-3xl group-hover:scale-110 transition-transform duration-200">{cat.icon}</div>
              <span className="font-bold text-stone-800 text-sm group-hover:inherit">{cat.title}</span>
            </Link>
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

      {/* ── DARA AI SECTION — warm mahogany dark ──────────────── */}
      <section className="py-24 px-6 lg:px-12 overflow-hidden relative border-y border-stone-800"
        style={{ background: "linear-gradient(135deg, #1C1009 0%, #2D1800 50%, #1A0C05 100%)" }}>

        {/* Warm amber glow */}
        <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] rounded-full blur-[130px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ background: "rgba(217,119,6,0.08)" }}></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
          style={{ background: "rgba(21,128,61,0.06)" }}></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
          {/* Chat demo */}
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -inset-1 rounded-[2.5rem] opacity-20 blur"
              style={{ background: "linear-gradient(135deg, #D97706, #15803D)" }}></div>
            <div className="aspect-[4/5] sm:aspect-square bg-stone-950/80 backdrop-blur-2xl rounded-[2.5rem] border border-stone-700/50 relative p-6 sm:p-10 flex flex-col justify-end shadow-2xl">
              <div className="absolute top-8 right-8">
                <Sparkles size={36} className="text-amber-400 opacity-50" />
              </div>
              <div className="space-y-5 w-full">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-full bg-stone-700 flex-shrink-0"></div>
                  <div className="px-4 py-3.5 bg-stone-700/60 backdrop-blur rounded-2xl border border-stone-600/50 text-stone-200 font-medium text-sm shadow-sm leading-relaxed">
                    Ndinoda kunzwisisa photosynthesis — ndizvo chii chaizvo?
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: 0.7 }}
                  className="flex items-start gap-3 flex-row-reverse"
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                    style={{ background: "linear-gradient(135deg, #D97706, #15803D)" }}>
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div className="px-4 py-3.5 backdrop-blur-md rounded-2xl border text-sm font-medium leading-relaxed"
                    style={{ background: "rgba(217,119,6,0.12)", borderColor: "rgba(217,119,6,0.25)", color: "#FEF3C7" }}>
                    Fikiridza zura riri mudenga — muti une "solar panels" mumashizha ake anonzi chlorophyll. Anotora
                    chiedza chezuva kuchinja mvura ne CO₂ kuita zuccheri (simba) ne oksijeni! 🌿☀️
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Copy */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold mb-8 tracking-widest uppercase"
              style={{ background: "rgba(217,119,6,0.12)", borderColor: "rgba(217,119,6,0.25)", color: "#FCD34D" }}>
              <Cpu size={15} /> Indigenous Intelligence
            </div>
            <h2 className="text-5xl lg:text-6xl font-black tracking-tight mb-8 leading-[1.1] text-white"
              style={{ fontFamily: 'var(--font-accent)' }}>
              Meet{" "}
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #FCD34D 0%, #A3E635 100%)" }}>
                DARA
              </span>
              , your AI learning companion.
            </h2>
            <p className="text-xl text-stone-400 font-medium mb-10 leading-relaxed">
              Break down complex subjects, get ZIMSEC-aligned summaries, and generate instant practice quizzes.
              DARA is fluent in <strong className="text-stone-200">English, Shona, and Ndebele</strong>.
            </p>
            <ul className="space-y-4 mb-10">
              {[
                "Summarise any chapter in seconds",
                "Contextual Q&A within your documents",
                "Practice quizzes aligned with ZIMSEC",
                "Shona & Ndebele language support",
              ].map(item => (
                <li key={item} className="flex items-center gap-3 font-medium text-stone-200">
                  <CheckCircle2 className="shrink-0" size={22} style={{ color: "#4ADE80" }} /> {item}
                </li>
              ))}
            </ul>
            <Link to="/tutor"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-stone-900 rounded-full font-bold text-lg hover:bg-amber-50 transition-all hover:-translate-y-1 active:translate-y-0 shadow-lg">
              Try DARA Free
              <PlayCircle size={22} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ────────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden border-t border-stone-200"
        style={{ background: "linear-gradient(180deg, #FFFBF0 0%, #FEF3C7 100%)" }}>
        <div className="absolute inset-0 pattern-kente -z-10 opacity-60"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] -z-10"
          style={{ background: "rgba(217,119,6,0.15)" }}></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="stripe-kente w-20 mx-auto mb-8 rounded-full"></div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-stone-900 mb-8 leading-tight"
            style={{ fontFamily: 'var(--font-accent)' }}>
            Shape the future<br className="hidden md:block"/> of African learning.
          </h2>
          <p className="text-xl lg:text-2xl text-stone-600 font-medium mb-12 max-w-2xl mx-auto text-balance">
            Join thousands of Zimbabwean students and educators transforming how Africa learns. Free, open, and incredibly smart.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup"
              className="inline-flex items-center justify-center px-10 py-4 rounded-full font-black text-xl text-white transition-all hover:-translate-y-1 active:translate-y-0 shadow-xl"
              style={{ background: "linear-gradient(135deg, #166534 0%, #15803D 100%)", boxShadow: "0 8px 32px rgba(21,128,61,0.30)" }}>
              Start Learning Free
            </Link>
            <Link to="/academic"
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-stone-900 border-2 border-stone-200 rounded-full font-black text-xl hover:border-amber-400 hover:bg-amber-50 transition-all">
              Explore 560M Papers
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
