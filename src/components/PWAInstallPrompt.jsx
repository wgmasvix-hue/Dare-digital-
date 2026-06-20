import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    if (ios) {
      const isStandalone = window.navigator.standalone === true;
      const dismissed = sessionStorage.getItem('pwa-ios-dismissed');
      if (!isStandalone && !dismissed) setShow(true);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = sessionStorage.getItem('pwa-dismissed');
      if (!dismissed) setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShow(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem(isIOS ? 'pwa-ios-dismissed' : 'pwa-dismissed', '1');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-stone-900 text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3 border border-white/10">
        <div className="w-11 h-11 rounded-xl bg-green-800 flex items-center justify-center shrink-0">
          <Smartphone size={22} className="text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">Install DARE Library</p>
          {isIOS ? (
            <p className="text-xs text-stone-400 mt-0.5">
              Tap <span className="text-white font-semibold">Share</span> then <span className="text-white font-semibold">"Add to Home Screen"</span> to install.
            </p>
          ) : (
            <p className="text-xs text-stone-400 mt-0.5">
              Install as an app — works offline, no app store needed.
            </p>
          )}
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-xs rounded-lg transition-colors"
            >
              <Download size={13} />
              Install App
            </button>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-stone-500 hover:text-stone-300 transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
