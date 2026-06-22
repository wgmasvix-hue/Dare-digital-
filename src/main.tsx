import { StrictMode, useEffect, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import App from './App';
import { ProtectedRoute } from './components/ProtectedRoute';
import './index.css';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ThemeProvider } from './context/ThemeProvider';
import { GamificationProvider } from './context/GamificationContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

/* ── Lightweight page-transition spinner ───────────────────────── */
function PageSpin() {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid rgba(22,101,52,0.15)',
        borderTopColor: '#166534',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  );
}

declare global {
  interface Window {
    ALL_LOCAL_OER: unknown[];
    supabase: import('@supabase/supabase-js').SupabaseClient;
  }
}

/* ── Lazy page imports — each becomes its own JS chunk ─────────── */
const Home              = lazy(() => import('./pages/Home'));
const AuthorOnboarding  = lazy(() => import('./pages/AuthorOnboarding'));
const BookWriter        = lazy(() => import('./pages/BookWriter'));
const AITools           = lazy(() => import('./pages/AITools'));
const Library           = lazy(() => import('./pages/Library'));
const BookDetail        = lazy(() => import('./pages/BookDetail'));
const BookActionPage    = lazy(() => import('./pages/BookActionPage'));
const Reader            = lazy(() => import('./pages/Reader'));
const Login             = lazy(() => import('./pages/Login'));
const Signup            = lazy(() => import('./pages/Signup'));
const StudentDashboard  = lazy(() => import('./pages/StudentDashboard'));
const LecturerDashboard = lazy(() => import('./pages/LecturerDashboard'));
const AuthorDashboard   = lazy(() => import('./pages/AuthorDashboard'));
const AuthorPortal      = lazy(() => import('./pages/AuthorPortal'));
const DareLibrary       = lazy(() => import('./pages/DareLibrary'));
const InstitutionalLogin = lazy(() => import('./pages/InstitutionalLogin'));
const DareInstitutional = lazy(() => import('./pages/DareInstitutional'));
const AdminSeed         = lazy(() => import('./pages/AdminSeed'));
const AdminLibrary      = lazy(() => import('./pages/AdminLibrary'));
const VocationalSchools = lazy(() => import('./pages/VocationalSchools'));
const PremiumResource   = lazy(() => import('./pages/PremiumResource'));
const DSpaceIntegration = lazy(() => import('./pages/DSpaceIntegration'));
const DSpaceExplorer    = lazy(() => import('./pages/DSpaceExplorer'));
const HBCTransformer    = lazy(() => import('./pages/HBCTransformer'));
const AIModelsTools     = lazy(() => import('./pages/AIModelsTools'));
const TutorPage         = lazy(() => import('./pages/TutorPage'));
const AITextbooks       = lazy(() => import('./pages/AITextbooks'));
const OpenStaxBooks     = lazy(() => import('./pages/OpenStaxBooks'));
const GutenbergBooks    = lazy(() => import('./pages/GutenbergBooks'));
const OpenAccessBooks   = lazy(() => import('./pages/OpenAccessBooks'));
const LocalResearch     = lazy(() => import('./pages/LocalResearch'));
const AcademicDatabase  = lazy(() => import('./pages/AcademicDatabase'));
const ResearchDetail    = lazy(() => import('./pages/ResearchDetail'));
const TeachersColleges  = lazy(() => import('./pages/TeachersColleges'));
const TeacherTools      = lazy(() => import('./pages/TeacherTools'));
const VocationalTools   = lazy(() => import('./pages/VocationalTools'));
const Leaderboard       = lazy(() => import('./pages/Leaderboard'));
const UnifiedSearch     = lazy(() => import('./pages/UnifiedSearch'));
const SearchResults     = lazy(() => import('./pages/SearchResults'));
const Institutions      = lazy(() => import('./pages/Institutions'));
const Institution       = lazy(() => import('./pages/Institution'));
const ResourceHub       = lazy(() => import('./pages/ResourceHub'));
const Download          = lazy(() => import('./pages/Download'));

