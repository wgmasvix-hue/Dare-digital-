import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  User, 
  ChevronDown, 
  LogOut, 
  BookOpen, 
  History, 
  Settings, 
  LayoutDashboard,
  Microscope,
  Sprout,
  Stethoscope,
  Briefcase,
  GraduationCap,
  Cog,
  Scale,
  Feather,
  Cpu,
  Flame,
  Zap,
  Trophy,
  Globe,
  Compass,
  Library,
  Book,
  Search,
  ArrowRight,
  Database,
  Sparkles,
  Building2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGamification } from '../../context/GamificationContext';
import GlobalSearch from './GlobalSearch';
import ThemeToggle from '../common/ThemeToggle';
import LogoIcon from '../common/LogoIcon';
import styles from './NavBar.module.css';

const NAV_GROUPS = [
  {
    id: 'explore',
    label: 'Explore',
    icon: <Compass size={18} />,
    links: [
      { to: '/library', label: 'Main Library', icon: <Library size={16} /> },
      { to: '/openstax', label: 'Partner Resources', icon: <Globe size={16} /> },
      { to: '/gutenberg', label: 'Gutenberg Books', icon: <Book size={16} /> },
      { to: '/search', label: 'National Search', icon: <Search size={16} /> },
    ]
  },
  {
    id: 'portals',
    label: 'Portals',
    icon: <LayoutDashboard size={18} />,
    links: [
      { to: '/ai-textbooks', label: 'AI Textbooks', icon: <Cpu size={16} /> },
      { to: '/research', label: 'Research Portal', icon: <Microscope size={16} /> },
      { to: '/institutions', label: 'Institutions', icon: <Building2 size={16} /> },
      { to: '/vocational', label: 'Vocational Hub', icon: <Cog size={16} /> },
      { to: '/institutional', label: 'Institutional Admin', icon: <Briefcase size={16} /> },
      { to: '/dspace', label: 'DSpace Submission', icon: <Database size={16} /> },
      { to: '/dspace-explorer', label: 'DSpace Explorer', icon: <Search size={16} /> },
      { to: '/hbc-transformer', label: 'HBC Transformer', icon: <Sparkles size={16} /> },
      { to: '/ai-tools', label: 'AI Models & Tools', icon: <Zap size={16} /> },
    ]
  }
];

const FACULTIES = [
  { name: 'STEM', icon: Microscope, id: 'stem', color: '#3b82f6' },
  { name: 'Agriculture', icon: Sprout, id: 'agriculture', color: '#10b981' },
  { name: 'Health', icon: Stethoscope, id: 'health', color: '#ef4444' },
  { name: 'Business', icon: Briefcase, id: 'business', color: '#f59e0b' },
  { name: 'Education', icon: GraduationCap, id: 'education', color: '#8b5cf6' },
  { name: 'Engineering', icon: Cog, id: 'engineering', color: '#64748b' },
  { name: 'Law', icon: Scale, id: 'law', color: '#1e293b' },
  { name: 'Humanities', icon: Feather, id: 'humanities', color: '#ec4899' },
  { name: 'AI & Tech', icon: Cpu, id: 'ai-future-tech', color: '#06b6d4' },
];

