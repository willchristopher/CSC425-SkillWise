import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import { QuestionRenderer } from '../components/questions';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PageLayout from '../components/layout/PageLayout';

/**
 * ChallengePlayPage - Dynamic challenge display with various question types
 */
const ChallengePlayPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Can receive challenge data via navigation state or fetch by ID
  const [challenge, setChallenge] = useState(location.state?.challenge || null);
  const [loading, setLoading] = useState(!location.state?.challenge);
  const [error, setError] = useState('');

  // Question state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [viewMode, setViewMode] = useState('sequential'); // 'sequential' or 'all'

  // Fetch challenge if not passed via state
  useEffect(() => {
    const fetchChallenge = async () => {
      if (challenge) return;

      try {
        setLoading(true);
        const response = await apiService.challenges.getById(id);
        if (response.data.success) {
          setChallenge(response.data.data);
        } else {
          setError('Challenge not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load challenge');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [id, challenge]);

  const questions = challenge?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress =
    questions.length > 0
      ? Math.round((Object.keys(answers).length / questions.length) * 100)
      : 0;

  const handleAnswer = (questionIndex, answer) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setShowResults(true);

    try {
      // Submit for AI feedback on essay-type questions
      const essayQuestions = questions.filter((q) =>
        ['short-answer', 'long-response', 'code-challenge'].includes(q.type)
      );

      if (essayQuestions.length > 0) {
        const response = await apiService.ai.submitForFeedback({
          challenge: challenge,
          submission: answers,
          questionTypes: essayQuestions.map((q) => q.type),
        });

        if (response.data.success) {
          setFeedback(response.data.data.feedback);
        }
      }
    } catch (err) {
      console.error('Failed to get feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    let total = 0;

    questions.forEach((q, i) => {
      if (
        ['mcq', 'true-false', 'fill-blank', 'ordering', 'matching'].includes(
          q.type
        )
      ) {
        total++;
        const userAnswer = answers[i];

        if (q.type === 'mcq' && userAnswer === q.correctAnswer) correct++;
        if (q.type === 'true-false' && userAnswer === q.correctAnswer)
          correct++;
        if (q.type === 'fill-blank') {
          const blanks = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
          if (
            blanks.every(
              (a, j) =>
                a?.toLowerCase().trim() === q.blanks[j]?.toLowerCase().trim()
            )
          ) {
            correct++;
          }
        }
        if (
          q.type === 'ordering' &&
          JSON.stringify(userAnswer) === JSON.stringify(q.correctOrder)
        )
          correct++;
        if (q.type === 'matching') {
          const userPairs = (userAnswer || [])
            .map((p) => p.sort().join('-'))
            .sort();
          const correctPairs = q.correctPairs
            .map((p) => p.sort().join('-'))
            .sort();
          if (JSON.stringify(userPairs) === JSON.stringify(correctPairs))
            correct++;
        }
      }
    });

    return total > 0 ? Math.round((correct / total) * 100) : null;
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="large" />
        </div>
      </PageLayout>
    );
  }

  if (error || !challenge) {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto py-12 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Challenge Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "We couldn't find this challenge."}
          </p>
          <button
            onClick={() => navigate('/challenges')}
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
          >
            Back to Challenges
          </button>
        </div>
      </PageLayout>
    );
  }

  const score = showResults ? calculateScore() : null;

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {challenge.title}
              </h1>
              <p className="text-gray-600 mt-1">{challenge.description}</p>
            </div>
            <button
              onClick={() => navigate('/challenges')}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium
              ${
                challenge.difficulty === 'beginner'
                  ? 'bg-green-100 text-green-700'
                  : challenge.difficulty === 'intermediate'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {challenge.difficulty}
            </span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
              {challenge.category}
            </span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
              ⏱ {challenge.estimatedTime}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600">
              {Object.keys(answers).length}/{questions.length} answered
            </span>
          </div>
        </div>

        {/* View Mode Toggle */}
        {questions.length > 1 && !showResults && (
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 rounded-xl p-1 inline-flex">
              <button
                onClick={() => setViewMode('sequential')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    viewMode === 'sequential'
                      ? 'bg-white text-emerald-600 shadow'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                One at a Time
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    viewMode === 'all'
                      ? 'bg-white text-emerald-600 shadow'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                Show All
              </button>
            </div>
          </div>
        )}

        {/* Questions */}
        {viewMode === 'sequential' && !showResults ? (
          <div className="space-y-6">
            <QuestionRenderer
              question={currentQuestion}
              index={currentQuestionIndex}
              onAnswer={(answer) => handleAnswer(currentQuestionIndex, answer)}
              showResult={showResults}
              disabled={submitting}
            />

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>

              {/* Question Dots */}
              <div className="flex gap-2">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestionIndex(i)}
                    className={`w-3 h-3 rounded-full transition-all
                      ${
                        i === currentQuestionIndex
                          ? 'bg-emerald-500 scale-125'
                          : answers[i] !== undefined
                          ? 'bg-emerald-300'
                          : 'bg-gray-300'
                      }`}
                  />
                ))}
              </div>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : '✓ Submit All'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <QuestionRenderer
                key={index}
                question={question}
                index={index}
                onAnswer={(answer) => handleAnswer(index, answer)}
                showResult={showResults}
                disabled={submitting}
              />
            ))}

            {!showResults && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : '✓ Submit Challenge'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results Summary */}
        {showResults && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              🎉 Challenge Complete!
            </h2>

            {score !== null && (
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white
                  ${
                    score >= 80
                      ? 'bg-green-500'
                      : score >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                >
                  {score}%
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {score >= 80
                      ? 'Excellent work!'
                      : score >= 60
                      ? 'Good effort!'
                      : 'Keep practicing!'}
                  </p>
                  <p className="text-gray-600">
                    You scored {score}% on the auto-graded questions.
                  </p>
                </div>
              </div>
            )}

            {feedback && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-6">
                <h3 className="font-semibold text-emerald-800 mb-2">
                  AI Feedback
                </h3>
                <p className="text-emerald-700">
                  {feedback.feedback || feedback.feedback_summary}
                </p>

                {feedback.strengths && feedback.strengths.length > 0 && (
                  <div className="mt-3">
                    <span className="text-sm font-medium text-emerald-700">
                      Strengths:{' '}
                    </span>
                    <span className="text-sm text-emerald-600">
                      {feedback.strengths.join(', ')}
                    </span>
                  </div>
                )}

                {feedback.improvements && feedback.improvements.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm font-medium text-amber-700">
                      Areas to improve:{' '}
                    </span>
                    <span className="text-sm text-amber-600">
                      {feedback.improvements.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            )}

            {challenge.tips && challenge.tips.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                <h3 className="font-semibold text-amber-800 mb-2">
                  💡 Tips for Next Time
                </h3>
                <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                  {challenge.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowResults(false);
                  setAnswers({});
                  setCurrentQuestionIndex(0);
                  setFeedback(null);
                }}
                className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/challenges')}
                className="flex-1 py-3 px-6 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
              >
                Back to Challenges
              </button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ChallengePlayPage;
