import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '80px 20px',
          textAlign: 'center',
          fontFamily: 'var(--font-display, Georgia, serif)',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--soil, #3e2723)', marginBottom: '12px' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--clay, #8d6e63)', marginBottom: '24px', lineHeight: '1.6' }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '10px 24px',
                background: 'var(--soil, #3e2723)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.95rem'
              }}
            >
              Try Again
            </button>
            <Link
              to="/"
              style={{
                padding: '10px 24px',
                background: 'transparent',
                color: 'var(--soil, #3e2723)',
                border: '1px solid var(--soil, #3e2723)',
                borderRadius: '8px',
                textDecoration: 'none',
                fontFamily: 'inherit',
                fontSize: '0.95rem'
              }}
            >
              Go Home
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
