import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "motion/react"
import { X } from "lucide-react"
import NavBar from "./components/layout/NavBar"
import Footer from "./components/layout/Footer"
import { isSupabaseConfigured } from "./lib/supabase"

const PageWrapper = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="flex-1 w-full flex flex-col relative"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  const isConfigured = isSupabaseConfigured();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-teal-500/30">
      {!isConfigured && !bannerDismissed && (
        <div className="relative flex items-center justify-center gap-3 bg-slate-900 text-slate-300 px-4 py-2 text-xs">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
          <span>
            <span className="font-semibold text-white">Dev mode —</span>{" "}
            Add <code className="bg-slate-700 px-1 py-0.5 rounded text-amber-300">VITE_SUPABASE_URL</code> &amp;{" "}
            <code className="bg-slate-700 px-1 py-0.5 rounded text-amber-300">VITE_SUPABASE_ANON_KEY</code> to unlock backend features.
          </span>
          <button
            onClick={() => setBannerDismissed(true)}
            className="absolute right-3 p-1 hover:text-white transition-colors rounded"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}
      <NavBar />
      <main className="flex-1 w-full flex flex-col relative w-full h-full">
        <PageWrapper>
          <Outlet />
        </PageWrapper>
      </main>
      <Footer />
    </div>
  )
}
