import React, { useState } from 'react';
import './GoalCard.css';

const GoalCard = ({ goal, onEdit, onDelete, onUpdateProgress }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleProgressUpdate = async (newProgress) => {
    if (onUpdateProgress) {
      await onUpdateProgress(goal.id, newProgress);
    }
  };

  const getDifficultyEmoji = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return '🌱';
      case 'medium':
        return '🌿';
      case 'hard':
        return '🔥';
      default:
        return '🌿';
    }
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      programming: '💻',
      design: '🎨',
      business: '💼',
      writing: '✍️',
      language: '🌍',
      music: '🎵',
      math: '📊',
      science: '🔬',
      fitness: '💪',
      learning: '📚',
    };
    return emojis[category?.toLowerCase()] || '🎯';
  };

  const getAccentColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return '#10b981';
      case 'medium':
        return '#f59e0b';
      case 'hard':
        return '#ef4444';
      default:
        return '#6366f1';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return '#ef4444';
    if (progress >= 75) return '#f59e0b';
    if (progress >= 50) return '#10b981';
    return '#10b981';
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset =
    circumference - ((goal.progress_percentage || 0) / 100) * circumference;

  const isOverdue =
    goal.target_completion_date &&
    new Date(goal.target_completion_date) < new Date() &&
    !goal.is_completed;

  return (
    <div
      className={`goal-card-redesign ${goal.is_completed ? 'completed' : ''} ${
        isOverdue ? 'overdue' : ''
      }`}
      style={{
        '--accent-color': getAccentColor(goal.difficulty_level),
        '--progress-color': getProgressColor(goal.progress_percentage || 0),
      }}
    >
      {/* Accent Bar */}
      <div className="accent-bar"></div>

      {/* Top Section - Icon + Status Badge */}
      <div className="card-top">
        <div className="icon-wrapper">{getCategoryEmoji(goal.category)}</div>
        {goal.is_completed && <div className="status-badge done">✓ DONE</div>}
      </div>

      {/* Title Section */}
      <div className="title-section">
        <h3 className="goal-title">{goal.title}</h3>
      </div>

      {/* Description */}
      {goal.description && (
        <p className="goal-description">{goal.description}</p>
      )}

      {/* Difficulty Badge */}
      {goal.difficulty_level && (
        <div className="difficulty-section">
          <span className="difficulty-emoji">
            {getDifficultyEmoji(goal.difficulty_level)}
          </span>
          <span className="difficulty-text">{goal.difficulty_level}</span>
        </div>
      )}

      {/* Circular Progress */}
      <div className="progress-circle-wrapper">
        <svg className="progress-circle" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle cx="60" cy="60" r="45" className="progress-bg" />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="45"
            className="progress-ring"
            style={{
              strokeDashoffset: strokeDashoffset,
            }}
            stroke={getProgressColor(goal.progress_percentage || 0)}
          />
        </svg>
        <div className="progress-text">
          <span className="progress-value">
            {goal.progress_percentage || 0}%
          </span>
        </div>
      </div>

      {/* Menu & Actions */}
      <div className="card-actions">
        <div className="menu-container">
          <button
            className="menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Goal menu"
          >
            ⋯
          </button>
          {isMenuOpen && (
            <div className="menu-dropdown">
              <button
                onClick={() => {
                  onEdit(goal);
                  setIsMenuOpen(false);
                }}
                className="menu-item"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => {
                  onDelete(goal.id);
                  setIsMenuOpen(false);
                }}
                className="menu-item delete-item"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
