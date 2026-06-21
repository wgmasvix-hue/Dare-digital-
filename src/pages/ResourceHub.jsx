import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  BookOpen, Globe, FlaskConical, Headphones, GraduationCap,
  Database, FileText, Newspaper, Search, ExternalLink, Layers,
  BookMarked, Mic, Library, ChevronRight
} from 'lucide-react';

const SOURCES = [
  // ── Live External ─────────────────────────────────────────────────────────
  {
    category: 'Research & Academic',
    items: [
      {
        id: 'academic',
        icon: <FlaskConical size={22} />,
        color: '#2563EB',
        bg: '#EFF6FF',
        name: 'Academic Database',
        count: '500M+',
        unit: 'peer-reviewed papers',
        desc: 'Semantic Scholar, OpenAlex, DOAJ, Europe PMC — the deepest open research index available.',
        href: '/academic',
        internal: true,
      },
      {
        id: 'research',
        icon: <Database size={22} />,
        color: '#7C3AED',
        bg: '#F5F3FF',
        name: 'Local Research Portal',
        count: '200M+',
        unit: 'papers + local Zimbabwe research',
        desc: 'OpenAlex global papers combined with local Zimbabwean institutional research.',
        href: '/research',
        internal: true,
      },
      {
        id: 'arxiv',
        icon: <FileText size={22} />,
        color: '#B45309',
        bg: '#FFFBEB',
        name: 'arXiv Preprints',
        count: '2.3M+',
        unit: 'preprint papers',
        desc: 'Mathematics, physics, CS, economics, biology. Free scientific preprints.',
        href: '/academic',
        internal: true,
      },
    ],
  },
  {
    category: 'Open Books & Texts',
    items: [
      {
        id: 'open-books',
        icon: <BookOpen size={22} />,
        color: '#0D9488',
        bg: '#F0FDFA',
        name: 'Open Access Books',
        count: '50M+',
        unit: 'books across all repositories',
        desc: 'Open Library, Internet Archive, OAPEN, Standard Ebooks, Open Textbook Library — unified.',
        href: '/open-books',
        internal: true,
      },
      {
        id: 'gutenberg',
        icon: <Library size={22} />,
        color: '#166534',
        bg: '#F0FDF4',
        name: 'Project Gutenberg',
        count: '70,000+',
        unit: 'public domain ebooks',
        desc: 'Classic literature, philosophy, history — all free, all public domain.',
        href: '/gutenberg',
        internal: true,
      },
      {
        id: 'openstax',
        icon: <BookMarked size={22} />,
        color: '#DC2626',
        bg: '#FEF2F2',
        name: 'OpenStax Textbooks',
        count: '50+',
        unit: 'peer-reviewed textbooks',
        desc: 'Free university-grade textbooks covering Science, Math, Social Sciences, and more.',
        href: '/openstax',
        internal: true,
      },
      {
        id: 'ai-textbooks',
        icon: <Layers size={22} />,
        color: '#9333EA',
        bg: '#FAF5FF',
        name: 'AI & Future Tech Books',
        count: '200+',
        unit: 'curated AI/tech resources',
        desc: 'Machine learning, data science, and emerging technology textbooks.',
        href: '/ai-textbooks',
        internal: true,
      },
    ],
  },
  {
    category: 'Audio & Media',
    items: [
      {
        id: 'librivox',
        icon: <Headphones size={22} />,
        color: '#0891B2',
        bg: '#ECFEFF',
        name: 'LibriVox Audiobooks',
        count: '15,000+',
        unit: 'free audiobooks',
        desc: 'Volunteer-read public domain audiobooks. Great for learning on the go.',
        href: '/open-books',
        internal: true,
      },
    ],
  },
  {
    category: 'Zimbabwe-Specific',
    items: [
      {
        id: 'library',
        icon: <BookOpen size={22} />,
        color: '#166534',
        bg: '#F0FDF4',
        name: 'DARE Local Library',
        count: '87',
        unit: 'curated OER books',
        desc: "Hand-picked open educational resources for Zimbabwe's Heritage-Based Curriculum.",
        href: '/library',
        internal: true,
      },
      {
        id: 'dare-institutional',
        icon: <GraduationCap size={22} />,
        color: '#D97706',
        bg: '#FFFBEB',
        name: 'Institutional Repositories',
        count: '44',
        unit: 'Zimbabwean institutions',
        desc: "UZ, NUST, MSU, teachers' colleges, polytechnics — local scholarship.",
        href: '/institutions',
        internal: true,
      },
      {
        id: 'teachers-colleges',
        icon: <GraduationCap size={22} />,
        color: '#C2410C',
        bg: '#FFF7ED',
        name: "Teachers' Colleges",
        count: '20+',
        unit: 'teacher training colleges',
        desc: 'Portals for student teachers. Lesson plans, TP companion, HBC tools.',
        href: '/teachers-colleges',
        internal: true,
      },
    ],
  },
  {
    category: 'Historical & Newspapers',
    items: [
      {
        id: 'historical',
        icon: <Newspaper size={22} />,
        color: '#78350F',
        bg: '#FFFBEB',
        name: 'Historical Archives',
        count: '19M+',
        unit: 'historical newspaper pages',
        desc: 'Chronicling America and global newspaper archives. Primary source research.',
        href: '/academic',
        internal: true,
      },
    ],
  },
];

