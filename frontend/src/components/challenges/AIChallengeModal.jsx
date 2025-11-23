import React from 'react';

const AIChallengeModal = ({ isOpen, onClose, challenge }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-window">
        <div className="modal-header">
          <h3>{challenge?.title || 'Generated Challenge'}</h3>
          <button onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <pre style={{whiteSpace: 'pre-wrap'}}>{challenge?.description || 'No challenge generated.'}</pre>
          {challenge?.difficulty && (
            <p><strong>Difficulty:</strong> {challenge.difficulty}</p>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default AIChallengeModal;
