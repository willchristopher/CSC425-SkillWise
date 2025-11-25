import React from 'react';

const ChallengesPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '2rem'
        }}>
          Coding Challenges
        </h1>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            Two Sum Problem
          </h2>
          <p style={{
            color: '#6b7280',
            marginBottom: '1rem'
          }}>
            Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
          </p>
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <span style={{
              backgroundColor: '#dcfce7',
              color: '#166534',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.875rem'
            }}>
              Easy
            </span>
            <span style={{
              backgroundColor: '#dbeafe',
              color: '#1d4ed8',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.875rem'
            }}>
              Arrays
            </span>
          </div>
          <button style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500'
          }}>
            Start Challenge
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengesPage;