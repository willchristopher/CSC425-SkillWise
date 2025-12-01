import React, { useState } from 'react';

export default function MCQQuestion({
  question,
  onAnswer,
  showResult,
  disabled,
}) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (index) => {
    if (disabled) return;
    setSelected(index);
    onAnswer?.(index);
  };

  const isCorrect = showResult && selected === question.correctAnswer;
  const isWrong =
    showResult && selected !== null && selected !== question.correctAnswer;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
          Multiple Choice
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {question.question}
      </h3>

      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelectedOption = selected === index;
          const isCorrectOption = question.correctAnswer === index;

          let optionClasses =
            'w-full p-4 rounded-lg border-2 text-left transition-all duration-200 flex items-center gap-3';

          if (showResult) {
            if (isCorrectOption) {
              optionClasses += ' bg-green-50 border-green-500 text-green-800';
            } else if (isSelectedOption && !isCorrectOption) {
              optionClasses += ' bg-red-50 border-red-500 text-red-800';
            } else {
              optionClasses += ' bg-gray-50 border-gray-200 text-gray-600';
            }
          } else if (isSelectedOption) {
            optionClasses +=
              ' bg-emerald-50 border-emerald-500 text-emerald-800';
          } else {
            optionClasses +=
              ' bg-gray-50 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer';
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={disabled || showResult}
              className={optionClasses}
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
                ${
                  isSelectedOption && !showResult
                    ? 'bg-emerald-500 text-white'
                    : showResult && isCorrectOption
                    ? 'bg-green-500 text-white'
                    : showResult && isSelectedOption
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1">{option}</span>
              {showResult && isCorrectOption && (
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {showResult && isSelectedOption && !isCorrectOption && (
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {showResult && question.explanation && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            isCorrect
              ? 'bg-green-50 border border-green-200'
              : 'bg-amber-50 border border-amber-200'
          }`}
        >
          <p
            className={`text-sm ${
              isCorrect ? 'text-green-700' : 'text-amber-700'
            }`}
          >
            <strong>Explanation:</strong> {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
