// Signup form component with React Hook Form and Zod validation
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import './AuthForm.css';

// Zod validation schema
const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name must be less than 50 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name must be less than 50 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const SignupForm = ({ onSubmit, error, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const submitHandler = async (data) => {
    if (onSubmit) {
      await onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="auth-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName" className="form-label">
            First Name
          </label>
          <input
            {...register('firstName')}
            type="text"
            id="firstName"
            className={`form-input ${errors.firstName ? 'error' : ''}`}
            placeholder="First name"
          />
          {errors.firstName && (
            <p className="error-text">{errors.firstName.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="lastName" className="form-label">
            Last Name
          </label>
          <input
            {...register('lastName')}
            type="text"
            id="lastName"
            className={`form-input ${errors.lastName ? 'error' : ''}`}
            placeholder="Last name"
          />
          {errors.lastName && (
            <p className="error-text">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email Address
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          className={`form-input ${errors.email ? 'error' : ''}`}
          placeholder="Enter your email"
        />
        {errors.email && <p className="error-text">{errors.email.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          {...register('password')}
          type="password"
          id="password"
          className={`form-input ${errors.password ? 'error' : ''}`}
          placeholder="Create a password"
        />
        {errors.password && (
          <p className="error-text">{errors.password.message}</p>
        )}
        <p
          style={{
            marginTop: '0.25rem',
            fontSize: '0.75rem',
            color: 'var(--color-text-tertiary)',
          }}
        >
          Must be 8+ characters with uppercase, lowercase, and number
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword" className="form-label">
          Confirm Password
        </label>
        <input
          {...register('confirmPassword')}
          type="password"
          id="confirmPassword"
          className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
          placeholder="Confirm your password"
        />
        {errors.confirmPassword && (
          <p className="error-text">{errors.confirmPassword.message}</p>
        )}
      </div>

      {error && (
        <div className="error-box">
          <p>{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="submit-btn"
      >
        {isSubmitting || isLoading ? (
          <>
            <svg
              className="spinner"
              width="20"
              height="20"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                style={{ opacity: 0.25 }}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                style={{ opacity: 0.75 }}
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  );
};

export default SignupForm;
