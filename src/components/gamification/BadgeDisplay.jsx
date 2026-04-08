import React from 'react';
import { useGamification } from '../../context/GamificationContext';
import styles from './BadgeDisplay.module.css';
import { Award } from 'lucide-react';

const ALL_BADGES = [
  { id: 'first_search', name: 'First Search', icon: '🔍', description: 'Performed your first search' },
  { id: 'reader', name: 'Bookworm', icon: '📚', description: 'Read 5 books' },
  { id: 'researcher', name: 'Researcher', icon: '🔬', description: 'Completed a research project' },
];

export default function BadgeDisplay() {
  const { badges } = useGamification();

  return (
    <div className={styles.badgeContainer}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#C8861A]">
          <Award className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-serif text-[#3D3028]">Your Badges</h2>
      </div>
      <div className={styles.badgeGrid}>
        {ALL_BADGES.map(badge => (
          <div 
            key={badge.id} 
            className={`${styles.badge} ${badges.includes(badge.id) ? styles.unlocked : styles.locked}`}
            title={badge.description}
          >
            <span className={styles.icon}>{badge.icon}</span>
            <span className={styles.name}>{badge.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
