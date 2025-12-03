import React, { useState } from 'react';
import { apiService } from '../../services/api';
import '../../styles/ai-tutor-v2.css';

const AITutor = ({ challengeId, challengeTitle, challengeDescription }) => {
  const [content, setContent] = useState('');
  const [feedback, setFeedback] = useState('');
  const [hints, setHints] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('feedback');

  const handleGetFeedback = async () => {
    if (!content.trim()) {
      setError('Please enter your work to get feedback');
      return;
    }

    setLoading(true);
    setError('');
    setFeedback('');

    try {
      const response = await apiService.ai.generateFeedback(content, {
        title: challengeTitle || 'Learning Review',
        description: challengeDescription || 'General learning submission',
      });

      setFeedback(response.data.data.feedback);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to generate feedback. Please try again.'
      );
      console.error('AI Feedback Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetHints = async () => {
    setLoading(true);
    setError('');
    setHints('');

    try {
      const response = await apiService.ai.getHints(
        challengeId || 'general',
        {
          title: challengeTitle || 'Learning Challenge',
          description: challengeDescription || 'General learning help',
          difficulty: 'Medium',
        },
        {
          attempts: 0,
          lastAttempt: content.trim() || 'No attempts yet',
        }
      );

      setHints(response.data.data.hints);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to generate hints. Please try again.'
      );
      console.error('AI Hints Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-tutor-widget">
      <div className="ai-tutor-widget-header">
        <h2 className="ai-tutor-widget-title">🤖 AI Learning Assistant</h2>
        <p className="ai-tutor-widget-subtitle">
          Powered by Google Gemini - Get instant feedback and hints for your
          learning journey!
        </p>
      </div>

      {/* Tabs */}
      <div className="ai-tutor-tabs">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`ai-tutor-tab ${
            activeTab === 'feedback' ? 'ai-tutor-tab--active' : ''
          }`}
        >
          📝 Get Feedback
        </button>
        <button
          onClick={() => setActiveTab('hints')}
          className={`ai-tutor-tab ${
            activeTab === 'hints' ? 'ai-tutor-tab--active' : ''
          }`}
        >
          💡 Get Hints
        </button>
      </div>

      {/* Content Input */}
      <div className="ai-tutor-input-group">
        <label className="ai-tutor-label">Your Work:</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your work here... This can be code, writing, notes, or any learning content you want feedback on."
          className="ai-tutor-textarea"
        />
      </div>

      {/* Action Button */}
      <div className="ai-tutor-input-group">
        {activeTab === 'feedback' ? (
          <button
            onClick={handleGetFeedback}
            disabled={loading}
            className="ai-tutor-btn ai-tutor-btn--primary"
          >
            {loading ? '🔄 Analyzing your work...' : '📝 Get AI Feedback'}
          </button>
        ) : (
          <button
            onClick={handleGetHints}
            disabled={loading}
            className="ai-tutor-btn ai-tutor-btn--success"
          >
            {loading ? '🔄 Getting hints...' : '💡 Get Hints'}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && <div className="ai-tutor-error">⚠️ {error}</div>}

      {/* Feedback/Hints Display */}
      {activeTab === 'feedback' && feedback && (
        <div className="ai-tutor-result ai-tutor-result--feedback">
          <h3 className="ai-tutor-result-title">AI Feedback:</h3>
          <div className="ai-tutor-result-content">{feedback}</div>
        </div>
      )}

      {activeTab === 'hints' && hints && (
        <div className="ai-tutor-result ai-tutor-result--hints">
          <h3 className="ai-tutor-result-title">AI Hints:</h3>
          <div className="ai-tutor-result-content">{hints}</div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="ai-tutor-loading">
          <div className="ai-tutor-spinner"></div>
          <p className="ai-tutor-loading-text">AI is thinking...</p>
        </div>
      )}
    </div>
  );
};

export default AITutor;
