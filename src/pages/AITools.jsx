import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, BookOpen, GraduationCap, FileText, Brain, Languages,
  Quote, PenLine, Microscope, MessageSquare, ChevronRight, X,
  Send, Zap, CheckCircle, Lightbulb, ArrowRight
} from 'lucide-react';

const DS_KEY = import.meta.env?.VITE_DEEPSEEK_API_KEY || '';
const DS_URL  = 'https://api.deepseek.com/chat/completions';

/* ── Tool definitions ── */
const TOOLS = [
  {
    id: 'bako-chat', icon: Sparkles, color: '#D97706', bg: 'rgba(217,119,6,0.12)',
    label: 'BAKO AI Chat', tag: 'General',
    desc: 'Ask anything about your studies. Get clear explanations in English, Shona, or Ndebele.',
    prompt: 'You are BAKO AI, Zimbabwe\'s educational assistant. Be helpful, warm, and culturally aware. Answer clearly.',
    placeholder: 'Ask BAKO anything…',
  },
  {
    id: 'summarizer', icon: FileText, color: '#166534', bg: 'rgba(22,101,52,0.12)',
    label: 'Book Summarizer', tag: 'Reading',
    desc: 'Paste any text or chapter — BAKO will extract key points and create a structured summary.',
    prompt: 'Summarize the following text into clear, bullet-pointed key points grouped by theme. Use simple language appropriate for Zimbabwe secondary school students.',
    placeholder: 'Paste text to summarize…',
  },
  {
    id: 'zimsec', icon: GraduationCap, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)',
    label: 'ZIMSEC Practice', tag: 'Exams',
    desc: 'Generate past-paper style questions for any ZIMSEC subject. O-Level and A-Level supported.',
    prompt: 'Generate 5 ZIMSEC-style exam questions for the topic provided. Include mark allocations and model answers. Format clearly.',
    placeholder: 'e.g. "O-Level Biology — Photosynthesis"',
  },
  {
    id: 'lesson-planner', icon: PenLine, color: '#0891b2', bg: 'rgba(8,145,178,0.12)',
    label: 'Lesson Planner', tag: 'Teaching',
    desc: 'Create Zimbabwe HBC-aligned lesson plans with objectives, activities, and assessment tasks.',
    prompt: 'Create a detailed lesson plan for Zimbabwe schools following the Heritage-Based Curriculum (HBC). Include: learning objectives, materials needed, introduction (5 min), main activities (25 min), assessment (10 min), homework. Format professionally.',
    placeholder: 'e.g. "Form 3 Agriculture — Soil Conservation"',
  },
  {
    id: 'quiz-gen', icon: Brain, color: '#be185d', bg: 'rgba(190,24,93,0.12)',
    label: 'Quiz Generator', tag: 'Assessment',
    desc: 'Generate multiple-choice, true/false, or short answer quizzes on any topic instantly.',
    prompt: 'Generate a 10-question quiz on the topic provided. Mix question types: multiple-choice (with 4 options and one correct answer marked), true/false, and 2 short answer questions. Provide an answer key at the end.',
    placeholder: 'e.g. "A-Level History — Zimbabwe Liberation War"',
  },
  {
    id: 'translator', icon: Languages, color: '#0d9488', bg: 'rgba(13,148,136,0.12)',
    label: 'Translate', tag: 'Language',
    desc: 'Translate educational content between English, Shona, and Ndebele with cultural accuracy.',
    prompt: 'Translate the following text accurately. Maintain educational meaning and cultural context. Specify both the source and target language if not clear. Support English ↔ Shona ↔ Ndebele.',
    placeholder: 'Enter text to translate…',
  },
  {
    id: 'citation', icon: Quote, color: '#b45309', bg: 'rgba(180,83,9,0.12)',
    label: 'Citation Helper', tag: 'Research',
    desc: 'Generate properly formatted APA, Harvard, or MLA citations for books, journals, and websites.',
    prompt: 'Generate a properly formatted citation for the source described. Support APA 7th edition, Harvard, and MLA 9th edition. Ask which format is needed if not specified. Also provide an in-text citation example.',
    placeholder: 'Describe the source (book, article, website…)',
  },
  {
    id: 'research', icon: Microscope, color: '#4338ca', bg: 'rgba(67,56,202,0.12)',
    label: 'Research Assistant', tag: 'Research',
    desc: 'Get help structuring research papers, literature reviews, and academic arguments.',
    prompt: 'You are a research writing assistant for Zimbabwe university students. Help structure arguments, suggest literature review points, improve academic writing style, and ensure proper academic discourse. Be specific and actionable.',
    placeholder: 'Describe your research topic or paste a draft paragraph…',
  },
  {
    id: 'notes', icon: Lightbulb, color: '#16a34a', bg: 'rgba(22,163,74,0.12)',
    label: 'Study Notes', tag: 'Learning',
    desc: 'Turn any text, topic, or chapter into concise, memorable study notes with mnemonics.',
    prompt: 'Create concise study notes for the topic or text provided. Include: key definitions, important dates/facts, diagrams described in text form, and a mnemonic or memory trick where helpful. Format with clear headings.',
    placeholder: 'Enter topic or paste chapter text…',
  },
  {
    id: 'essay', icon: MessageSquare, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)',
    label: 'Essay Coach', tag: 'Writing',
    desc: 'Get feedback on essays, improve arguments, and fix grammar while keeping your voice.',
    prompt: 'Review and improve the following essay. Provide: 1) Overall feedback (2-3 sentences), 2) Specific improvements for structure, 3) Grammar corrections highlighted, 4) A stronger introduction suggestion, 5) A stronger conclusion suggestion. Be encouraging and constructive.',
    placeholder: 'Paste your essay for feedback…',
  },
];

