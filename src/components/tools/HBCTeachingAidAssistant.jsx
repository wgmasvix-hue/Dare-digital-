import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles, 
  Download, 
  Share2, 
  Copy, 
  FileText,
  Wand2,
  History,
  CheckCircle,
  Lightbulb,
  Hammer,
  Palette
} from 'lucide-react';
import { geminiService } from '../../services/geminiService';
import { exportToPDF, shareContent } from '../../lib/exportUtils';
import Markdown from 'react-markdown';
import styles from './HBCTeachingAidAssistant.module.css';

export default function HBCTeachingAidAssistant({ initialData = null }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentGuide, setCurrentGuide] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (initialData && messages.length === 0) {
      const welcomeMessage = `Hello! I'm DARA, your HBC Teaching Aid Guide. I see you're looking for teaching aids for **${initialData.subject}** on the topic of **${initialData.topic}**.

I can help you design low-cost, high-impact teaching aids using locally available Zimbabwean materials. Should we start with a list of required materials or a step-by-step construction guide?`;
      
      setMessages([{ role: 'ai', text: welcomeMessage }]);
    } else if (messages.length === 0) {
      setMessages([{ 
        role: 'ai', 
        text: "Hello! I'm DARA, your HBC Teaching Aid Guide. I specialize in helping teachers create innovative teaching aids using local resources, aligned with Zimbabwe's Heritage-Based Curriculum. What are we building today?" 
      }]);
    }
  }, [initialData]);

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
      const history = messages.map(m => ({ 
        role: m.role === 'user' ? 'user' : 'ai', 
        text: m.text 
      }));
      
      const systemInstruction = `You are DARA, Zimbabwe's Heritage-Based Curriculum (HBC) aligned Teaching Aid Specialist. 
      Your goal is to help teachers design and construct effective teaching aids using locally available, low-cost or no-cost materials.
      
      CORE HBC PRINCIPLES FOR TEACHING AIDS:
      - Resourcefulness: Use local environment (clay, wood, recycled materials, seeds, etc.)
      - Innovation: Create aids that solve specific learning challenges.
      - Unhu/Ubuntu: Ensure aids are culturally appropriate and inclusive.
      - Production: The process of making the aid should ideally involve students as a practical task.
      
      STRUCTURE FOR A TEACHING AID GUIDE:
      1. Name of Teaching Aid
      2. Learning Objective (How it helps)
      3. Materials Needed (Focus on local/recycled)
      4. Step-by-Step Construction Guide
      5. How to Use in Class (Pedagogy)
      6. Student Involvement Task
      
      Always be creative and practical. Use Zimbabwean context.`;

      const response = await geminiService.chat(text.trim(), history, {
        temperature: 0.8,
        systemInstruction: systemInstruction
      });
      
      const aiMessage = { role: 'ai', text: response };
      setMessages(prev => [...prev, aiMessage]);
      
      if (response.includes('# TEACHING AID GUIDE') || response.includes('## 1. Name of Teaching Aid')) {
        setCurrentGuide(response);
      }
    } catch (error) {
      console.error("HBC Teaching Aid Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyGuide = () => {
    if (!currentGuide) return;
    navigator.clipboard.writeText(currentGuide);
    alert('Guide copied to clipboard!');
  };

  const downloadPDF = () => {
    if (!currentGuide) return;
    exportToPDF(currentGuide, 'HBC_Teaching_Aid_Guide');
  };

  const shareGuide = () => {
    if (!currentGuide) return;
    shareContent('HBC Teaching Aid Guide', currentGuide);
  };

  return (
    <div className={styles.container}>
      <div className={styles.chatArea}>
        <div className={styles.messages}>
          {messages.map((msg, idx) => (
            <div 
              key={idx}
              className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.userWrapper : styles.aiWrapper}`}
            >
              <div className={styles.avatar}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}>
                <Markdown>{msg.text}</Markdown>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.messageWrapper} ${styles.aiWrapper}`}>
              <div className={styles.avatar}>
                <Bot size={18} />
              </div>
              <div className={`${styles.message} ${styles.aiMessage}`}>
                <Loader2 size={18} className={styles.spin} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputArea}>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className={styles.inputForm}
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the teaching aid you need..."
              className={styles.input}
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className={styles.sendBtn}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      <div className={styles.sidebar}>
        <div className={styles.sidebarSection}>
          <h3 className={styles.sidebarTitle}>
            <Hammer size={16} /> Current Guide
          </h3>
          {currentGuide ? (
            <div className={styles.planPreview}>
              <div className={styles.planBadge}>LOCAL RESOURCE</div>
              <p className={styles.planText}>Your construction guide is ready.</p>
              <div className={styles.planActions}>
                <button className={styles.actionBtn} onClick={copyGuide}>
                  <Copy size={14} /> Copy
                </button>
                <button className={styles.actionBtn} onClick={downloadPDF}>
                  <Download size={14} /> PDF
                </button>
                <button className={styles.actionBtn} onClick={shareGuide}>
                  <Share2 size={14} /> Share
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.noPlan}>
              <p>No guide generated yet. Ask DARA for a teaching aid design!</p>
            </div>
          )}
        </div>

        <div className={styles.sidebarSection}>
          <h3 className={styles.sidebarTitle}>
            <Palette size={16} /> Creative Prompts
          </h3>
          <div className={styles.quickActions}>
            <button 
              className={styles.quickAction}
              onClick={() => handleSend("Suggest 3 low-cost teaching aids for this topic.")}
              disabled={isLoading}
            >
              <Wand2 size={14} /> Suggest 3 Aids
            </button>
            <button 
              className={styles.quickAction}
              onClick={() => handleSend("How can I use recycled plastic for this aid?")}
              disabled={isLoading}
            >
              <CheckCircle size={14} /> Use Recycled Plastic
            </button>
            <button 
              className={styles.quickAction}
              onClick={() => handleSend("Create a step-by-step construction guide.")}
              disabled={isLoading}
            >
              <Hammer size={14} /> Construction Guide
            </button>
            <button 
              className={styles.quickAction}
              onClick={() => handleSend("What local Zimbabwean plants/seeds can be used?")}
              disabled={isLoading}
            >
              <History size={14} /> Local Materials
            </button>
          </div>
        </div>

        <div className={styles.hbcTips}>
          <h4>Innovation Tip</h4>
          <p>The best teaching aids are those that students help build. It teaches them production skills alongside the theory.</p>
        </div>
      </div>
    </div>
  );
}
