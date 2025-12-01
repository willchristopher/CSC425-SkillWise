import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import ChallengeCard from '../components/challenges/ChallengeCard';
import ChallengeModal from '../components/challenges/ChallengeModal';
import ChallengeDetailModal from '../components/challenges/ChallengeDetailModal';
import AIGenerateModal from '../components/challenges/AIGenerateModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PageLayout from '../components/layout/PageLayout';
import '../styles/challenges.css';

const ChallengesPage = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false); // Story 3.1: AI Generate Modal
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  }, [fetchChallenges]);

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
    // Open detail modal in submit mode
    setSelectedChallenge(challenge);
    setIsDetailModalOpen(true);
  };

  const handleViewDetails = (challenge) => {
    // Open challenge detail modal
    setSelectedChallenge(challenge);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedChallenge(null);
  };

  const handleSubmitWork = async (challengeId, submission) => {
    try {
      setIsSubmitting(true);
      await apiService.challenges.submit(challengeId, submission);

      // Optionally get AI feedback
      try {
        const challenge = challenges.find((c) => c.id === challengeId);
        if (challenge) {
          await apiService.ai.submitForFeedback(
            submission.content,
            { title: challenge.title, description: challenge.description },
            null // submissionId will be returned from submit
          );
        }
      } catch (aiError) {
        console.log('AI feedback request failed:', aiError);
        // Non-critical - continue even if AI feedback fails
      }

      setSuccess('Challenge submitted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchChallenges();
      handleCloseDetailModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit challenge');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkToGoal = async (challenge) => {
    // Fetch user's goals and show selection
    try {
      const response = await apiService.goals.getAll();
      const goals = response.data?.data || response.data || [];

      if (goals.length === 0) {
        setError('No goals found. Create a goal first to link challenges.');
        return;
      }

      const goalNames = goals.map((g, i) => `${i + 1}. ${g.title}`).join('\n');
      const selection = prompt(
        `Select a goal to link this challenge to:\n\n${goalNames}\n\nEnter the number:`
      );

      if (selection) {
        const goalIndex = parseInt(selection) - 1;
        if (goalIndex >= 0 && goalIndex < goals.length) {
          await apiService.challenges.linkToGoal(
            challenge.id,
            goals[goalIndex].id
          );
          setSuccess(`Challenge linked to "${goals[goalIndex].title}"!`);
          setTimeout(() => setSuccess(''), 3000);
          await fetchChallenges();
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to link challenge to goal'
      );
    }
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
      <PageLayout>
        <LoadingSpinner message="Loading challenges..." />
      </PageLayout>
    );
  }

  const categories = getUniqueCategories();

  // Story 3.1: Handler for AI-generated challenge
  const handleAIGeneratedChallenge = (generatedChallenge) => {
    // Pre-fill the challenge modal with AI-generated data
    setEditingChallenge({
      ...generatedChallenge,
      title: generatedChallenge.title,
      description: generatedChallenge.description,
      difficulty_level: generatedChallenge.difficulty_level,
      category: generatedChallenge.category,
      estimated_time_minutes: generatedChallenge.estimated_time_minutes,
      tags: generatedChallenge.tags,
    });
    setIsModalOpen(true);
  };

  return (
    <PageLayout>
      <div className="challenges-page">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Learning Challenges
            </h1>
            <p className="mt-2 text-gray-600">
              Discover challenges to enhance your skills and knowledge.
            </p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            {/* Story 3.1: Generate challenge button */}
            <button
              className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
              onClick={() => setIsAIModalOpen(true)}
              data-testid="generate-ai-challenge-open-btn"
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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Generate with AI
            </button>
            <button
              className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
              onClick={handleCreateChallenge}
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
              Create Challenge
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg flex justify-between items-center">
            <p>{error}</p>
            <button
              onClick={() => setError('')}
              className="text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg flex justify-between items-center">
            <p>{success}</p>
            <button
              onClick={() => setSuccess('')}
              className="text-green-700 hover:text-green-900"
            >
              ×
            </button>
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
                  userSubmission={
                    challenge.user_submission_id
                      ? {
                          id: challenge.user_submission_id,
                          status: challenge.user_submission_status,
                          score: challenge.user_score,
                          submitted_at: challenge.user_submitted_at,
                          attempts_count: challenge.user_attempts,
                        }
                      : null
                  }
                  isOwner={challenge.created_by === user?.id}
                />
              ))}
            </div>
          ) : challenges.length === 0 ? (
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
                No challenges available
              </h3>
              <p className="text-gray-500 mt-2">
                {filters.tab === 'my'
                  ? "You haven't created any challenges yet!"
                  : 'No challenges found. Be the first to create one!'}
              </p>
              <button
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg"
                onClick={handleCreateChallenge}
              >
                Create Challenge
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
                No challenges match your filters
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

        {/* Challenge Modal */}
        <ChallengeModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitChallenge}
          challenge={editingChallenge}
          isLoading={isSubmitting}
        />

        {/* Challenge Detail Modal */}
        <ChallengeDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          challenge={selectedChallenge}
          onStart={handleStartChallenge}
          onSubmit={handleSubmitWork}
          isLoading={isSubmitting}
        />

        {/* Story 3.1: AI Generate Challenge Modal */}
        <AIGenerateModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          onChallengeGenerated={handleAIGeneratedChallenge}
        />
      </div>
    </PageLayout>
  );
};

export default ChallengesPage;
