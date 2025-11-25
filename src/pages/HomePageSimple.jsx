import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Navigation Header */}
      <header style={{
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <h2 style={{
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          margin: 0
        }}>SkillWise</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link 
            to="/login"
            style={{
              color: 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '2px solid rgba(255,255,255,0.3)'
            }}
          >
            Login
          </Link>
          <Link 
            to="/signup"
            style={{
              color: '#667eea',
              backgroundColor: 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontWeight: '600'
            }}
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 2rem',
        position: 'relative',
        zIndex: 5
      }}>
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '2rem'
          }}>
            Master Programming with AI
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '3rem',
            maxWidth: '700px',
            margin: '0 auto 3rem'
          }}>
            Transform your coding journey with personalized AI tutoring, interactive challenges, and a supportive learning community
          </p>
          <Link 
            to="/signup" 
            style={{
              display: 'inline-block',
              background: 'white',
              color: '#667eea',
              fontSize: '1.1rem',
              padding: '1rem 2rem',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
          >
            Start Learning Free
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HomePage;