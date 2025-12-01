import React, { useState } from 'react';
import PropTypes from 'prop-types';
import LinearProgress from '../progress/LinearProgress';

const ChallengeCard = ({
  challenge,
  onStart,
  onViewDetails,
  onLinkToGoal,
  onEdit,
  onDelete,
  userSubmission,
  showActions = true,
  isOwner = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Challenge status based on user submission
  const getStatus = () => {
    if (!userSubmission) return 'not-started';
    return userSubmission.status || 'in-progress';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in-progress':
      case 'submitted':
      case 'pending':
        return 'status-in-progress';
      case 'failed':
        return 'status-failed';
      default:
        return 'status-not-started';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'difficulty-easy';
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

  const handleAction = async (actionFn, ...args) => {
    if (!actionFn) return;

    try {
      setIsLoading(true);
      await actionFn(...args);
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuAction = (action, ...args) => {
    setIsMenuOpen(false);
    handleAction(action, ...args);
  };

  const status = getStatus();
  const canStart =
    status === 'not-started' ||
    (status === 'failed' &&
      (userSubmission?.attempts_count || 0) < (challenge?.max_attempts || 3));

  return (
    <div className={`challenge-card ${getStatusColor(status)}`}>
      {/* Challenge Header */}
      <div className="challenge-header">
        <div className="header-content">
          <h3 className="challenge-title" title={challenge?.title}>
            {challenge?.title || 'Challenge Title'}
          </h3>
          <div className="challenge-status">
            <span className={`status-badge ${getStatusColor(status)}`}>
              {status.replace('-', ' ')}
            </span>
          </div>
        </div>

        {showActions && (isOwner || status !== 'not-started') && (
          <div className="challenge-menu">
            <button
              type="button"
              className="menu-button"
              onClick={handleMenuToggle}
              aria-label="Challenge options"
              disabled={isLoading}
            >
              ⋯
            </button>

            {isMenuOpen && (
              <div className="menu-dropdown">
                <button
                  type="button"
                  className="menu-item"
                  onClick={() => handleMenuAction(onViewDetails, challenge)}
                >
                  View Details
                </button>
                {onLinkToGoal && (
                  <button
                    type="button"
                    className="menu-item"
                    onClick={() => handleMenuAction(onLinkToGoal, challenge)}
                  >
                    Link to Goal
                  </button>
                )}
                {isOwner && onEdit && (
                  <button
                    type="button"
                    className="menu-item"
                    onClick={() => handleMenuAction(onEdit, challenge)}
                  >
                    Edit
                  </button>
                )}
                {isOwner && onDelete && (
                  <button
                    type="button"
                    className="menu-item delete"
                    onClick={() => handleMenuAction(onDelete, challenge)}
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Challenge Content */}
      <div className="challenge-content">
        <p className="challenge-description" title={challenge?.description}>
          {challenge?.description || 'Challenge description goes here...'}
        </p>

        {/* Meta Information */}
        <div className="challenge-meta">
          <div className="meta-item">
            <span className="meta-label">Category:</span>
            <span className="meta-value">
              {challenge?.category || 'General'}
            </span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Difficulty:</span>
            <span
              className={`difficulty-badge ${getDifficultyColor(
                challenge?.difficulty_level
              )}`}
            >
              {challenge?.difficulty_level || 'Medium'}
            </span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Time:</span>
            <span className="meta-value">
              ⏱️ {formatTime(challenge?.estimated_time_minutes)}
            </span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Points:</span>
            <span className="meta-value points">
              +{challenge?.points_reward || 10} pts
            </span>
          </div>
        </div>

        {/* Tags */}
        {challenge?.tags && challenge.tags.length > 0 && (
          <div className="challenge-tags">
            {challenge.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
            {challenge.tags.length > 3 && (
              <span className="tag more">
                +{challenge.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Progress Information */}
        {userSubmission && (
          <div className="submission-info">
            {userSubmission.score !== null && (
              <div className="score-info">
                <span className="score-label">Score:</span>
                <span className="score-value">{userSubmission.score}%</span>
              </div>
            )}

            {userSubmission.attempts_count > 0 && (
              <div className="attempts-info">
                <span className="attempts-label">Attempts:</span>
                <span className="attempts-value">
                  {userSubmission.attempts_count} /{' '}
                  {challenge?.max_attempts || 3}
                </span>
              </div>
            )}

            {userSubmission.submitted_at && (
              <div className="submitted-info">
                <span className="submitted-label">Submitted:</span>
                <span className="submitted-value">
                  {new Date(userSubmission.submitted_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {userSubmission && userSubmission.score !== null && (
          <div className="challenge-progress">
            <LinearProgress
              percentage={userSubmission.score || 0}
              height={6}
              color={getStatus() === 'completed' ? '#38a169' : '#3182ce'}
              backgroundColor="#f7fafc"
              animated={true}
              className="challenge-progress-bar"
            />
          </div>
        )}

        {/* Requirements */}
        {challenge?.requires_peer_review && (
          <div className="requirements">
            <span className="requirement-badge">Peer Review Required</span>
          </div>
        )}
      </div>

      {/* Challenge Footer */}
      <div className="challenge-footer">
        {showActions && (
          <div className="footer-actions">
            {canStart ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleAction(onStart, challenge)}
                disabled={isLoading}
              >
                {status === 'failed' ? 'Try Again' : 'Start Challenge'}
              </button>
            ) : status === 'completed' ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleAction(onViewDetails, challenge)}
                disabled={isLoading}
              >
                View Results
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleAction(onViewDetails, challenge)}
                disabled={isLoading}
              >
                View Progress
              </button>
            )}

            {onViewDetails && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleAction(onViewDetails, challenge)}
                disabled={isLoading}
              >
                Details
              </button>
            )}
          </div>
        )}

        {/* Statistics */}
        {(challenge?.submission_count > 0 ||
          challenge?.total_submissions > 0) && (
          <div className="challenge-stats">
            <span className="stat">
              {challenge.total_submissions || challenge.submission_count || 0}{' '}
              attempts
            </span>
            {challenge.average_score && (
              <span className="stat">
                {parseFloat(challenge.average_score).toFixed(1)}% avg
              </span>
            )}
          </div>
        )}
      </div>

      {/* Click overlay for card actions */}
      <div
        className="card-overlay"
        onClick={() => onViewDetails && onViewDetails(challenge)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onViewDetails) {
            e.preventDefault();
            onViewDetails(challenge);
          }
        }}
        aria-label={`View details for ${challenge?.title}`}
      />
    </div>
  );
};

ChallengeCard.propTypes = {
  challenge: PropTypes.object.isRequired,
  onStart: PropTypes.func,
  onViewDetails: PropTypes.func,
  onLinkToGoal: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  userSubmission: PropTypes.object,
  showActions: PropTypes.bool,
  isOwner: PropTypes.bool,
};

export default ChallengeCard;
