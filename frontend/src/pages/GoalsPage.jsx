import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import GoalCard from '../components/goals/GoalCard';
import GoalModal from '../components/goals/GoalModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PageLayout from '../components/layout/PageLayout';
import '../styles/goals.css';

const GoalsPage = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    status: 'all', // 'all', 'active', 'completed'
    search: '',
  });

  // Fetch goals on component mount
  useEffect(() => {
    fetchGoals();
  }, []);

  // Filter goals when filters change
  const filterGoals = useCallback(() => {
    let filtered = [...goals];

    // Filter by category
    if (filters.category && filters.category !== '') {
      filtered = filtered.filter(
        (goal) =>
          goal.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Filter by difficulty
    if (filters.difficulty && filters.difficulty !== '') {
      filtered = filtered.filter(
        (goal) =>
          goal.difficulty_level?.toLowerCase() ===
          filters.difficulty.toLowerCase()
      );
    }

    // Filter by status
    if (filters.status === 'active') {
      filtered = filtered.filter((goal) => !goal.is_completed);
    } else if (filters.status === 'completed') {
      filtered = filtered.filter((goal) => goal.is_completed);
    }

    // Filter by search term
    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (goal) =>
          goal.title?.toLowerCase().includes(searchTerm) ||
          goal.description?.toLowerCase().includes(searchTerm) ||
          goal.category?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredGoals(filtered);
  }, [goals, filters]);

  useEffect(() => {
    filterGoals();
  }, [filterGoals]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.goals.getAll();
      // Handle both response.data and response.data.data structures
      const goalsData = response.data?.data || response.data || [];
      setGoals(Array.isArray(goalsData) ? goalsData : []);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to load goals';
      setError(errorMessage);
      console.error('Failed to fetch goals:', err);
      // Set empty array on error so UI doesn't break
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
    setIsSubmitting(false);
  };

  const handleSubmitGoal = async (goalData) => {
    console.log('GoalsPage handleSubmitGoal called with:', goalData);
    try {
      setIsSubmitting(true);
      setError('');

      if (editingGoal) {
        // Update existing goal
        console.log('Updating goal:', editingGoal.id, goalData);
        await apiService.goals.update(editingGoal.id, goalData);
      } else {
        // Create new goal
        console.log('Creating new goal:', goalData);
        const response = await apiService.goals.create(goalData);
        console.log('Create goal response:', response);
      }

      // Refresh goals list
      await fetchGoals();
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save goal - Full error:', err);
      console.error('Error response data:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to save goal');
      console.error('Failed to save goal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      setError('');
      await apiService.goals.delete(goalId);
      await fetchGoals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete goal');
      console.error('Failed to delete goal:', err);
    }
  };

  const handleUpdateProgress = async (goalId, progressPercentage) => {
    try {
      setError('');
      await apiService.goals.updateProgress(goalId, {
        progress_percentage: progressPercentage,
      });
      await fetchGoals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update progress');
      console.error('Failed to update progress:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      difficulty: '',
      status: 'all',
      search: '',
    });
  };

  const getUniqueCategories = () => {
    const categories = goals
      .filter((goal) => goal.category)
      .map((goal) => goal.category)
      .filter((category, index, self) => self.indexOf(category) === index);
    return categories.sort();
  };

  const getGoalStats = () => {
    const total = goals.length;
    const completed = goals.filter((goal) => goal.is_completed).length;
    const active = total - completed;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, active, completionRate };
  };

  if (loading) {
    return (
      <PageLayout>
        <LoadingSpinner message="Loading your goals..." />
      </PageLayout>
    );
  }

  const stats = getGoalStats();
  const categories = getUniqueCategories();

  return (
    <PageLayout>
      <div className="goals-page">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Learning Goals
            </h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {user?.firstName || user?.first_name || 'User'}!
              Track your learning progress.
            </p>
          </div>
          <button
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
            onClick={handleCreateGoal}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create New Goal
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {/* Goal Statistics */}
        <div className="goals-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Goals</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.active}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.completionRate}%</div>
            <div className="stat-label">Completion Rate</div>
          </div>
        </div>

        {/* Filters */}
        <div className="goals-filters">
          <div className="filters-section">
            <div className="filter-group">
              <label htmlFor="search">Search:</label>
              <input
                id="search"
                type="text"
                placeholder="Search goals..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="category">Category:</label>
              <select
                id="category"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="difficulty">Difficulty:</label>
              <select
                id="difficulty"
                value={filters.difficulty}
                onChange={(e) =>
                  handleFilterChange('difficulty', e.target.value)
                }
                className="filter-select"
              >
                <option value="">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="status">Status:</label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Goals</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <button onClick={clearFilters} className="btn btn-secondary btn-sm">
              Clear Filters
            </button>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="goals-content">
          {filteredGoals.length > 0 ? (
            <div className="goals-grid">
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={handleEditGoal}
                  onDelete={handleDeleteGoal}
                  onUpdateProgress={handleUpdateProgress}
                />
              ))}
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">
                No goals yet
              </h3>
              <p className="text-gray-500 mt-2">
                Create your first learning goal to start tracking your progress!
              </p>
              <button
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg"
                onClick={handleCreateGoal}
              >
                Create Your First Goal
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">
                No goals match your filters
              </h3>
              <p className="text-gray-500 mt-2">
                Try adjusting your search criteria or clearing the filters.
              </p>
              <button
                className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Goal Modal */}
        <GoalModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitGoal}
          goal={editingGoal}
          isLoading={isSubmitting}
        />
      </div>
    </PageLayout>
  );
};

export default GoalsPage;
