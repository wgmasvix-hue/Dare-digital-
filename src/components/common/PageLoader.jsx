import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen } from 'lucide-react';

export default function PageLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    setProgress(30);
    
    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 500);
    }, 800);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900 overflow-hidden"
        >
          {/* Background Atmospheric Gradients */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
                x: [0, 50, 0],
                y: [0, 30, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[120px]" 
            />
            <motion.div 
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.4, 0.2],
                x: [0, -50, 0],
                y: [0, -30, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[150px]" 
            />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mb-8 relative"
            >
              <div className="w-24 h-24 bg-amber-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-amber-900/40 relative z-10">
                <BookOpen size={48} className="text-white" />
              </div>
              {/* Outer Ring Animation */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 -m-4 border-2 border-dashed border-amber-500/30 rounded-[3rem]"
              />
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h2 className="text-2xl font-display font-black text-white tracking-tighter uppercase mb-2">
                DARE <span className="text-amber-500">Digital</span>
              </h2>
              <div className="flex items-center gap-2 justify-center">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Knowledge is Power</span>
              </div>
            </motion.div>

            {/* Progress Bar */}
            <div className="mt-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_15px_rgba(217,119,6,0.5)]"
              />
            </div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest"
            >
              {progress < 100 ? "Accessing Repository..." : "Welcome to DARE"}
            </motion.p>
          </div>

          {/* Decorative Rail Text */}
          <div className="absolute left-10 top-1/2 -translate-y-1/2 hidden lg:block">
            <span className="writing-mode-vertical-rl rotate-180 text-[10px] font-black uppercase tracking-[0.5em] text-slate-700 opacity-50">
              Education 5.0 • Innovation • Industrialisation
            </span>
          </div>
          <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:block">
            <span className="writing-mode-vertical-rl text-[10px] font-black uppercase tracking-[0.5em] text-slate-700 opacity-50">
              Zimbabwe National Digital Library
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
