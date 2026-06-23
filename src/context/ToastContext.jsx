import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

const CONFIG = {
  success: { icon: Check,         cls: 'border-emerald-300 text-emerald-800', iconCls: 'bg-emerald-100 text-emerald-600' },
  error:   { icon: AlertCircle,   cls: 'border-red-300 text-red-800',         iconCls: 'bg-red-100 text-red-500' },
  warning: { icon: AlertTriangle, cls: 'border-amber-300 text-amber-800',     iconCls: 'bg-amber-100 text-amber-500' },
  info:    { icon: Info,          cls: 'border-teal-300 text-teal-800',       iconCls: 'bg-teal-100 text-teal-600' },
};

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback(({ message, type = 'success', duration = 3500 }) => {
    const id = ++nextId;
    setToasts(prev => [...prev.slice(-3), { id, message, type }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const toast = {
    show,
    success: (msg, opts) => show({ message: msg, type: 'success', ...opts }),
    error:   (msg, opts) => show({ message: msg, type: 'error',   ...opts }),
    warning: (msg, opts) => show({ message: msg, type: 'warning', ...opts }),
    info:    (msg, opts) => show({ message: msg, type: 'info',    ...opts }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 z-[9998] flex flex-col gap-2 items-center sm:items-end pointer-events-none">
        <AnimatePresence initial={false}>
          {toasts.map(t => {
            const { icon: Icon, cls, iconCls } = CONFIG[t.type] || CONFIG.info;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0,  scale: 1 }}
                exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className={`pointer-events-auto flex items-center gap-3 w-[320px] max-w-[90vw] px-4 py-3 rounded-2xl border bg-white/95 backdrop-blur-md shadow-lg shadow-slate-200/60 ${cls}`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${iconCls}`}>
                  <Icon size={14} />
                </span>
                <p className="text-sm font-semibold flex-1 leading-snug">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 opacity-40 hover:opacity-80 transition-opacity p-0.5"
                  aria-label="Dismiss"
                >
                  <X size={13} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
