import { StrictMode, useEffect, lazy, Suspense } from 'react';
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

// Lazy-loaded pages — each becomes its own chunk
const Home                = lazy(() => import('./pages/Home'));
const Library             = lazy(() => import('./pages/Library'));
const BookDetail          = lazy(() => import('./pages/BookDetail'));
const BookActionPage      = lazy(() => import('./pages/BookActionPage'));
const Reader              = lazy(() => import('./pages/Reader'));
const Login               = lazy(() => import('./pages/Login'));
const Signup              = lazy(() => import('./pages/Signup'));
const StudentDashboard    = lazy(() => import('./pages/StudentDashboard'));
const LecturerDashboard   = lazy(() => import('./pages/LecturerDashboard'));
const AuthorDashboard     = lazy(() => import('./pages/AuthorDashboard'));
const AuthorPortal        = lazy(() => import('./pages/AuthorPortal'));
const DareLibrary         = lazy(() => import('./pages/DareLibrary'));
const InstitutionalLogin  = lazy(() => import('./pages/InstitutionalLogin'));
const DareInstitutional   = lazy(() => import('./pages/DareInstitutional'));
const AdminSeed           = lazy(() => import('./pages/AdminSeed'));
const AdminLibrary        = lazy(() => import('./pages/AdminLibrary'));
const VocationalSchools   = lazy(() => import('./pages/VocationalSchools'));
const PremiumResource     = lazy(() => import('./pages/PremiumResource'));
const DSpaceIntegration   = lazy(() => import('./pages/DSpaceIntegration'));
const DSpaceExplorer      = lazy(() => import('./pages/DSpaceExplorer'));
const HBCTransformer      = lazy(() => import('./pages/HBCTransformer'));
const AIModelsTools       = lazy(() => import('./pages/AIModelsTools'));
const TutorPage           = lazy(() => import('./pages/TutorPage'));
const ForInstitutions     = lazy(() => import('./pages/ForInstitutions'));
const GlobalRepositories  = lazy(() => import('./pages/GlobalRepositories'));
const AITextbooks         = lazy(() => import('./pages/AITextbooks'));
const OpenStaxBooks       = lazy(() => import('./pages/OpenStaxBooks'));
const GutenbergBooks      = lazy(() => import('./pages/GutenbergBooks'));
const OpenAccessBooks     = lazy(() => import('./pages/OpenAccessBooks'));
const LocalResearch       = lazy(() => import('./pages/LocalResearch'));
const ResearchDetail      = lazy(() => import('./pages/ResearchDetail'));
const TeachersColleges    = lazy(() => import('./pages/TeachersColleges'));
const TeacherTools        = lazy(() => import('./pages/TeacherTools'));
const VocationalTools     = lazy(() => import('./pages/VocationalTools'));
const Leaderboard         = lazy(() => import('./pages/Leaderboard'));
const UnifiedSearch       = lazy(() => import('./pages/UnifiedSearch'));
const SearchResults       = lazy(() => import('./pages/SearchResults'));
const Institutions        = lazy(() => import('./pages/Institutions'));
const Institution         = lazy(() => import('./pages/Institution'));
const Settings            = lazy(() => import('./pages/Settings'));
const ReadingHistory      = lazy(() => import('./pages/ReadingHistory'));
const Help                = lazy(() => import('./pages/Help'));
const Privacy             = lazy(() => import('./pages/Privacy'));
const Terms               = lazy(() => import('./pages/Terms'));
const Contact             = lazy(() => import('./pages/Contact'));

const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center py-32">
    <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const AdminDashboard = () => (
  <div style={{ padding: '120px 20px', textAlign: 'center', fontFamily: 'var(--font-display)' }}>
    <h1 style={{ fontSize: '2rem', color: 'var(--soil)', marginBottom: '12px' }}>Admin Dashboard</h1>
    <p style={{ color: 'var(--clay)' }}>Admin panel coming soon.</p>
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
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route element={<App />}>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/register" element={<Signup />} />
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

                  <Route path="/global-repos" element={<GlobalRepositories />} />
                  <Route path="/ai-textbooks" element={<AITextbooks />} />
                  <Route path="/openstax" element={<OpenStaxBooks />} />
                  <Route path="/gutenberg" element={<GutenbergBooks />} />
                  <Route path="/open-books" element={<OpenAccessBooks />} />
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
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/history" element={<ReadingHistory />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/for-institutions" element={<ForInstitutions />} />
                  <Route path="*" element={
                    <div style={{ padding: '120px 20px', textAlign: 'center', fontFamily: 'var(--font-display)' }}>
                      <h1 style={{ fontSize: '3rem', color: 'var(--soil)' }}>404</h1>
                      <p style={{ color: 'var(--clay)', marginTop: '8px' }}>Page not found.</p>
                      <Link to="/" style={{ color: 'var(--amber)', marginTop: '16px', display: 'inline-block' }}>Return Home</Link>
                    </div>
                  } />
                </Route>
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Router>
      </GamificationProvider>
    </ThemeProvider>
  </StrictMode>
);
