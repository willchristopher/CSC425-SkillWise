// Login page with form handling, JWT integration, and dashboard redirect
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import axios from 'axios';

const LoginPage = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to intended page after login
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (formData) => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email: formData.email,
        password: formData.password
      }, {
        withCredentials: true // Important for httpOnly cookies
      });
      
      if (response.data.success) {
        // Store access token in localStorage
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        // Redirect to dashboard
        navigate(from, { replace: true });
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('Login failed. Please check your internet connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #f3e8ff 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '3rem 1.5rem'
    }}>
      <div style={{
        margin: '0 auto',
        width: '100%',
        maxWidth: '28rem'
      }}>
        <Link to="/" style={{
          display: 'flex',
          justifyContent: 'center',
          textDecoration: 'none'
        }}>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #2563eb 0%, #9333ea 50%, #4f46e5 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            transition: 'transform 0.3s ease'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            SkillWise
          </h1>
        </Link>
        <h2 style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '1.875rem',
          fontWeight: '800',
          color: '#111827'
        }}>
          Welcome Back
        </h2>
        <p style={{
          marginTop: '0.5rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#4b5563'
        }}>
          Sign in to continue your learning journey
        </p>
      </div>

      <div style={{
        marginTop: '2rem',
        margin: '2rem auto 0',
        width: '100%',
        maxWidth: '28rem'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          padding: '2rem 1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '1rem'
        }}>
          <LoginForm 
            onSubmit={handleLogin}
            error={error}
            isLoading={isLoading}
          />

          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center'
              }}>
                <div style={{
                  width: '100%',
                  borderTop: '1px solid #d1d5db'
                }} />
              </div>
              <div style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                fontSize: '0.875rem'
              }}>
                <span style={{
                  padding: '0 0.5rem',
                  backgroundColor: 'white',
                  color: '#6b7280'
                }}>New to SkillWise?</span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <Link
                to="/signup"
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  background: 'linear-gradient(135deg, #f9fafb 0%, white 100%)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)';
                  e.target.style.borderColor = '#3b82f6';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #f9fafb 0%, white 100%)';
                  e.target.style.borderColor = '#d1d5db';
                }}
              >
                Create an account
              </Link>
            </div>
          </div>

          <div style={{
            marginTop: '1.5rem',
            textAlign: 'center'
          }}>
            <Link to="/" style={{
              fontSize: '0.875rem',
              color: '#2563eb',
              textDecoration: 'none'
            }}
            onMouseOver={(e) => e.target.style.color = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.color = '#2563eb'}
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;