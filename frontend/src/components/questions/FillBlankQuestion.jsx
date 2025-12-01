import React, { useState } from 'react';

export default function FillBlankQuestion({
  question,
  onAnswer,
  showResult,
  disabled,
}) {
  const [answers, setAnswers] = useState(
    Array(question.blanks?.length || 1).fill('')
  );

  // Parse the question to find blanks (represented by _____)
  const parts = question.question.split(/(_____)/g);
  let blankIndex = 0;

  const handleChange = (index, value) => {
    if (disabled) return;
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
    onAnswer?.(newAnswers);
  };

  const checkAnswer = (index) => {
    if (!showResult || !question.blanks) return null;
    const userAnswer = answers[index]?.toLowerCase().trim();
    const correctAnswer = question.blanks[index]?.toLowerCase().trim();
    return userAnswer === correctAnswer;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
          Fill in the Blanks
        </span>
      </div>

      <div className="text-lg text-gray-800 leading-relaxed mb-4">
        {parts.map((part, i) => {
          if (part === '_____') {
            const currentBlankIndex = blankIndex++;
            const isCorrect = checkAnswer(currentBlankIndex);

            return (
              <span key={i} className="inline-block mx-1">
                <input
                  type="text"
                  value={answers[currentBlankIndex] || ''}
                  onChange={(e) =>
                    handleChange(currentBlankIndex, e.target.value)
                  }
                  disabled={disabled || showResult}
                  placeholder={`Blank ${currentBlankIndex + 1}`}
                  className={`w-32 px-3 py-1 border-b-2 bg-transparent text-center font-medium
                    focus:outline-none transition-colors
                    ${
                      showResult
                        ? isCorrect
                          ? 'border-green-500 text-green-700 bg-green-50'
                          : 'border-red-500 text-red-700 bg-red-50'
                        : 'border-emerald-400 focus:border-emerald-600'
                    }`}
                />
                {showResult && !isCorrect && question.blanks && (
                  <span className="text-xs text-green-600 ml-1">
                    ({question.blanks[currentBlankIndex]})
                  </span>
                )}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>

      {question.hint && !showResult && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700">
            <strong>💡 Hint:</strong> {question.hint}
          </p>
        </div>
      )}

      {showResult && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            answers.every((_, i) => checkAnswer(i))
              ? 'bg-green-50 border border-green-200'
              : 'bg-amber-50 border border-amber-200'
          }`}
        >
          <p className="text-sm font-medium">
            {answers.every((_, i) => checkAnswer(i))
              ? '✅ All blanks filled correctly!'
              : `📝 Correct answers: ${question.blanks?.join(', ')}`}
          </p>
        </div>
      )}
    </div>
  );
}
