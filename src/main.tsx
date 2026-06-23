import { StrictMode, lazy, Suspense, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
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

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Route-level spinner — matches the initial loader colour so the transition feels seamless
function PageLoader() {
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: '#fafafa',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid rgba(16,185,129,0.2)', borderTopColor: '#10b981',
        animation: 'spin 0.9s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Lazy page imports ──────────────────────────────────────────────────────────
// Critical path (preloaded chunks — small, needed on first interaction)
const Home          = lazy(() => import('./pages/Home'));
const Login         = lazy(() => import('./pages/Login'));
const Signup        = lazy(() => import('./pages/Signup'));
const Library       = lazy(() => import('./pages/Library'));

// Secondary (loaded on demand)
const BookDetail        = lazy(() => import('./pages/BookDetail'));
const BookActionPage    = lazy(() => import('./pages/BookActionPage'));
const Reader            = lazy(() => import('./pages/Reader'));
const TutorPage         = lazy(() => import('./pages/TutorPage'));
const UnifiedSearch     = lazy(() => import('./pages/UnifiedSearch'));
const SearchResults     = lazy(() => import('./pages/SearchResults'));
const AdvancedSearch    = lazy(() => import('./pages/AdvancedSearch'));

// Auth-gated (only loaded when user is logged in)
const StudentDashboard  = lazy(() => import('./pages/StudentDashboard'));
const LecturerDashboard = lazy(() => import('./pages/LecturerDashboard'));
const AuthorDashboard   = lazy(() => import('./pages/AuthorDashboard'));
const AuthorPortal      = lazy(() => import('./pages/AuthorPortal'));
const Leaderboard       = lazy(() => import('./pages/Leaderboard'));
const Settings          = lazy(() => import('./pages/Settings'));
const ReadingHistory    = lazy(() => import('./pages/ReadingHistory'));

// Admin (very rarely visited)
const AdminSeed     = lazy(() => import('./pages/AdminSeed'));
const AdminLibrary  = lazy(() => import('./pages/AdminLibrary'));

// Content discovery
const AITextbooks         = lazy(() => import('./pages/AITextbooks'));
const OpenStaxBooks       = lazy(() => import('./pages/OpenStaxBooks'));
const GutenbergBooks      = lazy(() => import('./pages/GutenbergBooks'));
const OpenAccessBooks     = lazy(() => import('./pages/OpenAccessBooks'));
const LocalResearch       = lazy(() => import('./pages/LocalResearch'));
const ResearchDetail      = lazy(() => import('./pages/ResearchDetail'));
const GlobalRepositories  = lazy(() => import('./pages/GlobalRepositories'));

// Tools & institutional
const TeacherTools        = lazy(() => import('./pages/TeacherTools'));
const TeachersColleges    = lazy(() => import('./pages/TeachersColleges'));
const VocationalTools     = lazy(() => import('./pages/VocationalTools'));
const VocationalSchools   = lazy(() => import('./pages/VocationalSchools'));
const Institutions        = lazy(() => import('./pages/Institutions'));
const Institution         = lazy(() => import('./pages/Institution'));
const ForInstitutions     = lazy(() => import('./pages/ForInstitutions'));
const InstitutionalLogin  = lazy(() => import('./pages/InstitutionalLogin'));
const InstitutionalRepository = lazy(() => import('./pages/InstitutionalRepository'));
const DareInstitutional   = lazy(() => import('./pages/DareInstitutional'));
const DSpaceIntegration   = lazy(() => import('./pages/DSpaceIntegration'));
const DareLibrary         = lazy(() => import('./pages/DareLibrary'));
const PremiumResource     = lazy(() => import('./pages/PremiumResource'));

// Heavy ML pages — isolated in their own chunk so @xenova/transformers never
// loads unless the user specifically visits /ai-tools
const HBCTransformer = lazy(() => import('./pages/HBCTransformer'));
const AIModelsTools  = lazy(() => import('./pages/AIModelsTools'));

// Info pages
const Help    = lazy(() => import('./pages/Help'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms   = lazy(() => import('./pages/Terms'));
const Contact = lazy(() => import('./pages/Contact'));

const AdminDashboard = lazy(() => Promise.resolve({
  default: () => (
    <div style={{ padding: '120px 20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem' }}>Admin Dashboard</h1>
      <p style={{ color: '#6b7280', marginTop: 8 }}>Coming soon…</p>
    </div>
  ),
}));

// ── App ────────────────────────────────────────────────────────────────────────
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
                  {/* Public */}
                  <Route path="/"         element={<Home />} />
                  <Route path="/login"    element={<Login />} />
                  <Route path="/signup"   element={<Signup />} />
                  <Route path="/library"  element={<Library />} />
                  <Route path="/search"   element={<UnifiedSearch />} />
                  <Route path="/results"  element={<SearchResults />} />
                  <Route path="/book/:id" element={<BookDetail />} />
                  <Route path="/book-action/:id" element={<BookActionPage />} />
                  <Route path="/reader/:id"      element={<Reader />} />
                  <Route path="/tutor"    element={<TutorPage />} />

                  {/* Protected */}
                  <Route path="/dashboard" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
                  <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                  <Route path="/lecturer-dashboard" element={<ProtectedRoute requiredRole="lecturer"><LecturerDashboard /></ProtectedRoute>} />
                  <Route path="/author-dashboard"   element={<ProtectedRoute requiredRole="author"><AuthorDashboard /></ProtectedRoute>} />
                  <Route path="/author"  element={<ProtectedRoute requiredRole="author"><AuthorPortal /></ProtectedRoute>} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/history"  element={<ReadingHistory />} />

                  {/* Admin */}
                  <Route path="/admin"          element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/seed"     element={<ProtectedRoute requiredRole="admin"><AdminSeed /></ProtectedRoute>} />
                  <Route path="/admin/library"  element={<ProtectedRoute requiredRole="admin"><AdminLibrary /></ProtectedRoute>} />

                  {/* Content discovery */}
                  <Route path="/ai-textbooks"   element={<AITextbooks />} />
                  <Route path="/openstax"       element={<OpenStaxBooks />} />
                  <Route path="/gutenberg"      element={<GutenbergBooks />} />
                  <Route path="/open-books"     element={<OpenAccessBooks />} />
                  <Route path="/research"       element={<LocalResearch />} />
                  <Route path="/research/:id"   element={<ResearchDetail />} />
                  <Route path="/advanced-search" element={<AdvancedSearch />} />
                  <Route path="/global-repos"   element={<GlobalRepositories />} />

                  {/* Tools */}
                  <Route path="/teacher-tools"    element={<TeacherTools />} />
                  <Route path="/teachers-colleges" element={<TeachersColleges />} />
                  <Route path="/vocational-tools" element={<VocationalTools />} />
                  <Route path="/vocational"       element={<VocationalSchools />} />
                  <Route path="/hbc-transformer"  element={<HBCTransformer />} />
                  <Route path="/ai-tools"         element={<AIModelsTools />} />

                  {/* Institutional */}
                  <Route path="/for-institutions"     element={<ForInstitutions />} />
                  <Route path="/institutions"         element={<Institutions />} />
                  <Route path="/institution/:id"      element={<Institution />} />
                  <Route path="/institutional-login"  element={<InstitutionalLogin />} />
                  <Route path="/dspace-explorer"      element={<InstitutionalRepository />} />
                  <Route path="/repository"           element={<InstitutionalRepository />} />
                  <Route path="/dspace"               element={<DSpaceIntegration />} />
                  <Route path="/institutional"        element={<DareInstitutional />} />
                  <Route path="/browse"               element={<DareLibrary />} />
                  <Route path="/premium"              element={<PremiumResource />} />

                  {/* Info */}
                  <Route path="/help"    element={<Help />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms"   element={<Terms />} />
                  <Route path="/contact" element={<Contact />} />

                  {/* 404 */}
                  <Route path="*" element={
                    <div style={{ padding: '120px 20px', textAlign: 'center' }}>
                      <h1 style={{ fontSize: '3rem', color: '#1e293b' }}>404</h1>
                      <p style={{ color: '#64748b', marginTop: 8 }}>Page not found.</p>
                      <Link to="/" style={{ color: '#0d9488', marginTop: 16, display: 'inline-block', fontWeight: 700 }}>Return Home</Link>
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
