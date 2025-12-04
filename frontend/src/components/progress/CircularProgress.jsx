import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/progress-v2.css';

const CircularProgress = ({
  percentage = 0,
  size = 120,
  strokeWidth = 8,
  color = '#3182ce',
  backgroundColor = '#e2e8f0',
  label = '',
  showPercentage = true,
  animated = true,
  details = null,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circular-progress-container">
      <div className="circular-progress" style={{ width: size, height: size }}>
        <svg className="circular-progress-svg" width={size} height={size}>
          <circle
            className="circular-progress-track"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            className="circular-progress-fill"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={animated ? strokeDashoffset : circumference}
            style={{
              transition: animated
                ? 'stroke-dashoffset 1s ease-in-out'
                : 'none',
            }}
          />
        </svg>

        <div className="circular-progress-text">
          {showPercentage && (
            <div className="circular-progress-percentage">
              {Math.round(percentage)}%
            </div>
          )}
          {label && <div className="circular-progress-label">{label}</div>}
        </div>
      </div>

      {details && (
        <div className="circular-progress-details">
          <div className="circular-progress-count">{details}</div>
        </div>
      )}
    </div>
  );
};

CircularProgress.propTypes = {
  percentage: PropTypes.number,
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
  color: PropTypes.string,
  backgroundColor: PropTypes.string,
  label: PropTypes.string,
  showPercentage: PropTypes.bool,
  animated: PropTypes.bool,
  details: PropTypes.string,
};

export default CircularProgress;
