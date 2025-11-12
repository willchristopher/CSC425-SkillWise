import React from 'react';
import GoalForm from './GoalForm';

const GoalModal = ({
  isOpen,
  onClose,
  onSubmit,
  goal = null,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = (goalData) => {
    onSubmit(goalData);
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content goal-modal">
        <div className="modal-header">
          <h2>{goal ? 'Edit Goal' : 'Create New Goal'}</h2>
          <button
            onClick={onClose}
            className="modal-close"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <GoalForm
            onSubmit={handleSubmit}
            initialData={goal}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default GoalModal;