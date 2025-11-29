import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';

// UI Components
import { Alert, Badge, Button, Card, Input, Loading, Modal } from '../components/ui';

const ChallengesPageModern = () => {
  const { user } = useAuth();
  
  // State management
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    difficulty: '',
    tab: 'all', // 'all', 'my', 'recommended'
  });

  // Fetch challenges based on active tab
  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      let response;
      switch (filters.tab) {
        case 'my':
          response = await apiService.challenges.getMy();
          break;
        case 'recommended':
          response = await apiService.challenges.getRecommended();
          break;
        default:
          response = await apiService.challenges.getAll();
          break;
      }

      const challengesData = response.data?.data || response.data || [];
      setChallenges(Array.isArray(challengesData) ? challengesData : []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load challenges';
      setError(errorMessage);
      console.error('Failed to fetch challenges:', err);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  }, [filters.tab]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  // Filter challenges when filters or challenges change
  useEffect(() => {
    let filtered = [...challenges];

    // Filter by search term
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(challenge =>
        challenge.title?.toLowerCase().includes(searchTerm) ||
        challenge.description?.toLowerCase().includes(searchTerm) ||
        challenge.category?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(challenge =>
        challenge.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Filter by difficulty
    if (filters.difficulty) {
      filtered = filtered.filter(challenge =>
        challenge.difficulty_level?.toLowerCase() === filters.difficulty.toLowerCase()
      );
    }

    setFilteredChallenges(filtered);
  }, [challenges, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(prev => ({
      ...prev,
      search: '',
      category: '',
      difficulty: '',
    }));
  };

  const handleCreateChallenge = () => {
    setEditingChallenge(null);
    setIsCreateModalOpen(true);
  };

  const handleGenerateAIChallenge = () => {
    setIsAIModalOpen(true);
  };

  const handleEditChallenge = (challenge) => {
    setEditingChallenge(challenge);
    setIsCreateModalOpen(true);
  };

  const handleDeleteChallenge = async (challenge) => {
    if (!window.confirm(`Are you sure you want to delete "${challenge.title}"?`)) {
      return;
    }

    try {
      await apiService.challenges.delete(challenge.id);
      await fetchChallenges();
    } catch (err) {
      setError('Failed to delete challenge');
      console.error('Delete error:', err);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'success';
      case 'hard':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'info';
    }
  };

  const getUniqueCategories = () => {
    const categories = challenges
      .filter(challenge => challenge.category)
      .map(challenge => challenge.category)
      .filter((category, index, self) => self.indexOf(category) === index);
    return categories.sort();
  };

  const getChallengeStats = () => {
    const total = challenges.length;
    const completed = challenges.filter(c => c.user_submission?.status === 'completed').length;
    const inProgress = challenges.filter(c => c.user_submission?.status === 'in-progress').length;
    
    return { total, completed, inProgress };
  };

  if (loading) {
    return (
      <div className="page">
        <Loading size="large" text="Loading challenges..." />
      </div>
    );
  }

  const categories = getUniqueCategories();
  const stats = getChallengeStats();

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Learning Challenges</h1>
          <p className="page-subtitle">
            Welcome back, {user?.firstName || user?.first_name || 'learner'}! 
            Enhance your skills with our interactive challenges.
          </p>
        </div>
        <div className="header-actions">
          <Button
            variant="outline"
            onClick={handleGenerateAIChallenge}
            className="mr-3"
          >
            🤖 AI Challenge
          </Button>
          <Button onClick={handleCreateChallenge}>
            + Create Challenge
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Statistics */}
      <div className="stats-grid">
        <Card className="stat-card">
          <Card.Content>
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Challenges</div>
          </Card.Content>
        </Card>
        <Card className="stat-card">
          <Card.Content>
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </Card.Content>
        </Card>
        <Card className="stat-card">
          <Card.Content>
            <div className="stat-number">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </Card.Content>
        </Card>
        <Card className="stat-card">
          <Card.Content>
            <div className="stat-number">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </div>
            <div className="stat-label">Completion Rate</div>
          </Card.Content>
        </Card>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${filters.tab === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterChange('tab', 'all')}
        >
          All Challenges
        </button>
        <button
          className={`tab ${filters.tab === 'recommended' ? 'active' : ''}`}
          onClick={() => handleFilterChange('tab', 'recommended')}
        >
          Recommended
        </button>
        <button
          className={`tab ${filters.tab === 'my' ? 'active' : ''}`}
          onClick={() => handleFilterChange('tab', 'my')}
        >
          My Challenges
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <Input
            type="text"
            placeholder="Search challenges..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="filter-input"
          />
          
          <select
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
          
          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="filter-select"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          
          <Button variant="ghost" size="small" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="content-section">
        {filteredChallenges.length > 0 ? (
          <div className="grid">
            {filteredChallenges.map((challenge) => (
              <Card key={challenge.id} className="challenge-card">
                <Card.Header>
                  <div className="challenge-header">
                    <h3 className="challenge-title">{challenge.title}</h3>
                    <div className="challenge-badges">
                      <Badge variant={getDifficultyColor(challenge.difficulty_level)}>
                        {challenge.difficulty_level}
                      </Badge>
                      {challenge.user_submission && (
                        <Badge variant={getStatusColor(challenge.user_submission.status)}>
                          {challenge.user_submission.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card.Header>
                
                <Card.Content>
                  <p className="challenge-description">
                    {challenge.description?.length > 150
                      ? `${challenge.description.substring(0, 150)}...`
                      : challenge.description
                    }
                  </p>
                  
                  <div className="challenge-meta">
                    {challenge.category && (
                      <span className="challenge-category">
                        📂 {challenge.category}
                      </span>
                    )}
                    {challenge.estimated_time && (
                      <span className="challenge-time">
                        ⏱️ {challenge.estimated_time} min
                      </span>
                    )}
                    {challenge.points && (
                      <span className="challenge-points">
                        ⭐ {challenge.points} pts
                      </span>
                    )}
                  </div>

                  {challenge.user_submission?.progress_percentage && (
                    <div className="progress-section">
                      <div className="progress-label">
                        Progress: {challenge.user_submission.progress_percentage}%
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${challenge.user_submission.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Card.Content>
                
                <Card.Footer>
                  <div className="challenge-actions">
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => console.log('Start challenge:', challenge.id)}
                    >
                      {challenge.user_submission ? 'Continue' : 'Start'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => console.log('View details:', challenge.id)}
                    >
                      View Details
                    </Button>
                    
                    {challenge.created_by === user?.id && (
                      <div className="owner-actions">
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => handleEditChallenge(challenge)}
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => handleDeleteChallenge(challenge)}
                        >
                          🗑️
                        </Button>
                      </div>
                    )}
                  </div>
                </Card.Footer>
              </Card>
            ))}
          </div>
        ) : challenges.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>No challenges available</h3>
            <p>
              {filters.tab === 'my' 
                ? "You haven't created any challenges yet!"
                : "No challenges found. Be the first to create one!"
              }
            </p>
            <Button onClick={handleCreateChallenge}>
              Create Your First Challenge
            </Button>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No challenges match your filters</h3>
            <p>Try adjusting your search criteria or clearing the filters.</p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Challenge Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
        size="large"
      >
        <ChallengeForm
          challenge={editingChallenge}
          onSubmit={async (data) => {
            try {
              setIsSubmitting(true);
              if (editingChallenge) {
                await apiService.challenges.update(editingChallenge.id, data);
              } else {
                await apiService.challenges.create(data);
              }
              await fetchChallenges();
              setIsCreateModalOpen(false);
            } catch (err) {
              setError('Failed to save challenge');
            } finally {
              setIsSubmitting(false);
            }
          }}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* AI Challenge Modal */}
      <Modal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        title="🤖 AI Challenge Generator"
        size="lg"
      >
        <AIChallengeGenerator 
          onClose={() => setIsAIModalOpen(false)}
          onChallengeGenerated={fetchChallenges}
        />
      </Modal>
    </div>
  );
};

// AI Challenge Generator Component
const AIChallengeGenerator = ({ onClose, onChallengeGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedChallenge, setGeneratedChallenge] = useState(null);
  const [formData, setFormData] = useState({
    topic: '',
    difficulty: 'medium',
    category: 'algorithms'
  });

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const response = await apiService.ai.generateChallenge(formData);
      setGeneratedChallenge(response.data?.challenge);
    } catch (error) {
      console.error('Failed to generate challenge:', error);
      // Handle error appropriately
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptChallenge = async () => {
    if (!generatedChallenge) return;
    
    try {
      // Create the challenge
      await apiService.challenges.create({
        title: generatedChallenge.title,
        description: generatedChallenge.description,
        category: formData.category,
        difficulty_level: generatedChallenge.difficulty?.toLowerCase() || formData.difficulty,
        points: 100,
        estimated_time: 30,
        ai_generated: true
      });
      
      onChallengeGenerated();
      onClose();
    } catch (error) {
      console.error('Failed to create challenge:', error);
    }
  };

  return (
    <div className="ai-challenge-generator">
      {!generatedChallenge ? (
        <div className="generator-form">
          <div className="form-group">
            <label>Topic/Subject</label>
            <Input
              placeholder="e.g., Arrays, Algorithms, React Hooks"
              value={formData.topic}
              onChange={(e) => setFormData({...formData, topic: e.target.value})}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Difficulty</label>
              <select 
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                className="form-select"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="form-select"
              >
                <option value="algorithms">Algorithms</option>
                <option value="data-structures">Data Structures</option>
                <option value="programming">Programming</option>
                <option value="web-development">Web Development</option>
                <option value="databases">Databases</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              loading={isGenerating}
            >
              🤖 Generate Challenge
            </Button>
          </div>
        </div>
      ) : (
        <div className="generated-challenge">
          <div className="challenge-preview">
            <h3>{generatedChallenge.title}</h3>
            <Badge variant="info" className="mb-3">
              {generatedChallenge.difficulty || formData.difficulty}
            </Badge>
            <div className="challenge-description">
              <p>{generatedChallenge.description}</p>
            </div>
            
            {generatedChallenge.requirements && (
              <div className="requirements">
                <h4>Requirements:</h4>
                <ul>
                  {generatedChallenge.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="form-actions">
            <Button variant="outline" onClick={() => setGeneratedChallenge(null)}>
              Generate Another
            </Button>
            <Button onClick={handleAcceptChallenge}>
              Add to Challenges
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Challenge Form Component
const ChallengeForm = ({ challenge, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: challenge?.title || '',
    description: challenge?.description || '',
    category: challenge?.category || '',
    difficulty_level: challenge?.difficulty_level || 'medium',
    estimated_time: challenge?.estimated_time || 30,
    points: challenge?.points || 100,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="challenge-form">
      <Input
        label="Title"
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        placeholder="Enter challenge title..."
        required
      />

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe the challenge..."
          rows="4"
          className="form-textarea"
          required
        />
      </div>

      <div className="form-row">
        <Input
          label="Category"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          placeholder="e.g., Algorithms, Data Structures"
        />

        <div className="form-group">
          <label>Difficulty</label>
          <select
            value={formData.difficulty_level}
            onChange={(e) => handleChange('difficulty_level', e.target.value)}
            className="form-select"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <Input
          label="Estimated Time (minutes)"
          type="number"
          value={formData.estimated_time}
          onChange={(e) => handleChange('estimated_time', parseInt(e.target.value))}
          min="1"
        />

        <Input
          label="Points"
          type="number"
          value={formData.points}
          onChange={(e) => handleChange('points', parseInt(e.target.value))}
          min="1"
        />
      </div>

      <div className="form-actions">
        <Button
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {challenge ? 'Update Challenge' : 'Create Challenge'}
        </Button>
      </div>
    </form>
  );
};

export default ChallengesPageModern;