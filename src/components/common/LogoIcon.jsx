import { motion } from 'motion/react';

export default function LogoIcon({ size = 24, className = "" }) {
  // We use the provided size to scale the viewBox appropriately while maintaining responsiveness.
  return (
    <motion.div 
      className={`relative flex items-center justify-center select-none ${className}`} 
      style={{ width: size, height: size }}
      whileHover="hover"
    >
      {/* Premium Outer Ambient Aura / Glow */}
      <motion.div 
        className="absolute inset-0 rounded-full opacity-35 blur-xl pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, var(--color-secondary) 0%, var(--color-accent) 50%, var(--color-primary) 100%)' 
        }}
        animate={{ 
          scale: [1, 1.15, 1], 
          opacity: [0.25, 0.45, 0.25] 
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />

      {/* Main High-Fidelity SVG */}
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-md"
      >
        <defs>
          {/* Deep Royal Blue to Bright Azure Gradient */}
          <linearGradient id="primaryGrad" x1="4" y1="4" x2="20" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="40%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>

          {/* Deep Forest Green to Radiant Emerald Gradient */}
          <linearGradient id="accentGrad" x1="44" y1="4" x2="28" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="40%" stopColor="#065F46" />
            <stop offset="100%" stopColor="#022C22" />
          </linearGradient>

          {/* Rich Amber to Shining Gold Gradient */}
          <linearGradient id="goldGrad" x1="24" y1="12" x2="24" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Soft Highlight Overlay */}
          <linearGradient id="lightGloss" x1="24" y1="0" x2="24" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="30%" stopColor="white" stopOpacity="0.0" />
            <stop offset="100%" stopColor="black" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* 1. Tilted "Digital Resource" Orbital Engine Ring */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '24px 24px' }}
        >
          <ellipse 
            cx="24" 
            cy="24" 
            rx="21" 
            ry="7" 
            transform="rotate(-28 24 24)" 
            stroke="url(#goldGrad)" 
            strokeWidth="1.2" 
            strokeDasharray="3 4" 
            strokeOpacity="0.85"
            fill="none"
          />
          {/* Small digital node tracker orbiting the repository ring */}
          <circle cx="9" cy="15" r="2.2" fill="#F59E0B" className="shadow" />
          <circle cx="39" cy="33" r="1.5" fill="#10B981" />
        </motion.g>

        {/* 2. Abstract Geometric Columns / Great Zimbabwe Chevron pillars representing "DARE" forum structure */}
        <g strokeLinecap="round" strokeWidth="1.5">
          {/* Left chevron layer */}
          <path d="M12 40L16 36L12 32" stroke="var(--color-primary)" strokeOpacity="0.2" />
          {/* Right chevron layer */}
          <path d="M36 40L32 36L36 32" stroke="var(--color-accent)" strokeOpacity="0.2" />
        </g>

        {/* 3. The Digital Book Pages (Left Wing - Blue, Right Wing - Green/Teal) */}
        {/* Animated Left Page Page-curl curve */}
        <motion.path 
          d="M24 38C15.5 38 8 34.5 4 33.5V12C8.5 13 15.5 16 24 16.5V38Z" 
          fill="url(#primaryGrad)"
          variants={{
            hover: { d: "M24 38C14.5 38 7 35.5 4 33.5V11C8 12.5 15 15.5 24 16.5V38Z" }
          }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        />
        {/* Top Highlight on Left Page to give premium 3D volume */}
        <path d="M4 12C8.5 13 15.5 16 24 16.5" stroke="#60A5FA" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.7" />

        {/* Animated Right Page Page-curl curve */}
        <motion.path 
          d="M24 38C32.5 38 40 34.5 44 33.5V12C39.5 13 32.5 16 24 16.5V38Z" 
          fill="url(#accentGrad)"
          variants={{
            hover: { d: "M24 38C33.5 38 41 35.5 44 33.5V11C40 12.5 33 15.5 24 16.5V38Z" }
          }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        />
        {/* Top Highlight on Right Page to give premium 3D volume */}
        <path d="M44 12C39.5 13 32.5 16 24 16.5" stroke="#34D399" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.7" />

        {/* Gloss Finish overlay on top of pages */}
        <path d="M4 12V33.5C8 34.5 15.5 38 24 38C32.5 38 40 34.5 44 33.5V12C39.5 13 32.5 16 24 16.5C15.5 16 8.5 13 4 12Z" fill="url(#lightGloss)" style={{ mixBlendMode: 'overlay' }} />

        {/* 4. Center Spine of the Repository Engine */}
        <path d="M24 16V39.5" stroke="url(#goldGrad)" strokeWidth="3" strokeLinecap="round" />
        <path d="M24 16V39.5" stroke="#FEE2E2" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.4" />

        {/* 5. Center Core Sparkle (Primary star of innovation) */}
        {/* Soft pulsing shadow behind the star */}
        <motion.circle 
          cx="24" 
          cy="12" 
          r="6" 
          fill="#F59E0B" 
          opacity="0.35"
          animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Main 4-pointed Star */}
        <motion.path 
          d="M24 4C24.4 8.5 27.5 11.6 32 12C27.5 12.4 24.4 15.5 24 20C23.6 15.5 20.5 12.4 16 12C20.5 11.6 23.6 8.5 24 4Z" 
          fill="url(#goldGrad)"
          animate={{ scale: [1, 1.12, 1], rotate: [0, 5, 0] }}
          variants={{
            hover: { scale: 1.25, rotate: 90, transition: { duration: 0.4 } }
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
  );
}
