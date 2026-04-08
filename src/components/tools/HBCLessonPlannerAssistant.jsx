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
  Lightbulb
} from 'lucide-react';
import { geminiService } from '../../services/geminiService';
import { exportToPDF, shareContent } from '../../lib/exportUtils';
import Markdown from 'react-markdown';
import styles from './HBCLessonPlannerAssistant.module.css';

export default function HBCLessonPlannerAssistant({ initialData = null }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (initialData && messages.length === 0) {
      const welcomeMessage = `Hello! I'm DARA, your HBC Lesson Planning Assistant. I see you're interested in planning a lesson for **${initialData.subject}** on the topic of **${initialData.topic}** for **${initialData.level}** level.

Would you like me to generate a draft lesson plan aligned with Zimbabwe's Heritage-Based Curriculum (HBC) for you, or should we discuss specific objectives first?`;
      
      setMessages([{ role: 'ai', text: welcomeMessage }]);
    } else if (messages.length === 0) {
      setMessages([{ 
        role: 'ai', 
        text: "Hello! I'm DARA, your HBC Lesson Planning Assistant. I can help you create detailed, interactive lesson plans aligned with Zimbabwe's Heritage-Based Curriculum (HBC). What subject and topic are we working on today?" 
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
      
      // Specialized prompt for lesson planning
      const systemInstruction = `You are DARA, Zimbabwe's Heritage-Based Curriculum (HBC) aligned teacher training AI. 
      Your goal is to help teachers develop high-quality lesson plans.
      
      CORE HBC PRINCIPLES:
      - Unhu/Ubuntu (Ethics, values, and character)
      - Heritage (Local history, culture, and resources)
      - Production/Innovation (Practical application and problem-solving)
      - Technology (Modern tools integrated with local context)
      
      If the user asks for a lesson plan, use the standard HBC structure:
      1. Syllabus Reference
      2. Specific Objectives
      3. Heritage & Unhu/Ubuntu Integration
      4. Prior Knowledge
      5. Media/Resources
      6. Lesson Development (Interactive table)
      7. Assessment & Evaluation
      8. Innovation & Production Task
      
      Always be encouraging and professional. Use Zimbabwean examples.`;

      const response = await geminiService.chat(text.trim(), history, {
        temperature: 0.7,
        systemInstruction: systemInstruction
      });
      
      const aiMessage = { role: 'ai', text: response };
      setMessages(prev => [...prev, aiMessage]);
      
      // Check if the response looks like a full lesson plan to save it
      if (response.includes('# HERITAGE-BASED LESSON PLAN') || response.includes('## 1. Syllabus Reference')) {
        setCurrentPlan(response);
      }
    } catch (error) {
      console.error("HBC Assistant Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I encountered an error while processing your request. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyPlan = () => {
    if (!currentPlan) return;
    navigator.clipboard.writeText(currentPlan);
    alert('Lesson plan copied to clipboard!');
  };

  const downloadPDF = () => {
    if (!currentPlan) return;
    exportToPDF(currentPlan, 'HBC_Lesson_Plan');
  };

  const sharePlan = () => {
    if (!currentPlan) return;
    shareContent('HBC Lesson Plan', currentPlan);
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
              placeholder="Ask DARA to help with your lesson plan..."
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
            <FileText size={16} /> Current Plan
          </h3>
          {currentPlan ? (
            <div className={styles.planPreview}>
              <div className={styles.planBadge}>HBC ALIGNED</div>
              <p className={styles.planText}>Your lesson plan is ready for review.</p>
              <div className={styles.planActions}>
                <button className={styles.actionBtn} onClick={copyPlan}>
                  <Copy size={14} /> Copy
                </button>
                <button className={styles.actionBtn} onClick={downloadPDF}>
                  <Download size={14} /> PDF
                </button>
                <button className={styles.actionBtn} onClick={sharePlan}>
                  <Share2 size={14} /> Share
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.noPlan}>
              <p>No lesson plan generated yet. Chat with DARA to create one!</p>
            </div>
          )}
        </div>

        <div className={styles.sidebarSection}>
          <h3 className={styles.sidebarTitle}>
            <Lightbulb size={16} /> HBC Quick Actions
          </h3>
          <div className={styles.quickActions}>
            <button 
              className={styles.quickAction}
              onClick={() => handleSend("Generate a full HBC lesson plan draft for me.")}
              disabled={isLoading}
            >
              <Wand2 size={14} /> Generate Draft
            </button>
            <button 
              className={styles.quickAction}
              onClick={() => handleSend("How can I integrate Unhu/Ubuntu into this lesson?")}
              disabled={isLoading}
            >
              <CheckCircle size={14} /> Add Unhu/Ubuntu
            </button>
            <button 
              className={styles.quickAction}
              onClick={() => handleSend("Suggest a practical production task for this topic.")}
              disabled={isLoading}
            >
              <Sparkles size={14} /> Suggest Production Task
            </button>
            <button 
              className={styles.quickAction}
              onClick={() => handleSend("What local Zimbabwean resources can I use?")}
              disabled={isLoading}
            >
              <History size={14} /> Local Resources
            </button>
          </div>
        </div>

        <div className={styles.hbcTips}>
          <h4>DARA Pro Tip</h4>
          <p>HBC is about more than just facts. It's about building character (Unhu) and solving local problems through innovation.</p>
        </div>
      </div>
    </div>
  );
}
