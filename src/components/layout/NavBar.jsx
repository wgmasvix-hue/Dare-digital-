import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  User, 
  ChevronDown, 
  LogOut, 
  BookOpen, 
  History, 
  Settings, 
  Moon, 
  Sun, 
  PenTool, 
  Wrench, 
  LayoutDashboard,
  Microscope,
  Sprout,
  Stethoscope,
  Briefcase,
  GraduationCap,
  Cog,
  Scale,
  Feather,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import GlobalSearch from './GlobalSearch';
import styles from './NavBar.module.css';

export default function NavBar({ darkMode, setDarkMode }) {
  const { user, profile, institution, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const resourceLinks = [
    { name: 'Main Library', path: '/library' },
    { name: 'Partner Resources', path: '/openstax' },
  ];

  const portalLinks = [
    { name: 'AI Textbooks', path: '/ai-textbooks' },
    { name: 'Research Portal (IDR)', path: '/research' },
    { name: 'Vocational Hub', path: '/vocational' },
    { name: 'Vocational Tools', path: '/vocational-tools' },
    { name: 'Teachers Colleges', path: '/teachers-colleges' },
    { name: 'Teacher Tools', path: '/teacher-tools' },
    { name: 'Author Portal', path: '/author' },
    { name: 'Institutional Portal', path: '/institutional' },
  ];

  const institutionalLinks = [
    { name: 'Institutional Portal', path: '/institutional' },
    { name: 'Teachers Colleges', path: '/teachers-colleges' },
    { name: 'Polytechnic & Vocational', path: '/vocational' },
  ];

  const authorLinks = [
    { name: 'Publish With Us', path: '/author' },
  ];

  const faculties = [
    { name: 'STEM', icon: Microscope, id: 'stem', color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Agriculture', icon: Sprout, id: 'agriculture', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Health', icon: Stethoscope, id: 'health', color: 'text-rose-600', bg: 'bg-rose-50' },
    { name: 'Business', icon: Briefcase, id: 'business', color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Education', icon: GraduationCap, id: 'education', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Engineering', icon: Cog, id: 'engineering', color: 'text-slate-600', bg: 'bg-slate-50' },
    { name: 'Law', icon: Scale, id: 'law', color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'Humanities', icon: Feather, id: 'humanities', color: 'text-orange-600', bg: 'bg-orange-50' },
    { name: 'AI & Tech', icon: Cpu, id: 'ai-future-tech', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  ];

  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  return (
    <>
      <nav className={`${styles.nav} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.container}>
          {/* Logo */}
          <Link to="/" className={styles.logoGroup}>
            <div className={styles.logoIcon}>
              <div className={styles.bookIcon}>
                <div className={styles.pageLeft}></div>
                <div className={styles.pageRight}></div>
              </div>
            </div>
            <div className={styles.logoText}>
              <span className={styles.dare}>DARE</span>
              <div className={styles.subText}>
                <span className={styles.digital}>DIGITAL</span>
                <span className={styles.library}>LIBRARY</span>
              </div>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className={styles.desktopLinks}>
            <Link to="/" className={`${styles.link} ${isActive('/') ? styles.active : ''}`}>Home</Link>
            
            <Link 
              to="/dashboard" 
              className={`${styles.link} ${isActive('/dashboard') ? styles.active : ''}`}
            >
              Dashboard
            </Link>

            <div className={styles.navGroup}>
              <button className={`${styles.groupTrigger} ${location.pathname.startsWith('/library') || location.pathname.startsWith('/openstax') ? styles.active : ''}`}>
                Resources <ChevronDown size={14} />
              </button>
              <div className={styles.groupDropdown}>
                {resourceLinks.map((link) => (
                  <Link key={link.path} to={link.path} className={`${styles.groupLink} ${isActive(link.path) ? styles.active : ''}`}>
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className={styles.navGroup}>
              <button className={`${styles.groupTrigger} ${location.pathname.startsWith('/library') && location.search.includes('faculty') ? styles.active : ''}`}>
                Subjects <ChevronDown size={14} />
              </button>
              <div className={styles.groupDropdown}>
                {faculties.map((faculty) => (
                  <Link 
                    key={faculty.id} 
                    to={`/library?faculty=${faculty.name}`} 
                    className={`${styles.groupLink} ${location.search.includes(`faculty=${faculty.name}`) ? styles.active : ''}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <faculty.icon size={16} />
                    {faculty.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className={styles.navGroup}>
              <button className={`${styles.groupTrigger} ${portalLinks.some(link => isActive(link.path)) ? styles.active : ''}`}>
                Portals <ChevronDown size={14} />
              </button>
              <div className={styles.groupDropdown}>
                {portalLinks.map((link) => (
                  <Link key={link.path} to={link.path} className={`${styles.groupLink} ${isActive(link.path) ? styles.active : ''}`}>
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className={styles.navGroup}>
              <button className={`${styles.groupTrigger} ${location.pathname.startsWith('/teachers-colleges') || location.pathname.startsWith('/vocational') || location.pathname.startsWith('/institutional') ? styles.active : ''}`}>
                Institutions <ChevronDown size={14} />
              </button>
              <div className={styles.groupDropdown}>
                {institutionalLinks.map((link) => (
                  <Link key={link.path} to={link.path} className={`${styles.groupLink} ${isActive(link.path) ? styles.active : ''}`}>
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link to="/author" className={`${styles.link} ${isActive('/author') ? styles.active : ''}`}>Publish</Link>
          </div>

          {/* Global Search */}
          <div className={styles.searchWrapper}>
            <GlobalSearch />
          </div>

          {/* Auth Section */}
          <div className={styles.authSection}>
            {user ? (
              <div className={styles.userProfile} ref={dropdownRef}>
                <button className={styles.profileTrigger} onClick={toggleDropdown}>
                  <div className={styles.userInfo}>
                    <p className={styles.userName}>
                      {profile?.first_name || user.email.split('@')[0]}
                    </p>
                    <div className={styles.instInfo}>
                      <span className={styles.instName}>
                        {institution?.institution_name || 'Individual'}
                      </span>
                      <span className={styles.tierBadge}>
                        {profile?.role || 'Student'}
                      </span>
                    </div>
                  </div>
                  <div className={styles.avatar}>
                    <User size={20} />
                  </div>
                  <ChevronDown className={`${styles.chevron} ${isDropdownOpen ? styles.rotate : ''}`} size={16} />
                </button>

                {isDropdownOpen && (
                  <div className={styles.dropdown}>
                    <Link to="/dashboard" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                      <LayoutDashboard size={18} /> Dashboard
                    </Link>
                    {profile?.role === 'admin' && (
                      <Link to="/admin" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                        <Settings size={18} /> Admin Portal
                      </Link>
                    )}
                    <Link to="/history" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                      <History size={18} /> Reading History
                    </Link>
                    <Link to="/settings" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                      <Settings size={18} /> Settings
                    </Link>
                    <div className={styles.divider} />
                    <button 
                      onClick={() => {
                        signOut();
                        setIsDropdownOpen(false);
                      }} 
                      className={`${styles.dropdownItem} ${styles.signOut}`}
                    >
                      <LogOut size={18} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.authButtons}>
                <Link to="/login" className={styles.signIn}>Sign In</Link>
                <Link to="/register" className={styles.register}>Register</Link>
              </div>
            )}

            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={styles.themeToggle}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Mobile Menu Toggle */}
            <button className={styles.mobileToggle} onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Key Areas Bar */}
        <div className={styles.keyAreasBar}>
          <div className={styles.keyAreasContainer}>
            {faculties.map((faculty) => (
              <Link 
                key={faculty.id} 
                to={`/library?faculty=${faculty.name}`}
                className={styles.keyAreaItem}
                title={faculty.name}
              >
                <div className={`${styles.keyAreaIcon} ${faculty.bg} ${faculty.color}`}>
                  <faculty.icon size={18} />
                </div>
                <span className={styles.keyAreaName}>{faculty.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`${styles.mobileDrawer} ${isMobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.mobileContent}>
          <div className={styles.mobileSearch}>
            <GlobalSearch />
          </div>
          
          <div className={styles.mobileSection}>
            <Link to="/" className={`${styles.mobileLink} ${isActive('/') ? styles.active : ''}`}>
              Home
            </Link>
            <Link 
              to="/dashboard" 
              className={`${styles.mobileLink} ${isActive('/dashboard') ? styles.active : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
          </div>

          <div className={styles.mobileSection}>
            <h3 className={styles.mobileSectionTitle}>Subjects</h3>
            <div className={styles.mobileKeyAreasGrid}>
              {faculties.map((faculty) => (
                <Link 
                  key={faculty.id} 
                  to={`/library?faculty=${faculty.name}`}
                  className={styles.mobileKeyAreaItem}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className={`${styles.mobileKeyAreaIcon} ${faculty.bg} ${faculty.color}`}>
                    <faculty.icon size={18} />
                  </div>
                  <span className={styles.mobileKeyAreaName}>{faculty.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className={styles.mobileSection}>
            <h3 className={styles.mobileSectionTitle}>Portals</h3>
            {portalLinks.map((link) => (
              <Link key={link.path} to={link.path} className={`${styles.mobileLink} ${isActive(link.path) ? styles.active : ''}`}>
                {link.name}
              </Link>
            ))}
          </div>

          <div className={styles.mobileSection}>
            <h3 className={styles.mobileSectionTitle}>Resources</h3>
            {resourceLinks.map((link) => (
              <Link key={link.path} to={link.path} className={`${styles.mobileLink} ${isActive(link.path) ? styles.active : ''}`}>
                {link.name}
              </Link>
            ))}
          </div>

          <div className={styles.mobileSection}>
            <h3 className={styles.mobileSectionTitle}>Institutions</h3>
            {institutionalLinks.map((link) => (
              <Link key={link.path} to={link.path} className={`${styles.mobileLink} ${isActive(link.path) ? styles.active : ''}`}>
                {link.name}
              </Link>
            ))}
          </div>

          <div className={styles.mobileSection}>
            <h3 className={styles.mobileSectionTitle}>Publishing</h3>
            {authorLinks.map((link) => (
              <Link key={link.path} to={link.path} className={`${styles.mobileLink} ${isActive(link.path) ? styles.active : ''}`}>
                {link.name}
              </Link>
            ))}
          </div>

          {user ? (
            <div className={styles.mobileUserLinks}>
              <div className={styles.divider} style={{ margin: '16px 0', background: 'rgba(255,255,255,0.1)' }} />
              <Link to="/dashboard" className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                <BookOpen size={20} /> My Books
              </Link>
              <Link to="/history" className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                <History size={20} /> Reading History
              </Link>
              <Link to="/settings" className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Settings size={20} /> Settings
              </Link>
              <button 
                onClick={() => {
                  signOut();
                  setIsMobileMenuOpen(false);
                }} 
                className={`${styles.mobileLink} ${styles.signOut}`}
                style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: 0 }}
              >
                <LogOut size={20} /> Sign Out
              </button>
            </div>
          ) : (
            <div className={styles.mobileAuth}>
              <Link to="/login" className={styles.mobileSignIn} onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className={styles.mobileRegister} onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
