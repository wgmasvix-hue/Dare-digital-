import React from 'react';
import { Sun, Moon, Coffee } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { motion } from 'motion/react';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'sepia', icon: Coffee, label: 'Sepia' },
  ] as const;

  return (
    <div className="flex items-center bg-bg-subtle p-1 rounded-full border border-border">
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = theme === t.id;
        
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`relative p-2 rounded-full transition-all duration-300 ${
              isActive ? 'text-primary' : 'text-text-muted hover:text-text-main'
            }`}
            title={t.label}
          >
            {isActive && (
              <motion.div
                layoutId="activeTheme"
                className="absolute inset-0 bg-bg-base shadow-md rounded-full"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <Icon className="w-4 h-4 relative z-10" />
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
