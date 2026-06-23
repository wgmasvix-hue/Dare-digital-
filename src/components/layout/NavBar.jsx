import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu, X, User, LogOut, History, Settings,
  LayoutDashboard, Trophy, Search, Sparkles, Library,
  FlaskConical, Zap, Database, Globe, ClipboardCheck
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGamification } from '../../context/GamificationContext';
import GlobalSearch from './GlobalSearch';
import LogoIcon from '../common/LogoIcon';

const PRIMARY_LINKS = [
  { to: '/library',         label: 'Browse',      Icon: Library },
  { to: '/repository',      label: 'Repository',  Icon: Database },
  { to: '/tutor',           label: 'DARA Tutor',  Icon: Sparkles,      cls: 'text-amber-500' },
  { to: '/advanced-search', label: 'Research DB', Icon: Search,        special: true },
];

const SECONDARY_LINKS = [
  { to: '/open-books',    label: '1M+ Books',      Icon: Globe,          cls: 'text-teal-600' },
  { to: '/research',      label: 'Research',       Icon: FlaskConical },
  { to: '/teacher-tools', label: 'Lesson Planner', Icon: ClipboardCheck, cls: 'text-emerald-600' },
];

export default function NavBar() {
  const { user, profile, signOut } = useAuth();
  const { xp, streak, level, getLevelInfo } = useGamification();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  const isActive = useCallback((path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  // Press '/' to focus global search
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') {
        e.preventDefault();
        document.querySelector('[data-global-search]')?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const linkCls = (path, special) => {
    const active = isActive(path);
    if (special) {
      return `px-3.5 py-2 rounded-full font-bold text-sm flex items-center gap-1.5 transition-all ${
        active ? 'bg-indigo-700 text-white shadow-sm' : 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-indigo-200'
      }`;
    }
    return `px-3.5 py-2 rounded-full font-bold text-sm flex items-center gap-1.5 transition-all ${
      active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm py-2' : 'bg-transparent py-4'
    }`}>

      {/* XP progress bar */}
      {user && (
        <div className="absolute top-0 left-0 w-full h-[2px] bg-slate-100/60">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-400 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${getLevelInfo().progress}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4 mt-1">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group focus:outline-none" aria-label="DARE home">
          <div className="p-1.5 rounded-2xl transition-all bg-slate-50 border border-slate-200/60 shadow-inner group-hover:scale-105 group-hover:bg-white group-hover:border-slate-300">
            <LogoIcon size={32} />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-display font-black text-xl leading-none tracking-wider text-slate-900 group-hover:text-primary transition-colors">DARE</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5 font-mono">Digital Library</span>
          </div>
        </Link>

        {/* Desktop nav — md shows primary only, lg shows all */}
        <div className="hidden md:flex lg:hidden items-center gap-1">
          {PRIMARY_LINKS.map(({ to, label, Icon, cls, special }) => (
            <Link key={to} to={to} aria-current={isActive(to) ? 'page' : undefined} className={linkCls(to, special)}>
              <Icon size={14} className={isActive(to) || special ? '' : (cls || '')} />{label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-1">
          {[...PRIMARY_LINKS, ...SECONDARY_LINKS].map(({ to, label, Icon, cls, special }) => (
            <Link key={to} to={to} aria-current={isActive(to) ? 'page' : undefined} className={linkCls(to, special)}>
              <Icon size={14} className={isActive(to) ? '' : (cls || '')} />{label}
            </Link>
          ))}
        </div>

        {/* Search — lg+ */}
        <div className="flex-1 max-w-sm hidden lg:block">
          <GlobalSearch />
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-3 shrink-0">
          {user && (
            <div className="hidden sm:flex items-center gap-2.5 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-black">
              <span className="text-orange-600" title="Daily Streak">🔥 {streak}</span>
              <div className="w-px h-3.5 bg-slate-300" />
              <span className="text-blue-600 flex items-center gap-0.5" title="XP"><Zap size={12} />{xp}</span>
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center">{level}</span>
            </div>
          )}

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(v => !v)}
                aria-expanded={isProfileOpen}
                aria-haspopup="menu"
                className="w-9 h-9 rounded-full bg-teal-100 border-2 border-teal-200 flex items-center justify-center text-teal-700 font-black text-sm hover:scale-105 active:scale-95 hover:border-teal-300 transition-all focus:outline-none"
              >
                {profile?.first_name?.[0]?.toUpperCase() || <User size={17} />}
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 mb-1.5">
                      <p className="font-black text-slate-900 text-sm truncate">{profile?.first_name || 'Student'}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    {[
                      { to: '/dashboard',   Icon: LayoutDashboard, label: 'Dashboard' },
                      { to: '/history',     Icon: History,         label: 'Reading History' },
                      { to: '/leaderboard', Icon: Trophy,          label: 'Leaderboard' },
                      { to: '/settings',    Icon: Settings,        label: 'Settings' },
                    ].map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        role="menuitem"
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                          isActive(item.to) ? 'bg-slate-100 font-black text-slate-900' : 'font-medium text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <item.Icon size={15} className="text-slate-400 shrink-0" />{item.label}
                      </Link>
                    ))}
                    <div className="h-px bg-slate-100 my-1.5" />
                    <button
                      onClick={signOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 rounded-full font-bold text-sm text-slate-700 hover:bg-slate-100 transition-colors">Sign In</Link>
              <Link to="/register" className="px-4 py-2 rounded-full font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-all active:scale-95 shadow-sm">Join DARE</Link>
            </div>
          )}

          {/* Hamburger */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
            onClick={() => setIsMobileMenuOpen(v => !v)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isMobileMenuOpen ? 'x' : 'menu'}
                initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.12 }}
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden shadow-xl"
          >
            <div className="px-5 py-5 flex flex-col gap-1">
              <div className="mb-3 border border-slate-200 rounded-xl p-2 bg-slate-50">
                <GlobalSearch />
              </div>

              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 mb-1">Navigate</p>
              {[...PRIMARY_LINKS, ...SECONDARY_LINKS].map(({ to, label, Icon, cls }) => (
                <Link
                  key={to}
                  to={to}
                  aria-current={isActive(to) ? 'page' : undefined}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    isActive(to) ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={16} className={isActive(to) ? 'text-white' : (cls || 'text-slate-500')} />
                  {label}
                </Link>
              ))}

              <div className="h-px bg-slate-100 my-3" />

              {!user ? (
                <div className="flex flex-col gap-2">
                  <Link to="/login" className="py-3 rounded-xl font-bold text-center bg-slate-100 text-slate-900 text-sm">Sign In</Link>
                  <Link to="/register" className="py-3 rounded-xl font-bold text-center bg-slate-900 text-white text-sm shadow">Join DARE</Link>
                </div>
              ) : (
                <>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 mb-1">Account</p>
                  {[
                    { to: '/dashboard',   Icon: LayoutDashboard, label: 'Dashboard' },
                    { to: '/history',     Icon: History,         label: 'Reading History' },
                    { to: '/leaderboard', Icon: Trophy,          label: 'Leaderboard' },
                    { to: '/settings',    Icon: Settings,        label: 'Settings' },
                  ].map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                        isActive(item.to) ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <item.Icon size={16} className="text-slate-400" />{item.label}
                    </Link>
                  ))}
                  <button
                    onClick={signOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-600 hover:bg-red-50 transition-colors text-left w-full"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
