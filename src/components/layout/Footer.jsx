import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, Heart } from 'lucide-react';
import LogoIcon from '../common/LogoIcon';

/* ── Ndebele-inspired triangle strip ──────────────────────────── */
const NdebeleStrip = () => {
  const palette = ['#166534','#D97706','#C2410C','#1C1917','#D97706','#166534','#FFFBF0','#1C1917'];
  return (
    <svg
      viewBox="0 0 1200 24"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className="w-full"
      style={{ height: '24px', display: 'block' }}
      aria-hidden="true"
    >
      {[...Array(60)].map((_, i) => {
        const fill = palette[i % palette.length];
        const x    = i * 20;
        const even = i % 2 === 0;
        return (
          <g key={i}>
            <rect x={x} y="0" width="20" height="24" fill={fill} />
            <polygon
              points={even ? `${x},0 ${x+10},24 ${x+20},0` : `${x},24 ${x+10},0 ${x+20},24`}
              fill="rgba(0,0,0,0.18)"
            />
          </g>
        );
      })}
    </svg>
  );
};

/* ── Baobab tree SVG silhouette ───────────────────────────────── */
const BaobabSvg = ({ className = '' }) => (
  <svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg"
    className={className} fill="currentColor" aria-hidden="true">
    <rect x="46" y="100" width="28" height="100" rx="6" />
    <ellipse cx="60" cy="198" rx="46" ry="9" opacity="0.5" />
    <line x1="60" y1="100" x2="18" y2="58" stroke="currentColor" strokeWidth="11" strokeLinecap="round" />
    <line x1="60" y1="100" x2="102" y2="58" stroke="currentColor" strokeWidth="11" strokeLinecap="round" />
    <line x1="60" y1="100" x2="34" y2="36" stroke="currentColor" strokeWidth="8"  strokeLinecap="round" />
    <line x1="60" y1="100" x2="86" y2="36" stroke="currentColor" strokeWidth="8"  strokeLinecap="round" />
    <line x1="60" y1="100" x2="60" y2="20"  stroke="currentColor" strokeWidth="9"  strokeLinecap="round" />
    <circle cx="18"  cy="48" r="22" />
    <circle cx="102" cy="48" r="22" />
    <circle cx="34"  cy="26" r="18" />
    <circle cx="86"  cy="26" r="18" />
    <circle cx="60"  cy="12" r="20" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-[#0A1410] text-stone-400 relative overflow-hidden">

      {/* Decorative baobab silhouettes in background */}
      <div className="absolute bottom-0 right-6 opacity-[0.045] pointer-events-none select-none"
        style={{ width: '190px' }}>
        <BaobabSvg className="text-green-400 w-full" />
      </div>
      <div className="absolute bottom-0 left-12 opacity-[0.03] pointer-events-none select-none"
        style={{ width: '130px', transform: 'scaleX(-1)' }}>
        <BaobabSvg className="text-amber-300 w-full" />
      </div>

      {/* Ndebele geometric strip */}
      <NdebeleStrip />

      {/* Zimbabwe flag stripe */}
      <div className="h-[3px] w-full"
        style={{ background: 'linear-gradient(90deg,#166534 0% 25%,#D97706 25% 50%,#C2410C 50% 75%,#1C1917 75% 100%)' }}
      />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-14 relative z-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* ── Col 1 — Brand ─────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            <Link to="/" className="flex items-center gap-3">
              <LogoIcon size={36} className="text-white" />
              <div className="flex flex-col leading-none">
                <span className="text-white font-black text-xl tracking-tight">DARE</span>
                <span className="text-green-400 text-[10px] font-bold tracking-widest uppercase">
                  DIGITAL LIBRARY
                </span>
              </div>
            </Link>

            <p className="text-stone-400 text-sm leading-relaxed">
              Zimbabwe's premier open educational resource platform — rooted in African heritage,
              connected to the world. Empowering every learner, from primary school to PhD.
            </p>

            {/* Cultural tagline */}
            <div className="flex items-center gap-2 text-[11px] font-bold text-green-500/60 uppercase tracking-widest">
              <span>🌳</span>
              <span>Built with love for Zimbabwe</span>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                { Icon: Facebook,  label: 'Facebook'  },
                { Icon: Twitter,   label: 'Twitter'   },
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Linkedin,  label: 'LinkedIn'  },
              ].map(({ Icon, label }) => (
                <a key={label} href="#" aria-label={label}
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-stone-700 text-stone-400 hover:text-amber-400 hover:border-amber-400 transition-colors">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* ── Col 2 — Explore ───────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-4">
              Explore
            </h4>
            {[
              { label: 'Main Library',      to: '/library'   },
              { label: 'Open Books',        to: '/open-books'},
              { label: 'Academic Database', to: '/academic'  },
              { label: 'Research Portal',   to: '/research'  },
              { label: 'BAKO AI Tutor',     to: '/tutor'     },
            ].map(({ label, to }) => (
              <Link key={to} to={to}
                className="text-sm text-stone-400 hover:text-amber-400 transition-colors">
                {label}
              </Link>
            ))}
          </div>

          {/* ── Col 3 — Resources ─────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-4">
              Resources
            </h4>
            {[
              { label: 'Lesson Planner', to: '/teacher-tools'  },
              { label: 'Repository',     to: '/dspace-explorer'},
              { label: 'Author Portal',  to: '/author'         },
              { label: 'Institutional',  to: '/institutional'  },
              { label: 'Leaderboard',    to: '/leaderboard'    },
            ].map(({ label, to }) => (
              <Link key={to} to={to}
                className="text-sm text-stone-400 hover:text-amber-400 transition-colors">
                {label}
              </Link>
            ))}
          </div>

          {/* ── Col 4 — Connect ───────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-4">
              Connect
            </h4>

            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="w-full rounded-md bg-stone-800 border border-stone-700 px-3 py-2 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <button type="submit"
                className="w-full rounded-md bg-green-700 hover:bg-green-600 text-white text-sm font-semibold py-2 transition-colors">
                Subscribe
              </button>
            </form>

            <div className="flex flex-col gap-2 mt-2">
              <a href="tel:+263784457922"
                className="flex items-center gap-2 text-sm text-stone-400 hover:text-amber-400 transition-colors">
                <Phone size={14} className="shrink-0" />
                <span>+263 784 457 922</span>
              </a>
              <a href="mailto:dare.digitallib@gmail.com"
                className="flex items-center gap-2 text-sm text-stone-400 hover:text-amber-400 transition-colors">
                <Mail size={14} className="shrink-0" />
                <span>dare.digitallib@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ───────────────────────────────────────── */}
        <div className="mt-12 border-t border-stone-800 pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-500 flex items-center gap-1.5 flex-wrap">
            &copy; 2026 DARE Digital Library. A project by ChengetAI Labs.
            <Heart size={12} className="text-red-500 fill-red-500 ml-1 shrink-0" />
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-500">
            <span>MHTEISTD &middot; ZIMSEC &middot; OpenStax &middot; LibreTexts</span>
            <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy</Link>
            <Link to="/terms"   className="hover:text-amber-400 transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* Bottom kente stripe */}
      <div className="h-2 w-full" aria-hidden="true" style={{
        background: 'repeating-linear-gradient(90deg,#166534 0px,#166534 10px,#D97706 10px,#D97706 20px,#C2410C 20px,#C2410C 30px,#1C1917 30px,#1C1917 40px)'
      }} />
    </footer>
  );
}
