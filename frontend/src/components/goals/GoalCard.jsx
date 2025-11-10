import React, { useState } from 'react';

const GoalCard = ({ goal, onEdit, onDelete, onUpdateProgress }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleProgressUpdate = async (newProgress) => {
    if (onUpdateProgress) {
      await onUpdateProgress(goal.id, newProgress);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      default: return 'difficulty-medium';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'progress-complete';
    if (progress >= 75) return 'progress-high';
    if (progress >= 50) return 'progress-medium';
    if (progress >= 25) return 'progress-low';
    return 'progress-start';
  };

  const isOverdue = goal.target_completion_date &&
    new Date(goal.target_completion_date) < new Date() &&
    !goal.is_completed;

  return (
    <div className={`goal-card ${goal.is_completed ? 'goal-completed' : ''} ${isOverdue ? 'goal-overdue' : ''}`}>
      <div className="goal-header">
        <div className="goal-title-section">
          <h3 className="goal-title">{goal.title}</h3>
          {goal.category && (
            <span className="goal-category">{goal.category}</span>
          )}
        </div>

        <div className="goal-actions">
          <button
            className="goal-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ⋯
          </button>
          {isMenuOpen && (
            <div className="goal-menu">
              <button onClick={() => { onEdit(goal); setIsMenuOpen(false); }}>
                Edit
              </button>
              <button
                onClick={() => { onDelete(goal.id); setIsMenuOpen(false); }}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {goal.description && (
        <div className="goal-description">
          <p>{goal.description}</p>
        </div>
      )}

      <div className="goal-progress-section">
        <div className="progress-header">
          <span className="progress-label">Progress</span>
          <span className="progress-percentage">
            {goal.progress_percentage || 0}%
          </span>
        </div>
        <div className="progress-bar">
          <div
            className={`progress-fill ${getProgressColor(goal.progress_percentage || 0)}`}
            style={{ width: `${goal.progress_percentage || 0}%` }}
          />
        </div>
        
        {!goal.is_completed && (
          <div className="progress-controls">
            <button
              onClick={() => handleProgressUpdate(Math.min(100, (goal.progress_percentage || 0) + 10))}
              className="progress-btn"
              disabled={goal.progress_percentage >= 100}
            >
              +10%
            </button>
            <button
              onClick={() => handleProgressUpdate(Math.max(0, (goal.progress_percentage || 0) - 10))}
              className="progress-btn"
              disabled={goal.progress_percentage <= 0}
            >
              -10%
            </button>
          </div>
        )}
      </div>

      <div className="goal-footer">
        <div className="goal-meta">
          <span className={`goal-difficulty ${getDifficultyColor(goal.difficulty_level)}`}>
            {goal.difficulty_level}
          </span>
          {goal.points_reward > 0 && (
            <span className="goal-points">
              {goal.points_reward} pts
            </span>
          )}
        </div>

        {goal.target_completion_date && (
          <div className={`goal-date ${isOverdue ? 'date-overdue' : ''}`}>
            <span className="date-label">
              {isOverdue ? 'Overdue:' : 'Due:'}
            </span>
            <span className="date-value">
              {formatDate(goal.target_completion_date)}
            </span>
          </div>
        )}

        {goal.is_completed && goal.completion_date && (
          <div className="completion-date">
            <span className="completion-icon">✅</span>
            <span>Completed {formatDate(goal.completion_date)}</span>
          </div>
        )}
      </div>

      {goal.is_public && (
        <div className="goal-visibility">
          <span className="public-badge">Public</span>
        </div>
      )}
    </div>
  );
};

export default GoalCard;