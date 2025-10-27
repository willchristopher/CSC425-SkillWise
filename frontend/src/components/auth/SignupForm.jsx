// Signup form component with validation
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation schema
const signupSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const SignupForm = ({ onSubmit, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const handleFormSubmit = (data) => {
    const { confirmPassword, ...submitData } = data;
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="auth-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName" className="form-label">
            First Name
          </label>
          <input
            {...register('firstName')}
            type="text"
            id="firstName"
            className={`form-input ${errors.firstName ? 'form-input-error' : ''}`}
            placeholder="Enter your first name"
            disabled={isLoading}
          />
          {errors.firstName && (
            <span className="form-error">{errors.firstName.message}</span>
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
            className={`form-input ${errors.lastName ? 'form-input-error' : ''}`}
            placeholder="Enter your last name"
            disabled={isLoading}
          />
          {errors.lastName && (
            <span className="form-error">{errors.lastName.message}</span>
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
          className={`form-input ${errors.email ? 'form-input-error' : ''}`}
          placeholder="Enter your email"
          disabled={isLoading}
        />
        {errors.email && (
          <span className="form-error">{errors.email.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          {...register('password')}
          type="password"
          id="password"
          className={`form-input ${errors.password ? 'form-input-error' : ''}`}
          placeholder="Create a password"
          disabled={isLoading}
        />
        {errors.password && (
          <span className="form-error">{errors.password.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword" className="form-label">
          Confirm Password
        </label>
        <input
          {...register('confirmPassword')}
          type="password"
          id="confirmPassword"
          className={`form-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
          placeholder="Confirm your password"
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <span className="form-error">{errors.confirmPassword.message}</span>
        )}
      </div>

      <button 
        type="submit" 
        className={`auth-button ${isLoading ? 'auth-button-loading' : ''}`}
        disabled={isLoading}
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
};

export default SignupForm;