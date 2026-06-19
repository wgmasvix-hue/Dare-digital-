import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, User, ChevronDown, LogOut, History, Settings, 
  LayoutDashboard, Trophy, Search, Sparkles, Library, FlaskConical, Zap, Database, Globe, ClipboardCheck
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGamification } from '../../context/GamificationContext';
import GlobalSearch from './GlobalSearch';
import LogoIcon from '../common/LogoIcon';

export default function NavBar() {
  const { user, profile, signOut } = useAuth();
  const { xp, streak, level, getLevelInfo } = useGamification();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm py-2' : 'bg-transparent py-4'
      }`}
    >
      {/* Knowledge Progress Bar (Top Edge) */}
      {user && (
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
          <motion.div 
            className="h-full bg-gradient-to-r from-teal-400 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${getLevelInfo().progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-8 mt-1">
        <Link to="/" className="flex items-center gap-3 shrink-0 focus:outline-none group">
          <div className="p-1.5 rounded-2xl transition-all duration-300 bg-slate-50 border border-slate-200/60 shadow-inner group-hover:scale-105 group-hover:bg-white group-hover:border-slate-300">
             <LogoIcon size={32} />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-display font-black text-xl leading-none tracking-wider text-slate-900 group-hover:text-primary transition-colors">
              DARE
            </span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5 font-mono">
              Digital Library
            </span>
          </div>
        </Link>

        {/* Desktop Main Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/library" className="px-4 py-2 rounded-full font-bold text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-2">
            <Library size={16} /> Browse
          </Link>
          <Link to="/open-books" className="px-4 py-2 rounded-full font-bold text-sm text-slate-600 hover:text-slate-900 hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center gap-2">
            <Globe size={16} className="text-teal-550 shrink-0" /> 1M+ Books
          </Link>
          <Link to="/dspace-explorer" className="px-4 py-2 rounded-full font-bold text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-2">
            <Database size={16} /> Repository
          </Link>
          <Link to="/tutor" className="px-4 py-2 rounded-full font-bold text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" /> DARA Tutor
          </Link>
          <Link to="/research" className="px-4 py-2 rounded-full font-bold text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-2">
            <FlaskConical size={16} /> Research
          </Link>
          <Link to="/global-repos" className="px-4 py-2 rounded-full font-bold text-sm text-teal-600 hover:text-teal-800 hover:bg-teal-50 transition-colors flex items-center gap-2 border border-teal-200 rounded-full">
            <Globe size={16} /> Global Repos
          </Link>
          <Link to="/teacher-tools" className="px-4 py-2 rounded-full font-bold text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-2">
            <ClipboardCheck size={16} className="text-emerald-600" /> Lesson Planner
          </Link>
        </div>

        {/* Search Bar - Center */}
        <div className="flex-1 max-w-md hidden lg:block">
          <GlobalSearch />
        </div>

        {/* Right Auth/Profile Config */}
        <div className="flex items-center gap-4 shrink-0">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <div className="flex items-center gap-1 text-xs font-bold text-orange-600" title="Daily Streak">
                  🔥 {streak}
                </div>
                <div className="w-[1px] h-4 bg-slate-300"></div>
                <div className="flex items-center gap-1 text-xs font-bold text-blue-600" title="Experience Points">
                  <Zap size={14} /> {xp}
                </div>
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black">
                  {level}
                </div>
              </div>

              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 font-bold transition-transform hover:scale-105 active:scale-95">
                    {profile?.first_name?.[0]?.toUpperCase() || <User size={20} />}
                  </div>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 p-2"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 mb-2">
                        <p className="font-bold text-slate-900 truncate">{profile?.first_name || 'Student'}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 rounded-xl text-sm font-medium text-slate-700 transition-colors">
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                      <Link to="/history" className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 rounded-xl text-sm font-medium text-slate-700 transition-colors">
                        <History size={16} /> Reading History
                      </Link>
                      <Link to="/leaderboard" className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 rounded-xl text-sm font-medium text-slate-700 transition-colors">
                        <Trophy size={16} /> Leaderboard
                      </Link>
                      <Link to="/settings" className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 rounded-xl text-sm font-medium text-slate-700 transition-colors">
                        <Settings size={16} /> Settings
                      </Link>
                      <div className="h-px bg-slate-100 my-2"></div>
                      <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 rounded-xl text-sm font-medium text-red-600 transition-colors text-left">
                        <LogOut size={16} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/login" className="px-5 py-2.5 rounded-full font-bold text-sm text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent">
                Sign In
              </Link>
              <Link to="/register" className="px-5 py-2.5 rounded-full font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-transform active:scale-95 cursor-pointer shadow-sm border border-slate-800">
                Join DARE
              </Link>
            </div>
          )}

          <button 
            className="sm:hidden focus:outline-none p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden bg-white border-b border-slate-200 px-6 py-6 overflow-hidden shadow-xl"
          >
            <div className="flex flex-col gap-4">
              <div className="block lg:hidden mb-4 border border-slate-200 rounded-xl p-2 bg-slate-50">
                <GlobalSearch />
              </div>
              <Link to="/library" className="flex items-center gap-3 font-bold text-lg text-slate-900 py-2"><Library size={20} /> Browse Library</Link>
              <Link to="/open-books" className="flex items-center gap-3 font-bold text-lg text-slate-900 py-2"><Globe size={20} className="text-teal-500" /> 1M+ Open Source Books</Link>
              <Link to="/dspace-explorer" className="flex items-center gap-3 font-bold text-lg text-slate-900 py-2"><Database size={20} /> Institutional Repository</Link>
              <Link to="/tutor" className="flex items-center gap-3 font-bold text-lg text-slate-900 py-2"><Sparkles size={20} className="text-amber-500" /> DARA AI Tutor</Link>
              <Link to="/research" className="flex items-center gap-3 font-bold text-lg text-slate-900 py-2"><FlaskConical size={20} /> Research Portal</Link>
              <Link to="/global-repos" className="flex items-center gap-3 font-bold text-lg text-teal-600 py-2"><Globe size={20} className="text-teal-500" /> Global Repositories</Link>
              <Link to="/teacher-tools" className="flex items-center gap-3 font-bold text-lg text-slate-900 py-2"><ClipboardCheck size={20} className="text-emerald-500" /> Lesson Planner</Link>
              <hr className="border-slate-100 my-2" />
              {!user ? (
                <div className="flex flex-col gap-3 mt-2">
                  <Link to="/login" className="w-full py-3 rounded-full font-bold text-center bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors">Sign In</Link>
                  <Link to="/register" className="w-full py-3 rounded-full font-bold text-center bg-teal-500 text-white hover:bg-teal-600 transition-colors shadow-md text-lg">Join DARE</Link>
                </div>
              ) : (
                 <>
                   <Link to="/dashboard" className="font-bold text-lg text-slate-900 py-2">Dashboard</Link>
                   <Link to="/settings" className="font-bold text-lg text-slate-900 py-2">Settings</Link>
                   <button onClick={signOut} className="font-bold text-lg text-red-500 text-left py-2">Sign Out</button>
                 </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
