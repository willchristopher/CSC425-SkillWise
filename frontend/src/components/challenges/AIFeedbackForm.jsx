import React, { useState } from 'react';
import { apiService } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import './AIFeedbackForm.css';

/**
 * AI Feedback Submission Form (Story 3.4)
 * Form submits content to backend /ai/submitForFeedback
 */
const AIFeedbackForm = ({ challenge, submissionId, onFeedbackReceived }) => {
  const [submissionText, setSubmissionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!submissionText.trim()) {
      setError('Please enter your code or solution');
      return;
    }

    setLoading(true);
    setError('');
    setFeedback(null);

    try {
      // Story 3.4: Form submits content to backend /ai/submitForFeedback
      const response = await apiService.ai.submitForFeedback(
        submissionText,
        {
          title: challenge?.title || 'Code Review',
          description: challenge?.description || 'General code submission',
        },
        submissionId
      );

      if (response.data.success) {
        setFeedback(response.data.data.feedback);
        if (onFeedbackReceived) {
          onFeedbackReceived(response.data.data);
        }
      } else {
        setError(response.data.message || 'Failed to get feedback');
      }
    } catch (err) {
      console.error('Error submitting for feedback:', err);
      setError(
        err.response?.data?.message || 'Failed to submit. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFeedback(null);
    setSubmissionText('');
    setError('');
  };

  return (
    <div className="ai-feedback-form">
      <div className="form-header">
        <h3>🤖 Get AI Feedback</h3>
        <p>
          Submit your code or solution to receive instant AI-powered feedback.
        </p>
      </div>

      {!feedback ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="submission-text">Your Code / Solution</label>
            <textarea
              id="submission-text"
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Paste your code here..."
              rows={12}
              disabled={loading}
              data-testid="submission-text-input"
            />
            <span className="char-count">
              {submissionText.length} characters
            </span>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary submit-btn"
            disabled={loading || !submissionText.trim()}
            data-testid="submit-for-feedback-btn"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                Analyzing...
              </>
            ) : (
              <>📝 Get AI Feedback</>
            )}
          </button>
        </form>
      ) : (
        <div className="feedback-result">
          <div className="feedback-header">
            <h4>AI Feedback</h4>
            {feedback.overall_score && (
              <div
                className={`score-badge ${getScoreClass(
                  feedback.overall_score
                )}`}
              >
                Score: {feedback.overall_score}/100
              </div>
            )}
          </div>

          {feedback.strengths?.length > 0 && (
            <div className="feedback-section strengths">
              <h5>✅ Strengths</h5>
              <ul>
                {feedback.strengths.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {feedback.improvements?.length > 0 && (
            <div className="feedback-section improvements">
              <h5>📈 Areas for Improvement</h5>
              <ul>
                {feedback.improvements.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {feedback.suggestions?.length > 0 && (
            <div className="feedback-section suggestions">
              <h5>💡 Suggestions</h5>
              <ul>
                {feedback.suggestions.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {feedback.feedback_summary && (
            <div className="feedback-section summary">
              <h5>📋 Summary</h5>
              <p>{feedback.feedback_summary}</p>
            </div>
          )}

          {feedback.next_steps?.length > 0 && (
            <div className="feedback-section next-steps">
              <h5>🎯 Next Steps</h5>
              <ul>
                {feedback.next_steps.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <button className="btn btn-secondary" onClick={handleReset}>
            Submit Another
          </button>
        </div>
      )}
    </div>
  );
};

// Helper to determine score class
const getScoreClass = (score) => {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'average';
  return 'needs-work';
};

export default AIFeedbackForm;
