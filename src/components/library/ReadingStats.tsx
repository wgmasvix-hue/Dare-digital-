import { useMemo, useEffect, useState } from 'react';
import { BookOpen, Heart, Flame, TrendingUp } from 'lucide-react';

interface ReadingStatsProps {
  savedCount: number;
  totalResults: number;
}

function getStreak(): number {
  try {
    const raw = localStorage.getItem('dare_reading_streak');
    if (!raw) return 0;
    const { streak, lastDate } = JSON.parse(raw);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastDate === today || lastDate === yesterday) return streak;
    return 0;
  } catch {
    return 0;
  }
}

function bumpStreak() {
  try {
    const raw = localStorage.getItem('dare_reading_streak');
    const today = new Date().toDateString();
    if (raw) {
      const data = JSON.parse(raw);
      if (data.lastDate === today) return;
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const streak = data.lastDate === yesterday ? data.streak + 1 : 1;
      localStorage.setItem('dare_reading_streak', JSON.stringify({ streak, lastDate: today }));
    } else {
      localStorage.setItem('dare_reading_streak', JSON.stringify({ streak: 1, lastDate: today }));
    }
  } catch {}
}

function getViewedToday(): number {
  try {
    const raw = localStorage.getItem('dare_viewed_today');
    if (!raw) return 0;
    const { date, count } = JSON.parse(raw);
    if (date !== new Date().toDateString()) return 0;
    return count;
  } catch {
    return 0;
  }
}

export function recordBookView() {
  try {
    bumpStreak();
    const today = new Date().toDateString();
    const raw = localStorage.getItem('dare_viewed_today');
    if (raw) {
      const data = JSON.parse(raw);
      if (data.date === today) {
        localStorage.setItem('dare_viewed_today', JSON.stringify({ date: today, count: data.count + 1 }));
      } else {
        localStorage.setItem('dare_viewed_today', JSON.stringify({ date: today, count: 1 }));
      }
    } else {
      localStorage.setItem('dare_viewed_today', JSON.stringify({ date: today, count: 1 }));
    }
  } catch {}
}

export default function ReadingStats({ savedCount, totalResults }: ReadingStatsProps) {
  const [streak] = useState(getStreak);
  const [viewedToday] = useState(getViewedToday);

  const stats = useMemo(() => [
    { icon: TrendingUp, label: 'Results',      value: totalResults.toLocaleString(), color: 'text-teal-600',   bg: 'bg-teal-50'   },
    { icon: Heart,      label: 'Saved',        value: String(savedCount),            color: 'text-rose-600',   bg: 'bg-rose-50'   },
    { icon: BookOpen,   label: 'Viewed Today', value: String(viewedToday),           color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { icon: Flame,      label: 'Day Streak',   value: String(streak),                color: 'text-orange-600', bg: 'bg-orange-50' },
  ], [totalResults, savedCount, viewedToday, streak]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map(({ icon: Icon, label, value, color, bg }) => (
        <div key={label} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-100 bg-white shadow-sm`}>
          <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
            <Icon size={16} className={color} />
          </div>
          <div>
            <p className={`text-lg font-black leading-none ${color}`}>{value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
