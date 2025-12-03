import React, { useState } from 'react';
import { apiService } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import '../styles/ai-tutor-v2.css';

const AITutorPage = () => {
  // Main state
  const [topic, setTopic] = useState('');
  const [studyGuide, setStudyGuide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [topicAnalysis, setTopicAnalysis] = useState(null);
  const [wizardData, setWizardData] = useState({
    questionTypes: [],
    questionCount: 10,
    gradingMode: 'reveal',
    difficultyLevel: 'intermediate',
  });

  // Study guide interaction state
  const [answers, setAnswers] = useState({});
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [gradingResults, setGradingResults] = useState({});
  const [gradingLoading, setGradingLoading] = useState({});

  // Question type options
  const questionTypeOptions = [
    {
      id: 'mcq',
      label: 'Multiple Choice',
      icon: '📋',
      description: 'Choose the correct answer from options',
    },
    {
      id: 'fill_blank',
      label: 'Fill in the Blank',
      icon: '✏️',
      description: 'Complete sentences with missing words',
    },
    {
      id: 'true_false',
      label: 'True/False',
      icon: '✓✗',
      description: 'Determine if statements are true or false',
    },
    {
      id: 'short_answer',
      label: 'Short Answer',
      icon: '💬',
      description: 'Brief responses in your own words',
    },
    {
      id: 'long_response',
      label: 'Long Response',
      icon: '📝',
      description: 'Detailed explanations and essays',
    },
  ];

  // Handle topic submission
  const handleSubmitTopic = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic you want to study');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.ai.analyzeTopic(topic);
      setTopicAnalysis(response.data.data);

      if (!response.data.data.is_valid_topic) {
        setError(
          response.data.data.clarification_needed ||
            'Please provide more details about what you want to study.'
        );
        setLoading(false);
        return;
      }

      setShowWizard(true);
      setWizardStep(1);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to analyze topic. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle question type toggle
  const toggleQuestionType = (typeId) => {
    setWizardData((prev) => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(typeId)
        ? prev.questionTypes.filter((t) => t !== typeId)
        : [...prev.questionTypes, typeId],
    }));
  };

  // Handle wizard navigation
  const handleWizardNext = () => {
    if (wizardStep === 1 && wizardData.questionTypes.length === 0) {
      setError('Please select at least one question type');
      return;
    }
    setError('');
    setWizardStep((prev) => prev + 1);
  };

  const handleWizardBack = () => {
    setError('');
    setWizardStep((prev) => prev - 1);
  };

  // Generate study guide
  const handleGenerateStudyGuide = async () => {
    setWizardStep(4); // Loading step
    setError('');

    try {
      const response = await apiService.ai.generateStudyGuide({
        topic: topicAnalysis?.topic || topic,
        questionTypes: wizardData.questionTypes,
        questionCount: wizardData.questionCount,
        gradingMode: wizardData.gradingMode,
        difficultyLevel: wizardData.difficultyLevel,
        additionalContext: topicAnalysis?.specific_focus?.join(', ') || '',
      });

      setStudyGuide(response.data.data);
      setShowWizard(false);
      setWizardStep(0);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to generate study guide. Please try again.'
      );
      setWizardStep(3);
    }
  };

  // Handle answer input
  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // Handle reveal answer
  const handleRevealAnswer = (questionId) => {
    setRevealedAnswers((prev) => ({ ...prev, [questionId]: true }));
  };

  // Handle AI grading
  const handleGradeAnswer = async (question) => {
    const studentAnswer = answers[question.id];
    if (!studentAnswer?.trim()) {
      return;
    }

    setGradingLoading((prev) => ({ ...prev, [question.id]: true }));

    try {
      const response = await apiService.ai.gradeAnswer({
        question: question.question,
        correctAnswer: question.correct_answer,
        studentAnswer: studentAnswer,
        questionType: question.type,
      });

      setGradingResults((prev) => ({
        ...prev,
        [question.id]: response.data.data,
      }));
    } catch (err) {
      console.error('Grading error:', err);
    } finally {
      setGradingLoading((prev) => ({ ...prev, [question.id]: false }));
    }
  };

  // Reset to start over
  const handleStartOver = () => {
    setTopic('');
    setStudyGuide(null);
    setShowWizard(false);
    setWizardStep(0);
    setTopicAnalysis(null);
    setWizardData({
      questionTypes: [],
      questionCount: 10,
      gradingMode: 'reveal',
      difficultyLevel: 'intermediate',
    });
    setAnswers({});
    setRevealedAnswers({});
    setGradingResults({});
  };

  // Render question based on type
  const renderQuestion = (question, index) => {
    const isRevealed = revealedAnswers[question.id];
    const gradeResult = gradingResults[question.id];
    const isGrading = gradingLoading[question.id];
    const userAnswer = answers[question.id] || '';

    return (
      <div
        key={question.id}
        className={`study-question ${
          gradeResult ? (gradeResult.is_correct ? 'correct' : 'incorrect') : ''
        }`}
      >
        <div className="question-header">
          <span className="question-number">Question {index + 1}</span>
          <span className={`question-type-badge ${question.type}`}>
            {question.type.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <p className="question-text">{question.question}</p>

        {/* MCQ Options */}
        {question.type === 'mcq' && question.options && (
          <div className="mcq-options">
            {question.options.map((option, optIndex) => (
              <label
                key={optIndex}
                className={`mcq-option ${
                  userAnswer === option ? 'selected' : ''
                } ${
                  isRevealed && option === question.correct_answer
                    ? 'correct-answer'
                    : ''
                } ${
                  isRevealed &&
                  userAnswer === option &&
                  option !== question.correct_answer
                    ? 'wrong-answer'
                    : ''
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={userAnswer === option}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  disabled={isRevealed || gradeResult}
                />
                <span className="option-letter">
                  {String.fromCharCode(65 + optIndex)}
                </span>
                <span className="option-text">{option}</span>
              </label>
            ))}
          </div>
        )}

        {/* True/False Options */}
        {question.type === 'true_false' && (
          <div className="tf-options">
            {['True', 'False'].map((option) => (
              <label
                key={option}
                className={`tf-option ${
                  userAnswer === option ? 'selected' : ''
                } ${
                  isRevealed && option === question.correct_answer
                    ? 'correct-answer'
                    : ''
                } ${
                  isRevealed &&
                  userAnswer === option &&
                  option !== question.correct_answer
                    ? 'wrong-answer'
                    : ''
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={userAnswer === option}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  disabled={isRevealed || gradeResult}
                />
                <span className={`tf-icon ${option.toLowerCase()}`}>
                  {option === 'True' ? '✓' : '✗'}
                </span>
                <span className="option-text">{option}</span>
              </label>
            ))}
          </div>
        )}

        {/* Fill in the Blank / Short Answer */}
        {(question.type === 'fill_blank' ||
          question.type === 'short_answer') && (
          <input
            type="text"
            className="text-answer-input"
            placeholder="Type your answer here..."
            value={userAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            disabled={isRevealed || gradeResult}
          />
        )}

        {/* Long Response */}
        {question.type === 'long_response' && (
          <textarea
            className="long-answer-textarea"
            placeholder="Write your detailed response here..."
            value={userAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            disabled={isRevealed || gradeResult}
            rows={5}
          />
        )}

        {/* Action Buttons */}
        <div className="question-actions">
          {studyGuide.gradingMode === 'reveal' &&
            !isRevealed &&
            !gradeResult && (
              <button
                className="btn-reveal"
                onClick={() => handleRevealAnswer(question.id)}
              >
                👁️ Reveal Answer
              </button>
            )}

          {studyGuide.gradingMode === 'ai_grade' &&
            !gradeResult &&
            userAnswer && (
              <button
                className="btn-grade"
                onClick={() => handleGradeAnswer(question)}
                disabled={isGrading}
              >
                {isGrading ? (
                  <>
                    <span className="spinner-small"></span>
                    Grading...
                  </>
                ) : (
                  '🤖 Grade My Answer'
                )}
              </button>
            )}
        </div>

        {/* Revealed Answer */}
        {isRevealed && (
          <div className="answer-reveal">
            <div className="correct-answer-box">
              <strong>✓ Correct Answer:</strong> {question.correct_answer}
            </div>
            {question.explanation && (
              <div className="explanation-box">
                <strong>📚 Explanation:</strong> {question.explanation}
              </div>
            )}
          </div>
        )}

        {/* AI Grading Result */}
        {gradeResult && (
          <div
            className={`grading-result ${
              gradeResult.is_correct ? 'correct' : 'incorrect'
            }`}
          >
            <div className="grade-header">
              <span className="grade-icon">
                {gradeResult.is_correct ? '🎉' : '💡'}
              </span>
              <span className="grade-score">Score: {gradeResult.score}%</span>
            </div>
            <div className="grade-feedback">{gradeResult.feedback}</div>
            {!gradeResult.is_correct && (
              <div className="correct-answer-box">
                <strong>Correct Answer:</strong> {question.correct_answer}
              </div>
            )}
            {gradeResult.improvement_tips &&
              gradeResult.improvement_tips.length > 0 && (
                <div className="improvement-tips">
                  <strong>Tips for Improvement:</strong>
                  <ul>
                    {gradeResult.improvement_tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}
      </div>
    );
  };

  // Render wizard step content
  const renderWizardStep = () => {
    switch (wizardStep) {
      case 1:
        return (
          <div className="wizard-step step-question-types">
            <h3>📋 Select Question Types</h3>
            <p className="wizard-subtitle">
              What types of questions would you like in your study guide?
            </p>

            <div className="question-type-grid">
              {questionTypeOptions.map((type) => (
                <div
                  key={type.id}
                  className={`question-type-card ${
                    wizardData.questionTypes.includes(type.id) ? 'selected' : ''
                  }`}
                  onClick={() => toggleQuestionType(type.id)}
                >
                  <div className="type-icon">{type.icon}</div>
                  <div className="type-label">{type.label}</div>
                  <div className="type-description">{type.description}</div>
                  <div className="type-checkbox">
                    {wizardData.questionTypes.includes(type.id) ? '✓' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="wizard-step step-count-difficulty">
            <h3>⚙️ Customize Your Guide</h3>
            <p className="wizard-subtitle">
              How many questions and at what difficulty?
            </p>

            <div className="wizard-option-group">
              <label>Number of Questions</label>
              <div className="count-selector">
                {[5, 10, 15, 20, 25].map((count) => (
                  <button
                    key={count}
                    className={`count-btn ${
                      wizardData.questionCount === count ? 'selected' : ''
                    }`}
                    onClick={() =>
                      setWizardData((prev) => ({
                        ...prev,
                        questionCount: count,
                      }))
                    }
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div className="wizard-option-group">
              <label>Difficulty Level</label>
              <div className="difficulty-selector">
                {[
                  {
                    id: 'beginner',
                    label: 'Beginner',
                    icon: '🌱',
                    description: 'Basic concepts',
                  },
                  {
                    id: 'intermediate',
                    label: 'Intermediate',
                    icon: '📚',
                    description: 'Core understanding',
                  },
                  {
                    id: 'advanced',
                    label: 'Advanced',
                    icon: '🎓',
                    description: 'Deep mastery',
                  },
                ].map((level) => (
                  <div
                    key={level.id}
                    className={`difficulty-card ${
                      wizardData.difficultyLevel === level.id ? 'selected' : ''
                    }`}
                    onClick={() =>
                      setWizardData((prev) => ({
                        ...prev,
                        difficultyLevel: level.id,
                      }))
                    }
                  >
                    <span className="diff-icon">{level.icon}</span>
                    <span className="diff-label">{level.label}</span>
                    <span className="diff-desc">{level.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="wizard-step step-grading">
            <h3>📊 How Should Answers Be Checked?</h3>
            <p className="wizard-subtitle">
              Choose how you want to verify your answers
            </p>

            <div className="grading-options">
              <div
                className={`grading-card ${
                  wizardData.gradingMode === 'reveal' ? 'selected' : ''
                }`}
                onClick={() =>
                  setWizardData((prev) => ({ ...prev, gradingMode: 'reveal' }))
                }
              >
                <div className="grading-icon">👁️</div>
                <h4>Reveal Answers</h4>
                <p>
                  Answer questions at your own pace, then reveal the correct
                  answer when ready. Great for self-study!
                </p>
                <ul className="grading-features">
                  <li>✓ Self-paced learning</li>
                  <li>✓ Instant answer reveal</li>
                  <li>✓ No pressure</li>
                </ul>
              </div>

              <div
                className={`grading-card ${
                  wizardData.gradingMode === 'ai_grade' ? 'selected' : ''
                }`}
                onClick={() =>
                  setWizardData((prev) => ({
                    ...prev,
                    gradingMode: 'ai_grade',
                  }))
                }
              >
                <div className="grading-icon">🤖</div>
                <h4>AI Grading</h4>
                <p>
                  Submit your answers and receive instant AI-powered feedback
                  with personalized tips!
                </p>
                <ul className="grading-features">
                  <li>✓ Detailed feedback</li>
                  <li>✓ Personalized tips</li>
                  <li>✓ Score tracking</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="wizard-step step-generating">
            <div className="generating-animation">
              <div className="book-loader">
                <div className="book-page"></div>
                <div className="book-page"></div>
                <div className="book-page"></div>
              </div>
              <h3>Creating Your Study Guide</h3>
              <p>Our AI is crafting personalized content just for you...</p>
              <div className="generating-details">
                <span>📚 Topic: {topicAnalysis?.topic || topic}</span>
                <span>📋 {wizardData.questionCount} questions</span>
                <span>🎯 {wizardData.difficultyLevel} level</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout
      title="AI Study Guide Partner"
      subtitle="Create personalized study guides for any topic with AI assistance"
    >
      <div className="ai-tutor-page-v2">
        {/* Initial Topic Input */}
        {!showWizard && !studyGuide && (
          <div className="topic-input-section">
            <div className="topic-input-card">
              <div className="topic-header">
                <div className="topic-icon">📖</div>
                <h2>What would you like to study?</h2>
                <p>
                  Enter any topic - from history to science, math to literature,
                  coding to art. Our AI will create a personalized study guide
                  just for you.
                </p>
              </div>

              <div className="topic-input-wrapper">
                <textarea
                  className="topic-input"
                  placeholder="e.g., 'The French Revolution', 'Photosynthesis in plants', 'JavaScript async/await', 'Shakespeare's Hamlet themes'..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={3}
                />

                <button
                  className="btn-create-guide"
                  onClick={handleSubmitTopic}
                  disabled={loading || !topic.trim()}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Analyzing Topic...
                    </>
                  ) : (
                    <>✨ Create Study Guide</>
                  )}
                </button>
              </div>

              {error && <div className="error-message">⚠️ {error}</div>}

              <div className="topic-suggestions">
                <span className="suggestions-label">Try these:</span>
                <div className="suggestion-chips">
                  {[
                    'World War II causes',
                    'Calculus derivatives',
                    'Cell biology',
                    'Python basics',
                    'Grammar rules',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      className="suggestion-chip"
                      onClick={() => setTopic(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Any Topic</h3>
                <p>
                  From academic subjects to professional skills - study anything
                  you want
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📝</div>
                <h3>Multiple Question Types</h3>
                <p>
                  MCQ, fill-in-the-blank, true/false, short answer, and essay
                  questions
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🤖</div>
                <h3>AI-Powered Grading</h3>
                <p>Get instant feedback and personalized learning tips</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Adaptive Difficulty</h3>
                <p>Choose your level - beginner, intermediate, or advanced</p>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Modal */}
        {showWizard && (
          <div className="wizard-overlay">
            <div className="wizard-modal">
              <div className="wizard-progress">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`progress-step ${
                      wizardStep >= step ? 'active' : ''
                    } ${wizardStep > step ? 'completed' : ''}`}
                  >
                    <div className="step-circle">
                      {wizardStep > step ? '✓' : step}
                    </div>
                    <div className="step-label">
                      {step === 1 && 'Question Types'}
                      {step === 2 && 'Settings'}
                      {step === 3 && 'Grading Mode'}
                    </div>
                  </div>
                ))}
              </div>

              {topicAnalysis && wizardStep < 4 && (
                <div className="topic-badge">
                  <span className="badge-icon">📚</span>
                  <span className="badge-text">{topicAnalysis.topic}</span>
                  <span className="badge-subject">
                    {topicAnalysis.subject_area}
                  </span>
                </div>
              )}

              <div className="wizard-content">{renderWizardStep()}</div>

              {error && (
                <div className="error-message wizard-error">⚠️ {error}</div>
              )}

              {wizardStep < 4 && (
                <div className="wizard-actions">
                  <button
                    className="btn-wizard-back"
                    onClick={
                      wizardStep === 1
                        ? () => {
                            setShowWizard(false);
                            setWizardStep(0);
                          }
                        : handleWizardBack
                    }
                  >
                    {wizardStep === 1 ? '← Back to Topic' : '← Back'}
                  </button>

                  {wizardStep < 3 ? (
                    <button
                      className="btn-wizard-next"
                      onClick={handleWizardNext}
                    >
                      Continue →
                    </button>
                  ) : (
                    <button
                      className="btn-wizard-generate"
                      onClick={handleGenerateStudyGuide}
                    >
                      ✨ Generate Study Guide
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Study Guide Display */}
        {studyGuide && (
          <div className="study-guide-container">
            <div className="study-guide-header">
              <button className="btn-start-over" onClick={handleStartOver}>
                ← New Study Guide
              </button>
              <h1>{studyGuide.title}</h1>
              <div className="guide-meta">
                <span className="meta-badge difficulty">
                  {wizardData.difficultyLevel}
                </span>
                <span className="meta-badge questions">
                  {studyGuide.questions?.length || 0} questions
                </span>
                <span className="meta-badge mode">
                  {studyGuide.gradingMode === 'ai_grade'
                    ? '🤖 AI Grading'
                    : '👁️ Self-Study'}
                </span>
              </div>
            </div>

            {/* Topic Summary */}
            <section className="guide-section summary-section">
              <h2>📖 Overview</h2>
              <p className="topic-summary">{studyGuide.topic_summary}</p>
            </section>

            {/* Key Concepts */}
            {studyGuide.key_concepts && studyGuide.key_concepts.length > 0 && (
              <section className="guide-section concepts-section">
                <h2>🔑 Key Concepts</h2>
                <div className="concepts-grid">
                  {studyGuide.key_concepts.map((concept, index) => (
                    <div key={index} className="concept-card">
                      <h4>{concept.term}</h4>
                      <p className="concept-definition">{concept.definition}</p>
                      {concept.example && (
                        <p className="concept-example">
                          <strong>Example:</strong> {concept.example}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Content Sections */}
            {studyGuide.sections &&
              studyGuide.sections.map((section, index) => (
                <section key={index} className="guide-section content-section">
                  <h2>📚 {section.section_title}</h2>
                  <div className="section-content">{section.content}</div>
                  {section.key_points && (
                    <div className="key-points">
                      <h4>Key Points:</h4>
                      <ul>
                        {section.key_points.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              ))}

            {/* Questions Section */}
            <section className="guide-section questions-section">
              <h2>📝 Practice Questions</h2>
              <div className="questions-list">
                {studyGuide.questions &&
                  studyGuide.questions.map((question, index) =>
                    renderQuestion(question, index)
                  )}
              </div>
            </section>

            {/* Study Tips */}
            {studyGuide.study_tips && studyGuide.study_tips.length > 0 && (
              <section className="guide-section tips-section">
                <h2>💡 Study Tips</h2>
                <div className="tips-list">
                  {studyGuide.study_tips.map((tip, index) => (
                    <div key={index} className="tip-card">
                      <span className="tip-number">{index + 1}</span>
                      <p>{tip}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Additional Resources */}
            {studyGuide.additional_resources &&
              studyGuide.additional_resources.length > 0 && (
                <section className="guide-section resources-section">
                  <h2>📚 Further Learning</h2>
                  <ul className="resources-list">
                    {studyGuide.additional_resources.map((resource, index) => (
                      <li key={index}>{resource}</li>
                    ))}
                  </ul>
                </section>
              )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AITutorPage;
