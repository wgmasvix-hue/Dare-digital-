import { useState, useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import NavBar from './components/layout/NavBar';
import Breadcrumbs from './components/layout/Breadcrumbs';
import Footer from './components/layout/Footer';
import FloatingDara from './components/common/FloatingDara';

export function ProtectedRoute({ children, roles = [] }) {
  return children;
}

export default function App() {
  const location = useLocation();
  const isReader = location.pathname.startsWith('/reader/');
  
  const [darkMode, setDarkMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dare_darkMode')) || false; } catch { return false; }
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    localStorage.setItem('dare_darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <AuthProvider>
      <div className={`app-wrapper ${darkMode ? 'dark-mode' : ''}`} style={{ 
        background: 'var(--color-bg-base)', 
        color: 'var(--text-main)', 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {!isReader && <NavBar darkMode={darkMode} setDarkMode={setDarkMode} />}
        {!isReader && location.pathname !== '/' && <Breadcrumbs />}
        
        <main style={{ flex: 1, position: 'relative' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ width: '100%', height: '100%' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {!isReader && <Footer />}
        <FloatingDara />
        
        {/* Scroll to Top Button */}
        <button 
          className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`}
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <ChevronUp size={24} />
        </button>
      </div>
    </AuthProvider>
  );
}
