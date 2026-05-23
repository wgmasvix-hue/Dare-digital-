import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "motion/react"
import { 
  ArrowRight, 
  BookOpen, 
  Sparkles, 
  Zap, 
  Globe, 
  Search,
  Cpu,
  GraduationCap,
  Building2,
  PlayCircle
} from "lucide-react"
import { OPENSTAX_EXPANDED, AI_PRIORITY_OER } from "../lib/oerCatalog"

export default function Home() {
  const [featuredBooks, setFeaturedBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const books = [...AI_PRIORITY_OER, ...OPENSTAX_EXPANDED.slice(0, 4)]
    setFeaturedBooks(books)
    setLoading(false)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-200 selection:text-teal-900 overflow-x-hidden">
      {/* Swiss/Minimalist Hero Section */}
      <section className="relative pt-32 pb-40 lg:pt-48 lg:pb-52 overflow-hidden px-6 lg:px-12 flex flex-col items-center text-center">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-100/40 blur-3xl"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-100/40 blur-3xl"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-sm font-medium text-slate-600 mb-8">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            Education 5.0 Ready
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight leading-[1.05] text-slate-900 mb-8">
            <span className="tracking-tighter">DARE to</span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">
              Share Knowledge.
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-slate-600 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
            Zimbabwe's premier Digital Academic Resource Engine. Empowering Education 5.0 through open access, AI-driven learning, and collaborative research.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/library?q=AI" className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-lg overflow-hidden transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto">
              <span className="relative z-10">Explore AI Books</span>
              <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link to="/tutor" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-full font-bold text-lg hover:border-slate-900 hover:bg-slate-50 transition-all active:scale-95 w-full sm:w-auto">
              <Sparkles size={20} className="text-amber-500" />
              <span>Meet DARA AI</span>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* High-Impact Stat Strip */}
      <section className="border-y border-slate-200 bg-white py-12 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-slate-100">
          <div className="flex flex-col items-center text-center px-4">
            <p className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-2">50K+</p>
            <p className="text-sm font-bold text-slate-500 tracking-widest uppercase">Resources</p>
          </div>
          <div className="flex flex-col items-center text-center px-4">
            <p className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-2">15+</p>
            <p className="text-sm font-bold text-slate-500 tracking-widest uppercase">Institutions</p>
          </div>
          <div className="flex flex-col items-center text-center px-4">
            <p className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-2">100%</p>
            <p className="text-sm font-bold text-slate-500 tracking-widest uppercase">Open Access</p>
          </div>
          <div className="flex flex-col items-center text-center px-4">
            <p className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-2">24/7</p>
            <p className="text-sm font-bold text-teal-600 tracking-widest uppercase">AI Tutoring</p>
          </div>
        </div>
      </section>

      {/* Clean Grid Showcase */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-slate-900 mb-4">Featured Collection</h2>
            <p className="text-lg text-slate-500 font-medium max-w-xl">Curated academic resources powering the next generation of Zimbabwean innovators and leaders.</p>
          </div>
          <Link to="/library" className="group inline-flex items-center gap-2 font-bold text-teal-600 hover:text-teal-700 transition-colors">
            View Entire Library 
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-4">
                <div className="aspect-[2/3] bg-slate-200 rounded-2xl"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            featuredBooks.slice(0, 4).map(book => (
              <Link key={book.id} to={`/book/${book.id}`} className="group flex flex-col gap-4 focus:outline-none">
                <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2 group-focus:ring-4 ring-teal-500/30">
                  <img 
                    src={book.cover_image_url} 
                    alt={book.title} 
                    referrerPolicy="no-referrer" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-300"></div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg leading-tight mb-1 group-hover:text-teal-600 transition-colors line-clamp-2">
                    {book.title}
                  </h4>
                  <p className="text-sm text-slate-500 font-medium line-clamp-1">
                    {book.author_names}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* 1 Million Books Connected Promo Section */}
      <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-200/60">
        <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent rounded-3xl p-8 lg:p-12 border border-teal-500/20 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-left max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
              <Globe size={12} className="text-teal-600 animate-pulse" /> Massive Global Catalog Synced
            </span>
            <h3 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-4">
              Access 1,000,000+ Real Open-Source Books
            </h3>
            <p className="text-slate-600 text-base lg:text-lg font-medium leading-relaxed">
              Our index links directly to millions of academic papers, digitized library scans, and classic public domain publications from Open Library, Project Gutenberg, arXiv, and OpenStax. Find and read any topic instantly!
            </p>
          </div>
          <Link to="/open-books" className="group shrink-0 inline-flex items-center gap-3 px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 rounded-full font-bold text-lg shadow-md transition-all active:scale-95">
            <span>Query 1M+ Books</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Giant Feature Block (Swiss Style) */}
      <section className="py-24 px-6 lg:px-12 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="aspect-square md:aspect-[4/3] bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 relative p-8 flex flex-col justify-end">
              <div className="absolute top-0 right-0 p-8">
                <Sparkles size={48} className="text-amber-400 opacity-50" />
              </div>
              <div className="space-y-4 max-w-sm">
                 <div className="inline-block px-4 py-2 bg-slate-700/50 backdrop-blur rounded-2xl border border-slate-600/50">
                   <p className="font-mono text-sm text-slate-300">"Explain quantum mechanics in Shona."</p>
                 </div>
                 <div className="inline-block px-4 py-2 bg-teal-500/20 backdrop-blur rounded-2xl border border-teal-500/30 ml-8">
                   <p className="font-mono text-sm text-teal-100">DARA is processing your request...</p>
                 </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-sm font-bold text-amber-400 mb-8 tracking-widest uppercase">
              <Cpu size={16} />
              AI Tutor
            </div>
            <h2 className="text-4xl lg:text-7xl font-black tracking-tight mb-6 leading-tight">
              Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">DARA.</span><br/>
              Your genius <br/> study partner.
            </h2>
            <p className="text-xl text-slate-400 font-medium mb-10 leading-relaxed max-w-xl">
              DARA reads alongside you, summarizing complex textbooks, generating ZIMSEC-aligned practice quizzes, and explaining concepts natively in English, Shona, and Ndebele.
            </p>
            <Link to="/tutor" className="inline-flex items-center gap-3 px-8 py-4 bg-teal-500 text-slate-900 rounded-full font-bold text-lg hover:bg-teal-400 transition-colors">
              Start Chatting
              <PlayCircle size={24} />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Bottom CTA */}
      <section className="py-32 px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-8">
          Ready to accelerate the future?
        </h2>
        <Link to="/register" className="inline-flex items-center justify-center px-10 py-5 bg-slate-900 text-white rounded-full font-bold text-xl hover:bg-slate-800 transition-transform hover:-translate-y-1 active:translate-y-0">
          Join DARE Community
        </Link>
      </section>
    </div>
  )
}
