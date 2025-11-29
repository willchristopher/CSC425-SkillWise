import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  ...props
}) => {
  const modalRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      previousFocus.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (closeOnEscape && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose, closeOnEscape]);

  const sizeClasses = {
    sm: 'modal-sm',
    md: 'modal-md',
    lg: 'modal-lg',
    xl: 'modal-xl',
    full: 'modal-full',
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      {...props}
    >
      <div
        ref={modalRef}
        className={`modal-content ${sizeClasses[size]} ${className}`}
        onClick={handleContentClick}
        tabIndex={-1}
      >
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && (
              <h2 id="modal-title" className="modal-title">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="modal-close"
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            )}
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

// Modal compound components
Modal.Header = ({ children, className = '', ...props }) => (
  <div className={`modal-section-header ${className}`} {...props}>
    {children}
  </div>
);

Modal.Body = ({ children, className = '', ...props }) => (
  <div className={`modal-section-body ${className}`} {...props}>
    {children}
  </div>
);

Modal.Footer = ({ children, className = '', ...props }) => (
  <div className={`modal-section-footer ${className}`} {...props}>
    {children}
  </div>
);

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  showCloseButton: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  className: PropTypes.string,
};

Modal.Header.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Modal.Body.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Modal.Footer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Modal;