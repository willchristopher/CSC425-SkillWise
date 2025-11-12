import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/progress.css';

const LinearProgress = ({ 
  percentage = 0,
  title = '',
  showStripes = false,
  color = '#3182ce',
  backgroundColor = '#e2e8f0',
  height = 8,
  animated = true,
  details = null,
  className = ''
}) => {
  const progressStyle = {
    width: animated ? `${Math.min(100, Math.max(0, percentage))}%` : '0%',
    height: `${height}px`,
    backgroundColor: color,
    transition: animated ? 'width 1s ease-out' : 'none'
  };

  const trackStyle = {
    backgroundColor: backgroundColor,
    height: `${height}px`
  };

  return (
    <div className={`linear-progress-container ${className}`}>
      {title && (
        <div className="linear-progress-header">
          <h3 className="linear-progress-title">{title}</h3>
          <span className="linear-progress-percentage">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div className="linear-progress-bar" style={trackStyle}>
        <div 
          className={`linear-progress-fill ${showStripes ? 'striped' : ''}`}
          style={progressStyle}
        />
      </div>
      
      {details && (
        <div className="linear-progress-details">
          {typeof details === 'string' ? (
            <span className="linear-progress-count">{details}</span>
          ) : (
            <>
              <span className="linear-progress-count">
                {details.completed}/{details.total} completed
              </span>
              {details.timeRemaining && (
                <span className="linear-progress-time">
                  {details.timeRemaining} remaining
                </span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

LinearProgress.propTypes = {
  percentage: PropTypes.number,
  title: PropTypes.string,
  showStripes: PropTypes.bool,
  color: PropTypes.string,
  backgroundColor: PropTypes.string,
  height: PropTypes.number,
  animated: PropTypes.bool,
  details: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      completed: PropTypes.number,
      total: PropTypes.number,
      timeRemaining: PropTypes.string
    })
  ]),
  className: PropTypes.string
};

export default LinearProgress;