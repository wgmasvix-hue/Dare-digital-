import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import App from './App';
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
            <Route path="/research" element={<LocalResearch />} />
            <Route path="/research/:id" element={<ResearchDetail />} />
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
            <Route path="/settings" element={
                <div style={{ padding: '120px 20px', textAlign: 'center', fontFamily: 'var(--font-display)' }}>
                  <h1 style={{ fontSize: '2rem', color: 'var(--soil)', marginBottom: '12px' }}>Settings</h1>
                  <p style={{ color: 'var(--clay)' }}>Account settings coming soon.</p>
                </div>
            } />
            <Route path="/history" element={
                <div style={{ padding: '120px 20px', textAlign: 'center', fontFamily: 'var(--font-display)' }}>
                  <h1 style={{ fontSize: '2rem', color: 'var(--soil)', marginBottom: '12px' }}>Reading History</h1>
                  <p style={{ color: 'var(--clay)' }}>Your reading history will appear here.</p>
                </div>
            } />
            <Route path="/help" element={
              <div style={{ padding: '120px 20px', textAlign: 'center', fontFamily: 'var(--font-display)' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--soil)', marginBottom: '12px' }}>Help Center</h1>
                <p style={{ color: 'var(--clay)' }}>Need help? Our support team is here to assist you.</p>
              </div>
            } />
            <Route path="/privacy" element={
              <div style={{ padding: '120px 20px', textAlign: 'center', fontFamily: 'var(--font-display)' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--soil)', marginBottom: '12px' }}>Privacy Policy</h1>
                <p style={{ color: 'var(--clay)' }}>Your privacy is important to us. Read our policy here.</p>
              </div>
            } />
            <Route path="/terms" element={
              <div style={{ padding: '120px 20px', textAlign: 'center', fontFamily: 'var(--font-display)' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--soil)', marginBottom: '12px' }}>Terms of Service</h1>
                <p style={{ color: 'var(--clay)' }}>By using DARE, you agree to our terms of service.</p>
              </div>
            } />
            <Route path="/contact" element={
              <div style={{ padding: '120px 20px', textAlign: 'center', fontFamily: 'var(--font-display)' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--soil)', marginBottom: '12px' }}>Contact Us</h1>
                <p style={{ color: 'var(--clay)' }}>Get in touch with the DARE team.</p>
              </div>
            } />
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
