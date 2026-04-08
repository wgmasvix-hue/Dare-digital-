import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import styles from './Signup.module.css';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error: signupError } = await authService.signUp(
      formData.email,
      formData.password,
      formData.fullName,
      formData.role
    );

    if (signupError) {
      setError(signupError);
      setLoading(false);
    } else {
      setSuccess('Account created! Check your email to verify.');
      setTimeout(() => navigate('/login'), 3000);
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
          src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=2000" 
          alt="Signup Background" 
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
        <h1 className={styles.title} style={{ color: 'white' }}>Create Dare Assist Account</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <form onSubmit={handleSignup} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Min 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength="6"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="role">Role</label>
            <select 
              id="role"
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              disabled={loading}
            >
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="author">Author</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={styles.button}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className={styles.links}>
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
