import React, { useState } from 'react';

export default function CodeChallengeQuestion({
  question,
  onAnswer,
  showResult,
  disabled,
}) {
  const [code, setCode] = useState(question.starterCode || '');
  const [activeTab, setActiveTab] = useState('editor');

  const handleChange = (e) => {
    if (disabled) return;
    setCode(e.target.value);
    onAnswer?.(e.target.value);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Code Challenge
            </span>
            {question.language && (
              <span className="bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-sm">
                {question.language}
              </span>
            )}
          </div>
          <h3 className="text-white font-semibold">{question.title}</h3>
        </div>
      </div>

      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <p className="text-gray-700">{question.description}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('editor')}
          className={`px-6 py-3 font-medium text-sm transition-colors
            ${
              activeTab === 'editor'
                ? 'bg-white text-emerald-600 border-b-2 border-emerald-500'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
        >
          💻 Code Editor
        </button>
        <button
          onClick={() => setActiveTab('tests')}
          className={`px-6 py-3 font-medium text-sm transition-colors
            ${
              activeTab === 'tests'
                ? 'bg-white text-emerald-600 border-b-2 border-emerald-500'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
        >
          🧪 Test Cases ({question.testCases?.length || 0})
        </button>
        {question.hints && question.hints.length > 0 && (
          <button
            onClick={() => setActiveTab('hints')}
            className={`px-6 py-3 font-medium text-sm transition-colors
              ${
                activeTab === 'hints'
                  ? 'bg-white text-emerald-600 border-b-2 border-emerald-500'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
          >
            💡 Hints ({question.hints.length})
          </button>
        )}
      </div>

      <div className="p-4">
        {activeTab === 'editor' && (
          <div className="relative">
            <textarea
              value={code}
              onChange={handleChange}
              disabled={disabled || showResult}
              placeholder="// Write your code here..."
              rows={12}
              spellCheck={false}
              className="w-full p-4 bg-gray-900 text-green-400 font-mono text-sm rounded-lg
                focus:outline-none focus:ring-2 focus:ring-emerald-500
                disabled:opacity-50
                resize-y min-h-[300px]"
            />
            <div className="absolute top-3 right-3 flex gap-2">
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                {code.split('\n').length} lines
              </span>
            </div>
          </div>
        )}

        {activeTab === 'tests' && question.testCases && (
          <div className="space-y-3">
            {question.testCases.map((test, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Test Case {index + 1}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Input:</span>
                    <code className="block mt-1 p-2 bg-gray-100 rounded font-mono">
                      {test.input}
                    </code>
                  </div>
                  <div>
                    <span className="text-gray-500">Expected Output:</span>
                    <code className="block mt-1 p-2 bg-gray-100 rounded font-mono">
                      {test.expectedOutput}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'hints' && question.hints && (
          <div className="space-y-3">
            {question.hints.map((hint, index) => (
              <div
                key={index}
                className="p-4 bg-amber-50 rounded-lg border border-amber-200"
              >
                <div className="flex items-center gap-2">
                  <span className="text-amber-500">💡</span>
                  <span className="text-amber-800">{hint}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showResult && (
        <div className="p-4 bg-emerald-50 border-t border-emerald-200">
          <p className="text-sm text-emerald-700">
            <strong>Note:</strong> Your code has been submitted for review. The
            AI tutor will provide detailed feedback on your solution.
          </p>
        </div>
      )}
    </div>
  );
}
