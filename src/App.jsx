import { Outlet, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "motion/react"
import NavBar from "./components/layout/NavBar"
import Footer from "./components/layout/Footer"
import PWAInstallPrompt from "./components/PWAInstallPrompt"

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
  return (
    <div className="min-h-screen flex flex-col font-sans bg-white text-stone-900 selection:bg-amber-200/60">
      <a href="#main-content" className="skip-nav">Skip to main content</a>
      <NavBar />
      <main id="main-content" className="flex-1 w-full flex flex-col relative">
        <PageWrapper>
          <Outlet />
        </PageWrapper>
      </main>
      <Footer />
      <PWAInstallPrompt />
    </div>
  )
}
