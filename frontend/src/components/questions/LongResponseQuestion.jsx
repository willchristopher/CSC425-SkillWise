import React, { useState } from 'react';

export default function LongResponseQuestion({
  question,
  onAnswer,
  showResult,
  disabled,
}) {
  const [answer, setAnswer] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const handleChange = (e) => {
    if (disabled) return;
    const text = e.target.value;
    setAnswer(text);
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    onAnswer?.(text);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-medium">
          Long Response
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {question.prompt}
      </h3>

      {question.guidelines && question.guidelines.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            📋 Guidelines:
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {question.guidelines.map((guideline, index) => (
              <li key={index} className="text-gray-600 text-sm">
                {guideline}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="relative">
        <textarea
          value={answer}
          onChange={handleChange}
          disabled={disabled || showResult}
          placeholder="Write your detailed response here..."
          rows={8}
          className="w-full p-4 border-2 border-gray-200 rounded-lg resize-y min-h-[200px]
            focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100
            disabled:bg-gray-50 disabled:text-gray-500
            transition-all"
        />
        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
          {wordCount} words
        </div>
      </div>

      {showResult && question.rubric && (
        <div className="mt-4 p-4 bg-violet-50 border border-violet-200 rounded-lg">
          <h4 className="text-sm font-semibold text-violet-800 mb-3">
            📊 Grading Rubric:
          </h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                A
              </span>
              <div>
                <span className="font-medium text-green-700">Excellent: </span>
                <span className="text-gray-600 text-sm">
                  {question.rubric.excellent}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                B
              </span>
              <div>
                <span className="font-medium text-blue-700">Good: </span>
                <span className="text-gray-600 text-sm">
                  {question.rubric.good}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">
                C
              </span>
              <div>
                <span className="font-medium text-amber-700">Needs Work: </span>
                <span className="text-gray-600 text-sm">
                  {question.rubric.needsWork}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
