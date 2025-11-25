import React, { useState, useEffect } from 'react';
import GoalCard from '../components/goals/GoalCard';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock goals data
  useEffect(() => {
    const mockGoals = [
      {
        id: 1,
        title: 'Master React Hooks',
        description: 'Learn useState, useEffect, useContext, and custom hooks',
        category: 'Programming',
        status: 'in-progress',
        progress: 65,
        targetDate: '2025-12-31',
        priority: 'high',
        tags: ['React', 'JavaScript', 'Frontend']
      },
      {
        id: 2,
        title: 'Complete CSS Grid Mastery',
        description: 'Build responsive layouts with CSS Grid and Flexbox',
        category: 'Design',
        status: 'completed',
        progress: 100,
        targetDate: '2025-11-15',
        priority: 'medium',
        tags: ['CSS', 'Layout', 'Responsive']
      },
      {
        id: 3,
        title: 'Learn Node.js API Development',
        description: 'Build RESTful APIs with Express.js and MongoDB',
        category: 'Backend',
        status: 'not-started',
        progress: 0,
        targetDate: '2026-02-28',
        priority: 'high',
        tags: ['Node.js', 'Express', 'API']
      }
    ];
    
    setGoals(mockGoals);
    setFilteredGoals(mockGoals);
  }, []);

  // Filter goals based on search and filters
  useEffect(() => {
    let filtered = goals;

    if (filters.category) {
      filtered = filtered.filter(goal => goal.category === filters.category);
    }

    if (filters.status) {
      filtered = filtered.filter(goal => goal.status === filters.status);
    }

    if (filters.search) {
      filtered = filtered.filter(goal =>
        goal.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        goal.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        goal.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    setFilteredGoals(filtered);
  }, [goals, filters]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #f3e8ff 100%)'
    }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Learning Goals</h1>
              <p className="text-lg text-gray-600">Track your progress and achieve your learning objectives</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="mt-4 md:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Goal
              </span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search goals..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="">All Categories</option>
                <option value="Programming">Programming</option>
                <option value="Design">Design</option>
                <option value="Backend">Backend</option>
                <option value="Business">Business</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="">All Status</option>
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ category: '', status: '', search: '' })}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        {filteredGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 max-w-md mx-auto">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {goals.length === 0 ? 'No goals yet' : 'No goals match your filters'}
              </h3>
              <p className="text-gray-600 mb-6">
                {goals.length === 0 
                  ? 'Create your first learning goal to start tracking your progress!' 
                  : 'Try adjusting your search criteria or clear the filters.'}
              </p>
              {goals.length === 0 && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  Create Your First Goal
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsPage;