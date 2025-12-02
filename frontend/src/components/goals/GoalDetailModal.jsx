import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation schema with challenge targets
const goalSchema = z.object({
  title: z
    .string()
    .min(1, 'Goal title is required')
    .max(255, 'Title must be less than 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  category: z.string().min(1, 'Please select a category'),
  difficulty_level: z.enum(['easy', 'medium', 'hard']),
  target_completion_date: z.string().optional(),
  is_public: z.boolean(),
  challenges_target: z.number().min(0).max(100).default(0),
  challenges_period: z.enum(['day', 'week', 'month']).default('week'),
});

const CATEGORIES = [
  { value: 'programming', label: 'Programming', icon: '💻' },
  { value: 'web development', label: 'Web Development', icon: '🌐' },
  { value: 'data science', label: 'Data Science', icon: '📊' },
  { value: 'design', label: 'Design', icon: '🎨' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'marketing', label: 'Marketing', icon: '📢' },
  { value: 'language learning', label: 'Language Learning', icon: '🗣️' },
  { value: 'mathematics', label: 'Mathematics', icon: '🔢' },
  { value: 'science', label: 'Science', icon: '🔬' },
  { value: 'personal development', label: 'Personal Development', icon: '🌱' },
  { value: 'fitness', label: 'Fitness', icon: '💪' },
  { value: 'other', label: 'Other', icon: '📌' },
];

const GoalDetailModal = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  goal = null,
  initialData = {},
  colors = [],
}) => {
  const [selectedColor, setSelectedColor] = useState(
    goal?.color || initialData?.color || 'indigo'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'challenges', 'customize'

  const isEditing = !!goal;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: goal?.title || initialData?.title || '',
      description: goal?.description || initialData?.description || '',
      category: goal?.category || initialData?.category || '',
      difficulty_level:
        goal?.difficulty_level || initialData?.difficulty_level || 'medium',
      target_completion_date: goal?.target_completion_date
        ? new Date(goal.target_completion_date).toISOString().split('T')[0]
        : initialData?.target_completion_date || '',
      is_public: goal?.is_public || initialData?.is_public || false,
      challenges_target:
        goal?.challenges_target || initialData?.challenges_target || 0,
      challenges_period:
        goal?.challenges_period || initialData?.challenges_period || 'week',
    },
  });

  const watchedCategory = watch('category');
  const watchedDifficulty = watch('difficulty_level');
  const watchedChallengesTarget = watch('challenges_target');
  const watchedChallengesPeriod = watch('challenges_period');

  useEffect(() => {
    if (goal) {
      setSelectedColor(goal.color || 'indigo');
    }
  }, [goal]);

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await onSave({
        ...data,
        color: selectedColor,
        challenges_target: Number(data.challenges_target) || 0,
        target_completion_date: data.target_completion_date || null,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save goal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getCategoryIcon = (value) => {
    return CATEGORIES.find((c) => c.value === value)?.icon || '🎯';
  };

  const getPeriodLabel = (period) => {
    const labels = { day: 'Daily', week: 'Weekly', month: 'Monthly' };
    return labels[period] || period;
  };

  // Calculate estimated progress based on challenge targets
  const getEstimatedProgress = () => {
    if (!goal || !watchedChallengesTarget) return null;
    const completed = goal.challenges_completed || 0;
    const target = watchedChallengesTarget;
    const percentage = Math.min(100, Math.round((completed / target) * 100));
    return { completed, target, percentage };
  };

  const challengeProgress = getEstimatedProgress();

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="goal-detail-modal animate-scale-in">
        {/* Modal Header */}
        <div
          className="modal-header"
          style={{
            '--accent-color':
              colors.find((c) => c.id === selectedColor)?.primary || '#6366f1',
          }}
        >
          <div className="header-content">
            <span className="header-icon">
              {getCategoryIcon(watchedCategory)}
            </span>
            <div className="header-text">
              <h2>{isEditing ? 'Edit Goal' : 'Create New Goal'}</h2>
              <p>
                {isEditing
                  ? 'Update your learning goal'
                  : 'Set a new learning objective'}
              </p>
            </div>
          </div>
          <button
            className="close-btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          <button
            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Details
          </button>
          <button
            className={`tab ${activeTab === 'challenges' ? 'active' : ''}`}
            onClick={() => setActiveTab('challenges')}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            Challenges
          </button>
          <button
            className={`tab ${activeTab === 'customize' ? 'active' : ''}`}
            onClick={() => setActiveTab('customize')}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Customize
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="modal-body">
          {activeTab === 'details' ? (
            <div className="details-tab">
              {/* Title */}
              <div className="form-group">
                <label htmlFor="title">
                  <span className="label-icon">✏️</span>
                  Goal Title
                  <span className="required">*</span>
                </label>
                <input
                  {...register('title')}
                  type="text"
                  id="title"
                  placeholder="What do you want to achieve?"
                  className={errors.title ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.title && (
                  <span className="error-message">{errors.title.message}</span>
                )}
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">
                  <span className="label-icon">📝</span>
                  Description
                </label>
                <textarea
                  {...register('description')}
                  id="description"
                  rows="3"
                  placeholder="Describe your goal in detail..."
                  className={errors.description ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.description && (
                  <span className="error-message">
                    {errors.description.message}
                  </span>
                )}
              </div>

              {/* Category */}
              <div className="form-group">
                <label>
                  <span className="label-icon">📂</span>
                  Category
                  <span className="required">*</span>
                </label>
                <div className="category-grid">
                  {CATEGORIES.map((cat) => (
                    <label
                      key={cat.value}
                      className={`category-option ${
                        watchedCategory === cat.value ? 'selected' : ''
                      }`}
                    >
                      <input
                        {...register('category')}
                        type="radio"
                        value={cat.value}
                        disabled={isSubmitting}
                      />
                      <span className="category-icon">{cat.icon}</span>
                      <span className="category-label">{cat.label}</span>
                    </label>
                  ))}
                </div>
                {errors.category && (
                  <span className="error-message">
                    {errors.category.message}
                  </span>
                )}
              </div>

              {/* Difficulty & Points Row */}
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <span className="label-icon">📊</span>
                    Difficulty
                  </label>
                  <div className="difficulty-options">
                    {[
                      {
                        value: 'easy',
                        label: 'Easy',
                        icon: '🌱',
                        color: '#10b981',
                      },
                      {
                        value: 'medium',
                        label: 'Medium',
                        icon: '🌿',
                        color: '#f59e0b',
                      },
                      {
                        value: 'hard',
                        label: 'Hard',
                        icon: '🌳',
                        color: '#ef4444',
                      },
                    ].map((diff) => (
                      <label
                        key={diff.value}
                        className={`difficulty-option ${
                          watchedDifficulty === diff.value ? 'selected' : ''
                        }`}
                        style={{ '--diff-color': diff.color }}
                      >
                        <input
                          {...register('difficulty_level')}
                          type="radio"
                          value={diff.value}
                          disabled={isSubmitting}
                        />
                        <span className="diff-icon">{diff.icon}</span>
                        <span className="diff-label">{diff.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Target Date */}
              <div className="form-group">
                <label htmlFor="target_completion_date">
                  <span className="label-icon">📅</span>
                  Target Completion Date
                </label>
                <input
                  {...register('target_completion_date')}
                  type="date"
                  id="target_completion_date"
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.target_completion_date ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.target_completion_date && (
                  <span className="error-message">
                    {errors.target_completion_date.message}
                  </span>
                )}
              </div>

              {/* Public Toggle */}
              <div className="form-group toggle-group">
                <label className="toggle-label">
                  <input
                    {...register('is_public')}
                    type="checkbox"
                    disabled={isSubmitting}
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-text">
                    <span className="toggle-icon">🌍</span>
                    Make this goal public
                    <span className="toggle-hint">
                      Others can see and get inspired
                    </span>
                  </span>
                </label>
              </div>
            </div>
          ) : activeTab === 'challenges' ? (
            <div className="challenges-tab">
              {/* Challenge Target Section */}
              <div className="challenge-target-section">
                <h4>
                  <span>🎯</span>
                  Link Challenges to This Goal
                </h4>
                <p>
                  Set a challenge completion target to track progress toward
                  this goal. Completed challenges will contribute to your goal
                  progress.
                </p>

                <div className="target-inputs">
                  <div className="target-input-group">
                    <label htmlFor="challenges_target">
                      Challenges to Complete
                    </label>
                    <input
                      {...register('challenges_target', {
                        valueAsNumber: true,
                      })}
                      type="number"
                      id="challenges_target"
                      min="0"
                      max="100"
                      placeholder="e.g., 5"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="target-input-group">
                    <label htmlFor="challenges_period">Per Period</label>
                    <select
                      {...register('challenges_period')}
                      id="challenges_period"
                      disabled={isSubmitting}
                    >
                      <option value="day">Daily</option>
                      <option value="week">Weekly</option>
                      <option value="month">Monthly</option>
                    </select>
                  </div>
                </div>

                {watchedChallengesTarget > 0 && (
                  <div className="linked-challenges-info">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <span>
                      Complete{' '}
                      <strong>
                        {watchedChallengesTarget} challenge
                        {watchedChallengesTarget > 1 ? 's' : ''}
                      </strong>{' '}
                      {getPeriodLabel(watchedChallengesPeriod).toLowerCase()} to
                      make progress on this goal. Challenges tagged with your
                      goal's category ({getCategoryIcon(watchedCategory)}{' '}
                      {watchedCategory || 'any'}) will automatically contribute!
                    </span>
                  </div>
                )}

                {/* Show current progress if editing */}
                {isEditing &&
                  challengeProgress &&
                  challengeProgress.target > 0 && (
                    <div className="goal-challenge-progress">
                      <div className="progress-header">
                        <span>
                          Challenge Progress This{' '}
                          {getPeriodLabel(watchedChallengesPeriod).replace(
                            'ly',
                            ''
                          )}
                        </span>
                        <span>
                          {challengeProgress.completed} /{' '}
                          {challengeProgress.target}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${challengeProgress.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
              </div>

              {/* Category Info */}
              <div className="category-info-box">
                <h4>
                  <span>💡</span>
                  How It Works
                </h4>
                <ul>
                  <li>
                    <strong>Category Matching:</strong> Challenges with the same
                    category as your goal will automatically count toward your
                    progress.
                  </li>
                  <li>
                    <strong>Tags:</strong> When creating challenges, add your
                    goal's category as a tag to link them.
                  </li>
                  <li>
                    <strong>Points:</strong> Each challenge is worth 5 points.
                    Completing your challenge target helps you reach your goal
                    faster!
                  </li>
                  <li>
                    <strong>Progress Tracking:</strong> Your goal's progress
                    percentage will update as you complete linked challenges.
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="customize-tab">
              {/* Color Selection */}
              <div className="form-group">
                <label>
                  <span className="label-icon">🎨</span>
                  Goal Color Theme
                </label>
                <div className="color-picker">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      className={`color-option ${
                        selectedColor === color.id ? 'selected' : ''
                      }`}
                      style={{ backgroundColor: color.primary }}
                      onClick={() => setSelectedColor(color.id)}
                      title={color.name}
                    >
                      {selectedColor === color.id && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
                <p className="color-hint">
                  Choose a color to personalize your goal card
                </p>
              </div>

              {/* Preview */}
              <div className="form-group">
                <label>
                  <span className="label-icon">👁️</span>
                  Preview
                </label>
                <div
                  className="goal-preview"
                  style={{
                    '--goal-color':
                      colors.find((c) => c.id === selectedColor)?.primary ||
                      '#6366f1',
                    '--goal-color-light':
                      colors.find((c) => c.id === selectedColor)?.light ||
                      '#e0e7ff',
                  }}
                >
                  <div className="preview-accent" />
                  <div className="preview-content">
                    <span className="preview-icon">
                      {getCategoryIcon(watchedCategory)}
                    </span>
                    <span className="preview-title">
                      {watch('title') || 'Your Goal Title'}
                    </span>
                    {watchedChallengesTarget > 0 && (
                      <span className="preview-challenges">
                        🎯 {watchedChallengesTarget} challenges/
                        {watchedChallengesPeriod}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="modal-footer">
            {isEditing && onDelete && (
              <button
                type="button"
                className="btn-delete"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete
              </button>
            )}
            <div className="footer-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-save"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {isEditing ? 'Save Changes' : 'Create Goal'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalDetailModal;