export default function NavBar() {
  const { user, profile, institution, signOut } = useAuth();
  const { xp, streak, level, getLevelInfo } = useGamification();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobileMenuOpenRef = useRef(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navGroupsRef = useRef(null);
  const prevScrollY = useRef(0);
  const location = useLocation();

  useEffect(() => {
    isMobileMenuOpenRef.current = isMobileMenuOpen;
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (isMobileMenuOpenRef.current) return;
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
      setIsHidden(currentScrollY > prevScrollY.current && currentScrollY > 100);
      prevScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (navGroupsRef.current && !navGroupsRef.current.contains(event.target)) {
        setActiveGroup(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveGroup(null);
    setIsProfileOpen(false);
  }, [location]);

  const toggleGroup = (groupId) => {
    setActiveGroup(activeGroup === groupId ? null : groupId);
    setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setActiveGroup(null);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className={`${styles.nav} ${isScrolled ? styles.scrolled : ''} ${isHidden ? styles.hidden : ''}`}>
        {/* Knowledge Progress Bar */}
        {user && (
          <div className={styles.navProgressRail}>
            <motion.div 
              className={styles.navProgressBar}
              initial={{ width: 0 }}
              animate={{ width: `${getLevelInfo().progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        )}
        
        <div className={styles.container}>
          {/* Logo */}
          <Link to="/" className={styles.logoGroup}>
            <div className={styles.logoWrapper}>
              <LogoIcon size={32} className={styles.logoIcon} />
            </div>
            <div className={styles.logoText}>
              <span className={styles.dare}>DARE</span>
              <span className={styles.libraryLabel}>Library</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className={styles.desktopLinks} ref={navGroupsRef}>
            {NAV_GROUPS.map((group) => (
              <div key={group.id} className={styles.navGroup}>
                <button 
                  className={`${styles.groupTrigger} ${activeGroup === group.id ? styles.active : ''}`}
                  onClick={() => toggleGroup(group.id)}
                >
                  <span className={styles.groupIcon}>{group.icon}</span>
                  <span>{group.label}</span>
                  <ChevronDown size={14} className={`${styles.chevron} ${activeGroup === group.id ? styles.rotate : ''}`} />
                </button>

                <AnimatePresence>
                  {activeGroup === group.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.98, x: "-50%" }}
                      animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                      exit={{ opacity: 0, y: 10, scale: 0.98, x: "-50%" }}
                      className={styles.groupDropdown}
                    >
                      <div className={styles.dropdownGrid}>
                        <div className={styles.dropdownCol}>
                          <div className={styles.dropdownTitle}>
                            {group.icon}
                            <span>{group.label}</span>
                          </div>
                          <div className={styles.linksGrid}>
                            {group.links.map((link) => (
                              <Link key={link.to} to={link.to} className={`${styles.groupLink} ${isActive(link.to) ? styles.active : ''}`}>
                                <div className={styles.linkIcon}>{link.icon}</div>
                                <span>{link.label}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                        <div className={styles.dropdownCol}>
                          <div className={styles.dropdownTitle}>Featured</div>
                          <div className={styles.featuredCard}>
                            <div className={styles.featuredTitle}>Curated Collections</div>
                            <p className={styles.featuredDesc}>Zimbabwean academic resources and international journals.</p>
                            <Link to="/library?sort=featured" className={styles.featuredAction}>
                              <span>Browse Featured</span>
                              <ArrowRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            <Link to="/ai-tools" className={`${styles.link} ${isActive('/ai-tools') ? styles.active : ''}`}>
              <Sparkles size={16} className={styles.aiIcon} />
              <span>AI Tools</span>
            </Link>
            <Link to="/author" className={`${styles.link} ${isActive('/author') ? styles.active : ''}`}>Publish</Link>
          </div>

          {/* Search */}
          <div className={styles.searchWrapper}>
            <GlobalSearch />
          </div>

          {/* Right Section */}
          <div className={styles.authSection}>
            {user ? (
              <>
                <div className={styles.gamificationStats}>
                  <div className={styles.statPill} title="Daily Streak">
                    <Flame size={16} className={streak > 0 ? styles.activeStreak : ''} />
                    <span>{streak}</span>
                  </div>
                  <div className={styles.statPill} title="Experience Points">
                    <Zap size={16} className={styles.xpIcon} />
                    <span>{xp}</span>
                  </div>
                  <div className={styles.levelPill}>
                    <span className={styles.levelNum}>{level}</span>
                  </div>
                </div>

                <div className={styles.userProfile} ref={dropdownRef}>
                  <button className={styles.profileTrigger} onClick={toggleProfile}>
                    <div className={styles.avatar}>
                      {profile?.first_name?.[0] || <User size={18} />}
                    </div>
                    <div className={styles.userInfo}>
                      <p className={styles.userName}>{profile?.first_name || user.email.split('@')[0]}</p>
                      <div className={styles.instInfo}>
                        <span className={styles.instName}>{institution?.institution_name || 'Individual'}</span>
                        <span className={styles.tierBadge}>{profile?.role || 'Student'}</span>
                      </div>
                    </div>
                    <ChevronDown size={14} className={`${styles.chevron} ${isProfileOpen ? styles.rotate : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className={styles.dropdown}
                      >
                        <Link to="/dashboard" className={styles.dropdownItem}>
                          <LayoutDashboard size={16} />
                          <span>Dashboard</span>
                        </Link>
                        <Link to="/leaderboard" className={styles.dropdownItem}>
                          <Trophy size={16} />
                          <span>Leaderboard</span>
                        </Link>
                        <Link to="/history" className={styles.dropdownItem}>
                          <History size={16} />
                          <span>Reading History</span>
                        </Link>
                        <Link to="/settings" className={styles.dropdownItem}>
                          <Settings size={16} />
                          <span>Settings</span>
                        </Link>
                        <div className={styles.divider} />
                        <button onClick={signOut} className={`${styles.dropdownItem} ${styles.signOut}`}>
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className={styles.authButtons}>
                <Link to="/login" className={styles.signIn}>Sign In</Link>
                <Link to="/register" className={styles.register}>Join DARE</Link>
              </div>
            )}

            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            <button 
              className={styles.mobileToggle}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Key Areas Rail */}
        <div className={styles.keyAreasBar}>
          <div className={styles.keyAreasContainer}>
            {FACULTIES.map((faculty) => (
              <Link 
                key={faculty.id} 
                to={`/library?faculty=${faculty.name}`} 
                className={styles.keyAreaItem}
              >
                <div className={styles.keyAreaIcon} style={{ backgroundColor: `${faculty.color}15`, color: faculty.color }}>
                  <faculty.icon size={16} />
                </div>
                <span className={styles.keyAreaName}>{faculty.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.mobileOverlay}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={styles.mobileDrawer}
              >
                <div className={styles.mobileContent}>
                  {user && (
                    <div className={styles.mobileUserCard}>
                      <div className={styles.mobileUserHeader}>
                        <div className={styles.mobileAvatar}>
                          {profile?.first_name?.[0] || <User size={24} />}
                        </div>
                        <div className={styles.mobileUserInfo}>
                          <p className={styles.mobileUserName}>{profile?.first_name || user.email.split('@')[0]}</p>
                          <p className={styles.mobileUserEmail}>{user.email}</p>
                        </div>
                      </div>
                      
                      <div className={styles.mobileStatsGrid}>
                        <div className={styles.mobileStatBox}>
                          <Flame size={20} className={streak > 0 ? styles.activeStreak : ''} />
                          <span className={styles.mobileStatVal}>{streak}</span>
                          <span className={styles.mobileStatLabel}>Streak</span>
                        </div>
                        <div className={styles.mobileStatBox}>
                          <Zap size={20} className={styles.xpIcon} />
                          <span className={styles.mobileStatVal}>{xp}</span>
                          <span className={styles.mobileStatLabel}>XP</span>
                        </div>
                        <div className={styles.mobileStatBox}>
                          <Trophy size={20} className="text-amber-500" />
                          <span className={styles.mobileStatVal}>{level}</span>
                          <span className={styles.mobileStatLabel}>Level</span>
                        </div>
                      </div>

                      <div className={styles.mobileLevelProgress}>
                        <div className={styles.mobileLevelInfo}>
                          <span>{getLevelInfo().current.title}</span>
                          <span className={styles.textMuted}>Next: {getLevelInfo().next.title}</span>
                        </div>
                        <div className={styles.mobileProgressBarRail}>
                          <motion.div 
                            className={styles.mobileProgressBar}
                            initial={{ width: 0 }}
                            animate={{ width: `${getLevelInfo().progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={styles.mobileSection}>
                    <h3 className={styles.mobileSectionTitle}>Explore Library</h3>
                    <div className={styles.mobileNavGrid}>
                      <Link to="/ai-tools" className={styles.mobileNavItem}>
                        <div className={styles.mobileNavIcon} style={{ color: 'var(--amber)' }}><Zap size={20} /></div>
                        <span>AI Tools</span>
                      </Link>
                      {NAV_GROUPS.flatMap(g => g.links).map(link => (
                        <Link key={link.to} to={link.to} className={styles.mobileNavItem}>
                          <div className={styles.mobileNavIcon}>{link.icon}</div>
                          <span>{link.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className={styles.mobileSection}>
                    <h3 className={styles.mobileSectionTitle}>Categories</h3>
                    <div className={styles.mobileKeyAreasGrid}>
                      {FACULTIES.map((faculty) => (
                        <Link 
                          key={faculty.id} 
                          to={`/library?faculty=${faculty.name}`} 
                          className={styles.mobileKeyAreaItem}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div className={styles.mobileKeyAreaIcon} style={{ backgroundColor: `${faculty.color}15`, color: faculty.color }}>
                            <faculty.icon size={18} />
                          </div>
                          <span className={styles.mobileKeyAreaName}>{faculty.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className={styles.mobileSection}>
                    <h3 className={styles.mobileSectionTitle}>Theme</h3>
                    <div className="px-2">
                      <ThemeToggle />
                    </div>
                  </div>

                  {!user && (
                    <div className={styles.mobileAuth}>
                      <Link to="/login" className={styles.mobileSignIn}>Sign In</Link>
                      <Link to="/register" className={styles.mobileRegister}>Join DARE</Link>
                    </div>
                  )}

                  {user && (
                    <div className={styles.mobileSection}>
                      <h3 className={styles.mobileSectionTitle}>Account</h3>
                      <Link to="/dashboard" className={styles.mobileLink}>Dashboard</Link>
                      <Link to="/profile" className={styles.mobileLink}>Profile</Link>
                      <Link to="/settings" className={styles.mobileLink}>Settings</Link>
                      <button onClick={signOut} className={`${styles.mobileLink} ${styles.signOut}`} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: '0.5rem 0' }}>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
