import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Play, Sparkles, Zap, ShieldCheck, Globe } from 'lucide-react';

const TOUR_STEPS = [
  {
    title: "Welcome to DARE Digital Library",
    description: "Zimbabwe's premier digital repository for academic excellence and knowledge preservation.",
    target: "hero",
    icon: <Globe className="text-amber-500" size={24} />,
    position: "center"
  },
  {
    title: "Competency-Based Learning",
    description: "Our resources are aligned with ZIMCHE standards and designed to build practical 'Unyanzvi' (skills).",
    target: "cta-group",
    icon: <ShieldCheck className="text-emerald-500" size={24} />,
    position: "bottom"
  },
  {
    title: "AI-Powered Data Saving",
    description: "Our DARA AI helps you save up to 95% of mobile data by providing high-impact summaries before you download.",
    target: "study-hub",
    icon: <Zap className="text-amber-500" size={24} />,
    position: "top"
  },
  {
    title: "The AI Librarian (DARA)",
    description: "Ask DARA anything! From study plans to complex research queries, your AI librarian is always ready.",
    target: "ask-dara",
    icon: <Sparkles className="text-purple-500" size={24} />,
    position: "left"
  },
  {
    title: "Future-Ready Collections",
    description: "Explore specialized portals for AI, Teachers Colleges, and Vocational Training.",
    target: "ai-banner",
    icon: <Play className="text-blue-500" size={24} />,
    position: "right"
  }
];

export default function DemoTour({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    let timer;
    if (isOpen && isAutoPlaying) {
      timer = setInterval(() => {
        if (currentStep < TOUR_STEPS.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          setIsAutoPlaying(false);
          clearInterval(timer);
        }
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isAutoPlaying, currentStep]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];

  const handleNext = () => {
    setIsAutoPlaying(false);
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    setIsAutoPlaying(false);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] pointer-events-none">
        {/* Overlay with hole (simplified for now, just a backdrop) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] pointer-events-auto"
          onClick={onClose}
        />

        <div className="absolute inset-0 flex items-center justify-center p-4">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-md w-full pointer-events-auto relative overflow-hidden"
          >
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 h-1 bg-amber-500 transition-all duration-500" style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }} />

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                {step.icon}
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="flex items-center justify-between w-full mt-4">
                <div className="flex gap-1">
                  {TOUR_STEPS.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-amber-500' : 'w-1.5 bg-slate-200 dark:bg-slate-700'}`} 
                    />
                  ))}
                </div>

                <div className="flex gap-3">
                  {currentStep > 0 && (
                    <button 
                      onClick={handlePrev}
                      className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  <button 
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                  >
                    {currentStep === TOUR_STEPS.length - 1 ? "Finish" : "Next"}
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {isAutoPlaying && (
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold animate-pulse">
                  Auto-playing... Click any button to pause
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
