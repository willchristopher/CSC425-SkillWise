// Signup page with form handling, validation, and authentication
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SignupForm from '../components/auth/SignupForm';
import axios from 'axios';

const SignupPage = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (formData) => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await axios.post('http://localhost:3001/api/auth/signup', {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName,
        lastName: formData.lastName
      }, {
        withCredentials: true // Important for httpOnly cookies
      });
      
      if (response.data.success) {
        // Store access token in localStorage
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        // Redirect to dashboard
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 409) {
        setError('An account with this email already exists. Please try logging in instead.');
      } else {
        setError('Registration failed. Please check your internet connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f3e8ff 0%, #dbeafe 50%, #e0e7ff 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '3rem 1.5rem'
    }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center group">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent transform group-hover:scale-105 transition-transform duration-300">
            SkillWise
          </h1>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create Your Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join SkillWise and start your learning journey today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-sm py-8 px-4 shadow-xl border border-white/20 sm:rounded-2xl sm:px-10">
          <SignupForm 
            onSubmit={handleSignup}
            error={error}
            isLoading={isLoading}
          />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-gradient-to-r from-gray-50 to-white text-sm font-medium text-gray-700 hover:from-purple-50 hover:to-blue-50 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300"
              >
                Sign in instead
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-blue-600 hover:text-blue-500">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;