import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, ChevronDown, LogOut, BookOpen, History, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import styles from './NavBar.module.css';

export default function NavBar() {
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

  const navLinks = [
    { name: 'Library', path: '/library' },
    { name: 'Browse', path: '/browse' },
    { name: 'For Institutions', path: '/institutions' },
    { name: 'Publish With Us', path: '/author' },
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
            <div className={styles.logoText}>
              <span className={styles.dare}>Dare</span>
              <span className={styles.period}>.</span>
            </div>
            <span className={styles.tagline}>Digital Library</span>
          </Link>

          {/* Desktop Links */}
          <div className={styles.desktopLinks}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${styles.link} ${isActive(link.path) ? styles.active : ''}`}
              >
                {link.name}
                {isActive(link.path) && <div className={styles.underline} />}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className={styles.authSection}>
            {!user ? (
              <div className={styles.authButtons}>
                <Link to="/login" className={styles.signIn}>Sign In</Link>
                <Link to="/register" className={styles.register}>Register</Link>
              </div>
            ) : (
              <div className={styles.userProfile} ref={dropdownRef}>
                <button onClick={toggleDropdown} className={styles.profileTrigger}>
                  <div className={styles.userInfo}>
                    <p className={styles.userName}>{profile?.first_name} {profile?.last_name}</p>
                    <div className={styles.instInfo}>
                      <span className={styles.instName}>{institution?.short_name || 'Individual'}</span>
                      {institution?.subscription_tier && (
                        <span className={styles.tierBadge}>{institution.subscription_tier}</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.avatar}>
                    <User size={20} color="var(--soil)" />
                  </div>
                  <ChevronDown size={16} className={`${styles.chevron} ${isDropdownOpen ? styles.rotate : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className={styles.dropdown}>
                    <Link to="/dashboard" className={styles.dropdownItem}>
                      <BookOpen size={16} />
                      <span>My Books</span>
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
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button className={styles.mobileToggle} onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`${styles.mobileDrawer} ${isMobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.mobileContent}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${styles.mobileLink} ${isActive(link.path) ? styles.mobileActive : ''}`}
            >
              {link.name}
            </Link>
          ))}
          {!user && (
            <div className={styles.mobileAuth}>
              <Link to="/login" className={styles.mobileSignIn}>Sign In</Link>
              <Link to="/register" className={styles.mobileRegister}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
