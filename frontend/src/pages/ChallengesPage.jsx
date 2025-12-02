import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import ChallengeModal from '../components/challenges/ChallengeModal';
import ChallengeDetailsModal from '../components/challenges/ChallengeDetailsModal';
import GenerateChallengeModal from '../components/challenges/GenerateChallengeModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AppLayout from '../components/layout/AppLayout';
import '../styles/challenges-v2.css';

const ChallengesPage = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    totalPoints: 0,
  });

  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: '',
    tab: 'all', // 'all', 'my', 'recommended'
  });

  // Fetch user stats
  const fetchUserStats = useCallback(async () => {
    try {
      const response = await apiService.user.getStatistics();
      if (response.data) {
        setStats((prev) => ({
          ...prev,
          totalPoints: response.data.total_points || 0,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
    }
  }, []);

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
      const challengesList = Array.isArray(challengesData)
        ? challengesData
        : [];
      setChallenges(challengesList);

      // Calculate stats
      const completed = challengesList.filter(
        (c) => c.user_submission_status === 'completed'
      ).length;
      const inProgress = challengesList.filter(
        (c) =>
          c.user_submission_status && c.user_submission_status !== 'completed'
      ).length;

      setStats((prev) => ({
        ...prev,
        total: challengesList.length,
        completed,
        inProgress,
      }));
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to load challenges';
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
    fetchUserStats();
  }, [fetchChallenges, fetchUserStats]);

  // Filter challenges when filters or challenges change
  const filterChallenges = useCallback(() => {
    let filtered = [...challenges];

    // Filter by category
    if (filters.category && filters.category !== '') {
      filtered = filtered.filter(
        (challenge) =>
          challenge.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Filter by difficulty
    if (filters.difficulty && filters.difficulty !== '') {
      filtered = filtered.filter(
        (challenge) =>
          challenge.difficulty_level?.toLowerCase() ===
          filters.difficulty.toLowerCase()
      );
    }

    // Filter by search term
    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (challenge) =>
          challenge.title?.toLowerCase().includes(searchTerm) ||
          challenge.description?.toLowerCase().includes(searchTerm) ||
          challenge.category?.toLowerCase().includes(searchTerm) ||
          challenge.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))
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

  const handleGenerateChallenge = () => {
    setIsGenerateModalOpen(true);
  };

  const handleChallengeGenerated = (generatedChallenge) => {
    // Pre-fill the challenge modal with AI-generated data
    // Ensure numeric fields are properly typed and remove any id/database fields
    const sanitizedChallenge = {
      title: generatedChallenge.title,
      description: generatedChallenge.description,
      instructions: generatedChallenge.instructions,
      category: generatedChallenge.category,
      difficulty_level: generatedChallenge.difficulty_level,
      estimated_time_minutes:
        parseInt(generatedChallenge.estimated_time_minutes, 10) || 30,
      points_reward: 5, // Fixed at 5 points per challenge
      max_attempts: parseInt(generatedChallenge.max_attempts, 10) || 3,
      requires_peer_review: Boolean(generatedChallenge.requires_peer_review),
      tags: Array.isArray(generatedChallenge.tags)
        ? generatedChallenge.tags
        : [],
      learning_objectives: Array.isArray(generatedChallenge.learning_objectives)
        ? generatedChallenge.learning_objectives
        : [],
      starter_code: generatedChallenge.starter_code || '',
      test_cases: Array.isArray(generatedChallenge.test_cases)
        ? generatedChallenge.test_cases
        : [],
      hints: Array.isArray(generatedChallenge.hints)
        ? generatedChallenge.hints
        : [],
      prerequisites: Array.isArray(generatedChallenge.prerequisites)
        ? generatedChallenge.prerequisites
        : [],
    };
    // Set as editing challenge (without id, so it will be treated as new)
    setEditingChallenge(sanitizedChallenge);
    setIsGenerateModalOpen(false);
    setIsModalOpen(true);
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

      if (editingChallenge && editingChallenge.id) {
        // Update existing challenge (only if it has an ID)
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
    setSelectedChallenge(challenge);
    setIsDetailsModalOpen(true);
  };

  const handleViewDetails = (challenge) => {
    setSelectedChallenge(challenge);
    setIsDetailsModalOpen(true);
  };

  const handleSubmitSolution = async (submissionData) => {
    try {
      setError('');
      const result = await apiService.challenges.submit(
        submissionData.challenge_id,
        {
          code: submissionData.code,
          requestPeerReview: submissionData.requestPeerReview || false,
        }
      );

      // Refresh challenges and stats to get updated submission status and points
      await fetchChallenges();
      await fetchUserStats();

      // Update the selected challenge with the new submission data
      if (selectedChallenge && result?.data) {
        const updatedChallenge = {
          ...selectedChallenge,
          user_submission_id: result.data.id,
          user_submission_status: result.data.status,
          user_score: result.data.score,
          user_submitted_at: result.data.submitted_at,
          user_feedback: result.data.feedback,
          user_submission_text: result.data.submission_text,
          user_attempts: result.data.attempt_number,
        };
        setSelectedChallenge(updatedChallenge);
      }

      // Return the submission data for the modal to use
      return result?.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit solution');
      console.error('Failed to submit solution:', err);
      throw err; // Re-throw so the modal can handle it
    }
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedChallenge(null);
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
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters((prev) => ({
      ...prev,
      category: '',
      difficulty: '',
      search: '',
    }));
  };

  const getUniqueCategories = () => {
    const categories = challenges
      .filter((challenge) => challenge.category)
      .map((challenge) => challenge.category)
      .filter((category, index, self) => self.indexOf(category) === index);
    return categories.sort();
  };

  if (loading) {
    return (
      <AppLayout
        title="Learning Challenges"
        subtitle="Discover challenges to enhance your skills"
      >
        <LoadingSpinner message="Loading challenges..." />
      </AppLayout>
    );
  }

  const categories = getUniqueCategories();

  const getStatus = (challenge) => {
    if (!challenge.user_submission_status) return 'not-started';
    return challenge.user_submission_status;
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
      case 'submitted':
      case 'pending':
        return 'In Progress';
      case 'failed':
        return 'Failed';
      default:
        return 'Not Started';
    }
  };

  const formatTime = (minutes) => {
    if (!minutes) return 'No estimate';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  return (
    <AppLayout
      title="Learning Challenges"
      subtitle="Discover challenges to enhance your skills"
    >
      <div className="challenges-page-v2">
        {/* Stats Bar */}
        <div className="challenges-stats-bar">
          <div className="challenge-stat-pill total">
            <svg
              className="stat-icon"
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
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="challenge-stat-pill completed">
            <svg
              className="stat-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="challenge-stat-pill in-progress">
            <svg
              className="stat-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="stat-value">{stats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="challenge-stat-pill points">
            <svg
              className="stat-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="stat-value">{stats.totalPoints}</span>
            <span className="stat-label">Total Points</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="challenges-action-bar">
          <button className="btn-generate-ai" onClick={handleGenerateChallenge}>
            <span className="ai-sparkle">✨</span>
            Generate with AI
          </button>
          <button
            className="btn-create-challenge"
            onClick={handleCreateChallenge}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Challenge
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="challenges-error-banner">
            <p>{error}</p>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {/* Tabs */}
        <div className="challenges-tabs">
          <button
            className={`challenge-tab ${filters.tab === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('tab', 'all')}
          >
            All Challenges
          </button>
          <button
            className={`challenge-tab ${
              filters.tab === 'recommended' ? 'active' : ''
            }`}
            onClick={() => handleFilterChange('tab', 'recommended')}
          >
            Recommended
          </button>
          <button
            className={`challenge-tab ${filters.tab === 'my' ? 'active' : ''}`}
            onClick={() => handleFilterChange('tab', 'my')}
          >
            My Challenges
          </button>
        </div>

        {/* Filters */}
        <div className="challenges-filters">
          <div className="filters-row">
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

            <button onClick={clearFilters} className="btn-clear-filters">
              Clear Filters
            </button>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="challenges-content">
          {filteredChallenges.length > 0 ? (
            <div className="challenges-grid">
              {filteredChallenges.map((challenge) => {
                const status = getStatus(challenge);
                const statusLabel = getStatusLabel(status);
                const isOwner = challenge.created_by === user?.id;
                const canStart =
                  status === 'not-started' ||
                  (status === 'failed' &&
                    (challenge.user_attempts || 0) <
                      (challenge.max_attempts || 3));

                return (
                  <div
                    key={challenge.id}
                    className={`challenge-card-v2 status-${status}`}
                    onClick={() => handleViewDetails(challenge)}
                  >
                    <div className="card-header">
                      <h3 className="card-title">
                        {challenge.title || 'Challenge Title'}
                      </h3>
                      <span className={`card-status-badge status-${status}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="card-body">
                      <p className="card-description">
                        {challenge.description ||
                          'Challenge description goes here...'}
                      </p>

                      <div className="card-meta">
                        <div className="card-meta-item">
                          <span className="meta-label">Category:</span>
                          <span className="meta-value">
                            {challenge.category || 'General'}
                          </span>
                        </div>
                        <div className="card-meta-item">
                          <span className="meta-label">Difficulty:</span>
                          <span
                            className={`difficulty-pill ${
                              challenge.difficulty_level?.toLowerCase() ||
                              'medium'
                            }`}
                          >
                            {challenge.difficulty_level || 'Medium'}
                          </span>
                        </div>
                        <div className="card-meta-item">
                          <span className="meta-label">Time:</span>
                          <span className="meta-value">
                            ⏱️ {formatTime(challenge.estimated_time_minutes)}
                          </span>
                        </div>
                        <div className="card-meta-item points">
                          <span className="meta-label">Points:</span>
                          <span className="meta-value">
                            +{challenge.points_reward || 5} pts
                          </span>
                        </div>
                      </div>

                      {challenge.tags && challenge.tags.length > 0 && (
                        <div className="card-tags">
                          {challenge.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="card-tag">
                              {tag}
                            </span>
                          ))}
                          {challenge.tags.length > 3 && (
                            <span className="card-tag more">
                              +{challenge.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div
                      className="card-footer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {canStart ? (
                        <button
                          className="btn-card-action primary"
                          onClick={() => handleStartChallenge(challenge)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                          Start Challenge
                        </button>
                      ) : (
                        <button
                          className="btn-card-action secondary"
                          onClick={() => handleViewDetails(challenge)}
                        >
                          View Details
                        </button>
                      )}
                      {isOwner && (
                        <>
                          <button
                            className="btn-card-action secondary"
                            onClick={() => handleEditChallenge(challenge)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-card-action danger"
                            onClick={() => handleDeleteChallenge(challenge)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : challenges.length === 0 ? (
            <div className="challenges-empty-state">
              <svg
                className="empty-state-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <h3 className="empty-state-title">No challenges available</h3>
              <p className="empty-state-text">
                {filters.tab === 'my'
                  ? "You haven't created any challenges yet!"
                  : 'No challenges found. Be the first to create one!'}
              </p>
              <button
                className="btn-create-challenge"
                onClick={handleCreateChallenge}
              >
                Create Challenge
              </button>
            </div>
          ) : (
            <div className="challenges-empty-state">
              <svg
                className="empty-state-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <h3 className="empty-state-title">
                No challenges match your filters
              </h3>
              <p className="empty-state-text">
                Try adjusting your search criteria or clearing the filters.
              </p>
              <button className="btn-clear-filters" onClick={clearFilters}>
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

        {/* Generate Challenge Modal */}
        <GenerateChallengeModal
          isOpen={isGenerateModalOpen}
          onClose={() => setIsGenerateModalOpen(false)}
          onChallengeGenerated={handleChallengeGenerated}
        />

        {/* Challenge Details/Start Modal */}
        <ChallengeDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          challenge={selectedChallenge}
          onSubmit={handleSubmitSolution}
          userSubmission={
            selectedChallenge?.user_submission_id
              ? {
                  id: selectedChallenge.user_submission_id,
                  status: selectedChallenge.user_submission_status,
                  score: selectedChallenge.user_score,
                  submitted_at: selectedChallenge.user_submitted_at,
                  attempts_count: selectedChallenge.user_attempts,
                  submission_text:
                    selectedChallenge.user_submission_text ||
                    selectedChallenge.user_submission_code,
                  feedback: selectedChallenge.user_feedback,
                }
              : null
          }
        />
      </div>
    </AppLayout>
  );
};

export default ChallengesPage;
