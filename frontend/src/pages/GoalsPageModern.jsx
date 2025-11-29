import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { Card, Button, Badge, Loading, Alert, Input, Modal } from '../components/ui';

const GoalsPageModern = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for creating/editing goals
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'programming',
    difficulty_level: 'medium',
    target_completion_date: ''
  });

  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    status: 'all',
    search: '',
  });

  const categories = [
    { value: 'programming', label: 'Programming' },
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'science', label: 'Science' },
    { value: 'language', label: 'Language Learning' },
    { value: 'design', label: 'Design' },
    { value: 'business', label: 'Business' },
    { value: 'other', label: 'Other' }
  ];

  const difficultyLevels = [
    { value: 'beginner', label: 'Beginner', color: 'success' },
    { value: 'intermediate', label: 'Intermediate', color: 'warning' },
    { value: 'advanced', label: 'Advanced', color: 'error' }
  ];

  // Fetch goals from API
  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.goals.getAll();
      setGoals(response.data || []);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError(err.response?.data?.message || 'Failed to load goals');
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter goals based on current filters
  const filterGoals = useCallback(() => {
    let filtered = [...goals];

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(goal => 
        goal.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Filter by difficulty
    if (filters.difficulty) {
      filtered = filtered.filter(goal => 
        goal.difficulty_level?.toLowerCase() === filters.difficulty.toLowerCase()
      );
    }

    // Filter by status
    if (filters.status === 'active') {
      filtered = filtered.filter(goal => !goal.is_completed);
    } else if (filters.status === 'completed') {
      filtered = filtered.filter(goal => goal.is_completed);
    }

    // Filter by search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(goal =>
        goal.title?.toLowerCase().includes(searchTerm) ||
        goal.description?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredGoals(filtered);
  }, [goals, filters]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Create new goal
  const handleCreateGoal = () => {
    setEditingGoal(null);
    setFormData({
      title: '',
      description: '',
      category: 'programming',
      difficulty_level: 'medium',
      target_completion_date: ''
    });
    setIsModalOpen(true);
  };

  // Edit existing goal
  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title || '',
      description: goal.description || '',
      category: goal.category || 'programming',
      difficulty_level: goal.difficulty_level || 'medium',
      target_completion_date: goal.target_completion_date ? 
        new Date(goal.target_completion_date).toISOString().split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  // Submit goal form
  const handleSubmitGoal = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const goalData = {
        ...formData,
        target_completion_date: formData.target_completion_date || null
      };

      if (editingGoal) {
        await apiService.goals.update(editingGoal.id, goalData);
      } else {
        await apiService.goals.create(goalData);
      }

      setIsModalOpen(false);
      await fetchGoals();
    } catch (err) {
      console.error('Error saving goal:', err);
      setError(err.response?.data?.message || 'Failed to save goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle goal completion
  const handleToggleCompletion = async (goal) => {
    try {
      setError('');
      await apiService.goals.update(goal.id, {
        is_completed: !goal.is_completed,
        completion_date: !goal.is_completed ? new Date().toISOString() : null,
        progress_percentage: !goal.is_completed ? 100 : 0
      });
      await fetchGoals();
    } catch (err) {
      console.error('Error updating goal:', err);
      setError(err.response?.data?.message || 'Failed to update goal');
    }
  };

  // Delete goal
  const handleDeleteGoal = async (goal) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      setError('');
      await apiService.goals.delete(goal.id);
      await fetchGoals();
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError(err.response?.data?.message || 'Failed to delete goal');
    }
  };

  // Get progress stats
  const getStats = () => {
    const total = goals.length;
    const completed = goals.filter(g => g.is_completed).length;
    const active = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, active, completionRate };
  };

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  useEffect(() => {
    filterGoals();
  }, [filterGoals]);

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="nav-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="text-2xl font-bold text-primary-600">
                SkillWise
              </Link>
              <nav className="flex space-x-1">
                <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600">
                  Dashboard
                </Link>
                <span className="px-3 py-2 rounded-md text-sm font-medium bg-primary-100 text-primary-700">
                  Goals
                </span>
                <Link to="/challenges" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600">
                  Challenges
                </Link>
                <Link to="/ai-tutor" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600">
                  AI Tutor
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.firstName}!</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Learning Goals</h1>
              <p className="mt-2 text-gray-600">
                Set and track your learning objectives
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button variant="primary" onClick={handleCreateGoal}>
                + Create New Goal
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <Card.Body className="stats-card">
              <div className="stats-number">{stats.total}</div>
              <div className="stats-label">Total Goals</div>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body className="stats-card">
              <div className="stats-number">{stats.active}</div>
              <div className="stats-label">Active Goals</div>
              <Badge variant="primary" size="sm" className="mt-2">In Progress</Badge>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body className="stats-card">
              <div className="stats-number">{stats.completed}</div>
              <div className="stats-label">Completed</div>
              <Badge variant="success" size="sm" className="mt-2">Achieved</Badge>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body className="stats-card">
              <div className="stats-number">{stats.completionRate}%</div>
              <div className="stats-label">Success Rate</div>
            </Card.Body>
          </Card>
        </div>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-8">
          <Card.Body>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="label">Search</label>
                <Input
                  placeholder="Search goals..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Category</label>
                <select
                  className="input"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Difficulty</label>
                <select
                  className="input"
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                >
                  <option value="">All Levels</option>
                  {difficultyLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select
                  className="input"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">All Goals</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Goals Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loading variant="spinner" size="lg" text="Loading goals..." />
          </div>
        ) : filteredGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map((goal) => (
              <Card key={goal.id} interactive>
                <Card.Header>
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {goal.title}
                    </h3>
                    <Badge 
                      variant={goal.is_completed ? 'success' : 'primary'} 
                      size="sm"
                    >
                      {goal.is_completed ? 'Completed' : 'Active'}
                    </Badge>
                  </div>
                </Card.Header>
                
                <Card.Body>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {goal.description || 'No description provided'}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Category:</span>
                      <Badge variant="secondary" size="sm">
                        {categories.find(c => c.value === goal.category)?.label || goal.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Difficulty:</span>
                      <Badge 
                        variant={difficultyLevels.find(d => d.value === goal.difficulty_level)?.color || 'secondary'} 
                        size="sm"
                      >
                        {difficultyLevels.find(d => d.value === goal.difficulty_level)?.label || goal.difficulty_level}
                      </Badge>
                    </div>
                    
                    {goal.target_completion_date && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Target Date:</span>
                        <span className="text-gray-700">
                          {new Date(goal.target_completion_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500">Progress</span>
                        <span className="text-gray-700">{goal.progress_percentage || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${goal.progress_percentage || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card.Body>

                <Card.Footer>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditGoal(goal)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteGoal(goal)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                    <Button
                      variant={goal.is_completed ? 'secondary' : 'success'}
                      size="sm"
                      onClick={() => handleToggleCompletion(goal)}
                    >
                      {goal.is_completed ? 'Mark Incomplete' : 'Complete'}
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <Card.Body className="text-center py-12">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Goals Found</h3>
              <p className="text-gray-600 mb-6">
                {goals.length === 0 
                  ? "Start your learning journey by creating your first goal!"
                  : "No goals match your current filters. Try adjusting your search criteria."
                }
              </p>
              {goals.length === 0 && (
                <Button variant="primary" onClick={handleCreateGoal}>
                  Create Your First Goal
                </Button>
              )}
            </Card.Body>
          </Card>
        )}
      </main>

      {/* Goal Creation/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGoal ? 'Edit Goal' : 'Create New Goal'}
        size="md"
      >
        <form onSubmit={handleSubmitGoal}>
          <Modal.Body>
            <div className="space-y-6">
              <div>
                <label className="label required">Goal Title</label>
                <Input
                  name="title"
                  placeholder="e.g., Learn React Hooks"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="label">Description</label>
                <Input
                  as="textarea"
                  name="description"
                  rows={4}
                  placeholder="Describe your learning goal and what you want to achieve..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label required">Category</label>
                  <select
                    name="category"
                    className="input"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label required">Difficulty</label>
                  <select
                    name="difficulty_level"
                    className="input"
                    value={formData.difficulty_level}
                    onChange={handleInputChange}
                    required
                  >
                    {difficultyLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Target Completion Date</label>
                <Input
                  type="date"
                  name="target_completion_date"
                  value={formData.target_completion_date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (editingGoal ? 'Update Goal' : 'Create Goal')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default GoalsPageModern;