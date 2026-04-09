import { Outlet } from "react-router-dom"
import NavBar from "./components/layout/NavBar"
import Footer from "./components/layout/Footer"
import styles from "./App.module.css"

export default function App() {
  return (
    <div className={styles.appContainer}>
      <NavBar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
