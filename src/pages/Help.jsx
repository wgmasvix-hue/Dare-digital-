import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown, BookOpen, Sparkles, User, Shield, Globe,
  Search, MessageSquare, ArrowRight, Mail, Phone, ExternalLink
} from 'lucide-react';

const faqs = [
  {
    category: 'Getting Started',
    icon: BookOpen,
    color: 'teal',
    items: [
      {
        q: 'What is DARE Digital Library?',
        a: 'DARE (Digital Academic Resource Engine) is Zimbabwe\'s premier open educational resource platform. It provides students, educators, and researchers with free access to over 50,000 academic resources including textbooks, research papers, and AI-powered learning tools aligned with Education 5.0 and Zimbabwe\'s Heritage-Based Curriculum.'
      },
      {
        q: 'How do I create an account?',
        a: 'Click "Join DARE" in the top navigation. Fill in your name, email, password, and select your role (Student, Lecturer, or Researcher). Your account will be created immediately and you can start browsing the library right away.'
      },
      {
        q: 'Is DARE completely free?',
        a: 'Yes! DARE is 100% open access. All resources on the platform — including books, research papers, AI tutoring via DARA, and teacher tools — are completely free for all users.'
      },
      {
        q: 'What institutions are supported?',
        a: 'DARE supports all Zimbabwean higher education institutions including the University of Zimbabwe, Midlands State University, NUST, Great Zimbabwe University, Chinhoyi University, Bindura University, HIT, and over 15 more. Vocational and teachers\' colleges are also fully supported.'
      },
    ]
  },
  {
    category: 'DARA AI Tutor',
    icon: Sparkles,
    color: 'amber',
    items: [
      {
        q: 'What is DARA?',
        a: 'DARA (Digital Academic Research Assistant) is your AI-powered study companion. It can explain complex concepts, generate ZIMSEC-aligned practice questions, summarize textbooks, and help with research — all within the context of the Zimbabwean and regional education system. DARA supports English, Shona, and Ndebele.'
      },
      {
        q: 'Can DARA explain concepts in Shona or Ndebele?',
        a: 'Yes! DARA is designed with local language support in mind. You can ask questions in English, Shona (ChiShona), or Ndebele (IsiNdebele) and DARA will respond accordingly. This makes learning more accessible and culturally relevant.'
      },
      {
        q: 'How do I use DARA effectively?',
        a: 'Navigate to the DARA Tutor page from the navigation bar. You can ask DARA to explain topics, generate quizzes, summarize books, help with assignments, or discuss research ideas. Be specific in your questions — for example: "Explain photosynthesis as it relates to Zimbabwean agriculture" or "Generate 5 ZIMSEC-style questions on quadratic equations."'
      },
      {
        q: 'Does DARA save my chat history?',
        a: 'Currently, DARA chat history is maintained within a single session. We are working on persistent chat history for logged-in users as part of our upcoming updates.'
      },
    ]
  },
  {
    category: 'Library & Resources',
    icon: Globe,
    color: 'blue',
    items: [
      {
        q: 'How many books are available?',
        a: 'DARE indexes over 1,000,000 titles through our connections to Open Library, Project Gutenberg, arXiv, and OpenStax, plus our own curated local collection of over 50,000 resources. You can search across all sources simultaneously from the Library page.'
      },
      {
        q: 'Can I download books for offline reading?',
        a: 'Many resources on DARE are available for download in PDF format. Look for the download button on any book detail page. We are also developing a full offline mode for the app so you can access saved resources without internet.'
      },
      {
        q: 'What is the DSpace Repository?',
        a: 'The DSpace Explorer allows you to browse institutional research repositories from Zimbabwean universities. This includes theses, dissertations, conference papers, and journals published by local academics. You can also request to sync your institution\'s DSpace repository with DARE.'
      },
      {
        q: 'How do I request a book that isn\'t in the library?',
        a: 'On the Library page, scroll to the bottom of the filter panel and click "Request Digitization." Fill in the book details and our team will work to source or digitize the resource. You\'ll be notified by email when it becomes available.'
      },
    ]
  },
  {
    category: 'Account & Privacy',
    icon: Shield,
    color: 'purple',
    items: [
      {
        q: 'How is my reading data used?',
        a: 'Your reading history and progress are stored locally on your device and used only to power features like "Continue Learning" and your personal dashboard. We do not sell your personal data to third parties. See our Privacy Policy for full details.'
      },
      {
        q: 'How do I delete my account?',
        a: 'Go to Settings → Danger Zone → Delete Account. This will permanently remove your profile and all associated data from our servers. Note: this action cannot be undone.'
      },
      {
        q: 'I forgot my password. What should I do?',
        a: 'On the Login page, click "Forgot Password?" and enter your email address. You will receive a password reset link within a few minutes. Check your spam folder if it doesn\'t arrive.'
      },
    ]
  },
];

