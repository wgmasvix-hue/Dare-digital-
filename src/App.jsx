import { Outlet, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "motion/react"
import NavBar from "./components/layout/NavBar"
import Footer from "./components/layout/Footer"
import TopProgressBar from "./components/ui/TopProgressBar"
import ScrollUpFAB from "./components/ui/ScrollUpFAB"
import { ToastProvider } from "./context/ToastContext"
import { isSupabaseConfigured } from "./lib/supabase"

const PageWrapper = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="flex-1 w-full flex flex-col relative"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  const isConfigured = isSupabaseConfigured();

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-teal-500/30">
        <TopProgressBar />
        {!isConfigured && (
          <div className="bg-amber-100 border-b border-amber-200 text-amber-800 px-4 py-3 text-center text-sm">
            <strong>Setup Required:</strong> Missing Vercel Environment Variables (<code>VITE_SUPABASE_URL</code> or <code>VITE_SUPABASE_ANON_KEY</code>).
            Configure these in your Vercel project settings to enable backend features.
          </div>
        )}
        <NavBar />
        <main className="flex-1 w-full flex flex-col relative">
          <PageWrapper>
            <Outlet />
          </PageWrapper>
        </main>
        <Footer />
        <ScrollUpFAB />
      </div>
    </ToastProvider>
  );
}
