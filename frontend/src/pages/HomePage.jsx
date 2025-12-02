import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLearnMore = () => {
    document
      .querySelector('.features-section')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Feedback',
      description:
        'Get instant, personalized feedback on your code with advanced AI analysis and insights',
      color: '#667eea',
    },
    {
      icon: '🎯',
      title: 'Goal Tracking',
      description:
        'Set ambitious goals and track your progress with detailed analytics and metrics',
      color: '#f093fb',
    },
    {
      icon: '👥',
      title: 'Peer Reviews',
      description:
        'Learn from others and share knowledge through collaborative code reviews and feedback',
      color: '#4facfe',
    },
    {
      icon: '📊',
      title: 'Progress Analytics',
      description:
        'Visualize your learning journey with comprehensive progress tracking and reports',
      color: '#43e97b',
    },
    {
      icon: '🏆',
      title: 'Leaderboards',
      description:
        'Compete with others and climb the ranks as you master new skills and challenges',
      color: '#fa709a',
    },
    {
      icon: '💡',
      title: 'Smart Challenges',
      description:
        'Practice with AI-generated challenges tailored to your skill level and learning pace',
      color: '#fee140',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Learners' },
    { value: '500+', label: 'Challenges' },
    { value: '95%', label: 'Success Rate' },
    { value: '24/7', label: 'AI Support' },
  ];

  return (
    <div className="home-page-modern">
      {/* Navigation Header */}
      <header className="home-header">
        <div className="home-header-container">
          <Link to="/" className="home-logo">
            <span className="home-logo-icon">S</span>
            <span className="home-logo-text">SkillWise</span>
          </Link>
          <div className="home-header-actions">
            <button
              onClick={toggleTheme}
              className="home-theme-toggle"
              title={
                theme === 'light'
                  ? 'Switch to dark mode'
                  : 'Switch to light mode'
              }
            >
              {theme === 'light' ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
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
                  width="20"
                  height="20"
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
            <button onClick={handleLogin} className="home-login-btn">
              Log In
            </button>
            <button onClick={handleGetStarted} className="home-signup-btn">
              Sign Up Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>

        <div className="hero-content-wrapper">
          <div className="hero-badge">
            <span className="badge-icon">✨</span>
            <span>AI-Powered Learning Platform</span>
          </div>

          <h1 className="hero-title">
            Master Your Skills with
            <br />
            <span className="gradient-text">SkillWise</span>
          </h1>

          <p className="hero-subtitle">
            Transform your learning journey with personalized AI feedback,
            real-time progress tracking, and a community of passionate learners.
            Start building your future today.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary-modern" onClick={handleGetStarted}>
              <span>Get Started Free</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M7.5 15L12.5 10L7.5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button className="btn-secondary-modern" onClick={handleLearnMore}>
              <span>Explore Features</span>
            </button>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <span className="section-badge">Features</span>
          <h2 className="section-title">Everything You Need to Excel</h2>
          <p className="section-subtitle">
            Powerful tools and features designed to accelerate your learning
            journey
          </p>
        </div>

        <div className="features-grid-modern">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card-modern"
              style={{ '--card-color': feature.color }}
            >
              <div className="feature-icon-wrapper">
                <span className="feature-icon">{feature.icon}</span>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-hover-effect"></div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Level Up Your Skills?</h2>
          <p className="cta-subtitle">
            Join thousands of learners who are already mastering their craft
            with SkillWise
          </p>
          <button className="btn-cta" onClick={handleGetStarted}>
            Start Learning Today
          </button>
        </div>
        <div className="cta-background"></div>
      </section>
    </div>
  );
};

export default HomePage;
