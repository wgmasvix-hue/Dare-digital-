import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Plus, Trash2, Sparkles, Save, Download, Upload,
  ChevronRight, ChevronLeft, AlignLeft, Bold, Italic, List,
  Send, X, Mic, Eye, MoreVertical, CheckCircle
} from 'lucide-react';

const BAKO_URL = 'https://api.deepseek.com/chat/completions';
const DS_KEY   = import.meta.env?.VITE_DEEPSEEK_API_KEY || '';

const DEFAULT_CHAPTERS = [{ id: 1, title: 'Chapter 1: Introduction', content: '', words: 0 }];

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function AIPanel({ context, onInsert, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '🌳 Hello! I\'m BAKO, your AI writing companion. I can help you:\n• Expand your ideas\n• Suggest chapter content\n• Improve clarity\n• Generate discussion questions\n\nWhat would you like help with?' }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const systemPrompt = `You are BAKO (Boundless African Knowledge Oracle), an AI writing assistant for DARE Digital Library — Zimbabwe's education platform. Help the author write educational content aligned with Zimbabwe's curriculum. Keep responses concise, practical, and culturally relevant. Current chapter context: "${context?.slice(0, 300) || 'New chapter'}"`;
      const res = await fetch(BAKO_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${DS_KEY}` },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0).map(m => ({ role: m.role, content: m.text })),
            { role: 'user', content: text }
          ],
          max_tokens: 600,
          temperature: 0.7,
        }),
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || 'I couldn\'t generate a response. Please try again.';
      setMessages(m => [...m, { role: 'assistant', text: reply }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', text: '⚠️ Couldn\'t connect to BAKO. Check your internet connection.' }]);
    } finally {
      setLoading(false);
    }
  };

  const QUICK = ['Expand this section', 'Add an example', 'Suggest discussion questions', 'Write a summary', 'Improve clarity'];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌳</span>
          <div>
            <p className="text-white font-black text-sm">BAKO AI</p>
            <p className="text-emerald-400 text-xs font-bold">Writing Assistant</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors"><X size={16} /></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messages.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className={`text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'assistant' ? 'text-stone-200' : 'text-right'}`}>
            {m.role === 'assistant' ? (
              <div className="p-3 rounded-2xl rounded-tl-sm" style={{ background: 'rgba(22,101,52,0.15)', border: '1px solid rgba(22,101,52,0.2)' }}>
                {m.text}
                <button onClick={() => onInsert(m.text)}
                  className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                  <Plus size={10} /> Insert into editor
                </button>
              </div>
            ) : (
              <div className="inline-block px-3 py-2 rounded-2xl rounded-tr-sm text-white text-xs" style={{ background: 'rgba(217,119,6,0.2)' }}>
                {m.text}
              </div>
            )}
          </motion.div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-stone-400 text-xs">
            <div className="flex gap-1">{[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}</div>
            BAKO is thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
      <div className="px-3 pb-2 flex flex-wrap gap-1.5">
        {QUICK.map(q => (
          <button key={q} onClick={() => send(q)}
            className="px-2 py-1 rounded-lg text-[10px] font-bold text-amber-300 hover:text-amber-200 transition-colors"
            style={{ background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.2)' }}>
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10">
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send(input))}
            placeholder="Ask BAKO anything…" disabled={loading}
            className="flex-1 px-3 py-2 rounded-xl text-white placeholder-stone-500 text-xs outline-none focus:ring-1 focus:ring-amber-500/40"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
          <button onClick={() => send(input)} disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#D97706,#C2410C)' }}>
            <Send size={13} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookWriter() {
  const [title, setTitle]         = useState('Untitled Book');
  const [chapters, setChapters]   = useState(DEFAULT_CHAPTERS);
  const [active, setActive]       = useState(0);
  const [showAI, setShowAI]       = useState(true);
  const [showOutline, setOutline] = useState(true);
  const [saved, setSaved]         = useState(false);
  const [wordGoal]                = useState(50000);
  const editorRef = useRef(null);

  const currentChapter = chapters[active] || chapters[0];
  const totalWords      = chapters.reduce((s, c) => s + c.words, 0);

  // Auto-save to localStorage
  useEffect(() => {
    const save = setTimeout(() => {
      localStorage.setItem('dare_book_draft', JSON.stringify({ title, chapters, saved_at: new Date().toISOString() }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1500);
    return () => clearTimeout(save);
  }, [title, chapters]);

  // Restore draft
  useEffect(() => {
    const draft = localStorage.getItem('dare_book_draft');
    if (draft) {
      try {
        const d = JSON.parse(draft);
        setTitle(d.title || 'Untitled Book');
        setChapters(d.chapters || DEFAULT_CHAPTERS);
      } catch { /* ignore */ }
    }
  }, []);

  const updateContent = useCallback((val) => {
    setChapters(prev => prev.map((c, i) => i === active ? { ...c, content: val, words: countWords(val) } : c));
  }, [active]);

  const addChapter = () => {
    const newCh = { id: Date.now(), title: `Chapter ${chapters.length + 1}`, content: '', words: 0 };
    setChapters(p => [...p, newCh]);
    setActive(chapters.length);
  };

  const deleteChapter = (idx) => {
    if (chapters.length === 1) return;
    setChapters(p => p.filter((_, i) => i !== idx));
    setActive(Math.max(0, active - 1));
  };

  const renameChapter = (idx, val) => {
    setChapters(p => p.map((c, i) => i === idx ? { ...c, title: val } : c));
  };

  const insertFromAI = (text) => {
    const ta = editorRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const cur   = currentChapter.content;
    const newVal = cur.slice(0, start) + '\n\n' + text + '\n\n' + cur.slice(start);
    updateContent(newVal);
    ta.focus();
  };

  const exportTxt = () => {
    const content = chapters.map(c => `${c.title}\n${'═'.repeat(c.title.length)}\n\n${c.content}`).join('\n\n\n');
    const blob = new Blob([`${title}\n${'═'.repeat(title.length)}\n\n${content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${title}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const pct = Math.min(100, Math.round((totalWords / wordGoal) * 100));

  return (
    <div className="h-screen flex flex-col overflow-hidden"
      style={{ background: '#0D1F17', fontFamily: 'var(--font-accent, Bricolage Grotesque, sans-serif)' }}>

      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0"
        style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>

        <Link to="/author-dashboard" className="text-white/40 hover:text-white/70 transition-colors">
          <ChevronLeft size={18} />
        </Link>

        {/* Book title */}
        <input value={title} onChange={e => setTitle(e.target.value)}
          className="flex-1 bg-transparent text-white font-black text-lg outline-none placeholder-white/20 min-w-0"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          placeholder="Book title…" />

        {/* Word progress */}
        <div className="hidden md:flex items-center gap-3 mr-2">
          <div className="text-right">
            <p className="text-white font-bold text-sm">{totalWords.toLocaleString()} words</p>
            <p className="text-white/30 text-xs">{pct}% of {wordGoal.toLocaleString()} goal</p>
          </div>
          <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#166534,#D97706)' }}
              initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {saved && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                <CheckCircle size={13} /> Saved
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={exportTxt} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white/60 text-xs font-bold hover:text-white/80 transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <Download size={13} /> Export
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-bold transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg,#D97706,#C2410C)' }}>
            <Upload size={13} /> Publish
          </button>
          <button onClick={() => setShowAI(v => !v)}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${showAI ? 'text-amber-400' : 'text-white/30'}`}
            style={{ background: showAI ? 'rgba(217,119,6,0.15)' : 'rgba(255,255,255,0.05)' }}>
            <Sparkles size={15} />
          </button>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Outline sidebar ── */}
        <AnimatePresence>
          {showOutline && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 220, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.25 }}
              className="flex flex-col border-r shrink-0 overflow-hidden"
              style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>

              <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Chapters</span>
                <button onClick={addChapter} className="w-6 h-6 rounded-lg flex items-center justify-center text-white/40 hover:text-amber-400 hover:bg-amber-400/10 transition-all">
                  <Plus size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
                {chapters.map((ch, i) => (
                  <div key={ch.id}
                    className={`group flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-all mx-1.5 rounded-xl mb-0.5 ${active === i ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
                    style={active === i ? { background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.2)' } : {}}
                    onClick={() => setActive(i)}>
                    <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0"
                      style={{ background: active === i ? 'rgba(217,119,6,0.3)' : 'rgba(255,255,255,0.06)', color: active === i ? '#D97706' : '' }}>
                      {i + 1}
                    </div>
                    <input value={ch.title} onChange={e => renameChapter(i, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      className="flex-1 bg-transparent text-xs font-semibold outline-none min-w-0 truncate" />
                    <button onClick={e => { e.stopPropagation(); deleteChapter(i); }}
                      className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all">
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="text-center">
                  <p className="text-white/60 text-xs font-bold">{chapters.length} chapters</p>
                  <p className="text-white/30 text-[10px]">{totalWords.toLocaleString()} words total</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle outline btn */}
        <button onClick={() => setOutline(v => !v)}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-10 flex items-center justify-center text-white/20 hover:text-white/50 transition-colors z-10"
          style={{ marginLeft: showOutline ? 220 : 0, background: 'rgba(255,255,255,0.05)' }}>
          {showOutline ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>

        {/* ── Main editor ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Chapter header */}
          <div className="px-6 pt-5 pb-3 shrink-0">
            <input value={currentChapter.title} onChange={e => renameChapter(active, e.target.value)}
              className="w-full bg-transparent text-white font-black text-2xl outline-none placeholder-white/20"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              placeholder="Chapter title…" />
            <div className="flex items-center gap-3 mt-2">
              <span className="text-white/30 text-xs">{currentChapter.words} words in this chapter</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
          </div>

          {/* Formatting toolbar */}
          <div className="flex items-center gap-1 px-6 pb-3 shrink-0">
            {[
              { icon: Bold,     tip: 'Bold (Ctrl+B)' },
              { icon: Italic,   tip: 'Italic (Ctrl+I)' },
              { icon: List,     tip: 'Bullet list' },
              { icon: AlignLeft,tip: 'Paragraph' },
            ].map(({ icon: Icon, tip }) => (
              <button key={tip} title={tip}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all">
                <Icon size={13} />
              </button>
            ))}
            <div className="flex-1" />
            <span className="text-white/20 text-[10px] font-mono">{active + 1}/{chapters.length}</span>
          </div>

          {/* Textarea editor */}
          <div className="flex-1 px-6 pb-6 overflow-hidden">
            <textarea
              ref={editorRef}
              value={currentChapter.content}
              onChange={e => updateContent(e.target.value)}
              placeholder={`Start writing Chapter ${active + 1}…\n\nTip: Select any text and ask BAKO AI to expand or improve it.`}
              className="w-full h-full resize-none bg-transparent text-stone-200 text-base leading-relaxed outline-none placeholder-white/10 custom-scrollbar"
              style={{ fontFamily: 'Georgia, serif', fontSize: '16px', lineHeight: '1.8' }}
              spellCheck
            />
          </div>
        </div>

        {/* ── BAKO AI panel ── */}
        <AnimatePresence>
          {showAI && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 300, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.25 }}
              className="flex flex-col border-l shrink-0 overflow-hidden"
              style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
              <AIPanel context={currentChapter.content} onInsert={insertFromAI} onClose={() => setShowAI(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
