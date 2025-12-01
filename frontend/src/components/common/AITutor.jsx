import React, { useState } from 'react';
import { apiService } from '../../services/api';

const AITutor = ({ challengeId, challengeTitle, challengeDescription }) => {
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState('');
  const [hints, setHints] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('feedback');

  const handleGetFeedback = async () => {
    if (!code.trim()) {
      setError('Please enter some code to get feedback');
      return;
    }

    setLoading(true);
    setError('');
    setFeedback('');

    try {
      const response = await apiService.ai.generateFeedback(code, {
        title: challengeTitle || 'Code Review',
        description: challengeDescription || 'General code submission',
      });

      setFeedback(response.data.data.feedback);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to generate feedback. Please try again.'
      );
      console.error('AI Feedback Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetHints = async () => {
    setLoading(true);
    setError('');
    setHints('');

    try {
      const response = await apiService.ai.getHints(
        challengeId || 'general',
        {
          title: challengeTitle || 'Programming Challenge',
          description: challengeDescription || 'General programming help',
          difficulty: 'Medium',
        },
        {
          attempts: 0,
          lastAttempt: code.trim() || 'No attempts yet',
        }
      );

      setHints(response.data.data.hints);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to generate hints. Please try again.'
      );
      console.error('AI Hints Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🤖 AI Tutor Assistant
        </h2>
        <p className="text-gray-600">
          Powered by Google Gemini - Get instant feedback and hints for your
          code!
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'feedback'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Get Feedback
        </button>
        <button
          onClick={() => setActiveTab('hints')}
          className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'hints'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          Get Hints
        </button>
      </div>

      {/* Code Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Code:
        </label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here..."
          className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm"
        />
      </div>

      {/* Action Button */}
      <div className="mb-4">
        {activeTab === 'feedback' ? (
          <button
            onClick={handleGetFeedback}
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Analyzing your code...' : 'Get AI Feedback'}
          </button>
        ) : (
          <button
            onClick={handleGetHints}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Getting hints...' : 'Get Hints'}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Feedback/Hints Display */}
      {activeTab === 'feedback' && feedback && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <h3 className="font-bold text-emerald-900 mb-2">AI Feedback:</h3>
          <div className="text-gray-800 whitespace-pre-wrap">{feedback}</div>
        </div>
      )}

      {activeTab === 'hints' && hints && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-bold text-green-900 mb-2">AI Hints:</h3>
          <div className="text-gray-800 whitespace-pre-wrap">{hints}</div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-2 text-gray-600">AI is thinking...</p>
        </div>
      )}
    </div>
  );
};

export default AITutor;
