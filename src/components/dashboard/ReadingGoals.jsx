import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, TrendingUp, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ReadingGoals({ currentPagesRead = 0 }) {
  const [goal, setGoal] = useState({ type: 'daily', target: 50 }); // type: 'daily' | 'weekly'
  const [isEditing, setIsEditing] = useState(false);
  const [editTarget, setEditTarget] = useState(50);
  const [progress, setProgress] = useState(0);

  // Load goal from localStorage
  useEffect(() => {
    const savedGoal = localStorage.getItem('dare_reading_goal');
    if (savedGoal) {
      setGoal(JSON.parse(savedGoal));
    }
  }, []);

  useEffect(() => {
    // Calculate progress based on current pages read vs target
    const calculatedProgress = Math.min((currentPagesRead / goal.target) * 100, 100);
    setProgress(calculatedProgress);
  }, [currentPagesRead, goal.target]);

  const handleSaveGoal = () => {
    const newGoal = { ...goal, target: Number(editTarget) };
    setGoal(newGoal);
    localStorage.setItem('dare_reading_goal', JSON.stringify(newGoal));
    setIsEditing(false);
  };

  const isGoalReached = currentPagesRead >= goal.target;

  return (
    <div className="bg-white border border-[#E8DFD0] rounded-3xl p-6 shadow-sm flex flex-col w-full h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-serif text-[#3D3028]">Reading Goals</h2>
        </div>
        <button 
          onClick={() => {
            setEditTarget(goal.target);
            setIsEditing(!isEditing);
          }}
          className="w-8 h-8 rounded-full hover:bg-stone-50 flex items-center justify-center text-[#8E8271] transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="flex items-center gap-4 mb-4">
              <select 
                value={goal.type}
                onChange={(e) => setGoal({ ...goal, type: e.target.value })}
                className="bg-[#FDFCF9] border border-[#E8DFD0] rounded-xl px-4 py-2 text-sm font-bold text-[#3D3028] outline-none focus:border-[#C8861A]"
              >
                <option value="daily">Daily Target</option>
                <option value="weekly">Weekly Target</option>
              </select>
              <div className="flex-1 flex items-center bg-[#FDFCF9] border border-[#E8DFD0] rounded-xl px-4 py-2 focus-within:border-[#C8861A]">
                <input 
                  type="number" 
                  value={editTarget}
                  onChange={(e) => setEditTarget(e.target.value)}
                  className="bg-transparent w-full outline-none text-sm font-bold text-[#3D3028]"
                  min="1"
                />
                <span className="text-xs font-bold text-[#8E8271] uppercase tracking-tighter">Pages</span>
              </div>
            </div>
            <button 
              onClick={handleSaveGoal}
              className="w-full py-2 bg-[#3D3028] text-white rounded-xl text-sm font-bold tracking-wide hover:bg-[#4A3B32] transition-colors"
            >
              Save Goal
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm font-bold uppercase tracking-wider text-[#8E8271]">
                {goal.type === 'daily' ? 'Today\'s' : 'This Week\'s'} Progress
              </span>
              <span className="font-mono font-bold text-[#3D3028] text-xl">
                {currentPagesRead} <span className="text-[#8E8271] text-sm">/ {goal.target} pgs</span>
              </span>
            </div>
            
            <div className="h-4 bg-[#FDFCF9] border border-[#E8DFD0] rounded-full overflow-hidden mb-6 relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full ${isGoalReached ? 'bg-emerald-500' : 'bg-[#C8861A]'} relative`}
              >
                <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,0.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0.15) 75%,transparent 75%,transparent)' }}></div>
              </motion.div>
            </div>

            <div className="flex items-center gap-3 justify-center p-3 rounded-xl bg-orange-50/50 border border-orange-100/50">
              {isGoalReached ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-serif font-bold text-emerald-700">Goal achieved! Amazing work.</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5 text-[#C8861A]" />
                  <span className="text-sm font-serif font-bold text-[#8E8271]">
                    You need <span className="text-[#3D3028]">{goal.target - currentPagesRead}</span> more pages to hit your {goal.type} goal!
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
