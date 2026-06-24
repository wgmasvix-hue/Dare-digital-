import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, Loader2, ChevronDown, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { geminiService } from '../../services/geminiService';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const QUICK_PROMPTS = [
  'Summarize what you can help with',
  'Find me books on Zimbabwe agriculture',
  'Explain Education 5.0',
  'Suggest research papers on HBC',
];

export default function DaraDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;

    const userMsg: Message = { role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const reply = await geminiService.chat(trimmed, history);
      setMessages(prev => [...prev, { role: 'ai', text: reply || '' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'I encountered an error. Please try again.' }]);
    } finally {
      setThinking(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="trigger"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            title="DARA AI Librarian"
          >
            <Sparkles size={22} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop (mobile only) */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-[88] md:hidden"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              key="drawer"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed bottom-0 right-0 top-0 z-[89] w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-700"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-teal-600 to-emerald-700 text-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-none">DARA AI Librarian</p>
                    <p className="text-teal-100 text-[10px] font-medium mt-0.5">Ask me anything about the library</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {messages.length > 0 && (
                    <button
                      onClick={() => setMessages([])}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      title="Clear chat"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-6 text-center pb-8">
                    <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
                      <Sparkles size={28} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">Hello, I'm DARA</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                        Your AI-powered academic librarian. Ask me about books, research, or Education 5.0.
                      </p>
                    </div>
                    <div className="w-full space-y-2">
                      {QUICK_PROMPTS.map(p => (
                        <button
                          key={p}
                          onClick={() => send(p)}
                          className="w-full text-left px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 hover:border-teal-200 transition-all font-medium"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'ai' && (
                      <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-600 shrink-0 mt-1 mr-2">
                        <Sparkles size={12} />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-teal-600 text-white rounded-br-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                      }`}
                    >
                      {msg.role === 'ai' ? (
                        <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                ))}

                {thinking && (
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-600 shrink-0 mt-1">
                      <Sparkles size={12} />
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:0ms]" />
                      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:150ms]" />
                      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="shrink-0 px-4 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-400/20 transition-all p-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Ask DARA anything…"
                    rows={1}
                    className="flex-1 bg-transparent resize-none outline-none text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 max-h-28 overflow-y-auto py-1 px-2"
                    style={{ minHeight: '36px' }}
                    onInput={e => {
                      const el = e.currentTarget;
                      el.style.height = 'auto';
                      el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
                    }}
                  />
                  <button
                    onClick={() => send(input)}
                    disabled={!input.trim() || thinking}
                    className="w-9 h-9 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 transition-all active:scale-95"
                  >
                    {thinking ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 text-center mt-2">Enter to send · Shift+Enter for new line</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
