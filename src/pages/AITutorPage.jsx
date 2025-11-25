import React from 'react';
import AITutor from '../components/common/AITutor';

const AITutorPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ecfeff 0%, #dbeafe 50%, #e0e7ff 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '896px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
            AI Coding Assistant
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#4b5563' }}>
            Get instant feedback, hints, and guidance powered by Google Gemini AI
          </p>
        </div>

        <AITutor 
          challengeId="ai-tutor"
          challengeTitle="Code Review & Learning"
          challengeDescription="Submit your code to get personalized feedback and suggestions"
        />

        <div style={{ marginTop: '2rem', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
            🎯 How to Use the AI Tutor
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'linear-gradient(to right, #f0fdf4, #ecfdf5)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '1.875rem', marginBottom: '0.75rem' }}>📝</div>
              <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>Get Feedback</h3>
              <p style={{ color: '#374151' }}>Paste your code and get detailed, constructive feedback on your implementation, including strengths and areas for improvement.</p>
            </div>
            <div style={{ background: 'linear-gradient(to right, #fffbeb, #fef3c7)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '1.875rem', marginBottom: '0.75rem' }}>💡</div>
              <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>Get Hints</h3>
              <p style={{ color: '#374151' }}>Stuck on a problem? Get helpful hints and guidance without spoiling the solution. Perfect for learning!</p>
            </div>
            <div style={{ background: 'linear-gradient(to right, #eff6ff, #dbeafe)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #93c5fd' }}>
              <div style={{ fontSize: '1.875rem', marginBottom: '0.75rem' }}>🚀</div>
              <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>Learn & Improve</h3>
              <p style={{ color: '#374151' }}>Use the AI's suggestions to understand best practices, improve your coding style, and learn new concepts.</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', background: 'linear-gradient(to right, #2563eb, #9333ea)', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '1.5rem', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ fontSize: '1.875rem', marginRight: '1rem' }}>💎</div>
            <div>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.25rem' }}>Powered by Google Gemini</h3>
              <p style={{ opacity: 0.9 }}>This AI assistant uses advanced language models to provide personalized learning support. All feedback is generated in real-time!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITutorPage;
