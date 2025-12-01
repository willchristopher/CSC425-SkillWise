import React, { useState } from 'react';

export default function TrueFalseQuestion({
  question,
  onAnswer,
  showResult,
  disabled,
}) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (value) => {
    if (disabled) return;
    setSelected(value);
    onAnswer?.(value);
  };

  const isCorrect = showResult && selected === question.correctAnswer;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
          True or False
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        {question.statement}
      </h3>

      <div className="flex gap-4 justify-center">
        {[true, false].map((value) => {
          const isSelected = selected === value;
          const isCorrectOption = question.correctAnswer === value;

          let buttonClasses =
            'flex-1 max-w-48 py-4 px-8 rounded-xl font-bold text-lg transition-all duration-200 border-2';

          if (showResult) {
            if (isCorrectOption) {
              buttonClasses +=
                ' bg-green-500 border-green-500 text-white shadow-lg';
            } else if (isSelected) {
              buttonClasses += ' bg-red-500 border-red-500 text-white';
            } else {
              buttonClasses += ' bg-gray-100 border-gray-200 text-gray-400';
            }
          } else if (isSelected) {
            buttonClasses += value
              ? ' bg-emerald-500 border-emerald-500 text-white shadow-lg'
              : ' bg-rose-500 border-rose-500 text-white shadow-lg';
          } else {
            buttonClasses += value
              ? ' bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
              : ' bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100';
          }

          return (
            <button
              key={value.toString()}
              onClick={() => handleSelect(value)}
              disabled={disabled || showResult}
              className={buttonClasses}
            >
              <span className="flex items-center justify-center gap-2">
                {value ? (
                  <>
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    TRUE
                  </>
                ) : (
                  <>
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    FALSE
                  </>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {showResult && question.explanation && (
        <div
          className={`mt-6 p-4 rounded-lg ${
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
            <strong>{isCorrect ? '✅ Correct!' : '📚 Learn:'}</strong>{' '}
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
