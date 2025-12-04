import React, { useState } from 'react';
import { apiService } from '../../services/api';
import './GenerateChallengeModal.css';

const GenerateChallengeModal = ({ isOpen, onClose, onChallengeGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedChallenge, setGeneratedChallenge] = useState(null);
  const [step, setStep] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    difficulty: 'medium',
    topic: '',
    requirements: '',
    estimatedTime: 30,
    learningGoals: '',
  });

  // Category options organized by group
  const categoryGroups = [
    {
      name: 'Programming',
      icon: '💻',
      categories: [
        'JavaScript',
        'Python',
        'Java',
        'C++',
        'React',
        'Web Development',
        'Backend Development',
      ],
    },
    {
      name: 'Mathematics',
      icon: '🔢',
      categories: [
        'Algebra',
        'Geometry',
        'Calculus',
        'Statistics',
        'Trigonometry',
      ],
    },
    {
      name: 'Science',
      icon: '🔬',
      categories: ['Physics', 'Chemistry', 'Biology', 'Environmental Science'],
    },
    {
      name: 'Language & Writing',
      icon: '📝',
      categories: [
        'English',
        'Spanish',
        'French',
        'German',
        'Chinese',
        'Creative Writing',
      ],
    },
    {
      name: 'History & Social Studies',
      icon: '🌍',
      categories: [
        'World History',
        'US History',
        'Economics',
        'Political Science',
      ],
    },
    {
      name: 'Arts & Music',
      icon: '🎨',
      categories: ['Music Theory', 'Visual Arts', 'Photography', 'Design'],
    },
    {
      name: 'Other',
      icon: '💡',
      categories: ['General Knowledge', 'Critical Thinking', 'Problem Solving'],
    },
  ];

  const difficultyOptions = [
    {
      value: 'easy',
      label: 'Easy',
      icon: '🌱',
      description: 'Great for beginners or warm-up exercises',
    },
    {
      value: 'medium',
      label: 'Medium',
      icon: '🌿',
      description: 'Balanced challenge for skill building',
    },
    {
      value: 'hard',
      label: 'Hard',
      icon: '🌳',
      description: 'Advanced concepts and complex problems',
    },
  ];

  const handleCategorySelect = (category) => {
    setFormData((prev) => ({ ...prev, category }));
    setError(null);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1 && !formData.category) {
      setError('Please select a category');
      return;
    }
    setError(null);
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setStep(4); // Loading step

    try {
      const response = await apiService.ai.generateChallenge({
        category: formData.category,
        difficulty: formData.difficulty,
        topic: formData.topic.trim() || undefined,
        requirements: formData.requirements.trim() || undefined,
        estimatedTime: formData.estimatedTime,
        learningGoals: formData.learningGoals.trim() || undefined,
      });

      if (response.data.success) {
        setGeneratedChallenge(response.data.data);
        setStep(5); // Preview step
      } else {
        setError('Failed to generate challenge');
        setStep(3);
      }
    } catch (err) {
      console.error('Error generating challenge:', err);
      setError(
        err.response?.data?.message ||
          'Failed to generate challenge. Please try again.'
      );
      setStep(3);
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
    setStep(1);
    setFormData({
      category: '',
      difficulty: 'medium',
      topic: '',
      requirements: '',
      estimatedTime: 30,
      learningGoals: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  const renderProgressBar = () => (
    <div className="wizard-progress">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`progress-step ${step >= s ? 'active' : ''} ${
            step > s ? 'completed' : ''
          }`}
        >
          <div className="step-circle">{step > s ? '✓' : s}</div>
          <span className="step-label">
            {s === 1 ? 'Category' : s === 2 ? 'Difficulty' : 'Details'}
          </span>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="wizard-step step-category">
      <div className="step-header">
        <h3>What would you like to practice?</h3>
        <p>Choose a subject area for your AI-generated challenge</p>
      </div>

      <div className="category-groups">
        {categoryGroups.map((group) => (
          <div key={group.name} className="category-group">
            <h4 className="group-title">
              <span className="group-icon">{group.icon}</span>
              {group.name}
            </h4>
            <div className="category-chips">
              {group.categories.map((cat) => (
                <button
                  key={cat}
                  className={`category-chip ${
                    formData.category === cat ? 'selected' : ''
                  }`}
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="wizard-step step-difficulty">
      <div className="step-header">
        <h3>Select your challenge level</h3>
        <p>Choose based on your current skill level in {formData.category}</p>
      </div>

      <div className="difficulty-options">
        {difficultyOptions.map((option) => (
          <div
            key={option.value}
            className={`difficulty-card ${
              formData.difficulty === option.value ? 'selected' : ''
            }`}
            onClick={() => handleInputChange('difficulty', option.value)}
          >
            <span className="difficulty-icon">{option.icon}</span>
            <div className="difficulty-info">
              <span className="difficulty-label">{option.label}</span>
              <span className="difficulty-desc">{option.description}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="time-selector">
        <label>Estimated Time</label>
        <div className="time-options">
          {[15, 30, 45, 60, 90].map((time) => (
            <button
              key={time}
              className={`time-chip ${
                formData.estimatedTime === time ? 'selected' : ''
              }`}
              onClick={() => handleInputChange('estimatedTime', time)}
            >
              {time} min
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="wizard-step step-details">
      <div className="step-header">
        <h3>Customize your challenge</h3>
        <p>Add optional details to personalize the AI-generated content</p>
      </div>

      <div className="details-form">
        <div className="form-field">
          <label htmlFor="topic">
            <span className="field-icon">🎯</span>
            Specific Topic or Focus
          </label>
          <input
            type="text"
            id="topic"
            value={formData.topic}
            onChange={(e) => handleInputChange('topic', e.target.value)}
            placeholder="e.g., Arrays, Async/Await, Quadratic Equations..."
          />
          <span className="field-hint">
            Leave blank for a general challenge in {formData.category}
          </span>
        </div>

        <div className="form-field">
          <label htmlFor="learningGoals">
            <span className="field-icon">📚</span>
            Learning Goals
          </label>
          <input
            type="text"
            id="learningGoals"
            value={formData.learningGoals}
            onChange={(e) => handleInputChange('learningGoals', e.target.value)}
            placeholder="e.g., Understand recursion, Master CSS Grid..."
          />
          <span className="field-hint">
            What do you want to learn from this challenge?
          </span>
        </div>

        <div className="form-field">
          <label htmlFor="requirements">
            <span className="field-icon">📋</span>
            Special Requirements
          </label>
          <textarea
            id="requirements"
            value={formData.requirements}
            onChange={(e) => handleInputChange('requirements', e.target.value)}
            placeholder="e.g., Include error handling, Use ES6 features, Focus on real-world application..."
            rows={3}
          />
          <span className="field-hint">
            Any specific constraints or requirements for the challenge
          </span>
        </div>
      </div>

      <div className="challenge-summary">
        <h4>Challenge Summary</h4>
        <div className="summary-pills">
          <span className="summary-pill category">{formData.category}</span>
          <span className={`summary-pill difficulty ${formData.difficulty}`}>
            {formData.difficulty}
          </span>
          <span className="summary-pill time">
            ⏱️ {formData.estimatedTime} min
          </span>
        </div>
      </div>
    </div>
  );

  const renderLoadingStep = () => (
    <div className="wizard-step step-loading">
      <div className="loading-animation">
        <div className="ai-brain">
          <span className="brain-icon">🧠</span>
          <div className="pulse-ring"></div>
          <div className="pulse-ring delay-1"></div>
          <div className="pulse-ring delay-2"></div>
        </div>
        <h3>Creating Your Challenge...</h3>
        <p>
          Our AI is crafting a personalized {formData.difficulty}{' '}
          {formData.category} challenge
        </p>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="wizard-step step-preview">
      <div className="preview-header">
        <span className="success-icon">✨</span>
        <h3>Your Challenge is Ready!</h3>
      </div>

      <div className="challenge-preview">
        <div className="preview-badges">
          <span
            className={`badge difficulty ${generatedChallenge.difficulty_level}`}
          >
            {generatedChallenge.difficulty_level}
          </span>
          <span className="badge category">{generatedChallenge.category}</span>
          <span className="badge ai">🤖 AI Generated</span>
        </div>

        <h4 className="preview-title">{generatedChallenge.title}</h4>

        <div className="preview-section">
          <h5>Description</h5>
          <p>{generatedChallenge.description}</p>
        </div>

        <div className="preview-section">
          <h5>Instructions</h5>
          <div className="instructions-content">
            {generatedChallenge.instructions}
          </div>
        </div>

        {generatedChallenge.learning_objectives &&
          generatedChallenge.learning_objectives.length > 0 && (
            <div className="preview-section">
              <h5>Learning Objectives</h5>
              <ul className="objectives-list">
                {generatedChallenge.learning_objectives.map((obj, idx) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ul>
            </div>
          )}

        {generatedChallenge.starter_code && (
          <div className="preview-section">
            <h5>Starter Code</h5>
            <pre className="code-preview">
              <code>{generatedChallenge.starter_code}</code>
            </pre>
          </div>
        )}

        <div className="preview-meta">
          <span>⏱️ {generatedChallenge.estimated_time_minutes} min</span>
          <span>🏆 {generatedChallenge.points_reward || 5} points</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay generate-modal-overlay" onClick={handleClose}>
      <div
        className="generate-challenge-wizard"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="wizard-header">
          <div className="header-content">
            <h2>AI Challenge Generator</h2>
          </div>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        {/* Progress Bar - only show for steps 1-3 */}
        {step <= 3 && renderProgressBar()}

        {/* Content */}
        <div className="wizard-content">
          {error && (
            <div className="wizard-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderLoadingStep()}
          {step === 5 && renderPreviewStep()}
        </div>

        {/* Footer */}
        <div className="wizard-footer">
          {step === 1 && (
            <>
              <button className="btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleNext}
                disabled={!formData.category}
              >
                Next →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button className="btn-secondary" onClick={handleBack}>
                ← Back
              </button>
              <button className="btn-primary" onClick={handleNext}>
                Next →
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button className="btn-secondary" onClick={handleBack}>
                ← Back
              </button>
              <button
                className="btn-primary generate-btn"
                onClick={handleGenerate}
              >
                <span className="sparkle">✨</span>
                Generate Challenge
              </button>
            </>
          )}

          {step === 5 && (
            <>
              <button
                className="btn-secondary"
                onClick={() => {
                  setGeneratedChallenge(null);
                  setStep(3);
                }}
              >
                ← Generate Another
              </button>
              <button className="btn-primary" onClick={handleUseChallenge}>
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
