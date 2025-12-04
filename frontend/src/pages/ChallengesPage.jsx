import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import ChallengeModal from '../components/challenges/ChallengeModal';
import ChallengeDetailsModal from '../components/challenges/ChallengeDetailsModal';
import GenerateChallengeModal from '../components/challenges/GenerateChallengeModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AppLayout from '../components/layout/AppLayout';
import '../styles/challenges-v2.css';

// SVG Icon renderer
const SVGIcon = ({ paths, size = 24, fill = 'none', viewBox = '0 0 24 24' }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {paths.map((path, i) => typeof path === 'string' ? <path key={i} d={path} /> : <circle key={i} {...path} />)}
  </svg>
);

const CHALLENGE_ICONS = {
  grid: [{ cx: 5, cy: 5, r: 1 }, { cx: 12, cy: 5, r: 1 }, { cx: 19, cy: 5, r: 1 }, { cx: 5, cy: 12, r: 1 }, { cx: 12, cy: 12, r: 1 }, { cx: 19, cy: 12, r: 1 }, { cx: 5, cy: 19, r: 1 }, { cx: 12, cy: 19, r: 1 }, { cx: 19, cy: 19, r: 1 }],
  checkCircle: ['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4 12 14.01 9 11.01'],
  clock: ['M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z', 'M12 6v6l4 2.5'],
  star: ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-5.18 3.25L8 14.14 3 9.27l6.91-1.01L12 2z'],
  zap: ['M13 2l-2 4h-2l4 5h-9l4 6 2-4h2l-4-5h9l-4-6z'],
  plus: ['M12 5v14M5 12h14'],
  play: ['M5 3l14 9-14 9V3'],
  search: ['M11 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm-7 11v-1a4 4 0 0 1 8 0v1', 'M11 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 8v1', 'M21 21l-4.35-4.35'],
};

const ChallengesPage = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [goals, setGoals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [goalCompletedModal, setGoalCompletedModal] = useState({
    show: false,
    goal: null,
  });
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    totalPoints: 0,
  });

  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: '',
    tab: 'not-started', // 'not-started', 'in-progress', 'completed'
  });

  // Fetch user goals
  const fetchGoals = useCallback(async () => {
    try {
      const response = await apiService.goals.getAll();
      const goalsData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setGoals(goalsData);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    }
  }, []);

  // Fetch user stats
  const fetchUserStats = useCallback(async () => {
    try {
      const response = await apiService.user.getStatistics();
      if (response.data?.data) {
        setStats((prev) => ({
          ...prev,
          totalPoints: response.data.data.totalPoints || 0,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
    }
  }, []);

  // Fetch all challenges on component mount
  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      let response;
      try {
        // Always fetch all challenges and filter locally by status
        response = await apiService.challenges.getAll();
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
      const notStarted = challengesList.filter(
        (c) => !c.user_submission_status
      ).length;

      setStats((prev) => ({
        ...prev,
        total: challengesList.length,
        completed,
        inProgress,
        notStarted,
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
  }, []);

  useEffect(() => {
    fetchChallenges();
    fetchUserStats();
    fetchGoals();
  }, [fetchChallenges, fetchUserStats, fetchGoals]);

  // Filter challenges when filters or challenges change
  const filterChallenges = useCallback(() => {
    let filtered = [...challenges];

    // Filter by tab (status)
    if (filters.tab === 'not-started') {
      filtered = filtered.filter((c) => !c.user_submission_status);
    } else if (filters.tab === 'in-progress') {
      filtered = filtered.filter(
        (c) =>
          c.user_submission_status && c.user_submission_status !== 'completed'
      );
    } else if (filters.tab === 'completed') {
      filtered = filtered.filter(
        (c) => c.user_submission_status === 'completed'
      );
    }

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
          challenge.category?.toLowerCase().includes(searchTerm)
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
      goal_id: null,
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

      // Check if a goal was completed
      if (result?.data?.goal_updated?.is_completed) {
        setGoalCompletedModal({
          show: true,
          goal: result.data.goal_updated,
        });
      }

      // Refresh challenges and stats to get updated submission status and points
      await fetchChallenges();
      await fetchUserStats();
      await fetchGoals(); // Refresh goals to update progress

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
            <SVGIcon paths={CHALLENGE_ICONS.grid} size={20} className="stat-icon" />
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="challenge-stat-pill completed">
            <SVGIcon paths={CHALLENGE_ICONS.checkCircle} size={20} className="stat-icon" />
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="challenge-stat-pill in-progress">
            <SVGIcon paths={CHALLENGE_ICONS.clock} size={20} className="stat-icon" />
            <span className="stat-value">{stats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="challenge-stat-pill points">
            <SVGIcon paths={CHALLENGE_ICONS.star} size={20} className="stat-icon" />
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
            <SVGIcon paths={CHALLENGE_ICONS.plus} size={18} />
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
            className={`challenge-tab ${
              filters.tab === 'not-started' ? 'active' : ''
            }`}
            onClick={() => handleFilterChange('tab', 'not-started')}
          >
            Not Started ({stats.notStarted || 0})
          </button>
          <button
            className={`challenge-tab ${
              filters.tab === 'in-progress' ? 'active' : ''
            }`}
            onClick={() => handleFilterChange('tab', 'in-progress')}
          >
            In Progress ({stats.inProgress || 0})
          </button>
          <button
            className={`challenge-tab ${
              filters.tab === 'completed' ? 'active' : ''
            }`}
            onClick={() => handleFilterChange('tab', 'completed')}
          >
            Completed ({stats.completed || 0})
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
                          <SVGIcon paths={CHALLENGE_ICONS.play} size={16} fill="currentColor" />
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
              <SVGIcon paths={CHALLENGE_ICONS.zap} size={48} className="empty-state-icon" />
              <h3 className="empty-state-title">No challenges available</h3>
              <p className="empty-state-text">
                {filters.tab === 'completed'
                  ? "You haven't completed any challenges yet. Start one now!"
                  : filters.tab === 'in-progress'
                  ? "You don't have any challenges in progress."
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
              <SVGIcon paths={CHALLENGE_ICONS.search} size={48} className="empty-state-icon" />
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
          goals={goals}
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

        {/* Goal Completed Celebration Modal */}
        {goalCompletedModal.show && (
          <div className="modal-overlay goal-completed-overlay">
            <div className="goal-completed-modal">
              <div className="goal-completed-content">
                <div className="celebration-icon">🎉</div>
                <h2>Congratulations!</h2>
                <p className="goal-completed-message">
                  You completed your goal:
                </p>
                <p className="goal-title">{goalCompletedModal.goal?.title}</p>
                <p className="goal-progress">Progress: 100%</p>
                <button
                  className="awesome-button"
                  onClick={() => {
                    setGoalCompletedModal({ show: false, goal: null });
                    fetchGoals(); // Refresh goals after closing
                  }}
                >
                  Awesome! 🎊
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ChallengesPage;
