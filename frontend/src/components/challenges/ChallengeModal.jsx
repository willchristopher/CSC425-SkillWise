import React from 'react';
import ChallengeForm from './ChallengeForm';

const ChallengeModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  challenge = null, 
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="modal-overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="challenge-modal-title"
    >
      <div className="modal-content challenge-modal">
        <div className="modal-header">
          <h2 id="challenge-modal-title" className="modal-title">
            {challenge ? 'Edit Challenge' : 'Create New Challenge'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="modal-close"
            aria-label="Close modal"
            disabled={isLoading}
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <ChallengeForm
            challenge={challenge}
            onSubmit={onSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ChallengeModal;