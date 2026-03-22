import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Bot, Send, Loader2, Sparkles, MessageSquare, 
  BookOpen, GraduationCap, ChevronRight, ArrowRight
} from 'lucide-react';
import { geminiService } from '../../services/geminiService';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import styles from './DaraChatModal.module.css';

const DaraChatModal = ({ isOpen, onClose, initialMessage = "", programmeCode, faculty, institutionId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      text: "Mhoro! 👋 I'm DARA, your personal AI Tutor. I'm here to help you master your subjects using all the resources in the Dare Digital Library. \n\nWhat are we learning today? I can help you explain a complex concept, create a study plan, or test your knowledge with a quick quiz." 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && initialMessage && messages.length === 1) {
      handleSend(initialMessage);
    }
  }, [isOpen]);

  const handleSend = async (text = input) => {
    if (!text.trim() || loading) return;

    const userMessage = { role: 'user', text: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // 1. Ensure we have a session if user is logged in
      let currentSessionId = sessionId;
      if (user && !currentSessionId) {
        const { data: session, error: sError } = await supabase
          .from('dara_sessions')
          .insert({
            user_id: user.id,
            institution_id: institutionId,
            programme_code: programmeCode,
            faculty: faculty,
            session_title: text.slice(0, 50) + (text.length > 50 ? '...' : '')
          })
          .select()
          .single();
        
        if (!sError && session) {
          currentSessionId = session.id;
          setSessionId(currentSessionId);
        }
      }

      // 2. Save user message to DB
      if (user && currentSessionId) {
        await supabase.from('dara_messages').insert({
          session_id: currentSessionId,
          user_id: user.id,
          role: 'user',
          content: text
        });
      }

      // 3. Get AI response
      const response = await geminiService.chat(text, messages, {
        programmeCode,
        faculty,
        institutionId
      });
      
      const aiMessage = { role: 'ai', text: response };
      setMessages(prev => [...prev, aiMessage]);

      // 4. Save AI response to DB
      if (user && currentSessionId) {
        await supabase.from('dara_messages').insert({
          session_id: currentSessionId,
          user_id: user.id,
          role: 'assistant',
          content: response
        });
      }
    } catch (error) {
      console.error('DARA AI Error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I encountered an error. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={onClose}>
        <motion.div 
          className={styles.modal} 
          onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <div className={styles.aiIcon}>
                <GraduationCap size={20} />
              </div>
              <div>
                <h3>DARA AI Tutor</h3>
                <span className={styles.status}>Online • Ready to teach</span>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className={styles.messagesArea}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.messageWrapper} ${m.role === 'user' ? styles.userWrapper : styles.aiWrapper}`}>
                {m.role === 'ai' && (
                  <div className={styles.aiAvatar}>
                    <Bot size={14} />
                  </div>
                )}
                <div className={styles.message}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className={styles.aiWrapper}>
                <div className={styles.aiAvatar}>
                  <Bot size={14} />
                </div>
                <div className={`${styles.message} ${styles.loading}`}>
                  <Loader2 size={16} className={styles.spinner} />
                  <span>DARA is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputArea}>
            <div className={styles.suggestions}>
              <button onClick={() => handleSend("Help me create a study plan")}>📅 Study Plan</button>
              <button onClick={() => handleSend("Explain a complex concept to me")}>💡 Explain Concept</button>
              <button onClick={() => handleSend("Quiz me on my current subject")}>📝 Quick Quiz</button>
              <button onClick={() => handleSend("Find resources for my research")}>🔍 Find Resources</button>
            </div>
            <div className={styles.inputWrapper}>
              <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask your AI Tutor anything..."
                disabled={loading}
              />
              <button 
                className={styles.sendBtn} 
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
              >
                {loading ? <Loader2 size={18} className={styles.spinner} /> : <Send size={18} />}
              </button>
            </div>
            <p className={styles.footer}>
              Your Academic Partner • Powered by DARE Digital Library
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DaraChatModal;
