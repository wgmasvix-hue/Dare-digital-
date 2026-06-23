import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function TopProgressBar() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let t1, t2, t3;
    setVisible(true);
    setWidth(0);
    t1 = setTimeout(() => setWidth(40), 20);
    t2 = setTimeout(() => setWidth(75), 300);
    t3 = setTimeout(() => {
      setWidth(100);
      setTimeout(() => setVisible(false), 300);
    }, 600);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none"
        >
          <div
            className="h-full bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 shadow-[0_0_8px_2px_rgba(20,184,166,0.4)] transition-all duration-500 ease-out"
            style={{ width: `${width}%` }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
