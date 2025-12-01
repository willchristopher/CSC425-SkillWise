import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  getCategoryList,
  getQuestionTypeList,
} from '../../constants/categories';
import LoadingSpinner from '../common/LoadingSpinner';
import './AIGenerateModal.css';

/**
 * AI Challenge Generation Modal - Supports all learning categories and question types
 */
const AIGenerateModal = ({
  isOpen,
  onClose,
  onChallengeGenerated,
  preselectedGoal,
}) => {
  const categories = getCategoryList();
  const questionTypes = getQuestionTypeList();

  const [formData, setFormData] = useState({
    category: 'programming',
    topic: '',
    difficulty: 'intermediate',
    questionTypes: ['mcq', 'short-answer'],
    numQuestions: 5,
    customInstructions: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedChallenge, setGeneratedChallenge] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Pre-fill from goal if provided
  useEffect(() => {
    if (preselectedGoal) {
      setFormData((prev) => ({
        ...prev,
        category: preselectedGoal.category || 'programming',
        topic: preselectedGoal.title || '',
      }));
    }
  }, [preselectedGoal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleQuestionType = (typeId) => {
    setFormData((prev) => {
      const types = prev.questionTypes.includes(typeId)
        ? prev.questionTypes.filter((t) => t !== typeId)
        : [...prev.questionTypes, typeId];
      return {
        ...prev,
        questionTypes: types.length > 0 ? types : prev.questionTypes,
      };
    });
  };

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      setError('Please enter a topic for your challenge');
      return;
    }

    if (formData.questionTypes.length === 0) {
      setError('Please select at least one question type');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedChallenge(null);

    try {
      const response = await apiService.ai.generateChallenge({
        category: formData.category,
        topic: formData.topic,
        difficulty: formData.difficulty,
        questionTypes: formData.questionTypes,
        numQuestions: formData.numQuestions,
        customInstructions: formData.customInstructions,
      });

      if (response.data.success) {
        setGeneratedChallenge(response.data.data);
      } else {
        setError(response.data.message || 'Failed to generate challenge');
      }
    } catch (err) {
      console.error('Error generating challenge:', err);
      setError(
        err.response?.data?.message ||
          'Failed to generate challenge. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUseChallenge = () => {
    if (generatedChallenge && onChallengeGenerated) {
      onChallengeGenerated(generatedChallenge);
      handleClose();
    }
  };

  const handleClose = () => {
    setGeneratedChallenge(null);
    setError('');
    setLoading(false);
    onClose();
  };

  const getTypeIcon = (typeId) => {
    const icons = {
      mcq: '📝',
      'fill-blank': '✍️',
      'true-false': '✅',
      matching: '🔗',
      'short-answer': '💬',
      'long-response': '📄',
      'code-challenge': '💻',
      practical: '🔨',
      flashcard: '🃏',
      ordering: '🔢',
    };
    return icons[typeId] || '❓';
  };

  if (!isOpen) return null;

  const selectedCategory = categories.find((c) => c.id === formData.category);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🤖</span>
              <div>
                <h2 className="text-xl font-bold text-white">
                  AI Challenge Generator
                </h2>
                <p className="text-emerald-100 text-sm">
                  Create personalized learning challenges
                </p>
              </div>
            </div>
            <button
              className="text-white/80 hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              onClick={handleClose}
            >
              ×
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
          {!generatedChallenge ? (
            <div className="p-6 space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Learning Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
                {selectedCategory && (
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedCategory.description}
                  </p>
                )}
              </div>

              {/* Topic Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Topic / Subject
                </label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  placeholder="e.g., Spanish vocabulary, Piano scales, React hooks, Bread baking..."
                  disabled={loading}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <div className="flex gap-3">
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, difficulty: level }))
                      }
                      disabled={loading}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all
                        ${
                          formData.difficulty === level
                            ? 'bg-emerald-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Types */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Question Types
                  <span className="font-normal text-gray-500 ml-2">
                    (Select the types you want)
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {questionTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => toggleQuestionType(type.id)}
                      disabled={loading}
                      className={`p-3 rounded-xl text-left transition-all border-2
                        ${
                          formData.questionTypes.includes(type.id)
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getTypeIcon(type.id)}</span>
                        <span className="text-sm font-medium">{type.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Questions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Questions: {formData.numQuestions}
                </label>
                <input
                  type="range"
                  name="numQuestions"
                  min="1"
                  max="15"
                  value={formData.numQuestions}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                  <span>15</span>
                </div>
              </div>

              {/* Advanced Options */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2"
                >
                  <span>{showAdvanced ? '▼' : '▶'}</span>
                  Advanced Options
                </button>

                {showAdvanced && (
                  <div className="mt-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Custom Instructions for AI
                    </label>
                    <textarea
                      name="customInstructions"
                      value={formData.customInstructions}
                      onChange={handleInputChange}
                      placeholder="e.g., Focus on beginner-friendly examples, include real-world scenarios, avoid technical jargon..."
                      disabled={loading}
                      rows={3}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  onClick={handleGenerate}
                  disabled={loading}
                  data-testid="generate-ai-challenge-btn"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="small" />
                      Generating...
                    </>
                  ) : (
                    <>🎲 Generate Challenge</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Generated Challenge Preview */
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {generatedChallenge.title}
                </h3>
                <p className="text-gray-600">
                  {generatedChallenge.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium
                  ${
                    generatedChallenge.difficulty === 'beginner'
                      ? 'bg-green-100 text-green-700'
                      : generatedChallenge.difficulty === 'intermediate'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {generatedChallenge.difficulty}
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {generatedChallenge.category}
                </span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  ⏱ {generatedChallenge.estimatedTime}
                </span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                  {generatedChallenge.questions?.length || 0} questions
                </span>
              </div>

              {/* Question Preview */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">
                  Question Types Included:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    ...new Set(
                      generatedChallenge.questions?.map((q) => q.type) || []
                    ),
                  ].map((type) => (
                    <span
                      key={type}
                      className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {getTypeIcon(type)} {type}
                    </span>
                  ))}
                </div>
              </div>

              {generatedChallenge.tips &&
                generatedChallenge.tips.length > 0 && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <h4 className="font-semibold text-amber-800 mb-2">
                      💡 Tips
                    </h4>
                    <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                      {generatedChallenge.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  onClick={() => setGeneratedChallenge(null)}
                >
                  Generate Another
                </button>
                <button
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg flex items-center justify-center gap-2"
                  onClick={handleUseChallenge}
                  data-testid="use-generated-challenge-btn"
                >
                  ✓ Use This Challenge
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGenerateModal;
