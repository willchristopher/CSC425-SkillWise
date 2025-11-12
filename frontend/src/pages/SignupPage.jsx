// Professional Signup page with beautiful design for tutoring app
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SignupForm from '../components/auth/SignupForm';
import axios from 'axios';

const SignupPage = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (formData) => {
    // Just redirect immediately for testing
    const testUser = {
      id: 1,
      firstName: formData.firstName || 'John',
      lastName: formData.lastName || 'Doe',
      email: formData.email || 'test@test.com'
    };
    localStorage.setItem('user', JSON.stringify(testUser));
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header with Back Button */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="flex justify-between items-center p-6">
          <Link 
            to="/" 
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <Link to="/" className="text-2xl font-bold text-blue-600">
            SkillWise
          </Link>
        </div>
      </div>

      <div className="min-h-screen flex">
        {/* Left Side - Signup Form */}
        <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-500 font-semibold">
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="mt-8">
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white py-8 px-6 shadow-xl rounded-lg border">
                <SignupForm 
                  onSubmit={handleSignup} 
                  isLoading={isLoading}
                  error={error}
                />
              </div>

              {/* Terms and Privacy */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  By creating an account, you agree to our{' '}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Benefits Content */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-12 xl:px-20">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Start Your Learning Adventure
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of students who are already excelling with SkillWise's AI-powered tutoring platform.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900 mb-1">Personalized Learning</h3>
                  <p className="text-gray-600 text-sm">AI adapts to your learning style and pace for maximum efficiency</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900 mb-1">Instant Help</h3>
                  <p className="text-gray-600 text-sm">Get immediate answers and explanations 24/7</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900 mb-1">Track Progress</h3>
                  <p className="text-gray-600 text-sm">Monitor your improvement with detailed analytics</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900 mb-1">Achieve Goals</h3>
                  <p className="text-gray-600 text-sm">Set and reach academic milestones with guided support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;