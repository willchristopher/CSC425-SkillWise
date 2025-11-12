// TODO: Implement home/landing page
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  // TODO: Add hero section, features, testimonials, call-to-action
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to SkillWise</h1>
          <p>Your AI-powered learning companion for skill development</p>
          <div className="hero-actions">
            <Link to="/signup" className="btn-primary">Get Started</Link>
            <Link to="/ai-tutor" className="btn-secondary">Try AI Tutor</Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Features</h2>
          <div className="features-grid">
            {/* TODO: Add feature cards */}
            <div className="feature-card">
              <h3>🤖 AI-Powered Feedback</h3>
              <p>Get personalized feedback on your code powered by Google Gemini</p>
              <Link to="/ai-tutor" className="feature-link">Try Now →</Link>
            </div>
            <div className="feature-card">
              <h3>🎯 Goal Tracking</h3>
              <p>Set and track your learning goals</p>
            </div>
            <div className="feature-card">
              <h3>👥 Peer Reviews</h3>
              <p>Learn from your peers through collaborative reviews</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;