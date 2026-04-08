import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bot, User, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { geminiService } from '../../services/geminiService';
import InteractiveMarkdown from './InteractiveMarkdown';

export default function DaraChatModal({ isOpen, onClose, initialMessage = "" }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && initialMessage && messages.length === 0) {
      handleSend(initialMessage);
    }
  }, [isOpen, initialMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (text = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'ai', text: m.text }));
      const response = await geminiService.chat(text.trim(), history);
      
      const aiMessage = { role: 'ai', text: response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("DARA Chat Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I encountered an error. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInteractiveAction = (type, text) => {
    let prompt = '';
    switch (type) {
      case 'explain':
        prompt = `Explain this concept more clearly: "${text}"`;
        break;
      case 'simplify':
        prompt = `Simplify this explanation for a beginner: "${text}"`;
        break;
      case 'quiz':
        prompt = `Generate a quick quiz question based on this section: "${text}"`;
        break;
      case 'answer':
        prompt = `Provide a detailed answer for this question: "${text}"`;
        break;
      case 'hint':
        prompt = `Give me a small hint for this question, but don't give the full answer yet: "${text}"`;
        break;
      case 'ask':
        prompt = `Tell me more about this: "${text}"`;
        break;
      default:
        prompt = text;
    }
    handleSend(prompt);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-2xl h-[600px] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200"
          >
          {/* Header */}
          <div className="p-6 bg-emerald-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">DARA AI Tutor</h3>
                <p className="text-xs text-emerald-100">Digital Academic Research Assistant</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {messages.length === 0 && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                  <Sparkles size={32} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">How can I help you today?</h4>
                  <p className="text-sm text-slate-500 max-w-xs">
                    Ask me about your studies, research papers, or lesson planning.
                  </p>
                </div>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div 
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-slate-100 text-slate-800 rounded-tl-none'
                  }`}>
                    {msg.role === 'ai' ? (
                      <InteractiveMarkdown 
                        content={msg.text} 
                        onAction={handleInteractiveAction}
                      />
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="p-4 bg-slate-100 rounded-2xl rounded-tl-none">
                    <Loader2 size={16} className="animate-spin text-emerald-600" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-slate-100">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative"
            >
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full pl-6 pr-14 py-4 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-all"
              >
                <Send size={20} />
              </button>
            </form>
            <p className="text-[10px] text-center text-slate-400 mt-4">
              DARA AI can make mistakes. Check important info.
            </p>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
}
