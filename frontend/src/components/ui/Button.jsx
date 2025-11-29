import React from 'react';
import PropTypes from 'prop-types';

const Button = React.forwardRef(({
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  children,
  className = '',
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  const baseClasses = 'btn';
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
  };
  
  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
    xl: 'btn-xl',
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {loading && (
        <span className="loading mr-2" aria-hidden="true" />
      )}
      {leftIcon && !loading && (
        <span className="mr-2" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      <span>{children}</span>
      {rightIcon && (
        <span className="ml-2" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
};

export default Button;