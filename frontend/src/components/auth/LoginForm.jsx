// Login form component with React Hook Form and Zod validation
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import './AuthForm.css';

// Zod validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

const LoginForm = ({ onSubmit, error, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const submitHandler = async (data) => {
    if (onSubmit) {
      await onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="auth-form">
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
          placeholder="Enter your password"
        />
        {errors.password && (
          <p className="error-text">{errors.password.message}</p>
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
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
};

export default LoginForm;
