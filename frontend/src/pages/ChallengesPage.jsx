import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const ChallengesPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [challengesRes, submissionsRes] = await Promise.all([
        apiService.challenges.getAll(),
        apiService.submissions.getAll().catch(() => ({ data: { data: [] } }))
      ]);
      setChallenges(challengesRes.data.data || challengesRes.data || []);
      setUserSubmissions(submissionsRes.data.data || submissionsRes.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load challenges');
      console.error('Error fetching data:', err);
      setChallenges([]);
      setUserSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = async (challenge) => {
    try {
      await apiService.challenges.start(challenge.id);
      alert(`Started challenge: ${challenge.title}`);
      fetchData();
    } catch (err) {
      alert('Failed to start challenge');
    }
  };

  const handleCompleteChallenge = async (challenge) => {
    try {
      await apiService.challenges.submit(challenge.id, {
        submission_text: 'Challenge completed',
        status: 'completed'
      });
      alert(`Completed challenge: ${challenge.title}`);
      fetchData();
    } catch (err) {
      alert('Failed to complete challenge');
      console.error(err);
    }
  };

  const isCompleted = (challengeId) => {
    return userSubmissions.some(
      sub => sub.challenge_id === challengeId && sub.status === 'completed'
    );
  };

  const isInProgress = (challengeId) => {
    return userSubmissions.some(
      sub => sub.challenge_id === challengeId && sub.status === 'in_progress'
    );
  };

  // Calculate progress
  const completedCount = challenges.filter(c => isCompleted(c.id)).length;
  const totalCount = challenges.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredChallenges = challenges.filter(challenge => {
    const matchesCategory = !filters.category || challenge.category?.toLowerCase() === filters.category.toLowerCase();
    const matchesDifficulty = !filters.difficulty || challenge.difficulty?.toLowerCase() === filters.difficulty.toLowerCase();
    const matchesSearch = !filters.search || 
      challenge.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      challenge.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
    };
    return colors[difficulty?.toLowerCase()] || colors.medium;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Learning Challenges</h1>
          <p className="text-lg text-gray-600">Test your skills with hands-on coding challenges</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Your Progress</h3>
              <p className="text-sm text-gray-600">
                {completedCount} of {totalCount} challenges completed
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-indigo-600">{progressPercentage}%</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          {completedCount > 0 && (
            <p className="text-sm text-green-600 mt-2">
              🎉 Great work! Keep going!
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search challenges..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="programming">Programming</option>
                <option value="algorithms">Algorithms</option>
                <option value="web-development">Web Development</option>
                <option value="databases">Databases</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {filteredChallenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((challenge) => {
              const completed = isCompleted(challenge.id);
              const inProgress = isInProgress(challenge.id);
              
              return (
                <div key={challenge.id} className={`bg-white rounded-2xl p-6 shadow-lg border-2 hover:shadow-xl transition-all ${completed ? 'border-green-500 bg-green-50' : 'border-gray-100'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{challenge.title}</h3>
                    <div className="flex gap-2">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty}
                      </span>
                      {completed && (
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800">
                          ✓ Done
                        </span>
                      )}
                      {inProgress && !completed && (
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">{challenge.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">⏱️ {challenge.timeEstimate || 30} min</span>
                    <span className="text-sm font-semibold text-indigo-600">🏆 {challenge.points || 50} pts</span>
                  </div>

                  <div className="flex gap-2">
                    {!completed && !inProgress && (
                      <button
                        onClick={() => handleStartChallenge(challenge)}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
                      >
                        Start Challenge
                      </button>
                    )}
                    {inProgress && !completed && (
                      <button
                        onClick={() => handleCompleteChallenge(challenge)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
                      >
                        Mark Complete
                      </button>
                    )}
                    {completed && (
                      <button
                        disabled
                        className="flex-1 bg-gray-300 text-gray-600 px-4 py-2 rounded-lg font-semibold cursor-not-allowed"
                      >
                        ✓ Completed
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎯</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {error ? 'Unable to load challenges' : 'No challenges available'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error ? 'Please try again later.' : 'Check back soon for new challenges!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengesPage;
