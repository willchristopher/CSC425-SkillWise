import React, { useState, useEffect } from 'react';
import GoalCard from '../components/goals/GoalCard';
import GoalForm from '../components/goals/GoalForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { apiService } from '../services/api';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filter, setFilter] = useState('all');

  // Fetch goals on component mount
  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.goals.getAll();
      setGoals(response.data.data || []);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError(err.response?.data?.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (goalData) => {
    try {
      const response = await apiService.goals.create(goalData);
      setGoals([response.data.data, ...goals]);
      setShowCreateForm(false);
      // Show success message
      alert('Goal created successfully!');
    } catch (err) {
      console.error('Error creating goal:', err);
      alert(err.response?.data?.message || 'Failed to create goal');
      throw err;
    }
  };

  const handleUpdateGoal = async (goalData) => {
    try {
      const response = await apiService.goals.update(editingGoal.id, goalData);
      setGoals(goals.map(g => g.id === editingGoal.id ? response.data.data : g));
      setEditingGoal(null);
      alert('Goal updated successfully!');
    } catch (err) {
      console.error('Error updating goal:', err);
      alert(err.response?.data?.message || 'Failed to update goal');
      throw err;
    }
  };

  const handleDeleteGoal = async (goal) => {
    if (!window.confirm(`Are you sure you want to delete "${goal.title}"?`)) {
      return;
    }

    try {
      await apiService.goals.delete(goal.id);
      setGoals(goals.filter(g => g.id !== goal.id));
      alert('Goal deleted successfully!');
    } catch (err) {
      console.error('Error deleting goal:', err);
      alert(err.response?.data?.message || 'Failed to delete goal');
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setShowCreateForm(true);
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingGoal(null);
  };

  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    if (filter === 'active') return !goal.is_completed;
    if (filter === 'completed') return goal.is_completed;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Learning Goals</h1>
          <p className="text-gray-600 mt-2">Track and manage your learning objectives</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
        >
          {showCreateForm ? '✕ Cancel' : '+ Create New Goal'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">
            {editingGoal ? 'Edit Goal' : 'Create New Goal'}
          </h2>
          <GoalForm
            onSuccess={editingGoal ? handleUpdateGoal : handleCreateGoal}
            onCancel={handleCancelForm}
            initialData={editingGoal}
          />
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({goals.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'active'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Active ({goals.filter(g => !g.is_completed).length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Completed ({goals.filter(g => g.is_completed).length})
        </button>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No goals yet</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all'
              ? 'Create your first learning goal to get started!'
              : `No ${filter} goals found.`}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Your First Goal
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GoalsPage;