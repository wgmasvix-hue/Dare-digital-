import { motion, AnimatePresence } from 'motion/react';
import { useGamification } from '../../context/GamificationContext';
import { Sparkles } from 'lucide-react';

export default function GamificationFeedback() {
  const { xpFeedback } = useGamification();

  return (
    <div className="fixed top-24 right-8 z-[100] pointer-events-none">
      <AnimatePresence>
        {xpFeedback && (
          <motion.div
            key={xpFeedback.id}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 1.2 }}
            className="flex flex-col items-end"
          >
            <div className="bg-amber-500 text-black px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 border-2 border-white/20">
              <Sparkles size={18} />
              <span>+{xpFeedback.amount} XP</span>
            </div>
            {xpFeedback.reason && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-amber-400 text-xs font-bold mt-1 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm"
              >
                {xpFeedback.reason}
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
