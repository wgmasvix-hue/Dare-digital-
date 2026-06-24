import { Outlet, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "motion/react"
import NavBar from "./components/layout/NavBar"
import Footer from "./components/layout/Footer"
import DaraDrawer from "./components/layout/DaraDrawer"
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

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-teal-500/30">
      {!isConfigured && (
        <div className="bg-amber-100 border-b border-amber-200 text-amber-800 px-4 py-3 text-center text-sm">
          <strong>Setup Required:</strong> Missing Vercel Environment Variables (`VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`). 
          Please configure these in your Vercel project settings to enable backend features.
        </div>
      )}
      <NavBar />
      <main className="flex-1 w-full flex flex-col relative w-full h-full">
        <PageWrapper>
          <Outlet />
        </PageWrapper>
      </main>
      <Footer />
      <DaraDrawer />
    </div>
  )
}
