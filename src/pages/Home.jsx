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
  BookOpen
} from "lucide-react"
import { OPENSTAX_EXPANDED, AI_PRIORITY_OER } from "../lib/oerCatalog"
import SearchBar from "../components/library/SearchBar"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

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
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-200 selection:text-teal-900 overflow-x-hidden pt-16">
      
      {/* Modern Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden px-6 lg:px-12 flex flex-col items-center">
        {/* Abstract Background Meshes */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden opacity-50 dark:opacity-20 flex items-center justify-center">
          <div className="relative w-[100vw] h-[100vw] max-w-[1200px] max-h-[1200px]">
            <div className="absolute top-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-teal-200 mix-blend-multiply blur-[80px] sm:blur-[120px] animate-blob"></div>
            <div className="absolute top-[30%] right-[10%] w-[60%] h-[60%] rounded-full bg-amber-200 mix-blend-multiply blur-[80px] sm:blur-[120px] animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[10%] left-[30%] w-[40%] h-[40%] rounded-full bg-rose-200 mix-blend-multiply blur-[80px] sm:blur-[120px] animate-blob animation-delay-4000"></div>
          </div>
        </div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10"
        >
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-teal-100 shadow-sm text-sm font-semibold text-teal-800 mb-8 backdrop-blur-md">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
            </span>
            Accelerating Education 5.0 in Zimbabwe
          </motion.div>
          
          <motion.h1 variants={fadeIn} className="text-5xl sm:text-7xl lg:text-[6rem] font-black tracking-tighter leading-[1.05] text-slate-900 mb-8">
            Knowledge without <br className="hidden lg:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-800">
              boundaries.
            </span>
          </motion.h1>
          
          <motion.p variants={fadeIn} className="text-xl lg:text-3xl text-slate-600 font-medium max-w-3xl mx-auto mb-10 leading-relaxed text-balance">
            DARE is the premier Digital Academic Resource Engine. We equip students and educators with millions of open-access books, powered by an intelligent AI tutoring system.
          </motion.p>
          
          <motion.div variants={fadeIn} className="w-full max-w-3xl mx-auto mb-8">
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={(val) => {
                if (val.trim()) {
                  navigate(`/library?q=${encodeURIComponent(val)}`)
                }
              }}
              placeholder="Search across millions of resources..."
            />
          </motion.div>

          <motion.div variants={fadeIn} className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mr-2">Jump to:</span>
            <Link to="/library?source=DARE%20Institutional" className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-700 hover:border-teal-500 hover:text-teal-600 transition-colors shadow-sm">DARE Institutional</Link>
            <Link to="/library?source=OpenStax" className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-700 hover:border-teal-500 hover:text-teal-600 transition-colors shadow-sm">OpenStax</Link>
            <Link to="/library?source=Project%20Gutenberg" className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-700 hover:border-teal-500 hover:text-teal-600 transition-colors shadow-sm">Project Gutenberg</Link>
            <Link to="/library?source=DOAB" className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-700 hover:border-teal-500 hover:text-teal-600 transition-colors shadow-sm">DOAB</Link>
            <Link to="/library" className="px-4 py-2 bg-slate-900 border border-slate-900 rounded-full text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2">
              Browse All <ArrowRight size={16} />
            </Link>
          </motion.div>

          <motion.div variants={fadeIn} className="mt-20 pt-10 border-t border-slate-200/60 w-full max-w-3xl flex flex-col items-center">
            <p className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-8">Trusted by leading academic institutions</p>
            <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 font-black text-xl lg:text-2xl tracking-tight text-slate-800"><Building2 size={28}/> UZ Research</div>
              <div className="flex items-center gap-2 font-black text-xl lg:text-2xl tracking-tight text-slate-800"><Building2 size={28}/> NUST Library</div>
              <div className="flex items-center gap-2 font-black text-xl lg:text-2xl tracking-tight text-slate-800"><Building2 size={28}/> MSU Scholars</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-24 px-6 lg:px-12 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-6">Supercharge your academic journey.</h2>
            <p className="text-xl text-slate-600 font-medium">DARE goes beyond a standard repository, actively assisting your learning process with intelligent tools.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl transition-shadow group">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <Globe size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Global Open Access</h3>
              <p className="text-slate-600 font-medium leading-relaxed text-lg">Instantly search across DSpace repositories, Project Gutenberg, OpenAlex, and OpenStax. One search bar, millions of results.</p>
            </div>
            
            <div className="bg-white p-10 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl transition-shadow group">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                <Sparkles size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">AI Contextual Tutor</h3>
              <p className="text-slate-600 font-medium leading-relaxed text-lg">Stuck on a concept? DARA provides tailored explanations, summaries, and quizzes aligned with your local curriculum.</p>
            </div>

            <div className="bg-white p-10 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl transition-shadow group">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <GraduationCap size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Institutional Hubs</h3>
              <p className="text-slate-600 font-medium leading-relaxed text-lg">Dedicated portals for secondary schools and universities, bridging the gap between local archives and the global academic sphere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse By Collections */}
      <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 mb-2">Browse Collections</h2>
            <p className="text-lg text-slate-500 font-medium">Explore specific subjects and categories directly.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { title: "Mathematics", icon: <BookOpen size={24} className="text-blue-500" /> },
            { title: "Science", icon: <Globe size={24} className="text-emerald-500" /> },
            { title: "Computer Sci", icon: <Cpu size={24} className="text-purple-500" /> },
            { title: "Primary Ed", icon: <GraduationCap size={24} className="text-amber-500" /> },
            { title: "Literature", icon: <BookOpen size={24} className="text-rose-500" /> },
            { title: "Research", icon: <Building2 size={24} className="text-slate-500" /> }
          ].map((cat) => (
            <Link 
              key={cat.title} 
              to={`/library?q=${encodeURIComponent(cat.title)}`}
              className="bg-white border border-slate-200/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-teal-400 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <span className="font-bold text-slate-800 text-sm">{cat.title}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Clean Grid Showcase */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-4">Curated Essentials</h2>
            <p className="text-xl text-slate-500 font-medium">Top-tier academic resources powering the next generation of innovators.</p>
          </div>
          <Link to="/library" className="group shrink-0 inline-flex items-center gap-2 font-bold text-teal-700 hover:text-teal-800 transition-colors px-6 py-3 bg-teal-50 rounded-full hover:bg-teal-100/80">
            Browse full catalog 
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-4">
                <div className="aspect-[2/3] bg-slate-200/60 rounded-3xl"></div>
                <div className="h-4 bg-slate-200/60 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200/60 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            featuredBooks.slice(0, 4).map(book => (
              <Link key={book.id} to={`/book/${book.id}`} className="group flex flex-col gap-4 focus:outline-none">
                <div className="relative aspect-[2/3] overflow-hidden rounded-[2rem] bg-slate-100 border border-slate-200/60 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 group-hover:border-teal-200 group-focus:ring-4 ring-teal-500/30">
                  <img 
                    src={book.cover_image_url} 
                    alt={book.title} 
                    referrerPolicy="no-referrer" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="inline-block px-4 py-1.5 bg-white backdrop-blur-md rounded-full text-slate-900 text-xs font-bold uppercase tracking-wider">Read Book</span>
                  </div>
                </div>
                <div className="px-1">
                  <h4 className="font-bold text-slate-900 text-xl leading-snug mb-1 group-hover:text-teal-600 transition-colors line-clamp-2">
                    {book.title}
                  </h4>
                  <p className="text-base text-slate-500 font-medium line-clamp-1">
                    {book.author_names}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Modern Split Section for AI */}
      <section className="py-24 px-6 lg:px-12 bg-[#0a0f1c] text-white overflow-hidden relative border-y border-slate-800">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-[2.5rem] opacity-20 blur mb-4"></div>
            <div className="aspect-[4/5] sm:aspect-square bg-[#111827]/80 backdrop-blur-2xl rounded-[2.5rem] border border-slate-700/50 relative p-6 sm:p-10 flex flex-col justify-end shadow-2xl">
              <div className="absolute top-0 right-0 p-8 pt-10 px-10">
                <Sparkles size={40} className="text-amber-400 opacity-60" />
              </div>
              <div className="space-y-6 w-full mx-auto">
                 <motion.div 
                   initial={{ opacity: 0, x: -20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   viewport={{ once: true, margin: "-100px" }}
                   transition={{ delay: 0.2 }}
                   className="flex items-start gap-4"
                 >
                   <div className="w-10 h-10 rounded-full bg-slate-700 flex-shrink-0"></div>
                   <div className="px-5 py-4 bg-slate-700/60 backdrop-blur rounded-2xl border border-slate-600/50 shadow-sm text-slate-200 font-medium text-base shadow-slate-900/50">
                     Can you explain photosynthesis, but make it simple?
                   </div>
                 </motion.div>
                 <motion.div 
                   initial={{ opacity: 0, x: 20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   viewport={{ once: true, margin: "-100px" }}
                   transition={{ delay: 0.6 }}
                   className="flex items-start gap-4 flex-row-reverse"
                 >
                   <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/20">
                     <Sparkles size={18} className="text-white" />
                   </div>
                   <div className="px-5 py-4 bg-teal-500/10 backdrop-blur-md rounded-2xl border border-teal-500/20 shadow-sm text-teal-50 font-medium text-base leading-relaxed shadow-slate-900/50">
                     Imagine a solar panel. Plants have natural solar panels in their leaves called chlorophyll. They capture sunlight to turn water and carbon dioxide into sugar (energy) and oxygen! ☀️🍃
                   </div>
                 </motion.div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 backdrop-blur-md border border-slate-700 text-sm font-bold text-amber-400 mb-8 tracking-widest uppercase">
              <Cpu size={16} /> Native Intelligence
            </div>
            <h2 className="text-5xl lg:text-6xl font-black tracking-tight mb-8 leading-[1.1]">
              Study smarter with <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">DARA Assistant.</span>
            </h2>
            <p className="text-xl lg:text-2xl text-slate-400 font-medium mb-12 leading-relaxed">
              Break down complex subjects, get summaries, and generate instant practice quizzes. DARA adapts to your pace and natively supports English, Shona, and Ndebele.
            </p>
            <ul className="space-y-5 mb-12">
              <li className="flex items-center gap-4 text-slate-200 font-medium text-lg">
                <CheckCircle2 className="text-teal-400 shrink-0" size={24} /> Summarize chapters in seconds
              </li>
              <li className="flex items-center gap-4 text-slate-200 font-medium text-lg">
                <CheckCircle2 className="text-teal-400 shrink-0" size={24} /> Contextual search within documents
              </li>
              <li className="flex items-center gap-4 text-slate-200 font-medium text-lg">
                <CheckCircle2 className="text-teal-400 shrink-0" size={24} /> Practice quizzes aligned with ZIMSEC
              </li>
            </ul>
            <Link to="/tutor" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-xl hover:bg-slate-200 transition-transform hover:-translate-y-1 active:translate-y-0">
              Try DARA out
              <PlayCircle size={24} />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Power-house Footer CTA */}
      <section className="py-32 px-6 relative overflow-hidden bg-slate-50 border-t border-slate-200">
        <div className="absolute right-0 bottom-0 w-full h-full bg-gradient-to-t from-teal-50 to-transparent -z-10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-100/50 rounded-full blur-[100px] -z-10 mix-blend-multiply opacity-50"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-slate-900 mb-8 leading-tight">
            Ready to shape the <br className="hidden md:block"/> future of learning?
          </h2>
          <p className="text-xl lg:text-2xl text-slate-600 font-medium mb-12 max-w-2xl mx-auto text-balance">
            Join thousands of students and educators transforming education across Zimbabwe. Free, open, and incredibly smart.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="inline-flex items-center justify-center px-10 py-5 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-bold text-xl transition-all shadow-xl shadow-teal-900/10 hover:shadow-teal-900/20 hover:-translate-y-1 active:translate-y-0">
              Get Started for Free
            </Link>
            <Link to="/about" className="inline-flex items-center justify-center px-10 py-5 bg-white text-slate-900 border-2 border-slate-200 rounded-full font-bold text-xl hover:border-slate-300 hover:bg-slate-50 transition-all">
              Learn more
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
