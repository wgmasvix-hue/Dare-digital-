import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Calendar, Zap, Flame, Trophy, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGamification } from '../context/GamificationContext';

export default function ReadingHistory() {
  const { user, profile } = useAuth();
  const { xp, streak, level, getLevelInfo } = useGamification();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('dare_reading_history') || '[]');
    setHistory(stored);
    setLoading(false);
  }, []);

  const levelInfo = getLevelInfo();

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
          <h2 className="text-xl font-black text-slate-700 mb-2">Sign in to view your history</h2>
          <Link to="/login" className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Reading History</h1>
        <p className="text-slate-500 mb-8">Track your learning journey and progress</p>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'XP Earned', value: xp, icon: Zap, color: 'text-blue-600 bg-blue-50 border-blue-100' },
            { label: 'Day Streak', value: streak, icon: Flame, color: 'text-orange-600 bg-orange-50 border-orange-100' },
            { label: 'Current Level', value: `Lv ${level}`, icon: Trophy, color: 'text-purple-600 bg-purple-50 border-purple-100' },
            { label: 'Books Opened', value: history.length, icon: BookOpen, color: 'text-teal-600 bg-teal-50 border-teal-100' },
          ].map(stat => (
            <div key={stat.label} className={`rounded-2xl border p-4 ${stat.color}`}>
              <stat.icon size={20} className="mb-2" />
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-xs font-bold uppercase tracking-widest opacity-70 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Level Progress */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-black text-slate-700">Level {level} Progress</span>
            <span className="text-xs font-bold text-slate-500">{Math.round(levelInfo.progress)}% to Level {level + 1}</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">{levelInfo.xpForNext - (xp % levelInfo.xpForNext)} XP needed to level up</p>
        </div>

        {/* History List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-black text-slate-900">Recent Activity</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading...</div>
          ) : history.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen size={40} className="mx-auto mb-3 text-slate-200" />
              <p className="font-bold text-slate-500 mb-1">No reading history yet</p>
              <p className="text-sm text-slate-400 mb-4">Start reading to track your progress</p>
              <Link to="/library" className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm">
                Browse Library
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {history.slice().reverse().map((item, i) => (
                <Link
                  key={i}
                  to={`/book/${item.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                    <BookOpen size={18} className="text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate text-sm">{item.title || 'Unknown Title'}</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock size={11} /> {item.readAt ? new Date(item.readAt).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