/* ── Placeholder for unimplemented pages ───────────────────────── */
const PlaceholderPage = ({ title, body }: { title: string; body?: string }) => (
  <div style={{ padding: '120px 20px', textAlign: 'center', fontFamily: 'var(--font-display)' }}>
    <h1 style={{ fontSize: '2rem', color: 'var(--soil)', marginBottom: '12px' }}>{title}</h1>
    {body && <p style={{ color: 'var(--clay)' }}>{body}</p>}
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
            <Suspense fallback={<PageSpin />}>
              <Routes>
                <Route element={<App />}>
                  {/* Public */}
                  <Route path="/"              element={<Home />} />
                  <Route path="/login"         element={<Login />} />
                  <Route path="/signup"        element={<Signup />} />
                  <Route path="/auth/callback" element={<Login />} />
                  <Route path="/library"       element={<Library />} />
                  <Route path="/search"        element={<UnifiedSearch />} />
                  <Route path="/results"       element={<SearchResults />} />
                  <Route path="/book/:id"      element={<BookDetail />} />
                  <Route path="/book-action/:id" element={<BookActionPage />} />
                  <Route path="/reader/:id"    element={<Reader />} />
                  <Route path="/tutor"         element={<TutorPage />} />
                  <Route path="/ai-tools"      element={<AITools />} />
                  <Route path="/author-onboarding" element={<AuthorOnboarding />} />
                  <Route path="/book-writer"   element={<BookWriter />} />

                  {/* Protected */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>
                  } />
                  <Route path="/leaderboard" element={
                    <ProtectedRoute><Leaderboard /></ProtectedRoute>
                  } />
                  <Route path="/lecturer-dashboard" element={
                    <ProtectedRoute requiredRole="lecturer"><LecturerDashboard /></ProtectedRoute>
                  } />
                  <Route path="/author-dashboard" element={
                    <ProtectedRoute requiredRole="author"><AuthorDashboard /></ProtectedRoute>
                  } />
                  <Route path="/author" element={
                    <ProtectedRoute requiredRole="author"><AuthorPortal /></ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute requiredRole="admin">
                      <PlaceholderPage title="Admin Dashboard" body="Coming soon..." />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/seed" element={
                    <ProtectedRoute requiredRole="admin"><AdminSeed /></ProtectedRoute>
                  } />
                  <Route path="/admin/library" element={
                    <ProtectedRoute requiredRole="admin"><AdminLibrary /></ProtectedRoute>
                  } />

                  {/* Content */}
                  <Route path="/ai-textbooks"   element={<AITextbooks />} />
                  <Route path="/openstax"       element={<OpenStaxBooks />} />
                  <Route path="/gutenberg"      element={<GutenbergBooks />} />
                  <Route path="/open-books"     element={<OpenAccessBooks />} />
                  <Route path="/research"       element={<LocalResearch />} />
                  <Route path="/academic"       element={<AcademicDatabase />} />
                  <Route path="/research/:id"   element={<ResearchDetail />} />
                  <Route path="/teachers-colleges" element={<TeachersColleges />} />
                  <Route path="/teacher-tools"  element={<TeacherTools />} />
                  <Route path="/vocational-tools" element={<VocationalTools />} />
                  <Route path="/resources"      element={<ResourceHub />} />
                  <Route path="/download"       element={<Download />} />

                  {/* Institutional / misc */}
                  <Route path="/browse"              element={<DareLibrary />} />
                  <Route path="/institutions"        element={<Institutions />} />
                  <Route path="/institution/:id"     element={<Institution />} />
                  <Route path="/institutional-login" element={<InstitutionalLogin />} />
                  <Route path="/vocational"          element={<VocationalSchools />} />
                  <Route path="/dspace"              element={<DSpaceIntegration />} />
                  <Route path="/dspace-explorer"     element={<DSpaceExplorer />} />
                  <Route path="/hbc-transformer"     element={<HBCTransformer />} />
                  <Route path="/ai-models"           element={<AIModelsTools />} />
                  <Route path="/institutional"       element={<DareInstitutional />} />
                  <Route path="/premium"             element={<PremiumResource />} />

                  {/* Static info pages */}
                  <Route path="/settings" element={<PlaceholderPage title="Settings" body="Account settings coming soon." />} />
                  <Route path="/history"  element={<PlaceholderPage title="Reading History" body="Your reading history will appear here." />} />
                  <Route path="/help"     element={<PlaceholderPage title="Help Center" body="Need help? Our support team is here to assist you." />} />
                  <Route path="/privacy"  element={<PlaceholderPage title="Privacy Policy" body="Your privacy is important to us. Read our policy here." />} />
                  <Route path="/terms"    element={<PlaceholderPage title="Terms of Service" body="By using DARE, you agree to our terms of service." />} />
                  <Route path="/contact"  element={<PlaceholderPage title="Contact Us" body="Get in touch with the DARE team." />} />

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
