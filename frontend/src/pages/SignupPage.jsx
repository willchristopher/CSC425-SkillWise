// Signup/registration page
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SignupForm from '../components/auth/SignupForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SignupPage = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (formData) => {
    try {
      setIsLoading(true);
      setError('');
      
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });
      
      if (result.success) {
        // Registration successful - user is now logged in
        navigate('/dashboard');
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <h1>SkillWise</h1>
            </Link>
            <h2>Create Your Account</h2>
            <p>Start your personalized learning journey today</p>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {isLoading ? (
            <LoadingSpinner message="Creating your account..." />
          ) : (
            <SignupForm onSubmit={handleSignup} isLoading={isLoading} />
          )}

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-background">
          <div className="auth-features">
            <h3>What you'll get:</h3>
            <ul>
              <li>✅ Personalized learning paths</li>
              <li>✅ AI-powered feedback</li>
              <li>✅ Progress tracking</li>
              <li>✅ Peer learning community</li>
              <li>✅ Achievement system</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;