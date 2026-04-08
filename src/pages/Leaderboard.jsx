import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Flame, 
  Zap, 
  Users, 
  Globe, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Award,
  Sparkles,
  ChevronRight,
  Search
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGamification } from '../context/GamificationContext';
import { getLeaderboardData, getMotivationalMessage } from '../services/leaderboardService';
import styles from './Leaderboard.module.css';

const TABS = [
  { id: 'weekly', label: 'Weekly', icon: Flame },
  { id: 'all-time', label: 'All Time', icon: Globe },
  { id: 'group', label: 'My Faculty', icon: Users }
];

export default function Leaderboard() {
  const { user, profile } = useAuth();
  const { xp, streak } = useGamification();
  const [activeTab, setActiveTab] = useState('weekly');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Get leaderboard data
  const leaderboardData = useMemo(() => {
    return getLeaderboardData(activeTab, xp, streak, user, profile);
  }, [activeTab, user, profile, xp, streak]);

  // Filter by search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return leaderboardData;
    return leaderboardData.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.faculty.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leaderboardData, searchQuery]);

  // Get current user rank and message
  const currentUserRank = useMemo(() => {
    const found = leaderboardData.find(u => u.isCurrentUser || u.id === user?.id);
    return found ? found.rank : null;
  }, [leaderboardData, user?.id]);

  const motivationalMessage = useMemo(() => {
    if (!currentUserRank) return "Start reading to join the leaderboard! 📚";
    return getMotivationalMessage(currentUserRank, leaderboardData.length);
  }, [currentUserRank, leaderboardData.length]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const topThree = filteredData.slice(0, 3);
  const others = filteredData.slice(3);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF9] gap-4">
        <div className="w-12 h-12 border-4 border-[#E8DFD0] border-t-[#C8861A] rounded-full animate-spin"></div>
        <p className="text-[#8E8271] font-medium animate-pulse">Calculating rankings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 min-h-screen bg-[#FDFCF9]">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-primary p-16 rounded-[3rem] mb-12 text-center shadow-premium"
      >
        {/* Real Book Background Image */}
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=2000" 
            alt="Leaderboard Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/50 to-primary" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 text-accent font-semibold mb-4">
            <Trophy className="w-6 h-6" />
            <span className="text-xs uppercase tracking-[0.2em] font-bold">Global Rankings</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-6 leading-tight">
            Scholar <span className="text-accent italic">Leaderboard</span>
          </h1>
          <p className="text-white/70 max-w-lg mx-auto text-lg font-medium">
            Compete with fellow scholars across Zimbabwe. Earn XP by reading, 
            answering questions, and maintaining your streak.
          </p>
        </div>
      </motion.header>

      {/* Motivational Banner */}
      {currentUserRank && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={styles.motivationalBanner}
        >
          <div className={styles.bannerIcon}>
            <Sparkles className="w-6 h-6" />
          </div>
          <div className={styles.bannerContent}>
            <p className={styles.rankText}>
              You are currently ranked <strong>#{currentUserRank}</strong>
            </p>
            <p className={styles.motivationText}>{motivationalMessage}</p>
          </div>
          <div className={styles.bannerStats}>
            <div className={styles.statItem}>
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{xp} XP</span>
            </div>
            <div className={styles.statItem}>
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{streak} Streak</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className={styles.tabsContainer}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeTab : ''}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.searchWrapper}>
          <Search className="w-4 h-4 text-[#8E8271]" />
          <input 
            type="text" 
            placeholder="Search scholars..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Podium (Top 3) */}
      {!searchQuery && topThree.length > 0 && (
        <div className={styles.podiumContainer}>
          {/* Second Place */}
          {topThree[1] && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`${styles.podiumItem} ${styles.silver}`}
            >
              <div className={styles.avatarWrapper}>
                <img src={topThree[1].avatar || `https://ui-avatars.com/api/?name=${topThree[1].name}`} alt="" />
                <div className={styles.badge}>🥈</div>
              </div>
              <p className={styles.podiumName}>{topThree[1].name}</p>
              <p className={styles.podiumFaculty}>{topThree[1].faculty}</p>
              <p className={styles.podiumScore}>{topThree[1].score.toLocaleString()} XP</p>
              <div className={styles.podiumBase}>2</div>
            </motion.div>
          )}

          {/* First Place */}
          {topThree[0] && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`${styles.podiumItem} ${styles.gold}`}
            >
              <div className={styles.avatarWrapper}>
                <img src={topThree[0].avatar || `https://ui-avatars.com/api/?name=${topThree[0].name}`} alt="" />
                <div className={styles.badge}>🥇</div>
                <div className={styles.crown}>👑</div>
              </div>
              <p className={styles.podiumName}>{topThree[0].name}</p>
              <p className={styles.podiumFaculty}>{topThree[0].faculty}</p>
              <p className={styles.podiumScore}>{topThree[0].score.toLocaleString()} XP</p>
              <div className={styles.podiumBase}>1</div>
            </motion.div>
          )}

          {/* Third Place */}
          {topThree[2] && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`${styles.podiumItem} ${styles.bronze}`}
            >
              <div className={styles.avatarWrapper}>
                <img src={topThree[2].avatar || `https://ui-avatars.com/api/?name=${topThree[2].name}`} alt="" />
                <div className={styles.badge}>🥉</div>
              </div>
              <p className={styles.podiumName}>{topThree[2].name}</p>
              <p className={styles.podiumFaculty}>{topThree[2].faculty}</p>
              <p className={styles.podiumScore}>{topThree[2].score.toLocaleString()} XP</p>
              <div className={styles.podiumBase}>3</div>
            </motion.div>
          )}
        </div>
      )}

      {/* List (Others) */}
      <div className={styles.listContainer}>
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab + searchQuery}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {(searchQuery ? filteredData : others).map((u, index) => (
              <motion.div 
                key={u.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`${styles.listItem} ${u.isCurrentUser ? styles.currentUserItem : ''}`}
              >
                <div className={styles.rankSection}>
                  <span className={styles.rankNumber}>#{u.rank}</span>
                  <div className={styles.movementIcon}>
                    {u.movement === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                    {u.movement === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                    {u.movement === 'stable' && <Minus className="w-3 h-3 text-slate-300" />}
                  </div>
                </div>

                <div className={styles.userSection}>
                  <img 
                    src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}`} 
                    alt="" 
                    className={styles.userAvatar}
                  />
                  <div>
                    <p className={styles.userName}>
                      {u.name}
                      {u.isCurrentUser && <span className={styles.youBadge}>You</span>}
                    </p>
                    <p className={styles.userFaculty}>{u.faculty}</p>
                  </div>
                </div>

                <div className={styles.statsSection}>
                  <div className={styles.streakBadge}>
                    <Flame className="w-3 h-3" />
                    {u.streak}
                  </div>
                  <div className={styles.scoreBadge}>
                    {u.score.toLocaleString()} XP
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#E8DFD0]" />
                </div>
              </motion.div>
            ))}

            {filteredData.length === 0 && (
              <div className="py-20 text-center">
                <Users className="w-12 h-12 text-[#E8DFD0] mx-auto mb-4" />
                <p className="text-[#8E8271]">No scholars found matching your search.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer / Fairness Note */}
      <div className="mt-12 text-center">
        <p className="text-xs text-[#8E8271] uppercase font-bold tracking-widest flex items-center justify-center gap-2">
          <Award className="w-4 h-4" />
          Top 10% of scholars earn the "Elite Researcher" badge
        </p>
      </div>
    </div>
  );
}
