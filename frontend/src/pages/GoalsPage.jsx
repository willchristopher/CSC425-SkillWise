import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AppLayout from '../components/layout/AppLayout';
import GoalDetailModal from '../components/goals/GoalDetailModal';
import '../styles/goals-v2.css';

// Goal color themes
const GOAL_COLORS = [
  { id: 'indigo', primary: '#6366f1', light: '#e0e7ff', name: 'Indigo' },
  { id: 'emerald', primary: '#10b981', light: '#d1fae5', name: 'Emerald' },
  { id: 'amber', primary: '#f59e0b', light: '#fef3c7', name: 'Amber' },
  { id: 'rose', primary: '#f43f5e', light: '#ffe4e6', name: 'Rose' },
  { id: 'violet', primary: '#8b5cf6', light: '#ede9fe', name: 'Violet' },
  { id: 'cyan', primary: '#06b6d4', light: '#cffafe', name: 'Cyan' },
  { id: 'orange', primary: '#f97316', light: '#ffedd5', name: 'Orange' },
  { id: 'teal', primary: '#14b8a6', light: '#ccfbf1', name: 'Teal' },
];

// Category icons mapping
const CATEGORY_ICONS = {
  programming: '💻',
  'web development': '🌐',
  'data science': '📊',
  design: '🎨',
  business: '💼',
  marketing: '📢',
  'language learning': '🗣️',
  mathematics: '🔢',
  science: '🔬',
  'personal development': '🌱',
  fitness: '💪',
  other: '📌',
  default: '🎯',
};

// Quick goal templates
const GOAL_TEMPLATES = [
  {
    title: 'Learn a New Programming Language',
    category: 'programming',
    difficulty_level: 'medium',
    description:
      'Master the fundamentals and build projects with a new language.',
  },
  {
    title: 'Build a Portfolio Website',
    category: 'web development',
    difficulty_level: 'easy',
    description: 'Create a personal portfolio to showcase your projects.',
  },
  {
    title: 'Complete a Data Analysis Project',
    category: 'data science',
    difficulty_level: 'hard',
    description: 'Analyze a real dataset and present insights.',
  },
  {
    title: 'Read 12 Books This Year',
    category: 'personal development',
    difficulty_level: 'medium',
    description: 'Expand your knowledge by reading one book per month.',
  },
];

