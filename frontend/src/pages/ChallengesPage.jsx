import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import ChallengeCard from '../components/challenges/ChallengeCard';
import ChallengeModal from '../components/challenges/ChallengeModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AIChallengeModal from '../components/challenges/AIChallengeModal';
import '../styles/challenges.css';

const ChallengesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAIChallengeOpen, setIsAIChallengeOpen] = useState(false);
  const [generatedChallenge, setGeneratedChallenge] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: '',
    tab: 'all', // 'all', 'my', 'recommended'
  });

  // Fetch challenges on component mount
  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      let response;
      try {
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
      } catch (apiError) {
        console.error('API call failed:', apiError);
        response = { data: [] };
      }

      // Handle both response.data and response.data.data structures
      const challengesData = response.data?.data || response.data || [];
      setChallenges(Array.isArray(challengesData) ? challengesData : []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load challenges';
      setError(errorMessage);
      console.error('Failed to fetch challenges:', err);
      // Set empty array on error so UI doesn't break
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  }, [filters.tab]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  // Filter challenges when filters or challenges change
  const filterChallenges = useCallback(() => {
    let filtered = [...challenges];

    // Filter by category
    if (filters.category && filters.category !== '') {
      filtered = filtered.filter(challenge =>
        challenge.category?.toLowerCase() === filters.category.toLowerCase(),
      );
    }

    // Filter by difficulty
    if (filters.difficulty && filters.difficulty !== '') {
      filtered = filtered.filter(challenge =>
        challenge.difficulty_level?.toLowerCase() === filters.difficulty.toLowerCase(),
      );
    }

    // Filter by search term
    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(challenge =>
        challenge.title?.toLowerCase().includes(searchTerm) ||
        challenge.description?.toLowerCase().includes(searchTerm) ||
        challenge.category?.toLowerCase().includes(searchTerm) ||
        challenge.tags?.some(tag => tag.toLowerCase().includes(searchTerm)),
      );
    }

    setFilteredChallenges(filtered);
  }, [challenges, filters]);

  useEffect(() => {
    filterChallenges();
  }, [filterChallenges]);

  const handleCreateChallenge = () => {
    setEditingChallenge(null);
    setIsModalOpen(true);
  };

  const handleGenerateChallenge = async () => {
    setGeneratedChallenge(null);
    setIsAIChallengeOpen(true);

    try {
      const response = await apiService.ai.generateChallenge({ topic: 'algorithms', difficulty: 'medium' });
      const challenge = response.data?.data?.challenge || response.data?.challenge || response.data;
      setGeneratedChallenge(challenge);
    } catch (err) {
      console.error('Failed to generate AI challenge:', err);
      setGeneratedChallenge({ title: 'Error', description: 'Failed to generate challenge. See console for details.' });
    }
  };

  const handleEditChallenge = (challenge) => {
    setEditingChallenge(challenge);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingChallenge(null);
    setIsSubmitting(false);
  };

  const handleSubmitChallenge = async (challengeData) => {
    try {
      setIsSubmitting(true);
      setError('');

      if (editingChallenge) {
        // Update existing challenge
        await apiService.challenges.update(editingChallenge.id, challengeData);
      } else {
        // Create new challenge
        await apiService.challenges.create(challengeData);
      }

      // Refresh challenges list
      await fetchChallenges();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save challenge');
      console.error('Failed to save challenge:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartChallenge = (challenge) => {
    // Navigate to challenge participation page
    navigate(`/challenges/${challenge.id}/participate`);
  };

  const handleViewDetails = (challenge) => {
    // Navigate to challenge details page
    navigate(`/challenges/${challenge.id}`);
  };

  const handleLinkToGoal = async (challenge) => {
    // Show goal selection modal and link challenge to goal
    setShowGoalLinkModal(true);
    setSelectedChallenge(challenge);
  };

  const handleDeleteChallenge = async (challenge) => {
    if (!window.confirm('Are you sure you want to delete this challenge?')) {
      return;
    }

    try {
      setError('');
      await apiService.challenges.delete(challenge.id);
      await fetchChallenges();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete challenge');
      console.error('Failed to delete challenge:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters(prev => ({
      ...prev,
      category: '',
      difficulty: '',
      search: '',
    }));
  };

  const getUniqueCategories = () => {
    const categories = challenges
      .filter(challenge => challenge.category)
      .map(challenge => challenge.category)
      .filter((category, index, self) => self.indexOf(category) === index);
    return categories.sort();
  };

  if (loading) {
    return (
      <div className="challenges-page">
        <LoadingSpinner message="Loading challenges..." />
      </div>
    );
  }

  const categories = getUniqueCategories();

  return (
    <div className="challenges-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Learning Challenges</h1>
          <p>Discover challenges to enhance your skills and knowledge.</p>
        </div>
        <div style={{display: 'flex', gap: '8px'}}>
          <button className="btn btn-secondary" onClick={handleGenerateChallenge}>
            🤖 Generate Challenge
          </button>
          <button className="btn btn-primary" onClick={handleCreateChallenge}>
          <span className="btn-icon">+</span>
          Create Challenge
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

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
      <div className="challenges-filters">
        <div className="filters-section">
          <div className="filter-group">
            <label htmlFor="search">Search:</label>
            <input
              id="search"
              type="text"
              placeholder="Search challenges..."
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
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="filter-select"
            >
              <option value="">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <button onClick={clearFilters} className="btn btn-secondary btn-sm">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="challenges-content">
        {filteredChallenges.length > 0 ? (
          <div className="challenges-grid">
            {filteredChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onStart={handleStartChallenge}
                onViewDetails={handleViewDetails}
                onLinkToGoal={handleLinkToGoal}
                onEdit={handleEditChallenge}
                onDelete={handleDeleteChallenge}
                userSubmission={challenge.user_submission_id ? {
                  id: challenge.user_submission_id,
                  status: challenge.user_submission_status,
                  score: challenge.user_score,
                  submitted_at: challenge.user_submitted_at,
                  attempts_count: challenge.user_attempts,
                } : null}
                isOwner={challenge.created_by === user?.id}
              />
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
            <button className="btn btn-primary" onClick={handleCreateChallenge}>
              Create Challenge
            </button>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No challenges match your filters</h3>
            <p>Try adjusting your search criteria or clearing the filters.</p>
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Challenge Modal */}
      <ChallengeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitChallenge}
        challenge={editingChallenge}
        isLoading={isSubmitting}
      />

      <AIChallengeModal
        isOpen={isAIChallengeOpen}
        onClose={() => { setIsAIChallengeOpen(false); setGeneratedChallenge(null); }}
        challenge={generatedChallenge}
      />
    </div>
  );
};

export default ChallengesPage;