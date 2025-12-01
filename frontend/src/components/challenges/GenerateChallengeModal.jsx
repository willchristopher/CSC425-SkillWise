import React, { useState } from 'react';
import { apiService } from '../../services/api';
import './GenerateChallengeModal.css';

const GenerateChallengeModal = ({ isOpen, onClose, onChallengeGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedChallenge, setGeneratedChallenge] = useState(null);

  // Form state
  const [category, setCategory] = useState('JavaScript');
  const [difficulty, setDifficulty] = useState('medium');
  const [topic, setTopic] = useState('');
  const [requirements, setRequirements] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setGeneratedChallenge(null);

    try {
      const response = await apiService.ai.generateChallenge({
        category,
        difficulty,
        topic: topic.trim() || undefined,
        requirements: requirements.trim() || undefined,
      });

      if (response.data.success) {
        setGeneratedChallenge(response.data.data);
      } else {
        setError('Failed to generate challenge');
      }
    } catch (err) {
      console.error('Error generating challenge:', err);
      setError(
        err.response?.data?.message ||
          'Failed to generate challenge. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUseChallenge = () => {
    if (generatedChallenge && onChallengeGenerated) {
      onChallengeGenerated(generatedChallenge);
      handleClose();
    }
  };

  const handleClose = () => {
    setGeneratedChallenge(null);
    setError(null);
    setCategory('JavaScript');
    setDifficulty('medium');
    setTopic('');
    setRequirements('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content generate-challenge-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>🤖 Generate Challenge with AI</h2>
          <button className="close-btn" onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {!generatedChallenge ? (
            <>
              <div className="form-group">
                <label htmlFor="category">
                  Category <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., JavaScript, Python, React, etc."
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="difficulty">
                  Difficulty <span className="required">*</span>
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  disabled={loading}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="topic">Topic/Focus (Optional)</label>
                <input
                  type="text"
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Arrays, Async/Await, State Management"
                  disabled={loading}
                />
                <small className="help-text">
                  Specific topic or concept to focus on
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="requirements">
                  Additional Requirements (Optional)
                </label>
                <textarea
                  id="requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="e.g., Must use ES6 features, Include error handling, etc."
                  rows={3}
                  disabled={loading}
                />
                <small className="help-text">
                  Any specific requirements or constraints
                </small>
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}
            </>
          ) : (
            <div className="generated-challenge">
              <div className="challenge-badge">
                <span
                  className={`difficulty-badge ${generatedChallenge.difficulty_level}`}
                >
                  {generatedChallenge.difficulty_level}
                </span>
                <span className="category-badge">
                  {generatedChallenge.category}
                </span>
                <span className="ai-badge">🤖 AI Generated</span>
              </div>

              <h3>{generatedChallenge.title}</h3>

              <div className="challenge-section">
                <h4>Description</h4>
                <p>{generatedChallenge.description}</p>
              </div>

              <div className="challenge-section">
                <h4>Instructions</h4>
                <div className="instructions">
                  {generatedChallenge.instructions}
                </div>
              </div>

              {generatedChallenge.learning_objectives &&
                generatedChallenge.learning_objectives.length > 0 && (
                  <div className="challenge-section">
                    <h4>Learning Objectives</h4>
                    <ul>
                      {generatedChallenge.learning_objectives.map(
                        (obj, index) => (
                          <li key={index}>{obj}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {generatedChallenge.starter_code && (
                <div className="challenge-section">
                  <h4>Starter Code</h4>
                  <pre>
                    <code>{generatedChallenge.starter_code}</code>
                  </pre>
                </div>
              )}

              <div className="challenge-meta">
                <span>
                  ⏱️ Est. Time: {generatedChallenge.estimated_time_minutes} min
                </span>
                <span>🏆 Points: {generatedChallenge.points_reward}</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {!generatedChallenge ? (
            <>
              <button
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={loading || !category || !difficulty}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Generating...
                  </>
                ) : (
                  '✨ Generate Challenge'
                )}
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setGeneratedChallenge(null)}
              >
                ← Generate Another
              </button>
              <button className="btn btn-primary" onClick={handleUseChallenge}>
                ✓ Use This Challenge
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateChallengeModal;