const GoalsPage = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userStats, setUserStats] = useState(null);

  // View and filter states
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'kanban'
  const [sortBy, setSortBy] = useState('created'); // 'created', 'progress', 'deadline', 'priority'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Editing states
  const [quickEditData, setQuickEditData] = useState({});

  useEffect(() => {
    fetchGoals();
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await apiService.user.getStatistics();
      setUserStats(response.data?.data || response.data || null);
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
    }
  };

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.goals.getAll();
      const goalsData = response.data?.data || response.data || [];
      // Add color if not present
      const goalsWithColors = (Array.isArray(goalsData) ? goalsData : []).map(
        (goal) => ({
          ...goal,
          color:
            goal.color ||
            GOAL_COLORS[Math.floor(Math.random() * GOAL_COLORS.length)].id,
        })
      );
      setGoals(goalsWithColors);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load goals');
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtered and sorted goals
  const processedGoals = useMemo(() => {
    let filtered = [...goals];

    // Filter by status
    if (filterStatus === 'active') {
      filtered = filtered.filter((g) => !g.is_completed);
    } else if (filterStatus === 'completed') {
      filtered = filtered.filter((g) => g.is_completed);
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(
        (g) => g.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.title?.toLowerCase().includes(query) ||
          g.description?.toLowerCase().includes(query) ||
          g.category?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return (b.progress_percentage || 0) - (a.progress_percentage || 0);
        case 'deadline':
          if (!a.target_completion_date) return 1;
          if (!b.target_completion_date) return -1;
          return (
            new Date(a.target_completion_date) -
            new Date(b.target_completion_date)
          );
        case 'priority':
          const priorityOrder = { hard: 0, medium: 1, easy: 2 };
          return (
            (priorityOrder[a.difficulty_level] || 1) -
            (priorityOrder[b.difficulty_level] || 1)
          );
        case 'created':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    return filtered;
  }, [goals, filterStatus, selectedCategory, searchQuery, sortBy]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter((g) => g.is_completed).length;
    const active = total - completed;
    const avgProgress =
      total > 0
        ? Math.round(
            goals.reduce((sum, g) => sum + (g.progress_percentage || 0), 0) /
              total
          )
        : 0;
    const overdue = goals.filter(
      (g) =>
        g.target_completion_date &&
        new Date(g.target_completion_date) < new Date() &&
        !g.is_completed
    ).length;
    return { total, completed, active, avgProgress, overdue };
  }, [goals, userStats]);

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(goals.map((g) => g.category).filter(Boolean))].sort();
  }, [goals]);

  // Kanban columns for kanban view
  const kanbanColumns = useMemo(() => {
    return {
      'not-started': processedGoals.filter(
        (g) => !g.is_completed && (g.progress_percentage || 0) === 0
      ),
      'in-progress': processedGoals.filter(
        (g) =>
          !g.is_completed &&
          (g.progress_percentage || 0) > 0 &&
          (g.progress_percentage || 0) < 100
      ),
      completed: processedGoals.filter(
        (g) => g.is_completed || g.progress_percentage === 100
      ),
    };
  }, [processedGoals]);

  // Handlers
  const handleCreateGoal = async (goalData) => {
    try {
      await apiService.goals.create(goalData);
      await fetchGoals();
      await fetchUserStats();
      setIsCreateModalOpen(false);
      setShowTemplates(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create goal');
    }
  };

  const handleUpdateGoal = async (goalId, updates) => {
    try {
      await apiService.goals.update(goalId, updates);
      await fetchGoals();
      await fetchUserStats();
      setSelectedGoal(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update goal');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this goal? This cannot be undone.'
      )
    )
      return;
    try {
      await apiService.goals.delete(goalId);
      await fetchGoals();
      await fetchUserStats();
      setSelectedGoal(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete goal');
    }
  };

  const handleUpdateProgress = async (goalId, newProgress) => {
    try {
      // Update the goal in state immediately (optimistic update)
      setGoals((prevGoals) =>
        prevGoals.map((goal) => {
          if (goal.id === goalId) {
            return {
              ...goal,
              progress_percentage: newProgress,
              is_completed: newProgress === 100,
              completion_date:
                newProgress === 100
                  ? new Date().toISOString()
                  : goal.completion_date,
            };
          }
          return goal;
        })
      );

      // Also update selected goal if it's open
      if (selectedGoal && selectedGoal.id === goalId) {
        setSelectedGoal((prev) => ({
          ...prev,
          progress_percentage: newProgress,
          is_completed: newProgress === 100,
          completion_date:
            newProgress === 100
              ? new Date().toISOString()
              : prev.completion_date,
        }));
      }

      // Make the API call to persist
      await apiService.goals.updateProgress(goalId, {
        progress_percentage: newProgress,
      });

      // Refresh user stats in case points were awarded
      await fetchUserStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update progress');
      // Refresh on error to sync state
      await fetchGoals();
      await fetchUserStats();
    }
  };

  const handleQuickComplete = async (goalId) => {
    await handleUpdateProgress(goalId, 100);
  };

  const handleUseTemplate = (template) => {
    setQuickEditData({
      ...template,
      target_completion_date: '',
      is_public: false,
    });
    setShowTemplates(false);
    setIsCreateModalOpen(true);
  };

  const getCategoryIcon = (category) => {
    return CATEGORY_ICONS[category?.toLowerCase()] || CATEGORY_ICONS.default;
  };

  const getColorTheme = (colorId) => {
    return GOAL_COLORS.find((c) => c.id === colorId) || GOAL_COLORS[0];
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0 && diffDays <= 7) return `${diffDays} days left`;
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDifficultyLabel = (level) => {
    const labels = { easy: '🌱 Easy', medium: '🌿 Medium', hard: '🌳 Hard' };
    return labels[level] || level;
  };

  if (loading) {
    return (
      <AppLayout title="Goals" subtitle="Track your learning journey">
        <LoadingSpinner message="Loading your goals..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Goals" subtitle="Track your learning journey">
      <div className="goals-page-v2">
        {/* Stats Overview */}
        <div className="goals-stats-bar animate-fade-in">
          <div className="stat-pill">
            <svg
              className="stat-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-pill active">
            <svg
              className="stat-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="stat-value">{stats.active}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-pill completed">
            <svg
              className="stat-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Done</span>
          </div>
          <div className="stat-pill progress">
            <svg
              className="stat-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 17" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            <span className="stat-value">{stats.avgProgress}%</span>
            <span className="stat-label">Avg Progress</span>
          </div>
          {stats.overdue > 0 && (
            <div className="stat-pill overdue">
              <svg
                className="stat-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="stat-value">{stats.overdue}</span>
              <span className="stat-label">Overdue</span>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="goals-toolbar animate-fade-in">
          <div className="toolbar-left">
            <div className="search-box">
              <svg
                className="search-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  className="search-clear"
                  onClick={() => setSearchQuery('')}
                >
                  ×
                </button>
              )}
            </div>

            <div className="filter-pills">
              <button
                className={`filter-pill ${
                  filterStatus === 'all' ? 'active' : ''
                }`}
                onClick={() => setFilterStatus('all')}
              >
                All
              </button>
              <button
                className={`filter-pill ${
                  filterStatus === 'active' ? 'active' : ''
                }`}
                onClick={() => setFilterStatus('active')}
              >
                Active
              </button>
              <button
                className={`filter-pill ${
                  filterStatus === 'completed' ? 'active' : ''
                }`}
                onClick={() => setFilterStatus('completed')}
              >
                Completed
              </button>
            </div>

            {categories.length > 0 && (
              <select
                className="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {getCategoryIcon(cat)} {cat}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="toolbar-right">
            <div className="sort-control">
              <label>Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="created">Recently Created</option>
                <option value="progress">Progress</option>
                <option value="deadline">Deadline</option>
                <option value="priority">Priority</option>
              </select>
            </div>

            <div className="view-toggles">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
              <button
                className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                onClick={() => setViewMode('kanban')}
                title="Kanban View"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="5" height="18" rx="1" />
                  <rect x="10" y="3" width="5" height="12" rx="1" />
                  <rect x="17" y="3" width="5" height="15" rx="1" />
                </svg>
              </button>
            </div>

            <div className="create-actions">
              <button
                className="btn-templates"
                onClick={() => setShowTemplates(!showTemplates)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
                Templates
              </button>
              <button
                className="btn-create-goal"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                New Goal
              </button>
            </div>
          </div>
        </div>

        {/* Templates Dropdown */}
        {showTemplates && (
          <div className="templates-dropdown animate-scale-in">
            <div className="templates-header">
              <h3>Quick Start Templates</h3>
              <button
                className="close-templates"
                onClick={() => setShowTemplates(false)}
              >
                ×
              </button>
            </div>
            <div className="templates-grid">
              {GOAL_TEMPLATES.map((template, idx) => (
                <div
                  key={idx}
                  className="template-card"
                  onClick={() => handleUseTemplate(template)}
                >
                  <span className="template-icon">
                    {getCategoryIcon(template.category)}
                  </span>
                  <h4>{template.title}</h4>
                  <p>{template.description}</p>
                  <div className="template-meta">
                    <span className="template-difficulty">
                      {getDifficultyLabel(template.difficulty_level)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="error-banner animate-shake">
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {/* Goals Content */}
        <div className="goals-content">
          {processedGoals.length === 0 ? (
            <div className="empty-goals animate-fade-in">
              <div className="empty-illustration">
                <svg viewBox="0 0 200 200" fill="none">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="#e0e7ff"
                    opacity="0.5"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="60"
                    fill="#c7d2fe"
                    opacity="0.5"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="40"
                    fill="#a5b4fc"
                    opacity="0.5"
                  />
                  <circle cx="100" cy="100" r="20" fill="#6366f1" />
                  <path
                    d="M100 60 L100 100 L130 100"
                    stroke="#4f46e5"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3>
                {goals.length === 0
                  ? 'Start Your Journey'
                  : 'No matching goals'}
              </h3>
              <p>
                {goals.length === 0
                  ? 'Set your first learning goal and begin tracking your progress!'
                  : 'Try adjusting your filters or search terms.'}
              </p>
              {goals.length === 0 ? (
                <div className="empty-actions">
                  <button
                    className="btn-primary"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    Create Your First Goal
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowTemplates(true)}
                  >
                    Use a Template
                  </button>
                </div>
              ) : (
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setFilterStatus('all');
                    setSelectedCategory('');
                    setSearchQuery('');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : viewMode === 'kanban' ? (
            /* Kanban View */
            <div className="kanban-board animate-stagger-container">
              <div className="kanban-column">
                <div className="kanban-header not-started">
                  <span className="column-icon">📋</span>
                  <h3>Not Started</h3>
                  <span className="column-count">
                    {kanbanColumns['not-started'].length}
                  </span>
                </div>
                <div className="kanban-cards">
                  {kanbanColumns['not-started'].map((goal) => (
                    <GoalKanbanCard
                      key={goal.id}
                      goal={goal}
                      getColorTheme={getColorTheme}
                      getCategoryIcon={getCategoryIcon}
                      formatDate={formatDate}
                      onSelect={() => setSelectedGoal(goal)}
                      onQuickProgress={(progress) =>
                        handleUpdateProgress(goal.id, progress)
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="kanban-column">
                <div className="kanban-header in-progress">
                  <span className="column-icon">🚀</span>
                  <h3>In Progress</h3>
                  <span className="column-count">
                    {kanbanColumns['in-progress'].length}
                  </span>
                </div>
                <div className="kanban-cards">
                  {kanbanColumns['in-progress'].map((goal) => (
                    <GoalKanbanCard
                      key={goal.id}
                      goal={goal}
                      getColorTheme={getColorTheme}
                      getCategoryIcon={getCategoryIcon}
                      formatDate={formatDate}
                      onSelect={() => setSelectedGoal(goal)}
                      onQuickProgress={(progress) =>
                        handleUpdateProgress(goal.id, progress)
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="kanban-column">
                <div className="kanban-header completed">
                  <span className="column-icon">🎉</span>
                  <h3>Completed</h3>
                  <span className="column-count">
                    {kanbanColumns['completed'].length}
                  </span>
                </div>
                <div className="kanban-cards">
                  {kanbanColumns['completed'].map((goal) => (
                    <GoalKanbanCard
                      key={goal.id}
                      goal={goal}
                      getColorTheme={getColorTheme}
                      getCategoryIcon={getCategoryIcon}
                      formatDate={formatDate}
                      onSelect={() => setSelectedGoal(goal)}
                      completed
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : viewMode === 'list' ? (
            /* List View */
            <div className="goals-list animate-stagger-container">
              {processedGoals.map((goal) => (
                <GoalListItem
                  key={goal.id}
                  goal={goal}
                  getColorTheme={getColorTheme}
                  getCategoryIcon={getCategoryIcon}
                  getDifficultyLabel={getDifficultyLabel}
                  formatDate={formatDate}
                  onSelect={() => setSelectedGoal(goal)}
                  onQuickComplete={() => handleQuickComplete(goal.id)}
                  onUpdateProgress={(progress) =>
                    handleUpdateProgress(goal.id, progress)
                  }
                />
              ))}
            </div>
          ) : (
            /* Grid View */
            <div className="goals-grid-v2 animate-stagger-container">
              {processedGoals.map((goal) => (
                <GoalGridCard
                  key={goal.id}
                  goal={goal}
                  getColorTheme={getColorTheme}
                  getCategoryIcon={getCategoryIcon}
                  getDifficultyLabel={getDifficultyLabel}
                  formatDate={formatDate}
                  onSelect={() => setSelectedGoal(goal)}
                  onQuickComplete={() => handleQuickComplete(goal.id)}
                  onUpdateProgress={(progress) =>
                    handleUpdateProgress(goal.id, progress)
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {isCreateModalOpen && (
          <GoalDetailModal
            isOpen={isCreateModalOpen}
            onClose={() => {
              setIsCreateModalOpen(false);
              setQuickEditData({});
            }}
            onSave={handleCreateGoal}
            initialData={quickEditData}
            colors={GOAL_COLORS}
          />
        )}

        {/* Detail Modal */}
        {selectedGoal && (
          <GoalDetailModal
            isOpen={!!selectedGoal}
            onClose={() => setSelectedGoal(null)}
            onSave={(data) => handleUpdateGoal(selectedGoal.id, data)}
            onDelete={() => handleDeleteGoal(selectedGoal.id)}
            goal={selectedGoal}
            colors={GOAL_COLORS}
          />
        )}
      </div>
    </AppLayout>
  );
};

// Goal Grid Card Component
const GoalGridCard = ({
  goal,
  getColorTheme,
  getCategoryIcon,
  getDifficultyLabel,
  formatDate,
  onSelect,
  onQuickComplete,
  onUpdateProgress,
}) => {
  const colorTheme = getColorTheme(goal.color);
  const isOverdue =
    goal.target_completion_date &&
    new Date(goal.target_completion_date) < new Date() &&
    !goal.is_completed;
  const progress = goal.progress_percentage || 0;
  const hasChallengeTarget =
    goal.challenges_target && goal.challenges_target > 0;
  const challengeProgress = hasChallengeTarget
    ? Math.min(
        100,
        Math.round((goal.challenges_completed / goal.challenges_target) * 100)
      )
    : 0;

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'day':
        return 'daily';
      case 'week':
        return 'weekly';
      case 'month':
        return 'monthly';
      default:
        return period;
    }
  };

  return (
    <div
      className={`goal-card-v2 ${goal.is_completed ? 'completed' : ''} ${
        isOverdue ? 'overdue' : ''
      }`}
      style={{
        '--goal-color': colorTheme.primary,
        '--goal-color-light': colorTheme.light,
      }}
      onClick={onSelect}
    >
      <div className="card-accent" />

      <div className="card-header">
        <span className="goal-category-icon">
          {getCategoryIcon(goal.category)}
        </span>
        <div className="card-badges">
          {goal.is_public && <span className="badge public">Public</span>}
          {isOverdue && <span className="badge overdue">Overdue</span>}
          {goal.is_completed && <span className="badge completed">✓ Done</span>}
        </div>
      </div>

      <h3 className="goal-title">{goal.title}</h3>

      {goal.description && (
        <p className="goal-description">{goal.description}</p>
      )}

      {hasChallengeTarget && (
        <div className="challenge-progress-indicator">
          <div className="challenge-progress-header">
            <span className="challenge-icon">⚡</span>
            <span className="challenge-label">
              {goal.challenges_completed || 0}/{goal.challenges_target}{' '}
              {getPeriodLabel(goal.challenges_period)}
            </span>
          </div>
          <div className="challenge-progress-bar">
            <div
              className="challenge-progress-fill"
              style={{ width: `${challengeProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="goal-progress-ring">
        <svg viewBox="0 0 36 36" className="circular-progress">
          <path
            className="progress-bg"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="progress-fill"
            strokeDasharray={`${progress}, 100`}
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <span className="progress-text">{progress}%</span>
      </div>

      <div className="card-meta">
        <span className="meta-item difficulty">
          {getDifficultyLabel(goal.difficulty_level)}
        </span>
      </div>

      {goal.target_completion_date && (
        <div className={`card-deadline ${isOverdue ? 'overdue' : ''}`}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {formatDate(goal.target_completion_date)}
        </div>
      )}

      {!goal.is_completed && (
        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="action-btn progress-btn"
            onClick={() => onUpdateProgress(Math.min(100, progress + 10))}
          >
            +10%
          </button>
          {progress >= 90 && (
            <button
              className="action-btn complete-btn"
              onClick={onQuickComplete}
            >
              Complete ✓
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Goal List Item Component
const GoalListItem = ({
  goal,
  getColorTheme,
  getCategoryIcon,
  getDifficultyLabel,
  formatDate,
  onSelect,
  onQuickComplete,
  onUpdateProgress,
}) => {
  const colorTheme = getColorTheme(goal.color);
  const isOverdue =
    goal.target_completion_date &&
    new Date(goal.target_completion_date) < new Date() &&
    !goal.is_completed;
  const progress = goal.progress_percentage || 0;

  return (
    <div
      className={`goal-list-item ${goal.is_completed ? 'completed' : ''} ${
        isOverdue ? 'overdue' : ''
      }`}
      style={{
        '--goal-color': colorTheme.primary,
        '--goal-color-light': colorTheme.light,
      }}
      onClick={onSelect}
    >
      <div className="list-accent" />

      <div className="list-icon">
        <span>{getCategoryIcon(goal.category)}</span>
      </div>

      <div className="list-content">
        <div className="list-header">
          <h3 className="goal-title">{goal.title}</h3>
          <div className="list-badges">
            {goal.category && (
              <span className="badge category">{goal.category}</span>
            )}
            <span className="badge difficulty">
              {getDifficultyLabel(goal.difficulty_level)}
            </span>
            {goal.is_public && <span className="badge public">Public</span>}
            {isOverdue && <span className="badge overdue">Overdue</span>}
            {goal.is_completed && (
              <span className="badge completed">✓ Done</span>
            )}
          </div>
        </div>

        {goal.description && (
          <p className="goal-description">{goal.description}</p>
        )}

        <div className="list-footer">
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="progress-label">{progress}%</span>
          </div>

          <div className="list-meta">
            {goal.target_completion_date && (
              <span className={`meta-date ${isOverdue ? 'overdue' : ''}`}>
                📅 {formatDate(goal.target_completion_date)}
              </span>
            )}
          </div>
        </div>
      </div>

      {!goal.is_completed && (
        <div className="list-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="action-btn"
            onClick={() => onUpdateProgress(Math.min(100, progress + 10))}
          >
            +10%
          </button>
          <button className="action-btn complete-btn" onClick={onQuickComplete}>
            ✓
          </button>
        </div>
      )}
    </div>
  );
};

// Goal Kanban Card Component
const GoalKanbanCard = ({
  goal,
  getColorTheme,
  getCategoryIcon,
  formatDate,
  onSelect,
  onQuickProgress,
  completed,
}) => {
  const colorTheme = getColorTheme(goal.color);
  const isOverdue =
    goal.target_completion_date &&
    new Date(goal.target_completion_date) < new Date() &&
    !goal.is_completed;
  const progress = goal.progress_percentage || 0;

  return (
    <div
      className={`kanban-card ${completed ? 'completed' : ''} ${
        isOverdue ? 'overdue' : ''
      }`}
      style={{
        '--goal-color': colorTheme.primary,
        '--goal-color-light': colorTheme.light,
      }}
      onClick={onSelect}
    >
      <div className="kanban-card-accent" />

      <div className="kanban-card-header">
        <span className="kanban-icon">{getCategoryIcon(goal.category)}</span>
      </div>

      <h4 className="kanban-title">{goal.title}</h4>

      {!completed && (
        <div className="kanban-progress">
          <div className="progress-mini">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span>{progress}%</span>
        </div>
      )}

      {goal.target_completion_date && (
        <div className={`kanban-date ${isOverdue ? 'overdue' : ''}`}>
          {formatDate(goal.target_completion_date)}
        </div>
      )}

      {!completed && onQuickProgress && (
        <div className="kanban-actions" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onQuickProgress(Math.min(100, progress + 25))}>
            +25%
          </button>
        </div>
      )}
    </div>
  );
};

export default GoalsPage;
