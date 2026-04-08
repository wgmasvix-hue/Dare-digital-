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
  ClipboardCheck,
  BrainCircuit
} from 'lucide-react';
import { geminiService } from '../../services/geminiService';
import { exportToPDF, shareContent } from '../../lib/exportUtils';
import Markdown from 'react-markdown';
import styles from './HBCAssessmentAssistant.module.css';

export default function HBCAssessmentAssistant({ initialData = null }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (initialData && messages.length === 0) {
      const welcomeMessage = `Hello! I'm DARA, your HBC Assessment Specialist. I see you're working on **${initialData.subject}** for **${initialData.level}** level on the topic of **${initialData.topic}**.
      
I can help you create:
1. **Interactive Quizzes** (Multiple Choice & Short Answer)
2. **Structured Exam Questions** (ZIMSEC Style)
3. **Practical Production Tasks** (Innovation focused)
4. **Unhu/Ubuntu Reflection Rubrics**

What type of assessment should we build first?`;
      
      setMessages([{ role: 'ai', text: welcomeMessage }]);
    } else if (messages.length === 0) {
      setMessages([{ 
        role: 'ai', 
        text: "Hello! I'm DARA, your HBC Assessment Specialist. I help teachers create meaningful evaluations that measure not just facts, but skills, values (Unhu), and innovation. What are we assessing today?" 
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
      
      const systemInstruction = `You are DARA, Zimbabwe's Heritage-Based Curriculum (HBC) Assessment Specialist.
      Your goal is to help teachers create assessments that align with the 5.0 model.
      
      ASSESSMENT PRINCIPLES:
      - Cognitive Skills (Knowledge, application, analysis)
      - Psychomotor Skills (Practical production, innovation, hands-on tasks)
      - Affective Domain (Unhu/Ubuntu, values, ethics, character)
      - Heritage Connection (Using local context in questions)
      
      STRUCTURE FOR ASSESSMENTS:
      - Clear Instructions
      - Section A: Knowledge & Understanding
      - Section B: Application & Problem Solving (Heritage-based scenarios)
      - Section C: Production/Practical Task (Innovation focus)
      - Marking Scheme / Rubric (Essential for HBC)
      
      Always use Zimbabwean names, places, and scenarios in your questions.`;

      const response = await geminiService.chat(text.trim(), history, {
        temperature: 0.7,
        systemInstruction: systemInstruction
      });
      
      const aiMessage = { role: 'ai', text: response };
      setMessages(prev => [...prev, aiMessage]);
      
      if (response.includes('# HBC ASSESSMENT') || response.includes('## Section A') || response.includes('MARKING SCHEME')) {
        setCurrentAssessment(response);
      }
    } catch (error) {
      console.error("HBC Assessment Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyAssessment = () => {
    if (!currentAssessment) return;
    navigator.clipboard.writeText(currentAssessment);
    alert('Assessment copied to clipboard!');
  };

  const downloadPDF = () => {
    if (!currentAssessment) return;
    exportToPDF(currentAssessment, 'HBC_Assessment');
  };

  const shareAssessment = () => {
    if (!currentAssessment) return;
    shareContent('HBC Assessment', currentAssessment);
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
              placeholder="Ask DARA to generate a quiz or practical task..."
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
            <ClipboardCheck size={16} /> Current Assessment
          </h3>
          {currentAssessment ? (
            <div className={styles.planPreview}>
              <div className={styles.planBadge}>HBC VALIDATED</div>
              <p className={styles.planText}>Your assessment and marking scheme are ready.</p>
              <div className={styles.planActions}>
                <button className={styles.actionBtn} onClick={copyAssessment}>
                  <Copy size={14} /> Copy
                </button>
                <button className={styles.actionBtn} onClick={downloadPDF}>
                  <Download size={14} /> PDF
                </button>
                <button className={styles.actionBtn} onClick={shareAssessment}>
                  <Share2 size={14} /> Share
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.noPlan}>
              <p>No assessment generated yet. Chat with DARA to create one!</p>
            </div>
          )}
        </div>

        <div className={styles.sidebarSection}>
          <h3 className={styles.sidebarTitle}>
            <BrainCircuit size={16} /> Assessment Tools
          </h3>
          <div className={styles.quickActions}>
            <button 
              className={styles.quickAction}
              onClick={() => handleSend("Generate a 10-question multiple choice quiz with Zimbabwean context.")}
              disabled={isLoading}
            >
              <Wand2 size={14} /> 10-Question Quiz
            </button>
            <button 
              className={styles.quickAction}
              onClick={() => handleSend("Create a practical production task that solves a local problem.")}
              disabled={isLoading}
            >
              <CheckCircle size={14} /> Practical Task
            </button>
            <button 
              className={styles.quickAction}
              onClick={() => handleSend("Design an Unhu/Ubuntu reflection rubric for this topic.")}
              disabled={isLoading}
            >
              <Sparkles size={14} /> Unhu Rubric
            </button>
            <button 
              className={styles.quickAction}
              onClick={() => handleSend("Generate ZIMSEC style structured questions with a marking scheme.")}
              disabled={isLoading}
            >
              <FileText size={14} /> ZIMSEC Style
            </button>
          </div>
        </div>

        <div className={styles.hbcTips}>
          <h4>DARA Assessment Tip</h4>
          <p>HBC assessments should measure the 'Head, Heart, and Hands'. Don't just test memory; test application and character.</p>
        </div>
      </div>
    </div>
  );
}
