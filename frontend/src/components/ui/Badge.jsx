import React from 'react';
import PropTypes from 'prop-types';

const Badge = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  dot = false,
  ...props
}) => {
  const variantClasses = {
    default: 'badge-default',
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
  };

  const sizeClasses = {
    sm: 'badge-sm',
    md: 'badge-md',
    lg: 'badge-lg',
  };

  const classes = [
    'badge',
    variantClasses[variant],
    sizeClasses[size],
    dot ? 'badge-dot' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {dot && <span className="badge-dot-indicator" />}
      {children}
    </span>
  );
};

Badge.propTypes = {
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  dot: PropTypes.bool,
};

export default Badge;