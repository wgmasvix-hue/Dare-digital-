import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, X, Sparkles, ListChecks, AlertTriangle, ShieldAlert, ArrowRightCircle, HelpCircle, BrainCircuit } from 'lucide-react';
import Markdown from 'react-markdown';
import { geminiService } from '../services/geminiService';
import styles from './TrainerAI.module.css';

export default function TrainerAI({ trade, skill, context, level }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuery = async (action, customQuery = null) => {
    try {
      setIsLoading(true);
      setIsOpen(true);
      const result = await geminiService.vocationalAssist({
        action,
        trade: trade || 'General Vocational',
        skill: skill || 'Technical Skills',
        context: customQuery || context || 'General workshop environment'
      });
      setMessage(result);
    } catch (err) {
      console.error('Trainer AI failed:', err);
      setMessage("I'm sorry, I couldn't process that request right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button 
        className={styles.floatingBtn}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Users size={24} />
        <span className={styles.btnLabel}>Trainer AI</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={styles.panel}
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
          >
            <div className={styles.header}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className={styles.avatar}>
                  <Users size={20} />
                </div>
                <div>
                  <h4 className={styles.name}>Workshop Assistant</h4>
                  <span className={styles.status}>Online & Ready</span>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.content}>
              {message ? (
                <div className={styles.message}>
                  <Markdown>{message}</Markdown>
                </div>
              ) : (
                <div className={styles.welcome}>
                  <p>Hello! I'm your **Trainer AI**. I can help you with steps, safety, or fixing mistakes in real-time.</p>
                  <p>What do you need help with right now?</p>
                </div>
              )}
              {isLoading && (
                <div className={styles.loading}>
                  <div className={styles.loadingDots}>
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.footer}>
              <div className={styles.actionGrid}>
                <button onClick={() => handleQuery('steps')}>Show Steps</button>
                <button onClick={() => handleQuery('safety_tips')}>Safety Tips</button>
                <button onClick={() => handleQuery('fix_mistake')}>Fix Mistake</button>
                <button onClick={() => handleQuery('quiz')}>Quick Quiz</button>
              </div>
              {skill && (
                <div className={styles.contextBadge}>
                  Context: {skill} {level ? `(${level})` : ''}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
