import { Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import NavBar from './components/layout/NavBar';

function ProtectedRoute({ children, roles = [] }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontFamily: 'var(--font-display)', 
        fontSize: '2rem', 
        fontStyle: 'italic',
        color: 'var(--soil)'
      }}>
        Loading Dare...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  if (roles.length > 0 && !roles.includes(profile?.role)) {
    return <Navigate to="/" />;
  }

  return children;
}

export default function App({ children }) {
  return (
    <AuthProvider>
      <div className="app-wrapper">
        <NavBar />
        <main>
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
