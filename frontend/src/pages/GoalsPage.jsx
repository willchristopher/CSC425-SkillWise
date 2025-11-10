import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import InteractiveQuiz from '../components/InteractiveQuiz';

const GoalsPage = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [aiQuestions, setAiQuestions] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressGoal, setProgressGoal] = useState(null);
  const [newProgress, setNewProgress] = useState(0);
  const [useSlider, setUseSlider] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'programming',
    difficulty: 'medium',
    targetCompletionDate: '',
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await apiService.goals.getAll();
      console.log('Goals API Response:', response.data);
      setGoals(response.data.data || response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load goals');
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      await apiService.goals.create(formData);
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        category: 'programming',
        difficulty: 'medium',
        targetCompletionDate: '',
      });
      fetchGoals();
    } catch (err) {
      alert('Failed to create goal: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;

    try {
      await apiService.goals.delete(id);
      fetchGoals();
    } catch (err) {
      alert('Failed to delete goal');
    }
  };

  const handleUpdateProgress = async (goal) => {
    setProgressGoal(goal);
    setNewProgress(goal.currentProgress || 0);
    setShowProgressModal(true);
  };

  const submitProgressUpdate = async () => {
    try {
      await apiService.goals.update(progressGoal.id, { currentProgress: newProgress });
      setShowProgressModal(false);
      setProgressGoal(null);
      fetchGoals();
    } catch (err) {
      alert('Failed to update progress');
    }
  };

  const handleGeneratePracticeQuestions = async (goal) => {
    console.log('🤖 Generating interactive practice questions for goal:', goal);
    setLoadingAI(true);
    setSelectedGoal(goal);
    setAiQuestions(null); // Clear previous questions
    
    try {
      const response = await apiService.ai.generatePracticeQuestions({
        title: goal.title,
        description: goal.description,
        difficulty: goal.difficulty,
        category: goal.category,
      });
      
      console.log('✅ AI Response received:', response.data);
      
      // Backend returns { status: 'success', data: { goalTitle, questions, ... } }
      const questionsData = response.data.data || response.data;
      
      // Check if we have structured questions
      if (!questionsData.questions || questionsData.questions.length === 0) {
        throw new Error('No questions were generated. Please try again.');
      }
      
      console.log('📝 Parsed questions:', questionsData.questions);
      setAiQuestions(questionsData);
      
    } catch (err) {
      console.error('❌ Error generating questions:', err);
      const errorMessage = err.response?.data?.message || err.message;
      
      // Show clear error message
      alert(`⚠️ Unable to generate practice questions\n\n${errorMessage}\n\nPlease try again in a moment.`);
      setAiQuestions(null);
    } finally {
      setLoadingAI(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      paused: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.active;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading your goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Learning Goals</h1>
            <p className="text-lg text-gray-600">Track your learning journey with AI-powered assistance</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
          >
            + Create New Goal
          </button>
        </div>

        {/* Goals Grid */}
        {goals.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                {/* Goal Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{goal.title}</h3>
                    <div className="flex gap-2 mb-3">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getDifficultyColor(goal.difficulty)}`}>
                        {goal.difficulty}
                      </span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(goal.status)}`}>
                        {goal.status}
                      </span>
                      {goal.category && (
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                          {goal.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                    title="Delete goal"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* Description */}
                {goal.description && (
                  <p className="text-gray-600 mb-4">{goal.description}</p>
                )}

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">Progress</span>
                    <span className="text-sm font-bold text-indigo-600">{goal.currentProgress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all"
                      style={{ width: `${goal.currentProgress || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Due Date */}
                {goal.targetCompletionDate && (
                  <p className="text-sm text-gray-500 mb-4">
                    📅 Target: {new Date(goal.targetCompletionDate).toLocaleDateString()}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleUpdateProgress(goal)}
                    className="flex-1 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-100 transition-colors"
                  >
                    Update Progress
                  </button>
                  <button
                    onClick={() => handleGeneratePracticeQuestions(goal)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <span>🤖</span> Get AI Questions
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎯</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No goals yet</h2>
            <p className="text-gray-600 mb-6">Start your learning journey by creating your first goal!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
            >
              Create Your First Goal
            </button>
          </div>
        )}

        {/* Create Goal Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Create New Goal</h2>

              <form onSubmit={handleCreateGoal} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Master React Hooks"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="4"
                    placeholder="What do you want to learn and achieve?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="programming">Programming</option>
                      <option value="web-development">Web Development</option>
                      <option value="data-science">Data Science</option>
                      <option value="design">Design</option>
                      <option value="devops">DevOps</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={formData.targetCompletionDate}
                    onChange={(e) => setFormData({ ...formData, targetCompletionDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    Create Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Interactive Quiz Modal */}
        {aiQuestions && aiQuestions.questions && aiQuestions.questions.length > 0 && (
          <InteractiveQuiz
            questions={aiQuestions.questions}
            goalTitle={aiQuestions.goalTitle}
            onClose={() => setAiQuestions(null)}
            onRegenerate={() => handleGeneratePracticeQuestions(selectedGoal)}
            isRegenerating={loadingAI}
          />
        )}

        {/* Progress Update Modal */}
        {showProgressModal && progressGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Update Progress</h2>
              <p className="text-gray-600 mb-6">{progressGoal.title}</p>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <button
                    onClick={() => setUseSlider(true)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      useSlider
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Slider
                  </button>
                  <button
                    onClick={() => setUseSlider(false)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      !useSlider
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Input
                  </button>
                </div>

                {useSlider ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">Progress</span>
                      <span className="text-2xl font-bold text-indigo-600">{newProgress}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={newProgress}
                      onChange={(e) => setNewProgress(parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${newProgress}%, #e5e7eb ${newProgress}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Enter Progress (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newProgress}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 0 && val <= 100) {
                          setNewProgress(val);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowProgressModal(false);
                    setProgressGoal(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitProgressUpdate}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsPage;
