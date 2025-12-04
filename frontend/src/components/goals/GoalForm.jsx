import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation schema
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
  target_completion_date: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      return new Date(date) > new Date();
    }, 'Target date must be in the future'),
  is_public: z.boolean(),
});

const CATEGORIES = [
  'Programming',
  'Web Development',
  'Data Science',
  'Design',
  'Business',
  'Marketing',
  'Language Learning',
  'Mathematics',
  'Science',
  'Personal Development',
  'Fitness',
  'Other',
];

const GoalForm = ({ onSubmit, initialData = null, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      difficulty_level: initialData?.difficulty_level || 'medium',
      target_completion_date: initialData?.target_completion_date
        ? new Date(initialData.target_completion_date)
            .toISOString()
            .split('T')[0]
        : '',
      is_public: initialData?.is_public || false,
    },
  });

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      target_completion_date: data.target_completion_date || null,
    });
  };

  const handleReset = () => {
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="goal-form">
      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Goal Title *
        </label>
        <input
          {...register('title')}
          type="text"
          id="title"
          className={`form-input ${errors.title ? 'form-input-error' : ''}`}
          placeholder="What do you want to learn?"
          disabled={isLoading}
        />
        {errors.title && (
          <span className="form-error">{errors.title.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows="4"
          className={`form-textarea ${
            errors.description ? 'form-input-error' : ''
          }`}
          placeholder="Describe your learning goal in detail..."
          disabled={isLoading}
        />
        {errors.description && (
          <span className="form-error">{errors.description.message}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category" className="form-label">
            Category *
          </label>
          <select
            {...register('category')}
            id="category"
            className={`form-select ${
              errors.category ? 'form-input-error' : ''
            }`}
            disabled={isLoading}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat.toLowerCase()}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <span className="form-error">{errors.category.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="difficulty_level" className="form-label">
            Difficulty Level
          </label>
          <select
            {...register('difficulty_level')}
            id="difficulty_level"
            className="form-select"
            disabled={isLoading}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="target_completion_date" className="form-label">
            Target Completion Date
          </label>
          <input
            {...register('target_completion_date')}
            type="date"
            id="target_completion_date"
            className={`form-input ${
              errors.target_completion_date ? 'form-input-error' : ''
            }`}
            min={new Date().toISOString().split('T')[0]}
            disabled={isLoading}
          />
          {errors.target_completion_date && (
            <span className="form-error">
              {errors.target_completion_date.message}
            </span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label className="form-checkbox-label">
          <input
            {...register('is_public')}
            type="checkbox"
            className="form-checkbox"
            disabled={isLoading}
          />
          <span className="checkbox-text">
            Make this goal public (others can see and get inspired)
          </span>
        </label>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={handleReset}
          className="btn btn-secondary"
          disabled={isLoading}
        >
          Reset
        </button>
        <button
          type="submit"
          className={`btn btn-primary ${isLoading ? 'btn-loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="btn-spinner"></span>
              {initialData ? 'Updating...' : 'Creating...'}
            </>
          ) : initialData ? (
            'Update Goal'
          ) : (
            'Create Goal'
          )}
        </button>
      </div>
    </form>
  );
};

export default GoalForm;
