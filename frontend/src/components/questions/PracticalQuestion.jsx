import React, { useState } from 'react';

export default function PracticalQuestion({
  question,
  onAnswer,
  showResult,
  disabled,
}) {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [notes, setNotes] = useState('');

  const toggleStep = (index) => {
    if (disabled) return;
    const newCompleted = completedSteps.includes(index)
      ? completedSteps.filter((i) => i !== index)
      : [...completedSteps, index];
    setCompletedSteps(newCompleted);
    onAnswer?.({ completedSteps: newCompleted, notes });
  };

  const handleNotesChange = (e) => {
    if (disabled) return;
    setNotes(e.target.value);
    onAnswer?.({ completedSteps, notes: e.target.value });
  };

  const progress = question.steps
    ? Math.round((completedSteps.length / question.steps.length) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium">
            🔨 Practical Exercise
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-600">{progress}%</span>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-2">{question.title}</h3>
      <p className="text-gray-600 mb-6">{question.description}</p>

      {question.materials && question.materials.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
            📦 Materials Needed:
          </h4>
          <ul className="flex flex-wrap gap-2">
            {question.materials.map((material, index) => (
              <li
                key={index}
                className="bg-white px-3 py-1 rounded-full text-sm text-blue-700 border border-blue-200"
              >
                {material}
              </li>
            ))}
          </ul>
        </div>
      )}

      {question.steps && question.steps.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            📋 Steps to Complete:
          </h4>
          <div className="space-y-3">
            {question.steps.map((step, index) => {
              const isCompleted = completedSteps.includes(index);
              return (
                <button
                  key={index}
                  onClick={() => toggleStep(index)}
                  disabled={disabled || showResult}
                  className={`w-full flex items-start gap-4 p-4 rounded-lg border-2 text-left transition-all
                    ${
                      isCompleted
                        ? 'bg-green-50 border-green-300'
                        : 'bg-gray-50 border-gray-200 hover:border-pink-300'
                    }`}
                >
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all
                    ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </span>
                  <span
                    className={`flex-1 ${
                      isCompleted
                        ? 'text-green-700 line-through opacity-75'
                        : 'text-gray-700'
                    }`}
                  >
                    {step}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          📝 Your Notes & Observations:
        </h4>
        <textarea
          value={notes}
          onChange={handleNotesChange}
          disabled={disabled || showResult}
          placeholder="Document what you learned, any challenges you faced, or variations you tried..."
          rows={4}
          className="w-full p-4 border-2 border-gray-200 rounded-lg resize-none
            focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100
            disabled:bg-gray-50"
        />
      </div>

      {question.successCriteria && question.successCriteria.length > 0 && (
        <div
          className={`p-4 rounded-lg ${
            showResult
              ? 'bg-green-50 border border-green-200'
              : 'bg-gray-50 border border-gray-200'
          }`}
        >
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            ✅ Success Criteria:
          </h4>
          <ul className="space-y-2">
            {question.successCriteria.map((criteria, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs
                  ${
                    showResult
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {showResult ? '✓' : '○'}
                </span>
                {criteria}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
