import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ 
  progress = 0, 
  label = '', 
  showPercentage = true,
  height = '12px',
  color = 'blue',
  animated = true 
}) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  
  // Color mapping
  const colorMap = {
    blue: '#3b82f6',
    green: '#10b981',
    purple: '#8b5cf6',
    orange: '#f97316',
    red: '#ef4444',
    yellow: '#eab308'
  };

  const progressColor = colorMap[color] || colorMap.blue;

  return (
    <div className="progress-bar-container">
      {label && (
        <div className="progress-label">
          <span>{label}</span>
          {showPercentage && <span className="progress-percentage">{normalizedProgress}%</span>}
        </div>
      )}
      <div className="progress-bar-track" style={{ height }}>
        <div 
          className={`progress-bar-fill ${animated ? 'animated' : ''}`}
          style={{ 
            width: `${normalizedProgress}%`,
            backgroundColor: progressColor
          }}
        >
          {!label && showPercentage && normalizedProgress > 10 && (
            <span className="progress-text-inside">{normalizedProgress}%</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
