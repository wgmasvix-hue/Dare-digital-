import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, Loader2, Sparkles, MessageSquare, ChevronDown, Maximize2, Minimize2, GraduationCap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../hooks/useAuth';
import { daraService } from '../../services/daraService';
import styles from './FloatingDara.module.css';

const FloatingDara = () => {
  const { user, profile, institution } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Mhoro! 👋 I'm DARA, your personal AI Tutor. I'm here to help you master your subjects using all the resources in the Dare Digital Library. \n\nWhat are we learning today? I can help you explain a complex concept, create a study plan, or test your knowledge with a quick quiz." }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [memoryState, setMemoryState] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const QUICK_ACTIONS = [
    { label: 'Summarize current page', icon: Sparkles, prompt: "Can you summarize the main points of what I'm currently looking at?" },
    { label: 'Create Study Plan', icon: MessageSquare, prompt: "I need help creating a study plan for my current modules. Can you help me structure my week?" },
    { label: 'Explain concept', icon: Bot, prompt: "Can you explain a complex academic concept to me in simple terms?" },
    { label: 'Quick Quiz', icon: GraduationCap, prompt: "Can you give me a quick quiz on a topic of your choice to test my knowledge?" },
  ];

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsThinking(true);

    try {
      const response = await daraService.sendMessage({
        message: userMessage,
        sessionId: sessionId,
        userId: user?.id || 'guest',
        institutionId: institution?.id,
        programmeCode: profile?.programme,
        faculty: profile?.faculty,
        history: messages.map(m => ({
          role: m.role === 'assistant' ? 'ai' : 'user',
          text: m.content
        }))
      });

      if (response.session_id) setSessionId(response.session_id);
      if (response.memory_state) setMemoryState(response.memory_state);
      setMessages(prev => [...prev, { role: 'assistant', content: response.message }]);
    } catch (error) {
      console.error('DARA Chat Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again later." }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleQuickAction = (prompt) => {
    setInput(prompt);
    // Use setTimeout to ensure state is updated before sending
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} };
      handleSend(fakeEvent);
    }, 0);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? '60px' : '500px',
              width: '380px'
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={styles.chatWindow}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerInfo}>
                <div className={styles.botIcon}>
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className={styles.title}>DARA AI Tutor</h3>
                  <div className={styles.headerSub}>
                    <span className={styles.status}>Online • Academic Partner</span>
                    {memoryState?.is_returning_user && (
                      <span className={styles.memoryBadge} title={`DARA remembers you from ${memoryState.sessions_count} previous sessions`}>
                        <Sparkles size={10} />
                        Personalized
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.headerActions}>
                <button onClick={() => setIsMinimized(!isMinimized)} className={styles.actionBtn}>
                  {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                </button>
                <button onClick={toggleChat} className={styles.actionBtn}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className={styles.messagesContainer}>
                  {messages.map((msg, i) => (
                    <div key={i} className={`${styles.messageWrapper} ${styles[msg.role]}`}>
                      <div className={styles.messageBubble}>
                        {msg.role === 'assistant' ? (
                          <div className="markdown-body">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>
                  ))}
                  {isThinking && (
                    <div className={`${styles.messageWrapper} ${styles.assistant}`}>
                      <div className={`${styles.messageBubble} ${styles.thinking}`}>
                        <Loader2 size={16} className={styles.spin} />
                        <span>DARA is thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Quick Actions */}
                {!isThinking && messages.length < 3 && (
                  <div className={styles.quickActions}>
                    {QUICK_ACTIONS.map((action, idx) => (
                      <button 
                        key={idx} 
                        className={styles.quickActionBtn}
                        onClick={() => handleQuickAction(action.prompt)}
                      >
                        <action.icon size={14} />
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Input Area */}
                <form className={styles.inputArea} onSubmit={handleSend}>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ask your AI Tutor anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className={styles.input}
                  />
                  <button type="submit" disabled={!input.trim() || isThinking} className={styles.sendBtn}>
                    <Send size={18} />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        className={`${styles.floatingBtn} ${isOpen ? styles.hidden : ''}`}
      >
        <div className={styles.btnIcon}>
          <Bot size={28} />
          <div className={styles.notificationDot} />
        </div>
        <span className={styles.btnLabel}>DARA AI Tutor</span>
      </motion.button>
    </div>
  );
};

export default FloatingDara;
