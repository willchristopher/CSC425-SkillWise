import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import './ChallengeDetailsModal.css';

const ChallengeDetailsModal = ({
  isOpen,
  challenge,
  onClose,
  onChallengeUpdate,
  onSubmit,
}) => {
  const [answers, setAnswers] = useState({});
  const [codeAnswer, setCodeAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [previousSubmissions, setPreviousSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentView, setCurrentView] = useState('challenge'); // 'challenge', 'submitted', 'feedback', 'history'
  const [lastSubmission, setLastSubmission] = useState(null);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [submittingForReview, setSubmittingForReview] = useState(false);

  // Reset state when modal opens with new challenge
  useEffect(() => {
    if (isOpen && challenge?.id) {
      setAnswers({});
      setCodeAnswer('');
      setError(null);
      setSuccess(null);
      setFeedback(null);
      setCurrentView('challenge');
      setLastSubmission(null);
      setMarkingComplete(false);
      setSubmittingForReview(false);
      // Fetch submissions async
      const loadSubmissions = async () => {
        setLoadingSubmissions(true);
        try {
          const response = await apiService.challenges.getSubmissions(
            challenge.id
          );
          if (response.data?.success) {
            setPreviousSubmissions(response.data.data || []);
          }
        } catch (err) {
          console.error('Failed to fetch submissions:', err);
        } finally {
          setLoadingSubmissions(false);
        }
      };
      loadSubmissions();
    }
  }, [isOpen, challenge?.id]);

  // Don't render if not open
  if (!isOpen || !challenge) return null;

  const fetchPreviousSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const response = await apiService.challenges.getSubmissions(challenge.id);
      if (response.data?.success) {
        setPreviousSubmissions(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!challenge) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setFeedback(null);

    try {
      // Prepare the answer text - backend expects 'code' field
      let answerText;

      if (challenge.challenge_type === 'coding') {
        answerText = codeAnswer;
      } else if (challenge.questions && challenge.questions.length > 0) {
        answerText = formatAnswersForFeedback();
      } else {
        // For challenges without specific questions, use the first answer
        answerText = answers[0] || '';
      }

      // Ensure we have some content to submit
      if (!answerText || !answerText.trim()) {
        setError('Please provide an answer before submitting');
        setSubmitting(false);
        return;
      }

      console.log('Submitting answer:', {
        challengeId: challenge.id,
        code: answerText.trim(),
      });

      // Submit the answer - backend expects { code, requestPeerReview }
      const response = await apiService.challenges.submitAnswer(challenge.id, {
        code: answerText.trim(),
        requestPeerReview: false,
      });

      console.log('Submit response:', response);

      if (response.data?.success) {
        // Store the submission info for later use
        const submissionId =
          response.data.data?.id || response.data.data?.submission_id;
        setLastSubmission({
          id: submissionId,
          text: answerText.trim(),
          timestamp: new Date().toISOString(),
        });

        // Show post-submission options instead of auto-getting feedback
        setSuccess('Answer submitted successfully!');
        setCurrentView('submitted');

        // Refresh submissions list
        await fetchPreviousSubmissions();

        // Notify parent component
        if (onChallengeUpdate) {
          onChallengeUpdate();
        }
      }
    } catch (err) {
      console.error('Submission error:', err);
      console.error('Error response:', err.response);
      setError(
        err.response?.data?.message || err.message || 'Failed to submit answer'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getAIFeedback = async () => {
    setLoadingFeedback(true);
    setError(null);
    try {
      // Use the saved submission text if available, otherwise get from form
      let submissionText;
      if (lastSubmission?.text) {
        submissionText = lastSubmission.text;
      } else if (challenge.challenge_type === 'coding') {
        submissionText = codeAnswer;
      } else {
        submissionText = formatAnswersForFeedback();
      }

      if (!submissionText || !submissionText.trim()) {
        setError('No submission text available for feedback');
        setLoadingFeedback(false);
        return;
      }

      const challengeContext = {
        title: challenge.title || 'Untitled Challenge',
        description:
          challenge.description || challenge.title || 'No description provided',
        requirements: challenge.instructions || challenge.description || '',
        challengeType: challenge.challenge_type,
        difficulty: challenge.difficulty_level,
        questions: challenge.questions || [],
        category: challenge.category,
      };

      console.log('Requesting AI feedback with:', {
        submissionText: submissionText.substring(0, 100) + '...',
        challengeContext,
      });

      // Grade the submission with AI - this updates stats and streak
      const submissionId = lastSubmission?.id;
      if (submissionId) {
        try {
          console.log('Grading submission with AI:', submissionId);
          const gradeResponse = await apiService.ai.gradeSubmission(
            submissionId,
            { challengeContext }
          );

          if (gradeResponse.data?.success) {
            console.log(
              'Submission graded successfully:',
              gradeResponse.data.data
            );
            // Still get regular feedback for full display
            const feedbackData = gradeResponse.data.data?.feedback || '';
            const structuredFeedback = parseFeedbackResponse(feedbackData);
            setFeedback({
              ...structuredFeedback,
              score: gradeResponse.data.data?.score,
            });
            setCurrentView('feedback');
            return;
          }
        } catch (gradeErr) {
          console.warn(
            'Failed to grade submission with AI, falling back to regular feedback:',
            gradeErr
          );
          // Fall through to regular feedback if grading fails
        }
      }

      const response = await apiService.ai.generateFeedback({
        submissionText,
        challengeContext,
      });

      if (response.data?.success) {
        // Parse the feedback response
        const feedbackData =
          response.data.data?.feedback || response.data.feedback;

        // Structure the feedback for display
        const structuredFeedback = parseFeedbackResponse(feedbackData);
        setFeedback(structuredFeedback);
        setCurrentView('feedback');
      }
    } catch (err) {
      console.error('Failed to get AI feedback:', err);
      setError('Failed to get AI feedback. Please try again.');
    } finally {
      setLoadingFeedback(false);
    }
  };

  // Handle marking challenge as complete
  const handleMarkComplete = async () => {
    setMarkingComplete(true);
    setError(null);

    try {
      const submissionId = lastSubmission?.id;

      const response = await apiService.challenges.markComplete(
        challenge.id,
        submissionId
      );

      if (response.data?.success) {
        setSuccess('Challenge marked as complete! 🎉');

        // Notify parent to refresh the challenges list
        if (onChallengeUpdate) {
          onChallengeUpdate();
        }

        // Close the modal after a brief delay
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to mark complete:', err);
      setError(
        err.response?.data?.message || 'Failed to mark challenge as complete'
      );
    } finally {
      setMarkingComplete(false);
    }
  };

  // Handle submitting for peer review
  const handleSubmitForPeerReview = async () => {
    setSubmittingForReview(true);
    setError(null);

    try {
      const submissionText =
        lastSubmission?.text ||
        (challenge.challenge_type === 'coding'
          ? codeAnswer
          : formatAnswersForFeedback());

      // Backend expects: { title, content, description, category, difficulty }
      const response = await apiService.peerReview.submitWorkForReview({
        title: `Review request: ${challenge.title}`,
        content: submissionText,
        description: challenge.description || challenge.title,
        category: challenge.category || 'General',
        difficulty: challenge.difficulty_level || 'Intermediate',
      });

      if (response.data?.success) {
        setSuccess(
          "Submitted for peer review! You'll be notified when you receive feedback."
        );

        // Notify parent to refresh
        if (onChallengeUpdate) {
          onChallengeUpdate();
        }

        // Close after a delay
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to submit for peer review:', err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to submit for peer review'
      );
    } finally {
      setSubmittingForReview(false);
    }
  };

  // Parse AI feedback response into structured format
  const parseFeedbackResponse = (feedbackText) => {
    if (typeof feedbackText === 'object') {
      return feedbackText; // Already structured
    }

    // Parse text feedback into structured format
    const feedback = {
      summary: '',
      score: null,
      strengths: [],
      improvements: [],
      suggestions: [],
      nextSteps: '',
    };

    // Try to extract score - look for "Score: X/100" or "**Score: X/100**" format
    const scoreMatch =
      feedbackText.match(/\*?\*?Score:\s*\[?(\d+)\]?\/100\*?\*?/i) ||
      feedbackText.match(/score[:\s]*(\d+)\s*(?:\/100|out of 100)?/i);
    if (scoreMatch) {
      feedback.score = parseInt(scoreMatch[1], 10);
    }
    // If no score found, DON'T generate a fake high score

    // Try to extract sections
    const lines = feedbackText.split('\n').filter((l) => l.trim());
    let currentSection = 'summary';

    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      // Skip the score line
      if (lowerLine.includes('score:') && lowerLine.includes('/100')) {
        continue;
      }

      if (lowerLine.includes('**summary') || lowerLine.includes('summary:')) {
        currentSection = 'summary';
        continue;
      } else if (
        lowerLine.includes('strength') ||
        lowerLine.includes('what you did well') ||
        lowerLine.includes('positive')
      ) {
        currentSection = 'strengths';
        continue;
      } else if (
        lowerLine.includes('improvement') ||
        lowerLine.includes('area for') ||
        lowerLine.includes('needs work')
      ) {
        currentSection = 'improvements';
        continue;
      } else if (
        lowerLine.includes('suggestion') ||
        lowerLine.includes('recommend')
      ) {
        currentSection = 'suggestions';
        continue;
      } else if (
        lowerLine.includes('next step') ||
        lowerLine.includes('going forward')
      ) {
        currentSection = 'nextSteps';
        continue;
      }

      // Clean up bullet points and markdown
      const cleanLine = line
        .replace(/^[-•*]\s*/, '')
        .replace(/^\*\*|\*\*$/g, '')
        .trim();
      if (!cleanLine) continue;

      if (currentSection === 'strengths' && cleanLine) {
        feedback.strengths.push(cleanLine);
      } else if (currentSection === 'improvements' && cleanLine) {
        feedback.improvements.push(cleanLine);
      } else if (currentSection === 'suggestions' && cleanLine) {
        feedback.suggestions.push(cleanLine);
      } else if (currentSection === 'nextSteps' && cleanLine) {
        feedback.nextSteps += (feedback.nextSteps ? ' ' : '') + cleanLine;
      } else if (currentSection === 'summary') {
        feedback.summary += (feedback.summary ? ' ' : '') + cleanLine;
      }
    }

    // If no sections found, use the whole text as summary
    if (
      !feedback.summary &&
      !feedback.strengths.length &&
      !feedback.improvements.length
    ) {
      feedback.summary = feedbackText;
    }

    return feedback;
  };

  const formatAnswersForFeedback = () => {
    if (!challenge.questions) return '';

    return challenge.questions
      .map((q, idx) => {
        const answer = answers[idx];
        if (q.type === 'multiple_choice' && q.options) {
          return `Q${idx + 1}: ${q.question}\nAnswer: ${
            q.options[answer] || 'Not answered'
          }`;
        }
        return `Q${idx + 1}: ${q.question}\nAnswer: ${
          answer || 'Not answered'
        }`;
      })
      .join('\n\n');
  };

  const renderQuestion = (question, index) => {
    if (!question) return null;

    switch (question.type) {
      case 'multiple_choice':
        return (
          <div key={index} className="question-block">
            <div className="question-number">Question {index + 1}</div>
            <div className="question-text">{question.question}</div>
            <div className="options-grid">
              {question.options?.map((option, optIndex) => (
                <label
                  key={optIndex}
                  className={`option-card ${
                    answers[index] === optIndex ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={optIndex}
                    checked={answers[index] === optIndex}
                    onChange={() => handleAnswerChange(index, optIndex)}
                  />
                  <span className="option-letter">
                    {String.fromCharCode(65 + optIndex)}
                  </span>
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'short_answer':
        return (
          <div key={index} className="question-block">
            <div className="question-number">Question {index + 1}</div>
            <div className="question-text">{question.question}</div>
            <textarea
              className="answer-textarea"
              placeholder="Type your answer here..."
              value={answers[index] || ''}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              rows={4}
            />
          </div>
        );

      case 'true_false':
        return (
          <div key={index} className="question-block">
            <div className="question-number">Question {index + 1}</div>
            <div className="question-text">{question.question}</div>
            <div className="true-false-options">
              <label
                className={`tf-option ${
                  answers[index] === 'true' ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name={`question-${index}`}
                  value="true"
                  checked={answers[index] === 'true'}
                  onChange={() => handleAnswerChange(index, 'true')}
                />
                <span className="tf-icon">✓</span>
                <span>True</span>
              </label>
              <label
                className={`tf-option ${
                  answers[index] === 'false' ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name={`question-${index}`}
                  value="false"
                  checked={answers[index] === 'false'}
                  onChange={() => handleAnswerChange(index, 'false')}
                />
                <span className="tf-icon">✗</span>
                <span>False</span>
              </label>
            </div>
          </div>
        );

      default:
        return (
          <div key={index} className="question-block">
            <div className="question-number">Question {index + 1}</div>
            <div className="question-text">{question.question || question}</div>
            <textarea
              className="answer-textarea"
              placeholder="Type your answer here..."
              value={answers[index] || ''}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              rows={4}
            />
          </div>
        );
    }
  };

  const renderCodingChallenge = () => (
    <div className="coding-challenge">
      <div className="challenge-description">
        <h3>Challenge Description</h3>
        <p>{challenge.description}</p>
      </div>

      {challenge.starter_code && (
        <div className="starter-code">
          <h4>Starter Code</h4>
          <pre>
            <code>{challenge.starter_code}</code>
          </pre>
        </div>
      )}

      <div className="code-editor-section">
        <h4>Your Solution</h4>
        <textarea
          className="code-editor"
          placeholder="Write your code here..."
          value={codeAnswer}
          onChange={(e) => setCodeAnswer(e.target.value)}
          spellCheck={false}
        />
      </div>
    </div>
  );

  const renderFeedback = () => {
    if (!feedback) return null;

    return (
      <div className="feedback-container">
        <div className="feedback-header">
          <div className="feedback-icon">🤖</div>
          <h3>AI Feedback</h3>
        </div>

        {feedback.score !== undefined && (
          <div className="feedback-score">
            <div className="score-circle">
              <span className="score-value">{feedback.score}</span>
              <span className="score-max">/100</span>
            </div>
            <div className="score-label">
              {feedback.score >= 80
                ? 'Excellent!'
                : feedback.score >= 60
                ? 'Good job!'
                : feedback.score >= 40
                ? 'Keep practicing!'
                : 'Needs improvement'}
            </div>
          </div>
        )}

        {feedback.summary && (
          <div className="feedback-section">
            <h4>📝 Summary</h4>
            <p>{feedback.summary}</p>
          </div>
        )}

        {feedback.strengths && feedback.strengths.length > 0 && (
          <div className="feedback-section strengths">
            <h4>💪 Strengths</h4>
            <ul>
              {feedback.strengths.map((strength, idx) => (
                <li key={idx}>{strength}</li>
              ))}
            </ul>
          </div>
        )}

        {feedback.improvements && feedback.improvements.length > 0 && (
          <div className="feedback-section improvements">
            <h4>🎯 Areas for Improvement</h4>
            <ul>
              {feedback.improvements.map((improvement, idx) => (
                <li key={idx}>{improvement}</li>
              ))}
            </ul>
          </div>
        )}

        {feedback.suggestions && feedback.suggestions.length > 0 && (
          <div className="feedback-section suggestions">
            <h4>💡 Suggestions</h4>
            <ul>
              {feedback.suggestions.map((suggestion, idx) => (
                <li key={idx}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {feedback.correctAnswers && (
          <div className="feedback-section correct-answers">
            <h4>✅ Correct Answers</h4>
            <div className="answers-list">
              {Object.entries(feedback.correctAnswers).map(
                ([key, value], idx) => (
                  <div key={idx} className="answer-item">
                    <span className="answer-label">Q{parseInt(key) + 1}:</span>
                    <span className="answer-value">{value}</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {feedback.nextSteps && (
          <div className="feedback-section next-steps">
            <h4>🚀 Next Steps</h4>
            <p>{feedback.nextSteps}</p>
          </div>
        )}

        <div className="feedback-actions">
          <button
            className="btn-secondary"
            onClick={() => setCurrentView('challenge')}
          >
            Back to Challenge
          </button>
          <button className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    );
  };

  const renderSubmissionHistory = () => (
    <div className="history-container">
      <div className="history-header">
        <h3>📋 Submission History</h3>
        <button
          className="btn-back"
          onClick={() => setCurrentView('challenge')}
        >
          ← Back
        </button>
      </div>

      {loadingSubmissions ? (
        <div className="loading-submissions">
          <div className="spinner"></div>
          <p>Loading submissions...</p>
        </div>
      ) : previousSubmissions.length === 0 ? (
        <div className="no-submissions">
          <p>No previous submissions found.</p>
        </div>
      ) : (
        <div className="submissions-list">
          {previousSubmissions.map((submission, idx) => (
            <div key={submission.id || idx} className="submission-card">
              <div className="submission-header">
                <span className="submission-date">
                  {new Date(submission.submitted_at).toLocaleDateString(
                    'en-US',
                    {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </span>
                {submission.score !== null && (
                  <span
                    className={`submission-score ${
                      submission.score >= 80
                        ? 'high'
                        : submission.score >= 50
                        ? 'medium'
                        : 'low'
                    }`}
                  >
                    Score: {submission.score}%
                  </span>
                )}
              </div>

              <div className="submission-content">
                <h5>Your Answer:</h5>
                <pre className="submission-text">
                  {typeof submission.submission_text === 'string'
                    ? submission.submission_text
                    : JSON.stringify(submission.submission_text, null, 2)}
                </pre>
              </div>

              {submission.feedback && (
                <div className="submission-feedback">
                  <h5>Feedback:</h5>
                  <p>{submission.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render post-submission options
  const renderPostSubmitOptions = () => (
    <div className="post-submit-options">
      <div className="success-icon">
        <div className="checkmark-circle">
          <span>✓</span>
        </div>
      </div>

      <h3>Submission Saved!</h3>
      <p className="submit-message">
        Your answer has been recorded. What would you like to do next?
      </p>

      {error && (
        <div className="error-message">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="options-container">
        <button
          className="option-btn ai-feedback-btn"
          onClick={getAIFeedback}
          disabled={loadingFeedback || markingComplete}
        >
          <span className="option-icon">🤖</span>
          <div className="option-content">
            <span className="option-title">Get AI Feedback</span>
            <span className="option-desc">
              Receive personalized feedback on your answer
            </span>
          </div>
          {loadingFeedback && <span className="btn-spinner"></span>}
        </button>

        <button
          className="option-btn peer-review-btn"
          onClick={handleSubmitForPeerReview}
          disabled={loadingFeedback || markingComplete || submittingForReview}
        >
          <span className="option-icon">👥</span>
          <div className="option-content">
            <span className="option-title">Request Peer Review</span>
            <span className="option-desc">
              Get feedback from other learners
            </span>
          </div>
          {submittingForReview && <span className="btn-spinner"></span>}
        </button>

        <button
          className="option-btn complete-btn"
          onClick={handleMarkComplete}
          disabled={loadingFeedback || markingComplete || submittingForReview}
        >
          <span className="option-icon">✅</span>
          <div className="option-content">
            <span className="option-title">Mark Complete</span>
            <span className="option-desc">
              Finish this challenge and earn your points
            </span>
          </div>
          {markingComplete && <span className="btn-spinner"></span>}
        </button>

        <button
          className="option-btn continue-btn"
          onClick={() => setCurrentView('challenge')}
          disabled={loadingFeedback || markingComplete || submittingForReview}
        >
          <span className="option-icon">📝</span>
          <div className="option-content">
            <span className="option-title">Continue Working</span>
            <span className="option-desc">Review or modify your answer</span>
          </div>
        </button>
      </div>
    </div>
  );

  const renderLoadingFeedback = () => (
    <div className="loading-feedback">
      <div className="ai-analyzing">
        <div className="pulse-circle"></div>
        <div className="ai-icon">🤖</div>
      </div>
      <h3>AI is analyzing your submission...</h3>
      <p>This may take a few seconds</p>
      <div className="analyzing-steps">
        <div className="step active">Reviewing answers</div>
        <div className="step">Evaluating correctness</div>
        <div className="step">Generating feedback</div>
      </div>
    </div>
  );

  if (!challenge) return null;

  const getDifficultyClass = (level) => {
    switch (level?.toLowerCase()) {
      case 'easy':
        return 'difficulty-easy';
      case 'medium':
        return 'difficulty-medium';
      case 'hard':
        return 'difficulty-hard';
      default:
        return '';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="challenge-details-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="header-content">
            <h2>{challenge.title}</h2>
            <div className="challenge-meta">
              <span
                className={`difficulty-badge ${getDifficultyClass(
                  challenge.difficulty_level
                )}`}
              >
                {challenge.difficulty_level}
              </span>
              <span className="category-badge">{challenge.category}</span>
              <span className="type-badge">{challenge.challenge_type}</span>
              <span className="points-badge">🏆 {challenge.points} pts</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="modal-tabs">
          <button
            className={`tab ${currentView === 'challenge' ? 'active' : ''}`}
            onClick={() => setCurrentView('challenge')}
          >
            Challenge
          </button>
          <button
            className={`tab ${currentView === 'history' ? 'active' : ''}`}
            onClick={() => setCurrentView('history')}
          >
            History{' '}
            {previousSubmissions.length > 0 &&
              `(${previousSubmissions.length})`}
          </button>
          {feedback && (
            <button
              className={`tab ${currentView === 'feedback' ? 'active' : ''}`}
              onClick={() => setCurrentView('feedback')}
            >
              Feedback
            </button>
          )}
        </div>

        <div className="modal-body">
          {loadingFeedback ? (
            renderLoadingFeedback()
          ) : currentView === 'submitted' ? (
            renderPostSubmitOptions()
          ) : currentView === 'feedback' ? (
            renderFeedback()
          ) : currentView === 'history' ? (
            renderSubmissionHistory()
          ) : (
            <>
              {challenge.description && (
                <div className="challenge-description-section">
                  <p>{challenge.description}</p>
                </div>
              )}

              {challenge.challenge_type === 'coding' ? (
                renderCodingChallenge()
              ) : challenge.questions && challenge.questions.length > 0 ? (
                <div className="questions-container">
                  {challenge.questions.map((q, idx) => renderQuestion(q, idx))}
                </div>
              ) : (
                <div className="simple-answer">
                  <h4>Your Answer</h4>
                  <textarea
                    className="answer-textarea large"
                    placeholder="Type your answer here..."
                    value={answers[0] || ''}
                    onChange={(e) => handleAnswerChange(0, e.target.value)}
                    rows={8}
                  />
                </div>
              )}

              {error && (
                <div className="error-message">
                  <span>⚠️</span> {error}
                </div>
              )}

              {success && !loadingFeedback && (
                <div className="success-message">
                  <span>✅</span> {success}
                </div>
              )}

              <div className="modal-actions">
                <button className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button
                  className="btn-primary submit-btn"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="btn-spinner"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Answer
                      <span className="arrow">→</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetailsModal;
