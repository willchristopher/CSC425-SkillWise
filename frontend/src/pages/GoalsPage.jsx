import React, { useState, useEffect } from 'react';
import GoalCard from '../components/goals/GoalCard';
import CreateGoalForm from '../components/goals/CreateGoalForm';
import axios from 'axios';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  // Fetch goals on component mount
  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/goals');
      setGoals(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleGoalCreated = (newGoal) => {
    setGoals([newGoal, ...goals]);
    setShowForm(false);
  };

  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    if (filter === 'active') return !goal.is_completed;
    if (filter === 'completed') return goal.is_completed;
    return goal.category === filter;
  });

  if (showForm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <CreateGoalForm
          onSuccess={handleGoalCreated}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Learning Goals</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Create New Goal
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Goals</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="programming">Programming</option>
          <option value="design">Design</option>
          <option value="business">Business</option>
          <option value="data-science">Data Science</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Goals Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading goals...</p>
        </div>
      ) : filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onUpdate={fetchGoals} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">
            {filter === 'all' 
              ? 'No goals yet. Create your first learning goal!' 
              : 'No goals found with this filter.'}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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