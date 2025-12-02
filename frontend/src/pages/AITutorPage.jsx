import React from 'react';
import AITutor from '../components/common/AITutor';
import AppLayout from '../components/layout/AppLayout';
import '../styles/pages.css';

const AITutorPage = () => {
  return (
    <AppLayout
      title="AI Learning Assistant"
      subtitle="Get instant feedback, hints, and guidance for any learning challenge"
    >
      <div className="ai-tutor-container">
        <AITutor
          challengeId="ai-tutor"
          challengeTitle="Learning Review & Feedback"
          challengeDescription="Submit your work to get personalized feedback and suggestions"
        />

        <div className="card" style={{ marginTop: '2rem' }}>
          <h2 className="section-title">How to Use the AI Tutor</h2>
          <div className="feature-steps">
            <div className="feature-step">
              <div className="feature-step-icon feature-step-icon--blue">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </div>
              <div className="feature-step-content">
                <h3 className="feature-step-title">Get Feedback</h3>
                <p className="feature-step-description">
                  Share your work and get detailed, constructive feedback on
                  your approach and execution.
                </p>
              </div>
            </div>
            <div className="feature-step">
              <div className="feature-step-icon feature-step-icon--yellow">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <div className="feature-step-content">
                <h3 className="feature-step-title">Get Hints</h3>
                <p className="feature-step-description">
                  Stuck on a challenge? Get helpful hints and guidance without
                  spoiling the solution.
                </p>
              </div>
            </div>
            <div className="feature-step">
              <div className="feature-step-icon feature-step-icon--green">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
              </div>
              <div className="feature-step-content">
                <h3 className="feature-step-title">Learn & Improve</h3>
                <p className="feature-step-description">
                  Use the AI's suggestions to understand best practices and
                  improve your skills.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="info-box info-box-blue">
          <p>
            <strong>Powered by Google Gemini:</strong> This AI assistant uses
            advanced language models to provide personalized learning support
            for any subject.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default AITutorPage;
