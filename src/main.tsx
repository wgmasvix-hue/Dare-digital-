import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import App from './App';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

import { ProtectedRoute } from './components/ProtectedRoute';
import './index.css';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ThemeProvider } from './context/ThemeProvider';
import { GamificationProvider } from './context/GamificationContext';

declare global {
  interface Window {
    ALL_LOCAL_OER: unknown[];
    supabase: import('@supabase/supabase-js').SupabaseClient;
  }
}

// Pages
import Home from './pages/Home';
import Library from './pages/Library';
import BookDetail from './pages/BookDetail';
import BookActionPage from './pages/BookActionPage';
import Reader from './pages/Reader';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import AuthorDashboard from './pages/AuthorDashboard';
import AuthorPortal from './pages/AuthorPortal';
import DareLibrary from './pages/DareLibrary';
import InstitutionalLogin from './pages/InstitutionalLogin';
import DareInstitutional from './pages/DareInstitutional';
import AdminSeed from './pages/AdminSeed';
import AdminLibrary from './pages/AdminLibrary';
import VocationalSchools from './pages/VocationalSchools';
import PremiumResource from './pages/PremiumResource';
import DSpaceIntegration from './pages/DSpaceIntegration';
import DSpaceExplorer from './pages/DSpaceExplorer';
import HBCTransformer from './pages/HBCTransformer';
import AIModelsTools from './pages/AIModelsTools';
import TutorPage from './pages/TutorPage';

import AITextbooks from './pages/AITextbooks';
import OpenStaxBooks from './pages/OpenStaxBooks';
import GutenbergBooks from './pages/GutenbergBooks';
import OpenAccessBooks from './pages/OpenAccessBooks';
import LocalResearch from './pages/LocalResearch';
import ResearchDetail from './pages/ResearchDetail';
import TeachersColleges from './pages/TeachersColleges';
import TeacherTools from './pages/TeacherTools';
import VocationalTools from './pages/VocationalTools';
import Leaderboard from './pages/Leaderboard';
import UnifiedSearch from './pages/UnifiedSearch';
import SearchResults from './pages/SearchResults';
import Institutions from './pages/Institutions';
import Institution from './pages/Institution';
import AdvancedSearch from './pages/AdvancedSearch';
import GlobalRepositories from './pages/GlobalRepositories';
import ForInstitutions from './pages/ForInstitutions';
import Settings from './pages/Settings';
import ReadingHistory from './pages/ReadingHistory';
import Help from './pages/Help';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';

// Check if ALL_LOCAL_OER is loaded
console.log("ALL_LOCAL_OER length:", window.ALL_LOCAL_OER?.length || "undefined");

// Check if supabase is connected
console.log("Supabase client:", window.supabase ? "loaded" : "not found");

// Placeholders for unimplemented pages
const AdminDashboard = () => (
  <div style={{ padding: '120px 20px', textAlign: 'center', fontFamily: 'var(--font-display)' }}>
    <h1 style={{ fontSize: '2rem', color: 'var(--soil)', marginBottom: '12px' }}>Admin Dashboard</h1>
    <p style={{ color: 'var(--clay)' }}>Coming soon...</p>
  </div>
);

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <GamificationProvider>
        <Router>
          <ScrollToTop />
          <ErrorBoundary>
            <Routes>
            <Route element={<App />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/library" element={<Library />} />
            <Route path="/search" element={<UnifiedSearch />} />
            <Route path="/results" element={<SearchResults />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/book-action/:id" element={<BookActionPage />} />
            <Route path="/reader/:id" element={<Reader />} />
            <Route path="/tutor" element={<TutorPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/leaderboard" element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } />
            <Route path="/lecturer-dashboard" element={
              <ProtectedRoute requiredRole="lecturer">
                <LecturerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/author-dashboard" element={
              <ProtectedRoute requiredRole="author">
                <AuthorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/author" element={
              <ProtectedRoute requiredRole="author">
                <AuthorPortal />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/seed" element={
              <ProtectedRoute requiredRole="admin">
                <AdminSeed />
              </ProtectedRoute>
            } />
            <Route path="/admin/library" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLibrary />
              </ProtectedRoute>
            } />

            <Route path="/ai-textbooks" element={<AITextbooks />} />
            <Route path="/openstax" element={<OpenStaxBooks />} />
            <Route path="/gutenberg" element={<GutenbergBooks />} />
            <Route path="/open-books" element={<OpenAccessBooks />} />
            <Route path="/research" element={<LocalResearch />} />
            <Route path="/research/:id" element={<ResearchDetail />} />
            <Route path="/advanced-search" element={<AdvancedSearch />} />
            <Route path="/global-repos" element={<GlobalRepositories />} />
            <Route path="/for-institutions" element={<ForInstitutions />} />
            <Route path="/teachers-colleges" element={<TeachersColleges />} />
            <Route path="/teacher-tools" element={<TeacherTools />} />
            <Route path="/vocational-tools" element={<VocationalTools />} />

            {/* Placeholder Routes */}
            <Route path="/browse" element={<DareLibrary />} />
            <Route path="/institutions" element={<Institutions />} />
            <Route path="/institution/:id" element={<Institution />} />
            <Route path="/institutional-login" element={<InstitutionalLogin />} />
            <Route path="/vocational" element={<VocationalSchools />} />
            <Route path="/dspace" element={<DSpaceIntegration />} />
            <Route path="/dspace-explorer" element={<DSpaceExplorer />} />
            <Route path="/hbc-transformer" element={<HBCTransformer />} />
            <Route path="/ai-tools" element={<AIModelsTools />} />
            <Route path="/institutional" element={<DareInstitutional />} />
            <Route path="/premium" element={<PremiumResource />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/history" element={<ReadingHistory />} />
            <Route path="/help" element={<Help />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={
              <div style={{ padding: '120px 20px', textAlign: 'center', fontFamily: 'var(--font-display)' }}>
                <h1 style={{ fontSize: '3rem', color: 'var(--soil)' }}>404</h1>
                <p style={{ color: 'var(--clay)', marginTop: '8px' }}>Page not found.</p>
                <Link to="/" style={{ color: 'var(--amber)', marginTop: '16px', display: 'inline-block' }}>Return Home</Link>
              </div>
            } />
          </Route>
        </Routes>
        </ErrorBoundary>
      </Router>
      </GamificationProvider>
    </ThemeProvider>
  </StrictMode>
);