const TAGS = ['All', ...new Set(TOOLS.map(t => t.tag))];

/* ── Inline AI Chat Modal ── */
function ToolModal({ tool, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', text };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(DS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${DS_KEY}` },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: tool.prompt },
            ...messages.map(m => ({ role: m.role, content: m.text })),
            { role: 'user', content: text },
          ],
          max_tokens: 1200,
          temperature: 0.7,
        }),
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || 'No response. Please try again.';
      setMessages(m => [...m, { role: 'assistant', text: reply }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', text: '⚠️ Connection error. Please check your internet.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        className="w-full max-w-2xl flex flex-col rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: '#0D1F17', border: '1px solid rgba(255,255,255,0.1)', height: 'min(85vh, 700px)' }}>

        {/* Header */}
        <div className="flex items-center gap-4 p-5 border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: tool.bg, border: `1px solid ${tool.color}33` }}>
            <tool.icon size={22} style={{ color: tool.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-black text-lg leading-none" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{tool.label}</h3>
            <p className="text-stone-400 text-xs mt-0.5 truncate">{tool.desc}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-10">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4" style={{ background: tool.bg }}>
                <tool.icon size={28} style={{ color: tool.color }} />
              </div>
              <p className="text-white/60 font-semibold mb-2">{tool.label} ready</p>
              <p className="text-stone-500 text-sm max-w-xs mx-auto">{tool.desc}</p>
            </motion.div>
          )}
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'text-white rounded-tr-sm'
                  : 'text-stone-200 rounded-tl-sm'}`}
                style={m.role === 'user'
                  ? { background: `${tool.color}33`, border: `1px solid ${tool.color}44` }
                  : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {m.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-white/10">
                    <span className="text-base">🌳</span>
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">BAKO AI</span>
                  </div>
                )}
                {m.text}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-stone-400 text-xs pl-1">
              <div className="flex gap-1">{[0,1,2].map(i => (
                <span key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: tool.color, animationDelay: `${i*0.15}s` }} />
              ))}</div>
              BAKO is thinking…
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex gap-3">
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder={tool.placeholder} disabled={loading} rows={2}
              className="flex-1 px-4 py-2.5 rounded-2xl text-white placeholder-stone-500 text-sm outline-none focus:ring-2 resize-none custom-scrollbar"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', focusRingColor: tool.color }} />
            <button onClick={() => send(input)} disabled={!input.trim() || loading}
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40 shrink-0 self-end"
              style={{ background: `linear-gradient(135deg,${tool.color},${tool.color}cc)` }}>
              <Send size={16} className="text-white" />
            </button>
          </div>
          <p className="text-stone-600 text-[10px] mt-2 text-center">Enter to send · Shift+Enter for new line</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main page ── */
export default function AITools() {
  const [activeTag, setTag]   = useState('All');
  const [activeTool, setTool] = useState(null);
  const [search, setSearch]   = useState('');

  const filtered = TOOLS.filter(t =>
    (activeTag === 'All' || t.tag === activeTag) &&
    (t.label.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen pb-20" style={{ background: '#FFFBF0' }}>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden py-24 mb-12" style={{ background: 'linear-gradient(135deg,#0D1F17 0%,#166534 60%,#0D1F17 100%)' }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg,rgba(217,119,6,0.6) 0,rgba(217,119,6,0.6) 1px,transparent 0,transparent 28px),repeating-linear-gradient(-45deg,rgba(194,65,12,0.5) 0,rgba(194,65,12,0.5) 1px,transparent 0,transparent 28px)' }} />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.4 }}
            className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl"
            style={{ background: 'linear-gradient(135deg,#D97706,#C2410C)' }}>
            <Sparkles size={38} className="text-white" />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-5"
            style={{ background: 'rgba(217,119,6,0.15)', border: '1px solid rgba(217,119,6,0.3)', color: '#FCD34D' }}>
            <Zap size={12} /> Powered by BAKO AI
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif', letterSpacing: '-0.03em' }}>
            AI Tools for<br /><span style={{ color: '#D97706' }}>Zimbabwe Learners</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="text-green-200/70 text-lg max-w-xl mx-auto mb-8">
            {TOOLS.length} AI-powered tools built for Zimbabwe's curriculum. Free. Private. No account needed.
          </motion.p>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="relative max-w-md mx-auto">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tools…"
              className="w-full px-5 py-3.5 rounded-2xl text-white placeholder-white/40 text-sm outline-none focus:ring-2 focus:ring-amber-500/40"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }} />
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">

        {/* ── Tag filter ── */}
        <div className="flex gap-2 flex-wrap mb-8">
          {TAGS.map((tag, i) => (
            <motion.button key={tag} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => setTag(tag)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTag === tag ? 'text-white' : 'text-stone-600 hover:text-stone-800'}`}
              style={activeTag === tag ? { background: 'linear-gradient(135deg,#166534,#15803D)', boxShadow: '0 4px 12px rgba(22,101,52,0.2)' }
                : { background: 'white', border: '1px solid #E7D5B3' }}>
              {tag}
            </motion.button>
          ))}
        </div>

        {/* ── Tools grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((tool, i) => (
            <motion.div key={tool.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group bg-white rounded-3xl p-6 cursor-pointer transition-all hover:shadow-xl border border-stone-100"
              onClick={() => setTool(tool)}>

              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: tool.bg }}>
                  <tool.icon size={22} style={{ color: tool.color }} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg"
                  style={{ background: tool.bg, color: tool.color }}>
                  {tool.tag}
                </span>
              </div>

              <h3 className="font-black text-stone-900 text-lg mb-2 leading-tight group-hover:text-stone-700 transition-colors"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                {tool.label}
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-5">{tool.desc}</p>

              <div className="flex items-center gap-2 text-sm font-bold transition-all" style={{ color: tool.color }}>
                <span>Launch tool</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-stone-400">
            <Brain size={40} className="mx-auto mb-4 opacity-30" />
            <p className="font-bold">No tools found for "{search}"</p>
          </div>
        )}

        {/* ── DARE Book Writer CTA ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-14 rounded-3xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#0D1F17 0%,#1a3a28 100%)' }}>
          <div className="p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4"
                style={{ background: 'rgba(217,119,6,0.15)', border: '1px solid rgba(217,119,6,0.3)', color: '#FCD34D' }}>
                ✍️ For Authors
              </div>
              <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Write books with BAKO AI
              </h2>
              <p className="text-green-200/60 leading-relaxed">
                Use our AI-powered book writer to create educational content, get instant suggestions, and publish directly to Zimbabwe's digital library network.
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
              <Link to="/author-onboarding"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-white transition-all hover:-translate-y-1 hover:shadow-2xl"
                style={{ background: 'linear-gradient(135deg,#D97706,#C2410C)' }}>
                <BookOpen size={18} /> Start Writing
              </Link>
              <Link to="/author-dashboard"
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-bold text-white/60 text-sm transition-colors hover:text-white/80"
                style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                View Dashboard <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Tool modal ── */}
      <AnimatePresence>
        {activeTool && <ToolModal tool={activeTool} onClose={() => setTool(null)} />}
      </AnimatePresence>
    </div>
  );
}
