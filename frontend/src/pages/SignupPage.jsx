// Professional Signup page with beautiful design for tutoring app
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SignupForm from '../components/auth/SignupForm';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import './AuthPages.css';

const SignupPage = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSignup = async (formData) => {
    setIsLoading(true);
    setError('');

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });

    setIsLoading(false);

    if (result.success) {
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
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
            <Link to="/login" className="auth-switch-btn">
              Log In
            </Link>
          </div>
        </div>

        <div className="auth-container">
          {/* Left Side - Signup Form */}
          <div className="auth-form-panel">
            <div className="form-container">
              <div className="form-header">
                <h2 className="form-title">Create your account</h2>
                <p className="form-subtitle">
                  Already have an account? <Link to="/login">Sign in here</Link>
                </p>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="form-card">
                <SignupForm
                  onSubmit={handleSignup}
                  isLoading={isLoading}
                  error={error}
                />
              </div>

              {/* Terms and Privacy */}
              <div
                className="auth-link"
                style={{ marginTop: '1.5rem', textAlign: 'center' }}
              >
                <p style={{ fontSize: '0.75rem' }}>
                  By creating an account, you agree to our{' '}
                  <Link to="/terms">Terms of Service</Link> and{' '}
                  <Link to="/privacy">Privacy Policy</Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Benefits Content */}
          <div className="auth-welcome-panel">
            <div className="welcome-content">
              <h1 className="welcome-title">Start Your Learning Adventure</h1>
              <p className="welcome-description">
                Join thousands of students who are already excelling with
                SkillWise's AI-powered tutoring platform.
              </p>

              <div className="features-list" style={{ gap: '1.5rem' }}>
                <div
                  className="feature-item"
                  style={{ alignItems: 'flex-start' }}
                >
                  <div
                    className="feature-icon"
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      fontSize: '1.25rem',
                    }}
                  >
                    🎯
                  </div>
                  <div style={{ marginLeft: '1rem' }}>
                    <h3 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      Personalized Learning
                    </h3>
                    <p style={{ fontSize: '0.875rem' }}>
                      AI adapts to your learning style and pace for maximum
                      efficiency
                    </p>
                  </div>
                </div>

                <div
                  className="feature-item"
                  style={{ alignItems: 'flex-start' }}
                >
                  <div
                    className="feature-icon"
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      fontSize: '1.25rem',
                    }}
                  >
                    ⚡
                  </div>
                  <div style={{ marginLeft: '1rem' }}>
                    <h3 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      Instant Help
                    </h3>
                    <p style={{ fontSize: '0.875rem' }}>
                      Get immediate answers and explanations 24/7
                    </p>
                  </div>
                </div>

                <div
                  className="feature-item"
                  style={{ alignItems: 'flex-start' }}
                >
                  <div
                    className="feature-icon"
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      fontSize: '1.25rem',
                    }}
                  >
                    📈
                  </div>
                  <div style={{ marginLeft: '1rem' }}>
                    <h3 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      Track Progress
                    </h3>
                    <p style={{ fontSize: '0.875rem' }}>
                      Monitor your improvement with detailed analytics
                    </p>
                  </div>
                </div>

                <div
                  className="feature-item"
                  style={{ alignItems: 'flex-start' }}
                >
                  <div
                    className="feature-icon"
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      fontSize: '1.25rem',
                    }}
                  >
                    🏆
                  </div>
                  <div style={{ marginLeft: '1rem' }}>
                    <h3 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      Achieve Goals
                    </h3>
                    <p style={{ fontSize: '0.875rem' }}>
                      Set and reach academic milestones with guided support
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
