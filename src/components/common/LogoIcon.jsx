import { motion } from 'motion/react';

export default function LogoIcon({ size = 24, className = "" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Outer Glow / Aura */}
      <motion.div 
        className="absolute inset-0 rounded-full opacity-20 blur-xl"
        style={{ background: 'var(--color-accent)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main Book Structure */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="relative z-10"
      >
        {/* Left Page */}
        <path d="M2 3h6a4 4 0 0 1 4 4v14a4 4 0 0 0-4-4H2z" />
        {/* Right Page */}
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a4 4 0 0 1 4-4h6z" />
        
        {/* Spine Detail */}
        <line x1="12" y1="7" x2="12" y2="21" strokeOpacity="0.5" />
      </svg>

      {/* AI Sparkle / Knowledge Pulse */}
      <motion.div
        className="absolute z-20"
        style={{ top: '25%', left: '50%', transform: 'translateX(-50%)' }}
        animate={{ 
          scale: [0, 1, 0],
          opacity: [0, 1, 0],
          y: [0, -10, -20]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeOut",
          times: [0, 0.2, 1]
        }}
      >
        <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="var(--color-accent)">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </motion.div>

      {/* Secondary Sparkle */}
      <motion.div
        className="absolute z-20"
        style={{ top: '40%', left: '30%' }}
        animate={{ 
          scale: [0, 0.8, 0],
          opacity: [0, 0.6, 0],
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 0.5
        }}
      >
        <svg width={size * 0.2} height={size * 0.2} viewBox="0 0 24 24" fill="var(--color-secondary)">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </motion.div>
    </div>
  );
}
