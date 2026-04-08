import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Star, X } from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';
import styles from './LevelUpModal.module.css';

export default function LevelUpModal() {
  const { level, levelUpNotification, clearLevelUpNotification } = useGamification();

  if (!levelUpNotification) return null;

  return (
    <AnimatePresence>
      <div className={styles.overlay}>
        <motion.div 
          initial={{ scale: 0.5, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 100 }}
          className={styles.modal}
        >
          <button onClick={clearLevelUpNotification} className={styles.closeBtn}>
            <X size={24} />
          </button>
          
          <div className={styles.content}>
            <div className={styles.iconWrapper}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className={styles.glow}
              />
              <Trophy size={64} className={styles.trophyIcon} />
              <div className={styles.stars}>
                <Star size={20} className={styles.star1} />
                <Star size={24} className={styles.star2} />
                <Star size={20} className={styles.star3} />
              </div>
            </div>

            <h2 className={styles.title}>LEVEL UP!</h2>
            <div className={styles.levelBadge}>
              <span className={styles.levelNumber}>{level}</span>
            </div>
            
            <p className={styles.subtitle}>You have reached the rank of</p>
            <h3 className={styles.rankTitle}>{levelUpNotification}</h3>
            
            <div className={styles.rewards}>
              <div className={styles.rewardItem}>
                <Sparkles size={16} />
                <span>New AI Tutor Capabilities Unlocked</span>
              </div>
              <div className={styles.rewardItem}>
                <Star size={16} />
                <span>+500 Bonus XP</span>
              </div>
            </div>

            <button onClick={clearLevelUpNotification} className={styles.continueBtn}>
              Continue Learning
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
