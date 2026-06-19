import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  BookOpen, Clock, Flame, Zap, Trophy, ArrowRight,
  TrendingUp, Calendar, Target, BookMarked, CheckCircle, RotateCcw
} from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import { useAuth } from '../hooks/useAuth';
import { ALL_ADDITIONAL_OER } from '../lib/oerCatalog';
import { OPENSTAX_CURATED } from '../lib/transformBook';

const ALL_LOCAL_OER = (() => {
  const combined = [...(OPENSTAX_CURATED || []), ...(ALL_ADDITIONAL_OER || [])];
  const seenIds = new Set();
  return combined.filter(book => {
    if (!book?.id || seenIds.has(book.id)) return false;
    seenIds.add(book.id);
    return true;
  });
})();

function StatCard({ icon: Icon, label, value, color = 'teal' }) {
  const colors = {
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon size={20} />
        <span className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</span>
      </div>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

export default function ReadingHistory() {
  const { user } = useAuth();
  const { xp, streak, level, bookProgress, getLevelInfo, badges } = useGamification();
  const levelInfo = getLevelInfo();

  const [booksRead, setBooksRead] = useState([]);

  useEffect(() => {
    const progressEntries = Object.entries(bookProgress);
    if (progressEntries.length === 0) return;

    const enriched = progressEntries
      .map(([id, progress]) => {
        const book = ALL_LOCAL_OER.find(b => b.id === id);
        return {
          id,
          progress,
          title: book?.title || `Resource #${id.slice(0, 8)}`,
          author: book?.author_names || 'Unknown Author',
          cover: book?.cover_image_url || null,
          faculty: book?.faculty || book?.subject || 'General',
          lastRead: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        };
      })
      .sort((a, b) => b.progress - a.progress);

    setBooksRead(enriched);
  }, [bookProgress]);

  const completedCount = booksRead.filter(b => b.progress >= 100).length;
  const inProgressCount = booksRead.filter(b => b.progress > 0 && b.progress < 100).length;

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const activityData = weekdays.map((day, i) => ({
    day,
    active: Math.random() > 0.3,
    xp: Math.floor(Math.random() * 150),
  }));

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reading History</h1>
          <p className="text-slate-500 mt-1">Your learning journey at a glance.</p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard icon={BookOpen} label="Total Read" value={booksRead.length} color="teal" />
          <StatCard icon={CheckCircle} label="Completed" value={completedCount} color="blue" />
          <StatCard icon={Flame} label="Day Streak" value={`🔥 ${streak}`} color="amber" />
          <StatCard icon={Zap} label="Total XP" value={xp.toLocaleString()} color="purple" />
        </motion.div>

        {/* Level Progress Banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0">
            <span className="text-3xl font-black text-teal-300">{level}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="font-black text-xl">{levelInfo.current.title}</p>
              <p className="text-xs text-slate-400 font-bold">→ {levelInfo.next.title}</p>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${levelInfo.progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">{Math.round(levelInfo.progress)}% to next level · {xp} XP total</p>
          </div>
          <Link
            to="/leaderboard"
            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-teal-500/20 border border-teal-400/30 text-teal-300 font-bold text-sm rounded-xl hover:bg-teal-500/30 transition"
          >
            <Trophy size={16} />
            Leaderboard
          </Link>
        </motion.div>

        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg text-slate-900">This Week</h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Calendar size={13} /> Activity
            </span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {activityData.map(({ day, active, xp: dayXp }) => (
              <div key={day} className="flex flex-col items-center gap-2">
                <div
                  className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    active
                      ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/30'
                      : 'bg-slate-100 text-slate-300'
                  }`}
                  title={active ? `+${dayXp} XP` : 'No activity'}
                >
                  {active ? '+' + dayXp : '—'}
                </div>
                <span className="text-[10px] font-bold text-slate-400">{day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Badges */}
        {badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
          >
            <h2 className="font-bold text-lg text-slate-900 mb-4">Badges Earned</h2>
            <div className="flex flex-wrap gap-3">
              {badges.map(badge => (
                <div
                  key={badge}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-sm font-bold text-amber-700"
                >
                  <Trophy size={14} />
                  {badge}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reading List */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-slate-900">
              {booksRead.length > 0 ? `${booksRead.length} Resource${booksRead.length !== 1 ? 's' : ''} Read` : 'No Reading History Yet'}
            </h2>
            {inProgressCount > 0 && (
              <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                {inProgressCount} in progress
              </span>
            )}
          </div>

          {booksRead.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
                <BookOpen size={28} />
              </div>
              <h3 className="font-black text-xl text-slate-900 mb-2">Your story begins here</h3>
              <p className="text-slate-500 max-w-sm mb-6">Start reading any book from the library and your progress will be tracked here automatically.</p>
              <Link
                to="/library"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition"
              >
                <BookOpen size={18} />
                Browse Library
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {booksRead.map((book, i) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.04 }}
                  className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-5 shadow-sm hover:shadow-md transition group"
                >
                  {/* Cover */}
                  <div className="w-12 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    {book.cover ? (
                      <img src={book.cover} alt={book.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <BookOpen size={20} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate group-hover:text-teal-600 transition">{book.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{book.author}</p>
                    <div className="mt-2">
                      <ProgressBar value={book.progress} />
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-bold text-slate-400">{book.progress}% complete</span>
                      {book.progress >= 100 && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle size={11} /> Completed
                        </span>
                      )}
                      <span className="text-xs text-slate-300">·</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={11} /> {book.lastRead}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <Link
                    to={`/book/${book.id}`}
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition"
                  >
                    {book.progress >= 100 ? <RotateCcw size={13} /> : <BookOpen size={13} />}
                    {book.progress >= 100 ? 'Revisit' : 'Continue'}
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-teal-500/10 to-emerald-500/5 border border-teal-200/50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div>
            <h3 className="font-black text-lg text-slate-900">Keep the momentum going</h3>
            <p className="text-sm text-slate-500 mt-0.5">Explore new resources and grow your knowledge base.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link to="/library" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition">
              <BookOpen size={16} /> Library
            </Link>
            <Link to="/tutor" className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white font-bold text-sm rounded-xl hover:bg-teal-400 transition">
              Ask DARA <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
