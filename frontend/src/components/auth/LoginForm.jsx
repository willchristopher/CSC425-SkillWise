// Login form component with validation
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

const LoginForm = ({ onSubmit, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="auth-form">
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
          placeholder="Enter your password"
          disabled={isLoading}
        />
        {errors.password && (
          <span className="form-error">{errors.password.message}</span>
        )}
      </div>

      <button 
        type="submit" 
        className={`auth-button ${isLoading ? 'auth-button-loading' : ''}`}
        disabled={isLoading}
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
};

export default LoginForm;