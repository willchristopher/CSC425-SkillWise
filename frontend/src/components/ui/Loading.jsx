import React from 'react';
import PropTypes from 'prop-types';

const Loading = ({
  variant = 'spinner',
  size = 'md',
  color = 'primary',
  text,
  className = '',
  overlay = false,
  ...props
}) => {
  const sizeClasses = {
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg',
    xl: 'loading-xl',
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    white: 'text-white',
    gray: 'text-gray-600',
  };

  const spinnerClasses = [
    'loading-spinner',
    sizeClasses[size],
    colorClasses[color],
    className
  ].filter(Boolean).join(' ');

  const dotsClasses = [
    'loading-dots',
    sizeClasses[size],
    colorClasses[color],
    className
  ].filter(Boolean).join(' ');

  const pulseClasses = [
    'loading-pulse',
    sizeClasses[size],
    colorClasses[color],
    className
  ].filter(Boolean).join(' ');

  const renderSpinner = () => (
    <svg
      className={spinnerClasses}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const renderDots = () => (
    <div className={dotsClasses} {...props}>
      <div className="loading-dot loading-dot-1"></div>
      <div className="loading-dot loading-dot-2"></div>
      <div className="loading-dot loading-dot-3"></div>
    </div>
  );

  const renderPulse = () => (
    <div className={pulseClasses} {...props}>
      <div className="loading-pulse-circle loading-pulse-1"></div>
      <div className="loading-pulse-circle loading-pulse-2"></div>
      <div className="loading-pulse-circle loading-pulse-3"></div>
    </div>
  );

  const renderBars = () => (
    <div className={`loading-bars ${sizeClasses[size]} ${colorClasses[color]} ${className}`} {...props}>
      <div className="loading-bar loading-bar-1"></div>
      <div className="loading-bar loading-bar-2"></div>
      <div className="loading-bar loading-bar-3"></div>
      <div className="loading-bar loading-bar-4"></div>
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'bars':
        return renderBars();
      case 'spinner':
      default:
        return renderSpinner();
    }
  };

  const content = (
    <div className={`loading-container ${text ? 'loading-with-text' : ''}`}>
      {renderLoader()}
      {text && (
        <div className={`loading-text ${colorClasses[color]}`}>
          {text}
        </div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        <div className="loading-overlay-content">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

Loading.propTypes = {
  variant: PropTypes.oneOf(['spinner', 'dots', 'pulse', 'bars']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'secondary', 'white', 'gray']),
  text: PropTypes.string,
  className: PropTypes.string,
  overlay: PropTypes.bool,
};

export default Loading;