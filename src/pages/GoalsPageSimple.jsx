import React from 'react';

const GoalsPage = () => {
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
          Learning Goals
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
            Master React Hooks
          </h2>
          <p style={{
            color: '#6b7280',
            marginBottom: '1rem'
          }}>
            Learn and practice all React hooks including useState, useEffect, useContext, and custom hooks.
          </p>
          <div style={{
            backgroundColor: '#e5e7eb',
            borderRadius: '9999px',
            height: '8px',
            marginBottom: '1rem'
          }}>
            <div style={{
              backgroundColor: '#3b82f6',
              height: '100%',
              borderRadius: '9999px',
              width: '65%'
            }}></div>
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>65% Complete</p>
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;