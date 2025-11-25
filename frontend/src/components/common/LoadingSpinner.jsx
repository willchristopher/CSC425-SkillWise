// Loading spinner component
import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  // Different spinner sizes and animations available
  return (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner"></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;