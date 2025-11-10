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
      setError(err.response?.data?.message || 'Failed to generate feedback. Please try again.');
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
      setError(err.response?.data?.message || 'Failed to generate hints. Please try again.');
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
          Powered by Google Gemini - Get instant feedback and hints for your code!
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'feedback'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📝 Get Feedback
        </button>
        <button
          onClick={() => setActiveTab('hints')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'hints'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          💡 Get Hints
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
          className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
        />
      </div>

      {/* Action Button */}
      <div className="mb-4">
        {activeTab === 'feedback' ? (
          <button
            onClick={handleGetFeedback}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? '🔄 Analyzing your code...' : '📝 Get AI Feedback'}
          </button>
        ) : (
          <button
            onClick={handleGetHints}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? '🔄 Getting hints...' : '💡 Get Hints'}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* Feedback/Hints Display */}
      {activeTab === 'feedback' && feedback && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-2">AI Feedback:</h3>
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">AI is thinking...</p>
        </div>
      )}
    </div>
  );
};

export default AITutor;
