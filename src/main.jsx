import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// Pages
import Home from './pages/Home';
import Library from './pages/Library';
import BookDetail from './pages/BookDetail';
import Reader from './pages/Reader';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';

// Placeholders for unimplemented pages
const AuthorPortal = () => <div style={{ padding: '100px 20px', textAlign: 'center' }}><h1>Author Portal</h1><p>Coming soon...</p></div>;
const AdminDashboard = () => <div style={{ padding: '100px 20px', textAlign: 'center' }}><h1>Admin Dashboard</h1><p>Coming soon...</p></div>;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <App>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/reader/:id" element={<Reader />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/author" element={<AuthorPortal />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </App>
    </Router>
  </StrictMode>
);
