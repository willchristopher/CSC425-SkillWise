import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)'
      }}></div>

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
              border: '2px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
              e.target.style.borderColor = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = 'rgba(255,255,255,0.3)';
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
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
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
          marginBottom: '5rem'
        }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '2rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Master Programming with AI
          </h1>
          <p style={{
            fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '3rem',
            maxWidth: '700px',
            margin: '0 auto 3rem',
            lineHeight: 1.6
          }}>
            Transform your coding journey with personalized AI tutoring, interactive challenges, and a supportive learning community
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
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
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
              }}
            >
              Start Learning Free
            </Link>
            <Link 
              to="/login" 
              style={{
                display: 'inline-block',
                background: 'transparent',
                color: 'white',
                fontSize: '1.1rem',
                padding: '1rem 2rem',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: '600',
                border: '2px solid rgba(255,255,255,0.5)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                e.target.style.borderColor = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
            >
              Get Started
            </Link>
        </div>
        
        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
          marginBottom: '80px'
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <span style={{ fontSize: '2.5rem' }}>🧠</span>
            </div>
            <h3 style={{
              fontSize: '1.8rem',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#1f2937'
            }}>AI-Powered Learning</h3>
            <p style={{
              color: '#6b7280',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              Get personalized AI tutoring, instant feedback on your code, and adaptive learning paths tailored to your skill level
            </p>
            <Link 
              to="/ai-tutor" 
              style={{
                display: 'inline-block',
                background: '#3b82f6',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#2563eb'}
              onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
            >
              Start Learning
            </Link>
          </div>
          
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <span style={{ fontSize: '2.5rem' }}>🎯</span>
            </div>
            <h3 style={{
              fontSize: '1.8rem',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#1f2937'
            }}>Interactive Challenges</h3>
            <p style={{
              color: '#6b7280',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              Challenge yourself with real-world coding problems, track your progress, and build a portfolio of solutions
            </p>
            <Link 
              to="/challenges" 
              style={{
                display: 'inline-block',
                background: '#10b981',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#059669'}
              onMouseLeave={(e) => e.target.style.background = '#10b981'}
            >
              View Challenges
            </Link>
          </div>
          
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <span style={{ fontSize: '2.5rem' }}>🏆</span>
            </div>
            <h3 style={{
              fontSize: '1.8rem',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#1f2937'
            }}>Competitive Learning</h3>
            <p style={{
              color: '#6b7280',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              See how you stack up against other learners, earn achievements, and climb the global leaderboard
            </p>
            <Link 
              to="/leaderboard" 
              style={{
                display: 'inline-block',
                background: '#8b5cf6',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#7c3aed'}
              onMouseLeave={(e) => e.target.style.background = '#8b5cf6'}
            >
              View Leaderboard
            </Link>
          </div>
        </div>
        
        {/* Stats Section */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          padding: '40px',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '40px'
          }}>Join Thousands of Learners</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px'
          }}>
            <div>
              <div style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: '#3b82f6',
                marginBottom: '8px'
              }}>10,000+</div>
              <div style={{ color: '#6b7280' }}>Active Learners</div>
            </div>
            <div>
              <div style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: '#10b981',
                marginBottom: '8px'
              }}>50,000+</div>
              <div style={{ color: '#6b7280' }}>Challenges Solved</div>
            </div>
            <div>
              <div style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: '#8b5cf6',
                marginBottom: '8px'
              }}>1,500+</div>
              <div style={{ color: '#6b7280' }}>Skills Mastered</div>
            </div>
            <div>
              <div style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: '#f59e0b',
                marginBottom: '8px'
              }}>95%</div>
              <div style={{ color: '#6b7280' }}>Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;