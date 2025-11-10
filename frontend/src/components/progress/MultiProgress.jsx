import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/progress.css';

const MultiProgress = ({ 
  items = [],
  title = '',
  subtitle = '',
  colors = ['#3182ce', '#38a169', '#ed8936', '#e53e3e', '#805ad5'],
  animated = true
}) => {
  const getColor = (index) => {
    return colors[index % colors.length];
  };

  const formatPercentage = (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="multi-progress-container">
      {(title || subtitle) && (
        <div className="multi-progress-header">
          {title && <h3 className="multi-progress-title">{title}</h3>}
          {subtitle && <p className="multi-progress-subtitle">{subtitle}</p>}
        </div>
      )}
      
      <div className="multi-progress-items">
        {items.map((item, index) => {
          const percentage = formatPercentage(item.completed, item.total);
          const color = item.color || getColor(index);
          
          return (
            <div key={item.id || index} className="multi-progress-item">
              <div className="multi-progress-item-header">
                <div className="multi-progress-item-label">
                  {item.icon && <span className="multi-progress-icon">{item.icon}</span>}
                  <span>{item.label}</span>
                </div>
                <span className="multi-progress-item-percentage">
                  {percentage}%
                </span>
              </div>
              
              <div className="multi-progress-item-bar">
                <div 
                  className="multi-progress-item-fill"
                  style={{
                    width: animated ? `${percentage}%` : '0%',
                    backgroundColor: color,
                    transition: animated ? 'width 1s ease-out' : 'none'
                  }}
                />
              </div>
              
              <div className="multi-progress-item-details">
                <span>{item.completed}/{item.total} {item.unit || 'items'}</span>
                {item.timeRemaining && (
                  <span>{item.timeRemaining}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

MultiProgress.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string.isRequired,
    completed: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    color: PropTypes.string,
    icon: PropTypes.node,
    unit: PropTypes.string,
    timeRemaining: PropTypes.string
  })).isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  colors: PropTypes.arrayOf(PropTypes.string),
  animated: PropTypes.bool
};

export default MultiProgress;