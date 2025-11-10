import React, { useState } from 'react';

const InteractiveQuiz = ({ questions, goalTitle, onClose, onRegenerate, isRegenerating }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showHint, setShowHint] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [score, setScore] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (questionId, answer) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answer
    });
  };

  const checkAnswer = (questionId) => {
    const question = questions.find(q => q.id === questionId);
    const userAnswer = userAnswers[questionId];
    
    if (!userAnswer) {
      alert('Please provide an answer first!');
      return;
    }

    setSubmitted({
      ...submitted,
      [questionId]: true
    });
  };

  const isCorrect = (questionId) => {
    const question = questions.find(q => q.id === questionId);
    const userAnswer = userAnswers[questionId]?.toString().trim().toLowerCase();
    const correctAnswer = question.answer.toString().trim().toLowerCase();
    
    if (question.type === 'MCQ') {
      return userAnswer === correctAnswer;
    } else if (question.type === 'TRUE_FALSE') {
      return userAnswer === correctAnswer;
    } else {
      // For fill in the blank and code output, allow some flexibility
      return userAnswer === correctAnswer || userAnswer.includes(correctAnswer);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (submitted[q.id] && isCorrect(q.id)) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const finishQuiz = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const getQuestionTypeIcon = (type) => {
    const icons = {
      MCQ: '📝',
      FILL_BLANK: '✍️',
      TRUE_FALSE: '✓✗',
      CODE_OUTPUT: '💻',
      PROBLEM_SOLVING: '🧩'
    };
    return icons[type] || '❓';
  };

  const getQuestionTypeName = (type) => {
    const names = {
      MCQ: 'Multiple Choice',
      FILL_BLANK: 'Fill in the Blank',
      TRUE_FALSE: 'True or False',
      CODE_OUTPUT: 'Code Output',
      PROBLEM_SOLVING: 'Problem Solving'
    };
    return names[type] || type;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Hard: 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  if (showResults) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">
              {score >= 80 ? '🎉' : score >= 60 ? '👍' : '📚'}
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
            <p className="text-xl text-gray-600 mb-4">Your Score: <span className="font-bold text-indigo-600">{score}%</span></p>
            <p className="text-gray-600">
              {score >= 80 ? 'Excellent work! You have mastered this topic!' :
               score >= 60 ? 'Good job! Review the explanations to strengthen your understanding.' :
               'Keep practicing! Review the concepts and try again.'}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {questions.map((q, idx) => (
              <div key={q.id} className={`p-4 rounded-lg border-2 ${
                submitted[q.id] && isCorrect(q.id) ? 'border-green-500 bg-green-50' : 
                submitted[q.id] ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900">Q{idx + 1}. {q.question}</span>
                  </div>
                  <div>
                    {submitted[q.id] && (isCorrect(q.id) ? 
                      <span className="text-green-600 font-bold">✓ Correct</span> : 
                      <span className="text-red-600 font-bold">✗ Incorrect</span>
                    )}
                  </div>
                </div>
                {submitted[q.id] && (
                  <div className="mt-3 p-3 bg-white rounded-lg">
                    <p className="text-sm text-gray-700"><strong>Your answer:</strong> {userAnswers[q.id]}</p>
                    <p className="text-sm text-green-700 mt-1"><strong>Correct answer:</strong> {q.answer}</p>
                    <p className="text-sm text-gray-600 mt-2"><strong>Explanation:</strong> {q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              {isRegenerating ? 'Generating...' : '🔄 Try New Questions'}
            </button>
            <button
              onClick={onClose}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Interactive Practice Quiz</h2>
            <p className="text-gray-600">Topic: {goalTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-600">
              {Object.keys(submitted).length} answered
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{getQuestionTypeIcon(currentQuestion.type)}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getDifficultyColor(currentQuestion.difficulty)}`}>
                  {currentQuestion.difficulty}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                  {getQuestionTypeName(currentQuestion.type)}
                </span>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-4">{currentQuestion.question}</h3>

          {/* Answer Input Based on Type */}
          {currentQuestion.type === 'MCQ' && (
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => (
                <label
                  key={option.letter}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    userAnswers[currentQuestion.id] === option.letter
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  } ${submitted[currentQuestion.id] ? 'pointer-events-none' : ''}`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option.letter}
                    checked={userAnswers[currentQuestion.id] === option.letter}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                    className="mr-3"
                    disabled={submitted[currentQuestion.id]}
                  />
                  <span className="font-semibold mr-2">{option.letter})</span>
                  <span>{option.text}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'TRUE_FALSE' && (
            <div className="flex gap-4">
              <button
                onClick={() => handleAnswer(currentQuestion.id, 'True')}
                disabled={submitted[currentQuestion.id]}
                className={`flex-1 p-4 rounded-lg border-2 font-semibold transition-all ${
                  userAnswers[currentQuestion.id] === 'True'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300'
                } ${submitted[currentQuestion.id] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                ✓ True
              </button>
              <button
                onClick={() => handleAnswer(currentQuestion.id, 'False')}
                disabled={submitted[currentQuestion.id]}
                className={`flex-1 p-4 rounded-lg border-2 font-semibold transition-all ${
                  userAnswers[currentQuestion.id] === 'False'
                    ? 'border-red-600 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-red-300'
                } ${submitted[currentQuestion.id] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                ✗ False
              </button>
            </div>
          )}

          {(currentQuestion.type === 'FILL_BLANK' || currentQuestion.type === 'CODE_OUTPUT') && (
            <div>
              <input
                type="text"
                value={userAnswers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                disabled={submitted[currentQuestion.id]}
                placeholder="Type your answer here..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          )}

          {currentQuestion.type === 'PROBLEM_SOLVING' && (
            <div>
              <textarea
                value={userAnswers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                disabled={submitted[currentQuestion.id]}
                placeholder="Write your solution here..."
                rows="6"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          )}

          {/* Hint and Submit */}
          <div className="mt-4 flex gap-3">
            {!submitted[currentQuestion.id] && (
              <>
                <button
                  onClick={() => setShowHint({ ...showHint, [currentQuestion.id]: !showHint[currentQuestion.id] })}
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-semibold hover:bg-yellow-200 transition-colors"
                >
                  💡 {showHint[currentQuestion.id] ? 'Hide' : 'Show'} Hint
                </button>
                <button
                  onClick={() => checkAnswer(currentQuestion.id)}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  Check Answer
                </button>
              </>
            )}
          </div>

          {/* Hint Display */}
          {showHint[currentQuestion.id] && (
            <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <p className="text-sm text-yellow-800"><strong>💡 Hint:</strong> {currentQuestion.hint}</p>
            </div>
          )}

          {/* Feedback */}
          {submitted[currentQuestion.id] && (
            <div className={`mt-4 p-4 rounded-lg ${
              isCorrect(currentQuestion.id) ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
            }`}>
              <p className={`font-bold mb-2 ${isCorrect(currentQuestion.id) ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect(currentQuestion.id) ? '✓ Correct!' : '✗ Incorrect'}
              </p>
              <p className="text-sm text-gray-700 mb-2"><strong>Correct Answer:</strong> {currentQuestion.answer}</p>
              <p className="text-sm text-gray-700"><strong>Explanation:</strong> {currentQuestion.explanation}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <div className="flex-1" />
          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={nextQuestion}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={finishQuiz}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
            >
              Finish Quiz 🎯
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveQuiz;
