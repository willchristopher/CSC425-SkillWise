import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Card, Alert } from '../components/ui';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Redirect to intended page after login
  const from = location.state?.from?.pathname || '/dashboard';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    const result = await login({
      email: formData.email,
      password: formData.password
    });
    
    setIsLoading(false);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrors({ general: result.error || 'Login failed. Please try again.' });
    }
  };

  return (
    <div className="main-content flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Welcome Content */}
        <div className="hidden lg:block">
          <div className="max-w-md">
            <div className="mb-8">
              <Link to="/" className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors mb-8">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Welcome Back to{' '}
              <span className="text-primary-600">SkillWise</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Continue your learning journey with AI-powered tutoring and personalized study plans.
            </p>
            
            <div className="space-y-4">
              {[
                'Track your progress across all subjects',
                'Get instant AI tutoring support',
                'Connect with study groups',
                'Access personalized learning paths'
              ].map((feature, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-700">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full">
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              SkillWise
            </Link>
          </div>
          
          <Card className="auth-card">
            <Card.Header>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Sign in to your account
                </h2>
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                    Create one here
                  </Link>
                </p>
              </div>
            </Card.Header>

            <Card.Body>
              {errors.general && (
                <Alert variant="error" className="mb-6">
                  {errors.general}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="label required">
                    Email address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                  />
                  {errors.email && (
                    <p className="error-text">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="label required">
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    error={errors.password}
                  />
                  {errors.password && (
                    <p className="error-text">{errors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>

                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </Card.Body>

            <Card.Footer>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  By signing in, you agree to our{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-700">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-700">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </Card.Footer>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;