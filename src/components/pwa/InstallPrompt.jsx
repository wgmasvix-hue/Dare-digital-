import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Smartphone } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed this session or if running as installed PWA
    if (dismissed) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (window.navigator.standalone === true) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Small delay so the page has settled before the prompt appears
      setTimeout(() => setVisible(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, [dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
    setInstalling(false);
    if (outcome === 'dismissed') setDismissed(true);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 pb-safe"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-[0_-4px_32px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden">
            {/* Teal accent bar */}
            <div className="h-1 bg-gradient-to-r from-teal-400 to-emerald-500" />

            <div className="p-5 flex items-center gap-4">
              {/* App icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-md">
                <img src="/icons/icon-96x96.png" alt="DARE" className="w-10 h-10 rounded-xl" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-900 text-base leading-tight">Install DARE Library</p>
                <p className="text-slate-500 text-xs mt-0.5 leading-snug">
                  Add to home screen for offline access &amp; faster loading
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                    <Smartphone size={10} /> Works offline
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">· No app store needed</span>
                </div>
              </div>

              {/* Dismiss */}
              <button
                onClick={handleDismiss}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors shrink-0"
                aria-label="Dismiss"
              >
                <X size={18} />
              </button>
            </div>

            {/* Action buttons */}
            <div className="px-5 pb-5 flex gap-3">
              <button
                onClick={handleDismiss}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Not now
              </button>
              <button
                onClick={handleInstall}
                disabled={installing}
                className="flex-1 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors active:scale-[0.98] disabled:opacity-70"
              >
                <Download size={15} />
                {installing ? 'Installing…' : 'Install App'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
