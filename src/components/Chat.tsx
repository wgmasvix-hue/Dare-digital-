import React, { useState, useRef, useEffect } from "react";
import { Send, User, Loader2, Flame } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { geminiService } from "../services/geminiService";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
}

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      text: "Makadii! I am BAKO — your Boundless African Knowledge Oracle. Rooted in Zimbabwe's wisdom, powered by AI. Whether you need a concept explained in Shona, a ZIMSEC-aligned quiz, or research guidance — I am here. How can we rise together today? 🌿",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const reply = await geminiService.chat(input, history);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: reply,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("BAKO Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: "I apologize — I hit a technical obstacle. Please try again as we strive for excellence together.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] w-full max-w-3xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-amber-100 relative">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/8 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-400/8 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

      {/* Header */}
      <div className="p-5 text-white flex items-center justify-between relative z-10 shadow-lg"
        style={{ background: "linear-gradient(135deg, #92400E 0%, #B45309 40%, #C2410C 100%)" }}>
        <div className="flex items-center gap-4">
          {/* BAKO flame avatar */}
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border border-white/20 relative overflow-hidden"
            style={{ background: "rgba(255,255,255,0.15)" }}>
            <span className="text-2xl select-none">🌳</span>
          </div>
          <div>
            <h2 className="font-black text-xl tracking-tight leading-tight">BAKO AI</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 bg-amber-300 rounded-full animate-pulse" />
              <p className="text-[11px] font-bold text-amber-100/80 uppercase tracking-widest">
                Boundless African Knowledge Oracle
              </p>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1">
          <span className="text-[10px] uppercase tracking-widest text-white/50 font-mono">Education 5.0</span>
          <span className="text-[10px] uppercase tracking-widest text-white/50 font-mono">Unhu/Ubuntu AI</span>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-5 bg-gradient-to-b from-amber-50/30 to-white/60 custom-scrollbar relative z-10"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: index === messages.length - 1 ? 0.08 : 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-end gap-2`}
            >
              {msg.role === "ai" && (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mb-1 text-base shadow-sm border border-amber-200"
                  style={{ background: "linear-gradient(135deg, #92400E, #C2410C)" }}>
                  🌳
                </div>
              )}
              <div
                className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap font-sans shadow-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-amber-600 to-orange-700 text-white rounded-br-none"
                    : "bg-white text-stone-800 border border-amber-100/80 rounded-bl-none"
                }`}
              >
                {msg.text}
                <div className={`mt-1.5 text-[10px] ${msg.role === "user" ? "text-amber-100/60" : "text-stone-400"}`}>
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0 mb-1">
                  <User size={15} className="text-stone-500" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-end gap-2"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-base shadow-sm border border-amber-200"
              style={{ background: "linear-gradient(135deg, #92400E, #C2410C)" }}>
              🌳
            </div>
            <div className="bg-white border border-amber-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input bar */}
      <form onSubmit={sendMessage} className="relative z-10 p-4 bg-white/80 backdrop-blur-sm border-t border-amber-100">
        <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask BAKO anything — in English, Shona, or Ndebele…"
            className="flex-1 bg-transparent text-stone-800 placeholder-stone-400 text-sm outline-none font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-sm active:scale-95"
            style={{ background: "linear-gradient(135deg, #B45309, #C2410C)" }}
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-center text-[10px] text-stone-400 mt-2 font-medium">
          BAKO AI can make mistakes. Always verify important information.
        </p>
      </form>
    </div>
  );
}
