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
  CheckCircle,
  Lightbulb,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { geminiService } from '../../services/geminiService';
import { exportToPDF, shareContent } from '../../lib/exportUtils';
import Markdown from 'react-markdown';
import styles from './HBCRemedialAssistant.module.css';

export default function HBCRemedialAssistant({ initialData = null }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentActivities, setCurrentActivities] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (initialData && messages.length === 0) {
      const welcomeMessage = `Hello! I'm DARA, your HBC Inclusivity Specialist. 
      
Every student learns differently. I see you're teaching **${initialData.subject}** on **${initialData.topic}**. 

I can help you create:
1. **Remedial Activities** (For students who need extra support)
2. **Extension Tasks** (For fast learners who need a challenge)
3. **Differentiated Worksheets** (One topic, multiple levels)
4. **Inclusive Teaching Strategies** (Adapting your lesson for all)

Which group of students shall we support today?`;
      
      setMessages([{ role: 'ai', text: welcomeMessage }]);
    } else if (messages.length === 0) {
      setMessages([{ 
        role: 'ai', 
        text: "Hello! I'm DARA, your HBC Inclusivity Specialist. I help teachers ensure that no student is left behind. What topic are we differentiating today?" 
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
      
      const systemInstruction = `You are DARA, Zimbabwe's Heritage-Based Curriculum (HBC) Inclusivity Specialist.
      Your goal is to help teachers differentiate their instruction to meet the needs of all learners.
      
      DIFFERENTIATION PRINCIPLES:
      - Remediation: Simplifying concepts without losing the core HBC alignment. Using more visual and hands-on aids.
      - Extension: Adding complexity, research tasks, and leadership roles for fast learners.
      - Inclusivity: Considering students with physical, visual, or hearing impairments.
      - Heritage-Based: Using local examples that are familiar to all students.
      
      OUTPUT STRUCTURE:
      - Target Group (e.g., Remedial, Extension, Inclusive)
      - Activity Description
      - Step-by-Step Guide
      - Expected Outcome
      - Teacher's Note (Pedagogical advice)
      
      Always be supportive and provide practical, low-resource solutions.`;

      const response = await geminiService.chat(text.trim(), history, {
        temperature: 0.7,
        systemInstruction: systemInstruction
      });
      
      const aiMessage = { role: 'ai', text: response };
      setMessages(prev => [...prev, aiMessage]);
      
      if (response.includes('# REMEDIAL ACTIVITY') || response.includes('# EXTENSION TASK') || response.includes('## Differentiated Plan')) {
        setCurrentActivities(response);
      }
    } catch (error) {
      console.error("HBC Remedial Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyActivities = () => {
    if (!currentActivities) return;
    navigator.clipboard.writeText(currentActivities);
    alert('Activities copied to clipboard!');
  };

  const downloadPDF = () => {
    if (!currentActivities) return;
    exportToPDF(currentActivities, 'HBC_Remedial_Extension_Activities');
  };

  const shareActivities = () => {
    if (!currentActivities) return;
    shareContent('HBC Differentiated Activities', currentActivities);
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
                {msg.role === 'user' ? <User size={18} /> : <Zap size={18} className="text-yellow-500" />}
              </div>
              <div className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}>
                <Markdown>{msg.text}</Markdown>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.messageWrapper} ${styles.aiWrapper}`}>
              <div className={styles.avatar}>
                <Zap size={18} className="animate-pulse text-yellow-500" />
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
              placeholder="Ask DARA for remedial or extension ideas..."
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
            <ShieldAlert size={16} /> Current Activities
          </h3>
          {currentActivities ? (
            <div className={styles.planPreview}>
              <div className={styles.planBadge}>INCLUSIVE HBC</div>
              <p className={styles.planText}>Your differentiated activities are ready.</p>
              <div className={styles.planActions}>
                <button className={styles.actionBtn} onClick={copyActivities}>
                  <Copy size={14} /> Copy
                </button>
                <button className={styles.actionBtn} onClick={downloadPDF}>
                  <Download size={14} /> PDF
                </button>
                <button className={styles.actionBtn} onClick={shareActivities}>
                  <Share2 size={14} /> Share
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.noPlan}>
              <p>No activities generated yet. Chat with DARA to differentiate your lesson!</p>
            </div>
          )}
        </div>

        <div className={styles.sidebarSection}>
          <h3 className={styles.sidebarTitle}>
            <Sparkles size={16} /> Inclusivity Tools
          </h3>
          <div className={styles.quickActions}>
            <button 
              className={styles.quickAction}
              onClick={() => handleSend("Generate 3 remedial activities for students struggling with this concept.")}
              disabled={isLoading}
            >
              <Wand2 size={14} /> Remedial Activities
            </button>
            <button 
              className={styles.quickAction}
              onClick={() => handleSend("Create an advanced extension task for fast learners.")}
              disabled={isLoading}
            >
              <Zap size={14} /> Extension Task
            </button>
            <button 
              className={styles.quickAction}
              onClick={() => handleSend("How can I adapt this lesson for a student with visual impairment?")}
              disabled={isLoading}
            >
              <CheckCircle size={14} /> Inclusive Adaptation
            </button>
            <button 
              className={styles.quickAction}
              onClick={() => handleSend("Design a peer-teaching activity where fast learners help others.")}
              disabled={isLoading}
            >
              <FileText size={14} /> Peer-Teaching
            </button>
          </div>
        </div>

        <div className={styles.hbcTips}>
          <h4>Inclusivity Pro Tip</h4>
          <p>Differentiation isn't about giving more work to fast learners, but giving them *different* work that challenges their thinking.</p>
        </div>
      </div>
    </div>
  );
}
