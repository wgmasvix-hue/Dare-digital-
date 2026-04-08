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
  Heart as HeartIcon,
  Wand2,
  CheckCircle,
  Lightbulb,
  ShieldCheck,
  Users
} from 'lucide-react';
import { geminiService } from '../../services/geminiService';
import { exportToPDF, shareContent } from '../../lib/exportUtils';
import Markdown from 'react-markdown';
import styles from './UnhuRubricAssistant.module.css';

export default function UnhuRubricAssistant({ initialData = null }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentRubric, setCurrentRubric] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (initialData && messages.length === 0) {
      const welcomeMessage = `Salibonani! I'm DARA, your Unhu/Ubuntu Character Specialist. 
      
In the Heritage-Based Curriculum, character is just as important as grades. I see you're working with **${initialData.level}** students. 

I can help you design:
1. **Character Assessment Rubrics** (Measuring respect, integrity, community)
2. **Unhu Reflection Activities** (For students to self-evaluate)
3. **Values Integration Guides** (How to teach values through your subject)
4. **Community Service Projects** (Practical Unhu in action)

Which area of character development should we focus on?`;
      
      setMessages([{ role: 'ai', text: welcomeMessage }]);
    } else if (messages.length === 0) {
      setMessages([{ 
        role: 'ai', 
        text: "Salibonani! I'm DARA, your Unhu/Ubuntu Character Specialist. I help teachers build 'The Heart' of the student. How can we integrate Zimbabwean values into your classroom today?" 
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
      
      const systemInstruction = `You are DARA, Zimbabwe's Heritage-Based Curriculum (HBC) Unhu/Ubuntu Character Specialist.
      Your goal is to help teachers assess and develop the affective domain (values, ethics, character).
      
      UNHU/UBUNTU CORE VALUES:
      - Respect (Kuremekedza/Inhlonipho)
      - Integrity (Kuvimbika/Ukwethemba)
      - Community/Solidarity (Mushandirapamwe/Ukuncedisana)
      - Responsibility (Mutoro/Umthwalo)
      - Patriotism (Kuda nyika/Ukuthanda ilizwe)
      
      RUBRIC STRUCTURE:
      - Criteria (The specific value being measured)
      - Performance Levels (e.g., Emerging, Developing, Proficient, Exemplary)
      - Observable Indicators (What does this value look like in action?)
      
      Always use Zimbabwean cultural context and proverbs (Tsumo/Izaga) where appropriate.`;

      const response = await geminiService.chat(text.trim(), history, {
        temperature: 0.7,
        systemInstruction: systemInstruction
      });
      
      const aiMessage = { role: 'ai', text: response };
      setMessages(prev => [...prev, aiMessage]);
      
      if (response.includes('# UNHU/UBUNTU RUBRIC') || response.includes('## Assessment Criteria') || response.includes('REFLECTION ACTIVITY')) {
        setCurrentRubric(response);
      }
    } catch (error) {
      console.error("Unhu Rubric Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyRubric = () => {
    if (!currentRubric) return;
    navigator.clipboard.writeText(currentRubric);
    alert('Rubric copied to clipboard!');
  };

  const downloadPDF = () => {
    if (!currentRubric) return;
    exportToPDF(currentRubric, 'Unhu_Ubuntu_Rubric');
  };

  const shareRubric = () => {
    if (!currentRubric) return;
    shareContent('Unhu/Ubuntu Character Rubric', currentRubric);
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
                {msg.role === 'user' ? <User size={18} /> : <HeartIcon size={18} className="text-red-500" />}
              </div>
              <div className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}>
                <Markdown>{msg.text}</Markdown>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.messageWrapper} ${styles.aiWrapper}`}>
              <div className={styles.avatar}>
                <HeartIcon size={18} className="animate-pulse text-red-500" />
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
              placeholder="Ask DARA to help with character assessment..."
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
            <ShieldCheck size={16} /> Current Rubric
          </h3>
          {currentRubric ? (
            <div className={styles.planPreview}>
              <div className={styles.planBadge}>UNHU ALIGNED</div>
              <p className={styles.planText}>Your character assessment rubric is ready.</p>
              <div className={styles.planActions}>
                <button className={styles.actionBtn} onClick={copyRubric}>
                  <Copy size={14} /> Copy
                </button>
                <button className={styles.actionBtn} onClick={downloadPDF}>
                  <Download size={14} /> PDF
                </button>
                <button className={styles.actionBtn} onClick={shareRubric}>
                  <Share2 size={14} /> Share
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.noPlan}>
              <p>No rubric generated yet. Chat with DARA to create one!</p>
            </div>
          )}
        </div>

        <div className={styles.sidebarSection}>
          <h3 className={styles.sidebarTitle}>
            <Users size={16} /> Character Tools
          </h3>
          <div className={styles.quickActions}>
            <button 
              className={styles.quickAction}
              onClick={() => handleSend("Create a rubric for assessing 'Mushandirapamwe' (Community Solidarity) during a group project.")}
              disabled={isLoading}
            >
              <Wand2 size={14} /> Group Work Rubric
            </button>
            <button 
              className={styles.quickAction}
              onClick={() => handleSend("Design a self-reflection activity for students to evaluate their own 'Integrity'.")}
              disabled={isLoading}
            >
              <CheckCircle size={14} /> Self-Reflection
            </button>
            <button 
              className={styles.quickAction}
              onClick={() => handleSend("How can I teach 'Respect' through my subject?")}
              disabled={isLoading}
            >
              <Sparkles size={14} /> Values Integration
            </button>
            <button 
              className={styles.quickAction}
              onClick={() => handleSend("Suggest a community service project that builds 'Responsibility'.")}
              disabled={isLoading}
            >
              <HeartIcon size={14} /> Service Project
            </button>
          </div>
        </div>

        <div className={styles.hbcTips}>
          <h4>Unhu/Ubuntu Pro Tip</h4>
          <p>"Munhu munhu nekuda kwevanhu." A person is a person through other people. Character is built in community.</p>
        </div>
      </div>
    </div>
  );
}
