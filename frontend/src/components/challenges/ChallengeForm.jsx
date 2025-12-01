import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCategoryList } from '../../constants/categories';

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
  points_reward: z.number().min(1, 'Must be at least 1 point').default(10),
  max_attempts: z.number().min(1, 'Must allow at least 1 attempt').default(3),
  requires_peer_review: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  learning_objectives: z.array(z.string()).default([]),
});

// Default form values - defined outside component to prevent recreation on each render
const defaultFormValues = {
  title: '',
  description: '',
  instructions: '',
  category: '',
  difficulty_level: 'medium',
  estimated_time_minutes: 30,
  points_reward: 10,
  max_attempts: 3,
  requires_peer_review: false,
  tags: [],
  learning_objectives: [],
};

const ChallengeForm = ({
  challenge = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(challengeSchema),
    defaultValues: challenge || defaultFormValues,
  });

  // Reset form when challenge prop changes (e.g., AI-generated challenge)
  useEffect(() => {
    if (challenge) {
      reset({
        ...defaultFormValues,
        ...challenge,
        // Ensure instructions field is filled
        instructions: challenge.instructions || challenge.description || '',
      });
    } else {
      reset(defaultFormValues);
    }
  }, [challenge, reset]);

  const watchedTags = watch('tags');
  const watchedObjectives = watch('learning_objectives');

  const handleAddTag = () => {
    const newTag = prompt('Enter a new tag:');
    if (newTag && newTag.trim()) {
      setValue('tags', [...watchedTags, newTag.trim()]);
    }
  };

  const handleRemoveTag = (index) => {
    setValue(
      'tags',
      watchedTags.filter((_, i) => i !== index)
    );
  };

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

  // Get categories from shared constants
  const categories = getCategoryList();

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
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
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
            <input
              id="points_reward"
              type="number"
              min="1"
              {...register('points_reward', { valueAsNumber: true })}
              className={`form-input ${errors.points_reward ? 'error' : ''}`}
              placeholder="10"
            />
            {errors.points_reward && (
              <span className="form-error">{errors.points_reward.message}</span>
            )}
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

          <div className="form-group">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                {...register('requires_peer_review')}
                className="form-checkbox"
              />
              <span className="checkbox-text">Requires Peer Review</span>
            </label>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Additional Information</h3>

        <div className="form-group">
          <label className="form-label">Tags</label>
          <div className="tag-manager">
            <div className="tag-list">
              {watchedTags.map((tag, index) => (
                <div key={index} className="tag-item">
                  <span className="tag">{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(index)}
                    className="tag-remove"
                    aria-label={`Remove ${tag} tag`}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddTag}
                className="btn btn-outline btn-sm"
              >
                + Add Tag
              </button>
            </div>
          </div>
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
