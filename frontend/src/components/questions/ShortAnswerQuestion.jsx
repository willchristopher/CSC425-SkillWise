import React, { useState } from 'react';

export default function ShortAnswerQuestion({
  question,
  onAnswer,
  showResult,
  disabled,
}) {
  const [answer, setAnswer] = useState('');

  const handleChange = (e) => {
    if (disabled) return;
    setAnswer(e.target.value);
    onAnswer?.(e.target.value);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-medium">
          Short Answer
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {question.question}
      </h3>

      <textarea
        value={answer}
        onChange={handleChange}
        disabled={disabled || showResult}
        placeholder="Type your answer here..."
        rows={3}
        className="w-full p-4 border-2 border-gray-200 rounded-lg resize-none
          focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100
          disabled:bg-gray-50 disabled:text-gray-500
          transition-all"
      />

      {showResult && (
        <div className="mt-4 space-y-4">
          {question.sampleAnswer && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <h4 className="text-sm font-semibold text-emerald-800 mb-2">
                📝 Sample Answer:
              </h4>
              <p className="text-emerald-700">{question.sampleAnswer}</p>
            </div>
          )}

          {question.keyPoints && question.keyPoints.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                🎯 Key Points to Include:
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {question.keyPoints.map((point, index) => (
                  <li key={index} className="text-blue-700 text-sm">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
