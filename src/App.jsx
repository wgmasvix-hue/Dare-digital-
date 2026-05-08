import { Outlet } from "react-router-dom"
import NavBar from "./components/layout/NavBar"
import Footer from "./components/layout/Footer"
import { isSupabaseConfigured } from "./lib/supabase"
import styles from "./App.module.css"

export default function App() {
  const isConfigured = isSupabaseConfigured();

  return (
    <div className={styles.appContainer}>
      {!isConfigured && (
        <div className="bg-amber-100 border-b border-amber-200 text-amber-800 px-4 py-3 text-center text-sm">
          <strong>Setup Required:</strong> Missing Vercel Environment Variables (`VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`). 
          Please configure these in your Vercel project settings to enable backend features.
        </div>
      )}
      <NavBar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
