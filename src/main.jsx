import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import App, { ProtectedRoute } from './App.jsx';
import './index.css';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';

// Pages
import Home from './pages/Home';
import Library from './pages/Library';
import BookDetail from './pages/BookDetail';
import Reader from './pages/Reader';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import AuthorDashboard from './pages/AuthorDashboard';
import AuthorPortal from './pages/AuthorPortal';
import DareLibrary from './pages/DareLibrary';
import ForInstitutions from './pages/ForInstitutions';
import InstitutionalLogin from './pages/InstitutionalLogin';
import DareInstitutional from './pages/DareInstitutional';
import AdminSeed from './pages/AdminSeed';
import AdminLibrary from './pages/AdminLibrary';
import VocationalSchools from './pages/VocationalSchools';

import AITextbooks from './pages/AITextbooks';
import OpenStaxBooks from './pages/OpenStaxBooks';
import LocalResearch from './pages/LocalResearch';
import ResearchDetail from './pages/ResearchDetail';
import TeachersColleges from './pages/TeachersColleges';
import TeacherTools from './pages/TeacherTools';
import VocationalTools from './pages/VocationalTools';

// Placeholders for unimplemented pages
const AdminDashboard = () => (
  <div style={{ padding: '120px 20px', textAlign: 'center', fontFamily: 'var(--font-display)' }}>
    <h1 style={{ fontSize: '2rem', color: 'var(--soil)', marginBottom: '12px' }}>Admin Dashboard</h1>
    <p style={{ color: 'var(--clay)' }}>Coming soon...</p>
  </div>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <ErrorBoundary>
        <Routes>
          <Route element={<App />}>
            {/* Public Routes */}
            {/* Login and Register routes removed */}

            {/* Protected Routes (now public) */}
            <Route path="/" element={<Home />} />
            <Route path="/library" element={<Library />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/reader/:id" element={<Reader />} />
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
            <Route path="/author-dashboard" element={<AuthorDashboard />} />
            <Route path="/author" element={<AuthorPortal />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/seed" element={<AdminSeed />} />
            <Route path="/admin/library" element={<AdminLibrary />} />

            <Route path="/ai-textbooks" element={<AITextbooks />} />
            <Route path="/openstax" element={<OpenStaxBooks />} />
            <Route path="/research" element={<LocalResearch />} />
            <Route path="/research/:id" element={<ResearchDetail />} />
            <Route path="/teachers-colleges" element={<TeachersColleges />} />
            <Route path="/teacher-tools" element={<TeacherTools />} />
            <Route path="/vocational-tools" element={<VocationalTools />} />

            {/* Placeholder Routes */}
            <Route path="/browse" element={<DareLibrary />} />
            <Route path="/institutions" element={<ForInstitutions />} />
            <Route path="/institutional-login" element={<InstitutionalLogin />} />
            <Route path="/vocational" element={<VocationalSchools />} />
            <Route path="/institutional" element={<DareInstitutional />} />
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
  </StrictMode>
);

