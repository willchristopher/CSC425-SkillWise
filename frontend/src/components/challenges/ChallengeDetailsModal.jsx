import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './ChallengeDetailsModal.css';

const ChallengeDetailsModal = ({
  isOpen,
  onClose,
  challenge,
  onSubmit,
  userSubmission,
}) => {
  const [submissionCode, setSubmissionCode] = useState(
    userSubmission?.submission_text || userSubmission?.code || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPeerReviewPrompt, setShowPeerReviewPrompt] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !challenge) return null;

  // Determine if this is a code-based challenge
  const isCodeChallenge = () => {
    const codeCategories = [
      'JavaScript',
      'Python',
      'Java',
      'C++',
      'React',
      'Web Development',
      'Backend Development',
    ];
    return codeCategories.includes(challenge.category);
  };

  // Get submission label based on category
  const getSubmissionLabel = () => {
    if (isCodeChallenge()) {
      return 'Code Submission';
    }
    switch (challenge.category) {
      case 'Creative Writing':
      case 'English':
        return 'Your Response';
      case 'Music Theory':
      case 'Visual Arts':
      case 'Photography':
      case 'Design':
        return 'Your Work';
      default:
        return 'Your Answer';
    }
  };

  // Get placeholder text based on category
  const getPlaceholder = () => {
    if (isCodeChallenge()) {
      return 'Paste your code here...';
    }
    switch (challenge.category) {
      case 'Creative Writing':
        return 'Write your story or essay here...';
      case 'Music Theory':
        return 'Describe your answer or paste notation...';
      case 'Visual Arts':
      case 'Photography':
      case 'Design':
        return 'Describe your work, paste a link, or upload details...';
      default:
        return 'Enter your answer or response here...';
    }
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    if (!submissionCode.trim()) return;
    // Show peer review prompt before submitting
    setShowPeerReviewPrompt(true);
  };

  const handleConfirmSubmit = async (requestPeerReview) => {
    setShowPeerReviewPrompt(false);
    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit({
        challenge_id: challenge.id,
        code: submissionCode,
        requestPeerReview: requestPeerReview,
      });

      setSubmissionSuccess(true);
      // Close modal after showing success message
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to submit solution';
      setError(errorMessage);
      console.error('Failed to submit challenge:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'difficulty-easy';
      case 'medium':
        return 'difficulty-medium';
      case 'hard':
        return 'difficulty-hard';
      default:
        return 'difficulty-medium';
    }
  };

  const formatTime = (minutes) => {
    if (!minutes) return 'No estimate';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const attemptsUsed = userSubmission?.attempts_count || 0;
  const maxAttempts = challenge.max_attempts || 3;
  const canSubmit = attemptsUsed < maxAttempts;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content challenge-details-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{challenge.title}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* Challenge Info */}
          <div className="challenge-info">
            <div className="info-row">
              <span
                className={`difficulty-badge ${getDifficultyColor(
                  challenge.difficulty_level
                )}`}
              >
                {challenge.difficulty_level}
              </span>
              <span className="category-badge">{challenge.category}</span>
              <span className="time-badge">
                ⏱️ {formatTime(challenge.estimated_time_minutes)}
              </span>
              <span className="points-badge">
                +{challenge.points_reward} pts
              </span>
            </div>

            {userSubmission && (
              <div className="submission-status">
                <div className="status-item">
                  <span className="label">Attempts:</span>
                  <span className="value">
                    {attemptsUsed} / {maxAttempts}
                  </span>
                </div>
                {userSubmission.score !== null && (
                  <div className="status-item">
                    <span className="label">Best Score:</span>
                    <span className="value">{userSubmission.score}%</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="challenge-section">
            <h3>Description</h3>
            <p className="description-text">{challenge.description}</p>
          </div>

          {/* Instructions */}
          {challenge.instructions && (
            <div className="challenge-section">
              <h3>Instructions</h3>
              <div className="instructions-text">
                {challenge.instructions.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          )}

          {/* Learning Objectives */}
          {challenge.learning_objectives &&
            challenge.learning_objectives.length > 0 && (
              <div className="challenge-section">
                <h3>Learning Objectives</h3>
                <ul className="objectives-list">
                  {challenge.learning_objectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>
            )}

          {/* Starter Code */}
          {challenge.starter_code && (
            <div className="challenge-section">
              <h3>Starter Code</h3>
              <pre className="code-block">
                <code>{challenge.starter_code}</code>
              </pre>
            </div>
          )}

          {/* Test Cases */}
          {challenge.test_cases && challenge.test_cases.length > 0 && (
            <div className="challenge-section">
              <h3>Test Cases</h3>
              <div className="test-cases">
                {challenge.test_cases.map((testCase, index) => (
                  <div key={index} className="test-case">
                    <pre>{testCase}</pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hints */}
          {challenge.hints && challenge.hints.length > 0 && (
            <div className="challenge-section">
              <h3>💡 Hints</h3>
              <ul className="hints-list">
                {challenge.hints.map((hint, index) => (
                  <li key={index}>{hint}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Submission Form */}
          {!submissionSuccess && !showPeerReviewPrompt && (
            <div className="challenge-section">
              <h3>Your Solution</h3>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmitClick}>
                <div className="form-group">
                  <label htmlFor="submission-code">
                    {getSubmissionLabel()}
                    {!canSubmit && (
                      <span className="error-text">
                        {' '}
                        (Maximum attempts reached)
                      </span>
                    )}
                  </label>
                  <textarea
                    id="submission-code"
                    className={
                      isCodeChallenge() ? 'code-editor' : 'text-editor'
                    }
                    value={submissionCode}
                    onChange={(e) => setSubmissionCode(e.target.value)}
                    placeholder={getPlaceholder()}
                    rows={15}
                    disabled={!canSubmit}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      isSubmitting || !canSubmit || !submissionCode.trim()
                    }
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Solution'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Peer Review Prompt */}
          {showPeerReviewPrompt && (
            <div className="challenge-section peer-review-prompt-section">
              <h3>👥 Would you like peer feedback?</h3>
              <p className="prompt-description">
                Your submission will be saved and the challenge marked as
                complete. Would you also like to submit your work for peer
                review to get feedback from other learners?
              </p>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <div className="form-actions peer-review-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleConfirmSubmit(false)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'No, just complete it'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleConfirmSubmit(true)}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Submitting...'
                    : '✓ Yes, request peer review'}
                </button>
              </div>
            </div>
          )}

          {/* Success Message */}
          {submissionSuccess && (
            <div className="challenge-section success-section">
              <div className="success-message">
                <span className="success-icon">🎉</span>
                <h3>Challenge Completed!</h3>
                <p>
                  Great job! Your solution has been saved and points have been
                  awarded.
                </p>
              </div>
            </div>
          )}

          {/* Previous Submission Info */}
          {userSubmission && userSubmission.feedback && !submissionSuccess && (
            <div className="challenge-section feedback-section">
              <h3>Previous Feedback</h3>
              <div className="feedback-content">{userSubmission.feedback}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ChallengeDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  challenge: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  userSubmission: PropTypes.object,
};

export default ChallengeDetailsModal;
