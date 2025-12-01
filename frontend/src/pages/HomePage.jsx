// TODO: Implement home/landing page
import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleLearnMore = () => {
    // Scroll to features section
    document.querySelector('.features')?.scrollIntoView({ behavior: 'smooth' });
  };

  // TODO: Add hero section, features, testimonials, call-to-action
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to SkillWise</h1>
          <p>Your AI-powered learning companion for skill development</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={handleGetStarted}>
              Get Started
            </button>
            <button className="btn-secondary" onClick={handleLearnMore}>
              Learn More
            </button>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Features</h2>
          <div className="features-grid">
            {/* TODO: Add feature cards */}
            <div className="feature-card">
              <h3>AI-Powered Feedback</h3>
              <p>Get personalized feedback on your work</p>
            </div>
            <div className="feature-card">
              <h3>Goal Tracking</h3>
              <p>Set and track your learning goals</p>
            </div>
            <div className="feature-card">
              <h3>Peer Reviews</h3>
              <p>Learn from your peers through collaborative reviews</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