const colorMap = {
  teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
};

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left group"
      >
        <span className="font-semibold text-slate-800 group-hover:text-teal-600 transition text-sm leading-relaxed">{q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 mt-0.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-slate-600 leading-relaxed pb-4">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Help() {
  const [searchQ, setSearchQ] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredFaqs = faqs
    .map(cat => ({
      ...cat,
      items: cat.items.filter(item =>
        searchQ === '' ||
        item.q.toLowerCase().includes(searchQ.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQ.toLowerCase())
      )
    }))
    .filter(cat =>
      (activeCategory === 'All' || cat.category === activeCategory) &&
      cat.items.length > 0
    );

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold rounded-full uppercase tracking-widest mb-4">
            Support
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Help Center</h1>
          <p className="text-slate-500 text-lg">Find answers, guides, and support for DARE Digital Library.</p>

          {/* Search */}
          <div className="relative mt-6 max-w-lg mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search for help…"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition"
            />
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {['All', ...faqs.map(f => f.category)].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* FAQ Sections */}
        <div className="space-y-6">
          {filteredFaqs.map((cat, i) => {
            const colors = colorMap[cat.color];
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
              >
                <div className={`flex items-center gap-3 px-6 py-4 border-b border-slate-100 ${colors.bg}`}>
                  <div className={`w-8 h-8 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center ${colors.text}`}>
                    <Icon size={16} />
                  </div>
                  <h2 className={`font-bold text-base ${colors.text}`}>{cat.category}</h2>
                </div>
                <div className="px-6">
                  {cat.items.map((item, j) => <FAQItem key={j} q={item.q} a={item.a} />)}
                </div>
              </motion.div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <Search size={32} className="mx-auto text-slate-300 mb-3" />
              <h3 className="font-black text-lg text-slate-900">No results for "{searchQ}"</h3>
              <p className="text-slate-500 mt-1">Try a different search term or browse by category.</p>
            </div>
          )}
        </div>

        {/* Contact Banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mt-10 bg-slate-900 text-white rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div>
            <h3 className="font-black text-xl mb-1">Still need help?</h3>
            <p className="text-slate-400 text-sm">Our team is here to support you Monday to Friday, 8am–5pm CAT.</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-3 text-sm text-slate-300">
              <a href="mailto:dare.digitallib@gmail.com" className="flex items-center gap-1.5 hover:text-teal-400 transition">
                <Mail size={14} /> dare.digitallib@gmail.com
              </a>
              <a href="tel:+263784457922" className="flex items-center gap-1.5 hover:text-teal-400 transition">
                <Phone size={14} /> +263 784 457 922
              </a>
            </div>
          </div>
          <Link
            to="/contact"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition active:scale-95"
          >
            <MessageSquare size={18} />
            Send a Message
          </Link>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { to: '/library', label: 'Browse Library', icon: BookOpen },
            { to: '/tutor', label: 'Ask DARA AI', icon: Sparkles },
            { to: '/privacy', label: 'Privacy Policy', icon: Shield },
          ].map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-teal-300 hover:bg-teal-50/30 transition group"
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className="text-slate-400 group-hover:text-teal-500 transition" />
                <span className="text-sm font-bold text-slate-700 group-hover:text-teal-700 transition">{label}</span>
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-teal-500 transition" />
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
