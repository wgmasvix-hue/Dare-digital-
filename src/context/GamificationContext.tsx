import React, { createContext, useContext, useState } from 'react';

export const XP_REWARDS = {
  READ_PAGE: 5,
  COMPLETE_CHAPTER: 50,
  QUIZ_PERFECT: 100,
  COMPLETE_QUIZ: 50,
  DAILY_STREAK: 25,
  AI_INTERACTION: 10,
  ANSWER_QUESTION: 15,
  READ_SUMMARY: 10,
  BOOK_COMPLETED: 500,
};

interface LevelInfo {
  current: { title: string };
  next: { title: string; xpRequired: number };
  progress: number;
}

interface GamificationContextType {
  xp: number;
  streak: number;
  level: number;
  bookProgress: Record<string, number>;
  badges: string[];
  levelUpNotification: string | null;
  getLevelInfo: () => LevelInfo;
  addXP: (amount: number) => void;
  gainXp: (amount: number) => void;
  clearLevelUpNotification: () => void;
  incrementStreak: () => void;
  updateBookProgress: (bookId: string, progress: number) => void;
  unlockBadge: (badgeId: string) => void;
}

export const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [xp, setXP] = useState(() => {
    try {
      const saved = localStorage.getItem('xp');
      return saved ? parseInt(saved, 10) : 1250;
    } catch {
      return 1250;
    }
  });

  const [streak, setStreak] = useState(() => {
    try {
      const saved = localStorage.getItem('streak');
      return saved ? parseInt(saved, 10) : 5;
    } catch {
      return 5;
    }
  });

  const [level, setLevel] = useState(() => {
    try {
      const saved = localStorage.getItem('level');
      return saved ? parseInt(saved, 10) : 4;
    } catch {
      return 4;
    }
  });

  const [badges, setBadges] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('badges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bookProgress, setBookProgress] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('bookProgress');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error("Failed to parse bookProgress from localStorage", error);
      return {};
    }
  });

  const getLevelInfo = (): LevelInfo => {
    const titles = [
      'Novice', 'Apprentice', 'Student', 'Scholar', 'Sage', 
      'Master', 'Grandmaster', 'Legend', 'Knowledge Deity'
    ];
    const currentTitle = titles[Math.min(level - 1, titles.length - 1)];
    const nextTitle = titles[Math.min(level, titles.length - 1)];
    const xpInCurrentLevel = xp % 1000;
    
    return {
      current: { title: currentTitle },
      next: { title: nextTitle, xpRequired: 1000 },
      progress: (xpInCurrentLevel / 1000) * 100,
    };
  };

  const [levelUpNotification, setLevelUpNotification] = useState<string | null>(null);

  const addXP = (amount: number) => {
    setXP((prev) => {
      const newXp = prev + amount;
      localStorage.setItem('xp', newXp.toString());
      
      // Level up logic
      const newLevel = Math.floor(newXp / 1000) + 1;
      if (newLevel > level) {
        const titles = [
          'Novice', 'Apprentice', 'Student', 'Scholar', 'Sage', 
          'Master', 'Grandmaster', 'Legend', 'Knowledge Deity'
        ];
        const newTitle = titles[Math.min(newLevel - 1, titles.length - 1)];
        setLevelUpNotification(newTitle);
        setLevel(newLevel);
        localStorage.setItem('level', newLevel.toString());
      }
      
      return newXp;
    });
  };

  const gainXp = (amount: number) => {
    addXP(amount);
  };

  const clearLevelUpNotification = () => setLevelUpNotification(null);

  const incrementStreak = () => {
    setStreak((prev) => {
      const newStreak = prev + 1;
      localStorage.setItem('streak', newStreak.toString());
      return newStreak;
    });
  };

  const updateBookProgress = (bookId: string, progress: number) => {
    setBookProgress(prev => {
      const newProgress = { ...prev, [bookId]: progress };
      localStorage.setItem('bookProgress', JSON.stringify(newProgress));
      
      // Award XP for reaching 100%
      if (progress === 100 && prev[bookId] < 100) {
        addXP(XP_REWARDS.BOOK_COMPLETED);
      }
      
      return newProgress;
    });
  };

  const unlockBadge = (badgeId: string) => {
    setBadges(prev => {
      if (prev.includes(badgeId)) return prev;
      const newBadges = [...prev, badgeId];
      localStorage.setItem('badges', JSON.stringify(newBadges));
      return newBadges;
    });
  };

  return (
    <GamificationContext.Provider value={{ 
      xp, 
      streak, 
      level, 
      bookProgress, 
      badges,
      levelUpNotification,
      getLevelInfo, 
      addXP, 
      gainXp, 
      clearLevelUpNotification,
      incrementStreak, 
      updateBookProgress,
      unlockBadge
    }}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};
