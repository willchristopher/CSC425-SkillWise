import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation schema
const challengeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  instructions: z.string().min(1, 'Instructions are required'),
  category: z.string().min(1, 'Category is required'),
  difficulty_level: z.enum(['easy', 'medium', 'hard']),
  estimated_time_minutes: z
    .number()
    .min(1, 'Must be at least 1 minute')
    .optional(),
  points_reward: z.literal(5).default(5), // Capped at 5 points
  max_attempts: z.number().min(1, 'Must allow at least 1 attempt').default(3),
  goal_id: z.number().int().positive().optional(),
  progress_contribution: z.number().min(1).max(100).default(10),
  learning_objectives: z.array(z.string()).default([]),
});

const ChallengeForm = ({
  challenge = null,
  onSubmit,
  onCancel,
  isLoading = false,
  goals = [],
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(challengeSchema),
    defaultValues: challenge || {
      title: '',
      description: '',
      instructions: '',
      category: '',
      difficulty_level: 'medium',
      estimated_time_minutes: 30,
      points_reward: 5, // Fixed at 5 points
      max_attempts: 3,
      goal_id: '',
      progress_contribution: 10,
      learning_objectives: [],
    },
  });

  const watchedObjectives = watch('learning_objectives');

  const handleAddObjective = () => {
    const newObjective = prompt('Enter a learning objective:');
    if (newObjective && newObjective.trim()) {
      setValue('learning_objectives', [
        ...watchedObjectives,
        newObjective.trim(),
      ]);
    }
  };

  const handleRemoveObjective = (index) => {
    setValue(
      'learning_objectives',
      watchedObjectives.filter((_, i) => i !== index)
    );
  };

  const categories = [
    'Programming',
    'Web Development',
    'Data Science',
    'Machine Learning',
    'Design',
    'DevOps',
    'Database',
    'Security',
    'Mobile Development',
    'Game Development',
    'Other',
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="challenge-form">
      <div className="form-section">
        <h3>Basic Information</h3>

        <div className="form-group">
          <label htmlFor="title" className="form-label required">
            Challenge Title
          </label>
          <input
            id="title"
            type="text"
            {...register('title')}
            className={`form-input ${errors.title ? 'error' : ''}`}
            placeholder="Enter a descriptive title for your challenge"
          />
          {errors.title && (
            <span className="form-error">{errors.title.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label required">
            Description
          </label>
          <textarea
            id="description"
            {...register('description')}
            className={`form-textarea ${errors.description ? 'error' : ''}`}
            placeholder="Provide a clear description of what this challenge involves"
            rows={3}
          />
          {errors.description && (
            <span className="form-error">{errors.description.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="instructions" className="form-label required">
            Instructions
          </label>
          <textarea
            id="instructions"
            {...register('instructions')}
            className={`form-textarea ${errors.instructions ? 'error' : ''}`}
            placeholder="Provide detailed step-by-step instructions for completing this challenge"
            rows={5}
          />
          {errors.instructions && (
            <span className="form-error">{errors.instructions.message}</span>
          )}
        </div>
      </div>

      <div className="form-section">
        <h3>Challenge Settings</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category" className="form-label required">
              Category
            </label>
            <select
              id="category"
              {...register('category')}
              className={`form-select ${errors.category ? 'error' : ''}`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="form-error">{errors.category.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="difficulty_level" className="form-label required">
              Difficulty Level
            </label>
            <select
              id="difficulty_level"
              {...register('difficulty_level')}
              className={`form-select ${
                errors.difficulty_level ? 'error' : ''
              }`}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            {errors.difficulty_level && (
              <span className="form-error">
                {errors.difficulty_level.message}
              </span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="estimated_time_minutes" className="form-label">
              Estimated Time (minutes)
            </label>
            <input
              id="estimated_time_minutes"
              type="number"
              min="1"
              {...register('estimated_time_minutes', { valueAsNumber: true })}
              className={`form-input ${
                errors.estimated_time_minutes ? 'error' : ''
              }`}
              placeholder="30"
            />
            {errors.estimated_time_minutes && (
              <span className="form-error">
                {errors.estimated_time_minutes.message}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="points_reward" className="form-label">
              Points Reward
            </label>
            <div className="points-fixed-container">
              <input
                id="points_reward"
                type="number"
                value={5}
                readOnly
                className="form-input points-fixed"
                title="All challenges are worth 5 points"
              />
              <span className="points-fixed-badge">Fixed</span>
            </div>
            <span className="form-hint">
              All challenges are worth 5 points to keep things fair!
            </span>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="max_attempts" className="form-label">
              Maximum Attempts
            </label>
            <input
              id="max_attempts"
              type="number"
              min="1"
              {...register('max_attempts', { valueAsNumber: true })}
              className={`form-input ${errors.max_attempts ? 'error' : ''}`}
              placeholder="3"
            />
            {errors.max_attempts && (
              <span className="form-error">{errors.max_attempts.message}</span>
            )}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Additional Information</h3>

        <div className="form-group">
          <label htmlFor="goal_id" className="form-label">
            Assign to Goal (Optional)
          </label>
          <p className="form-hint" style={{ marginBottom: '0.75rem' }}>
            🎯 Select a goal to link this challenge to. When you complete the
            challenge, it will count towards your goal progress.
          </p>
          <select
            id="goal_id"
            {...register('goal_id', { valueAsNumber: true })}
            className={`form-input ${errors.goal_id ? 'error' : ''}`}
          >
            <option value="">-- No Goal Selected --</option>
            {goals && goals.length > 0 ? (
              goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))
            ) : (
              <option disabled>No goals available</option>
            )}
          </select>
          {errors.goal_id && (
            <span className="form-error">{errors.goal_id.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="progress_contribution" className="form-label">
            Goal Progress Contribution (%)
          </label>
          <p className="form-hint" style={{ marginBottom: '0.75rem' }}>
            📈 How much should completing this challenge add to your goal's
            progress? (1-100%)
          </p>
          <div className="progress-contribution-container">
            <input
              id="progress_contribution"
              type="range"
              min="1"
              max="100"
              {...register('progress_contribution', { valueAsNumber: true })}
              className="progress-contribution-slider"
            />
            <span className="progress-contribution-value">
              {watch('progress_contribution') || 10}%
            </span>
          </div>
          {errors.progress_contribution && (
            <span className="form-error">
              {errors.progress_contribution.message}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Learning Objectives</label>
          <div className="objectives-manager">
            <div className="objectives-list">
              {watchedObjectives.map((objective, index) => (
                <div key={index} className="objective-item">
                  <span className="objective">{objective}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveObjective(index)}
                    className="objective-remove"
                    aria-label={`Remove objective: ${objective}`}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddObjective}
                className="btn btn-outline btn-sm"
              >
                + Add Learning Objective
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading
            ? 'Saving...'
            : challenge
            ? 'Update Challenge'
            : 'Create Challenge'}
        </button>
      </div>
    </form>
  );
};

export default ChallengeForm;
