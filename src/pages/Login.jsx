import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import styles from './Login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setShowTimeoutMessage(false);

    // Set a timeout to show a message if login takes too long
    const timeoutId = setTimeout(() => {
      setShowTimeoutMessage(true);
    }, 8000);

    try {
      const { error: loginError } = await authService.signIn(email, password);

      clearTimeout(timeoutId);
      if (loginError) {
        setError(loginError);
        setLoading(false);
        setShowTimeoutMessage(false);
      } else {
        // Redirect to library
        navigate('/library');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
      setShowTimeoutMessage(false);
    }
  };

  return (
    <div className={styles.container} style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Real Book Background Image */}
      <div style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        opacity: 0.2
      }}>
        <img 
          src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=2000" 
          alt="Login Background" 
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          referrerPolicy="no-referrer"
        />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.7))"
        }} />
      </div>

      <div className={styles.card} style={{ position: 'relative', zIndex: 10, backdropFilter: 'blur(10px)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 className={styles.title} style={{ color: 'white' }}>Login to Dare Assist</h1>
        
        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {loading && showTimeoutMessage && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-300 text-sm animate-pulse">
            <p className="font-medium">The login process is taking longer than expected.</p>
            <p className="mt-1 opacity-80">This could be due to a slow connection or Supabase project initialization. Please wait a moment...</p>
          </div>
        )}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-3">
            <button 
              type="submit" 
              disabled={loading}
              className={styles.button}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <button 
              type="button"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                setError('');
                setShowTimeoutMessage(false);
                
                const demoEmail = 'wgmasvix@gmail.com';
                const demoPassword = 'Cheryl13..';
                
                setEmail(demoEmail);
                setPassword(demoPassword);

                try {
                  // 1. Try to sign in
                  const { error: loginError } = await authService.signIn(demoEmail, demoPassword);
                  
                  if (!loginError) {
                    navigate('/library');
                    return;
                  }

                  // 2. If login fails because user doesn't exist, try to sign up
                  if (loginError.includes('Invalid login credentials')) {
                    const { error: signUpError } = await authService.signUp(
                      demoEmail, 
                      demoPassword, 
                      'Admin User', 
                      'admin'
                    );

                    if (signUpError) {
                      setError('Demo account could not be created: ' + signUpError);
                      setLoading(false);
                      return;
                    }

                    // 3. After signup, try to sign in again
                    const { error: retryError } = await authService.signIn(demoEmail, demoPassword);
                    if (retryError) {
                      setError('Demo account created but login failed: ' + retryError);
                    } else {
                      navigate('/library');
                    }
                  } else {
                    setError(loginError);
                  }
                } catch (err) {
                  setError('An unexpected error occurred during demo login.');
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
            >
              {loading ? 'Processing...' : 'Demo Login (Admin)'}
            </button>
          </div>
        </form>

        <div className={styles.links}>
          <p>
            Don't have an account? <Link to="/signup">Sign up here</Link>
          </p>
          <p>
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
