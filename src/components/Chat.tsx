import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, Sparkles } from "lucide-react";
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
      text: "Masikati! I am DARA, your Digital Academic Research Assistant. I am here to help you excel within the Education 5.0 framework: Teaching, Research, Community Service, Innovation, and Industrialization. How can we innovate together today?",
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
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: "I apologize, but I encountered a technical hurdle. Please try again as we strive for excellence.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] w-full max-w-3xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-700 p-6 text-white flex items-center justify-between relative z-10 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl shadow-inner border border-white/30">
            <Bot size={28} className="text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl tracking-tight leading-tight">DARA Assistant</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <p className="text-xs font-medium text-emerald-100/80 uppercase tracking-widest">Education 5.0 Framework Ready</p>
            </div>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-[10px] uppercase tracking-tighter text-white/60 font-mono">System Integrity: 100%</p>
          <p className="text-[10px] uppercase tracking-tighter text-white/60 font-mono">Latency: 45ms</p>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white/50 custom-scrollbar relative z-10"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: index === messages.length - 1 ? 0.1 : 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`group relative max-w-[85%] p-4 rounded-2xl transition-all duration-300 ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/20 rounded-tr-none hover:shadow-emerald-600/40"
                    : "bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none hover:border-emerald-200"
                }`}
              >
                <div className={`absolute -top-2 ${msg.role === 'user' ? '-left-2' : '-right-2'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                   {msg.role === 'user' ? <User size={12} className="text-emerald-300" /> : <Bot size={12} className="text-emerald-600" />}
                </div>
                
                <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>
                
                <div className={`mt-2 text-[10px] ${msg.role === 'user' ? 'text-emerald-100/70' : 'text-slate-400'} flex items-center gap-1`}>
                   {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-start items-center gap-3"
          >
            <div className="w-10 h-10 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-center">
              <Loader2 size={18} className="animate-spin text-emerald-600" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-2 w-24 bg-emerald-100 rounded-full overflow-hidden relative">
                <motion.div 
                  className="absolute inset-0 bg-emerald-400"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Processing Inquiry</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white/50 backdrop-blur-md border-t border-slate-100 relative z-10">
        <form 
          onSubmit={sendMessage}
          className="relative flex items-center gap-3"
        >
          <div className="relative flex-1 group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask DARA: 'How can education drive industrialization?'"
              className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm sm:text-base focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
              <Sparkles size={20} />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-br from-emerald-600 to-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all shadow-lg hover:shadow-emerald-500/40"
          >
            <Send size={24} />
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-medium">
          DARA is committed to the vision of a prosperous Zimbabwe
        </p>
      </div>
    </div>
  );
}
