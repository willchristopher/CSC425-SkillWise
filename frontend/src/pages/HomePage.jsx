import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to SkillWise</h1>
          <p>Your AI-powered learning companion for skill development</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={handleGetStarted}>
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
            </button>
            <Link to="/login" className="btn-secondary">
              {isAuthenticated ? 'Dashboard' : 'Sign In'}
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Feedback</h3>
              <p>Get personalized, intelligent feedback on your work to improve faster</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Goal Tracking</h3>
              <p>Set and track your learning goals with visual progress indicators</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Peer Reviews</h3>
              <p>Learn from your peers through collaborative reviews and feedback</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Achievements</h3>
              <p>Earn badges and climb the leaderboard as you progress</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Progress Analytics</h3>
              <p>Track your improvement with detailed analytics and insights</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Challenges</h3>
              <p>Take on coding challenges to test and improve your skills</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;