import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu, X, User, LogOut, History, Settings,
  LayoutDashboard, Trophy, Search, Sparkles, ChevronDown, Zap
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGamification } from '../../context/GamificationContext';
import GlobalSearch from './GlobalSearch';
import LogoIcon from '../common/LogoIcon';

const CORE_NAV = [
  { label: 'Browse',   href: '/library'  },
  { label: 'Academic', href: '/academic' },
  { label: 'Research', href: '/research' },
];

const EXPLORE_ITEMS = [
  {
    emoji: '📚',
    label: 'Open Books',
    sub: '1M+ free titles',
    href: '/open-books',
  },
  {
    emoji: '🏛',
    label: 'Repository',
    sub: 'Institutional archives',
    href: '/dspace-explorer',
  },
  {
    emoji: '📝',
    label: 'Lesson Planner',
    sub: 'AI lesson plans',
    href: '/teacher-tools',
  },
  {
    emoji: '🏆',
    label: 'Leaderboard',
    sub: 'Top scholars',
    href: '/leaderboard',
  },
];

export default function NavBar() {
  const { user, profile, signOut } = useAuth();
  const { xp, streak, level, getLevelInfo } = useGamification();
  const [isScrolled, setIsScrolled]       = useState(false);
  const [isMobileOpen, setIsMobileOpen]   = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  const dropdownRef = useRef(null);
  const exploreRef  = useRef(null);
  const location    = useLocation();

  /* ── scroll shadow ──────────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── close profile dropdown on outside click ─────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── close explore dropdown on outside click ─────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (exploreRef.current && !exploreRef.current.contains(e.target)) {
        setIsExploreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── close everything on route change ───────────────────────── */
  useEffect(() => {
    setIsMobileOpen(false);
    setIsProfileOpen(false);
    setIsExploreOpen(false);
  }, [location]);

  const isActive = (href) => location.pathname === href;

  /* ── active link class ───────────────────────────────────────── */
  const navLinkClass = (href) =>
    `relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 focus:outline-none group ${
      isActive(href)
        ? 'text-green-700 font-black'
        : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/70'
    }`;

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-lg border-b border-stone-200/80 shadow-sm py-2'
          : 'bg-transparent py-4'
      }`}
    >
      {/* XP progress bar */}
      {user && (
        <div
          className="absolute top-0 left-0 w-full h-[3px]"
          style={{ background: 'rgba(231,213,179,0.35)' }}
        >
          <motion.div
            className="h-full"
            style={{ background: 'linear-gradient(90deg,#166534 0%,#D97706 60%,#C2410C 100%)' }}
            initial={{ width: 0 }}
            animate={{ width: `${getLevelInfo().progress}%` }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-5 flex items-center justify-between gap-6 mt-0.5">

        {/* ── Logo ────────────────────────────────────────────────── */}
        <Link
          to="/"
          className="flex items-center gap-3 shrink-0 focus:outline-none group"
        >
          <div className="p-1.5 rounded-2xl transition-all duration-200 bg-white/80 border border-stone-200/70 shadow-sm group-hover:scale-105 group-hover:border-stone-300">
            <LogoIcon size={30} />
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="font-display font-black text-[1.15rem] tracking-widest text-stone-900 group-hover:text-green-800 transition-colors">
              DARE
            </span>
            <span className="text-[8.5px] font-bold text-stone-400 uppercase tracking-[0.22em] mt-0.5 font-mono">
              Digital Library
            </span>
          </div>
        </Link>

        {/* ── Desktop nav ─────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-0.5">

          {/* Browse */}
          <Link to="/library" className={navLinkClass('/library')}>
            Browse
            {isActive('/library') && (
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-[2.5px] rounded-full bg-green-600" />
            )}
          </Link>

          {/* Academic */}
          <Link to="/academic" className={navLinkClass('/academic')}>
            Academic
            {isActive('/academic') && (
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-[2.5px] rounded-full bg-green-600" />
            )}
          </Link>

          {/* BAKO AI — amber accent */}
          <Link
            to="/tutor"
            className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 focus:outline-none group ${
              isActive('/tutor')
                ? 'text-amber-700 font-black bg-amber-50'
                : 'text-amber-600 hover:text-amber-800 hover:bg-amber-50/70'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="text-base leading-none">🌳</span>
              BAKO AI
            </span>
            {isActive('/tutor') && (
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-[2.5px] rounded-full bg-amber-500" />
            )}
          </Link>

          {/* Research */}
          <Link to="/research" className={navLinkClass('/research')}>
            Research
            {isActive('/research') && (
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-[2.5px] rounded-full bg-green-600" />
            )}
          </Link>

          {/* Explore dropdown */}
          <div className="relative" ref={exploreRef}>
            <button
              onClick={() => setIsExploreOpen((v) => !v)}
              className={`relative flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 focus:outline-none ${
                isExploreOpen
                  ? 'bg-stone-100 text-stone-900'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/70'
              }`}
            >
              Explore
              <motion.span
                animate={{ rotate: isExploreOpen ? 180 : 0 }}
                transition={{ duration: 0.18 }}
                className="flex items-center"
              >
                <ChevronDown size={14} />
              </motion.span>
            </button>

            <AnimatePresence>
              {isExploreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute left-0 top-full mt-2.5 w-[340px] bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] ring-1 ring-stone-200 p-3 z-50"
                >
                  <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
                    Explore
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {EXPLORE_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors group/item"
                      >
                        <span className="text-xl leading-none mt-0.5">{item.emoji}</span>
                        <div>
                          <p className="text-sm font-semibold text-stone-800 group-hover/item:text-stone-900 transition-colors">
                            {item.label}
                          </p>
                          <p className="text-xs text-stone-400 mt-0.5 leading-snug">
                            {item.sub}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Global Search — center ────────────────────────────── */}
        <div className="flex-1 max-w-sm hidden lg:block">
          <GlobalSearch />
        </div>

        {/* ── Right side ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <>
              {/* XP / streak chip */}
              <div className="hidden sm:flex items-center gap-2.5 bg-stone-100/80 px-3 py-1.5 rounded-full border border-stone-200/60 select-none">
                <span className="text-xs font-bold text-orange-500" title="Daily streak">
                  🔥 {streak}
                </span>
                <span className="w-px h-3.5 bg-stone-300" />
                <span className="flex items-center gap-1 text-xs font-bold text-indigo-500" title="XP">
                  <Zap size={12} className="shrink-0" /> {xp}
                </span>
                <span className="flex items-center justify-center w-[18px] h-[18px] rounded-full bg-stone-800 text-white text-[9px] font-black">
                  {level}
                </span>
              </div>

              {/* Avatar + profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen((v) => !v)}
                  className="flex items-center gap-1.5 focus:outline-none group"
                  aria-label="Open profile menu"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-200/80 flex items-center justify-center text-amber-800 font-bold text-sm shadow-sm transition-all duration-150 group-hover:scale-105 group-hover:shadow-md active:scale-95">
                    {profile?.first_name?.[0]?.toUpperCase() || <User size={16} />}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-stone-400 transition-transform duration-150 ${isProfileOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.14, ease: 'easeOut' }}
                      className="absolute right-0 top-full mt-2.5 w-60 bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] ring-1 ring-stone-200 p-2 z-50"
                    >
                      {/* User info */}
                      <div className="px-3 py-2.5 mb-1 border-b border-stone-100">
                        <p className="font-bold text-stone-900 text-sm truncate">
                          {profile?.first_name ? `${profile.first_name}` : 'Student'}
                        </p>
                        <p className="text-xs text-stone-400 truncate mt-0.5">{user.email}</p>
                      </div>

                      {[
                        { to: '/dashboard',  Icon: LayoutDashboard, label: 'Dashboard' },
                        { to: '/history',    Icon: History,          label: 'Reading History' },
                        { to: '/leaderboard',Icon: Trophy,           label: 'Leaderboard' },
                        { to: '/settings',   Icon: Settings,         label: 'Settings' },
                      ].map(({ to, Icon, label }) => (
                        <Link
                          key={to}
                          to={to}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                        >
                          <Icon size={15} className="text-stone-400 shrink-0" />
                          {label}
                        </Link>
                      ))}

                      <div className="h-px bg-stone-100 my-1.5" />

                      <button
                        onClick={signOut}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
                      >
                        <LogOut size={15} className="shrink-0" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-full text-sm font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-full text-sm font-bold text-white transition-all duration-150 active:scale-95 shadow-sm"
                style={{ background: 'linear-gradient(135deg,#16a34a 0%,#15803d 100%)' }}
              >
                Join DARE
              </Link>
            </div>
          )}

          {/* Hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors focus:outline-none"
            onClick={() => setIsMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile overlay ───────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm bg-white z-50 flex flex-col shadow-2xl md:hidden"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <LogoIcon size={26} />
                  <span className="font-black text-base tracking-widest text-stone-900">DARE</span>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">

                {/* Search */}
                <div className="mb-3">
                  <GlobalSearch />
                </div>

                {/* Main links */}
                {[
                  { label: 'Browse',   href: '/library'  },
                  { label: 'Academic', href: '/academic' },
                  { label: 'Research', href: '/research' },
                ].map(({ label, href }) => (
                  <Link
                    key={href}
                    to={href}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold transition-colors ${
                      isActive(href)
                        ? 'bg-green-50 text-green-700'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {label}
                  </Link>
                ))}

                {/* BAKO AI */}
                <Link
                  to="/tutor"
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold transition-colors ${
                    isActive('/tutor')
                      ? 'bg-amber-50 text-amber-700'
                      : 'text-amber-600 hover:bg-amber-50/60'
                  }`}
                >
                  <span className="text-xl leading-none">🌳</span>
                  BAKO AI
                </Link>

                {/* Explore section */}
                <div className="mt-3 mb-1 px-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">Explore</p>
                </div>
                {EXPLORE_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive(item.href)
                        ? 'bg-green-50 text-green-700'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <span className="text-lg leading-none">{item.emoji}</span>
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-xs text-stone-400 font-normal">{item.sub}</p>
                    </div>
                  </Link>
                ))}

                <div className="h-px bg-stone-100 my-3" />

                {/* Auth section */}
                {user ? (
                  <>
                    {/* XP chip */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 rounded-xl mb-1">
                      <span className="text-sm font-bold text-orange-500">🔥 {streak} day streak</span>
                      <span className="ml-auto flex items-center gap-1 text-sm font-bold text-indigo-500">
                        <Zap size={14} /> {xp} XP
                      </span>
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-stone-800 text-white text-[10px] font-black">
                        {level}
                      </span>
                    </div>

                    {[
                      { to: '/dashboard',   Icon: LayoutDashboard, label: 'Dashboard' },
                      { to: '/history',     Icon: History,          label: 'Reading History' },
                      { to: '/leaderboard', Icon: Trophy,           label: 'Leaderboard' },
                      { to: '/settings',    Icon: Settings,         label: 'Settings' },
                    ].map(({ to, Icon, label }) => (
                      <Link
                        key={to}
                        to={to}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        <Icon size={18} className="text-stone-400 shrink-0" />
                        {label}
                      </Link>
                    ))}

                    <button
                      onClick={signOut}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold text-red-500 hover:bg-red-50 transition-colors text-left mt-1"
                    >
                      <LogOut size={18} className="shrink-0" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2.5 mt-1">
                    <Link
                      to="/login"
                      className="w-full py-3.5 rounded-xl font-bold text-center text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors text-base"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="w-full py-3.5 rounded-xl font-bold text-center text-white text-base shadow-md transition-all active:scale-[0.98]"
                      style={{ background: 'linear-gradient(135deg,#16a34a 0%,#15803d 100%)' }}
                    >
                      Join DARE
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