const TOTAL_RESOURCES = '500M+';

export default function ResourceHub() {
  const [search, setSearch] = useState('');

  const filtered = SOURCES.map(cat => ({
    ...cat,
    items: cat.items.filter(
      item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.desc.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: '#0D1F17' }}>
        {/* Flag stripe */}
        <div className="h-1 w-full"
          style={{ background: 'linear-gradient(90deg,#166534 0% 25%,#D97706 25% 50%,#C2410C 50% 75%,#1C1917 75% 100%)' }} />
        {/* Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: '#D97706', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: '#166534', transform: 'translate(-30%, 30%)' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-14 md:py-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-stone-500 text-xs mb-6">
            <Link to="/" className="hover:text-stone-300 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-green-400 font-semibold">All Resources</span>
          </div>

          <div className="inline-flex items-center gap-2 bg-green-900/60 border border-green-700/40 text-green-300 text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            <Globe size={11} />
            {TOTAL_RESOURCES} Resources Available
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-3">
            All <span className="text-green-400">Learning</span> Resources
          </h1>
          <p className="text-stone-400 text-base md:text-lg max-w-xl mb-8">
            Every source DARE Digital indexes — from Zimbabwe-curated OER books to 500M+ global papers. All free, all searchable.
          </p>

          {/* Search */}
          <div className="relative max-w-lg">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter resources…"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-white placeholder-stone-500 text-sm outline-none focus:ring-2 focus:ring-amber-500/50"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
          </div>

          {/* Quick stat chips */}
          <div className="flex flex-wrap gap-3 mt-6">
            {[
              { label: '500M+ Papers', href: '/academic' },
              { label: '50M+ Books', href: '/open-books' },
              { label: '87 OER Books', href: '/library' },
              { label: '15K+ Audiobooks', href: '/open-books' },
              { label: '44 Zim Institutions', href: '/institutions' },
            ].map(c => (
              <Link key={c.label} to={c.href}
                className="px-3 py-1.5 rounded-full text-xs font-bold text-stone-300 border border-stone-700 hover:border-amber-500 hover:text-amber-400 transition-all"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Resource Sections ────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {filtered.length === 0 && (
          <div className="text-center py-20 text-stone-400">
            <Globe size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">No resources match "{search}"</p>
          </div>
        )}

        {filtered.map(cat => (
          <section key={cat.category}>
            <h2 className="text-xl font-black text-stone-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 rounded-full inline-block" style={{ background: '#166534' }} />
              {cat.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={item.href}
                    className="group flex flex-col h-full bg-white rounded-3xl p-6 border border-stone-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                    {/* Icon + count */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                        style={{ background: item.bg, color: item.color }}>
                        {item.icon}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black" style={{ color: item.color }}>{item.count}</div>
                        <div className="text-[10px] text-stone-400 font-medium">{item.unit}</div>
                      </div>
                    </div>

                    <h3 className="font-bold text-stone-800 text-base mb-1.5 group-hover:text-green-700 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-stone-500 text-sm leading-relaxed flex-1">{item.desc}</p>

                    <div className="flex items-center gap-1 mt-4 text-xs font-bold"
                      style={{ color: item.color }}>
                      Browse {item.name.split(' ')[0]}
                      <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        ))}

        {/* BAKO AI Banner */}
        <section className="rounded-3xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1C0A00 0%, #451A03 100%)' }}>
          <div className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-6">
            <div className="text-5xl">🌳</div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-amber-300 font-black text-sm uppercase tracking-widest mb-1">BAKO AI</p>
              <h3 className="text-white font-black text-2xl mb-2">AI Summaries for Every Resource</h3>
              <p className="text-amber-100/70 text-sm">
                Open any book or paper and BAKO automatically generates a Zimbabwean-context summary and Heritage-Based lesson plan — powered by DeepSeek AI.
              </p>
            </div>
            <Link to="/tutor"
              className="shrink-0 px-6 py-3 rounded-2xl font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#D97706,#C2410C)' }}>
              Meet BAKO
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
