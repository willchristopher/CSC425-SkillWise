// Professional Login page with beautiful design for tutoring app
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import './AuthPages.css';

const LoginPage = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Redirect to intended page after login
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (formData) => {
    setIsLoading(true);
    setError('');

    const result = await login({
      email: formData.email,
      password: formData.password,
    });

    setIsLoading(false);

    if (result.success) {
      // Redirect to dashboard or intended page
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background" style={{ minHeight: '100vh' }}>
        {/* Header with Back Button */}
        <div className="auth-header">
          <Link to="/" className="back-link">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
          <Link to="/" className="logo-link">
            SkillWise
          </Link>
          <div className="auth-header-actions">
            <button
              onClick={toggleTheme}
              className="auth-theme-toggle"
              title={
                theme === 'light'
                  ? 'Switch to dark mode'
                  : 'Switch to light mode'
              }
            >
              {theme === 'light' ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              )}
            </button>
            <Link to="/signup" className="auth-switch-btn">
              Sign Up
            </Link>
          </div>
        </div>

        <div className="auth-container">
          {/* Left Side - Welcome Content */}
          <div className="auth-welcome-panel">
            <div className="welcome-content">
              <h1 className="welcome-title">Welcome Back to SkillWise</h1>
              <p className="welcome-description">
                Continue your learning journey with AI-powered tutoring and
                personalized study plans.
              </p>

              <div className="features-list">
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="feature-text">
                    Track your progress across all subjects
                  </p>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="feature-text">
                    Get instant AI tutoring support
                  </p>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="feature-text">Connect with study groups</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="auth-form-panel">
            <div className="form-container">
              <div className="form-header">
                <h2 className="form-title">Sign in to your account</h2>
                <p className="form-subtitle">
                  Don't have an account?{' '}
                  <Link to="/signup">Create one here</Link>
                </p>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="form-card">
                <LoginForm
                  onSubmit={handleLogin}
                  isLoading={isLoading}
                  error={error}
                />
              </div>

              {/* Additional Options */}
              <div className="auth-link" style={{ marginTop: '1.5rem' }}>
                <div className="divider">
                  <div className="divider-line"></div>
                  <span className="divider-text">Need help?</span>
                  <div className="divider-line"></div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <Link to="/forgot-password" className="forgot-password">
                    Forgot your password?
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
