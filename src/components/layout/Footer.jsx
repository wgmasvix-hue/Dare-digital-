import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from 'lucide-react';
import LogoIcon from '../common/LogoIcon';

export default function Footer() {
  return (
    <footer className="bg-[#0B1612] text-stone-400">
      {/* Zimbabwe flag stripe */}
      <div
        className="h-1 w-full"
        style={{
          background:
            'linear-gradient(90deg, #166534 0% 25%, #D97706 25% 50%, #C2410C 50% 75%, #1C1917 75% 100%)',
        }}
      />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Col 1 — Brand */}
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
              Zimbabwe's premier open educational resource platform, empowering students and
              educators with quality digital content.
            </p>

            <div className="flex items-center gap-3 mt-1">
              {[
                { Icon: Facebook, label: 'Facebook' },
                { Icon: Twitter, label: 'Twitter' },
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Linkedin, label: 'LinkedIn' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-stone-700 text-stone-400 hover:text-amber-400 hover:border-amber-400 transition-colors"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Explore */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-stone-500 mb-4">
              Explore
            </h4>
            {[
              { label: 'Main Library', to: '/library' },
              { label: 'Open Books', to: '/open-books' },
              { label: 'Academic Database', to: '/academic' },
              { label: 'Research Portal', to: '/research' },
              { label: 'DARA AI Tutor', to: '/tutor' },
            ].map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="text-sm text-stone-400 hover:text-amber-400 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Col 3 — Resources */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-stone-500 mb-4">
              Resources
            </h4>
            {[
              { label: 'Lesson Planner', to: '/teacher-tools' },
              { label: 'Repository', to: '/dspace-explorer' },
              { label: 'Author Portal', to: '/author' },
              { label: 'Institutional', to: '/institutional' },
              { label: 'Leaderboard', to: '/leaderboard' },
            ].map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="text-sm text-stone-400 hover:text-amber-400 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Col 4 — Connect */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-stone-500 mb-4">
              Connect
            </h4>

            {/* Newsletter form */}
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="w-full rounded-md bg-stone-800 border border-stone-700 px-3 py-2 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <button
                type="submit"
                className="w-full rounded-md bg-green-700 hover:bg-green-600 text-white text-sm font-semibold py-2 transition-colors"
              >
                Subscribe
              </button>
            </form>

            {/* Contact details */}
            <div className="flex flex-col gap-2 mt-2">
              <a
                href="tel:+263784457922"
                className="flex items-center gap-2 text-sm text-stone-400 hover:text-amber-400 transition-colors"
              >
                <Phone size={14} className="shrink-0" />
                <span>+263 784 457 922</span>
              </a>
              <a
                href="mailto:dare.digitallib@gmail.com"
                className="flex items-center gap-2 text-sm text-stone-400 hover:text-amber-400 transition-colors"
              >
                <Mail size={14} className="shrink-0" />
                <span>dare.digitallib@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-stone-800 pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-500">
            &copy; 2025 DARE Digital Library. A project by ChengetAI Labs.
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-500">
            <span>MHTEISTD &middot; ZIMSEC &middot; OpenStax &middot; LibreTexts</span>
            <Link to="/privacy" className="hover:text-amber-400 transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-amber-400 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
