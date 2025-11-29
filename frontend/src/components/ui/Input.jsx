import React from 'react';
import PropTypes from 'prop-types';

const Input = React.forwardRef(({
  label,
  error,
  helperText,
  required = false,
  className = '',
  id,
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const inputClasses = [
    'input',
    error ? 'error' : '',
    leftIcon ? 'pl-10' : '',
    rightIcon ? 'pr-10' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className={`label ${required ? 'required' : ''}`}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-sm">
              {leftIcon}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : 
            helperText ? `${inputId}-helper` : 
            undefined
          }
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-sm">
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      
      {error && (
        <p 
          id={`${inputId}-error`}
          className="text-error-600 text-sm mt-1"
          role="alert"
        >
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p 
          id={`${inputId}-helper`}
          className="text-gray-500 text-sm mt-1"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
};

export default Input;