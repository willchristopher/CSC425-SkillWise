// Leaderboard and rankings page
import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import PageLayout from '../components/layout/PageLayout';

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRanking, setUserRanking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('all-time');
  const [category, setCategory] = useState('overall');
  const { user } = useAuth();

  // Fetch leaderboard data from API
  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [leaderboardRes, rankingRes] = await Promise.all([
        apiService.leaderboard.getGlobal({ timeframe, limit: 20 }),
        apiService.leaderboard.getUserRank(),
      ]);

      const leaderboard =
        leaderboardRes.data?.data || leaderboardRes.data || [];
      const ranking = rankingRes.data?.data || rankingRes.data || null;

      // Mark current user in leaderboard
      const enrichedLeaderboard = leaderboard.map((entry) => ({
        ...entry,
        isCurrentUser: entry.id === user?.id,
      }));

      setLeaderboardData(enrichedLeaderboard);
      setUserRanking(ranking);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError('Failed to load leaderboard data');
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  }, [timeframe, user?.id]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-1.17a3.001 3.001 0 01-5.66 0H4a2 2 0 110-4h1.17A3.001 3.001 0 015 5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-1.17a3.001 3.001 0 01-5.66 0H4a2 2 0 110-4h1.17A3.001 3.001 0 015 5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-orange-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-1.17a3.001 3.001 0 01-5.66 0H4a2 2 0 110-4h1.17A3.001 3.001 0 015 5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-500">#{rank}</span>
          </div>
        );
    }
  };

  const currentUserRank =
    userRanking?.rank ||
    leaderboardData.find((u) => u.isCurrentUser)?.rank ||
    0;

  return (
    <PageLayout
      title="Leaderboard"
      description="See how you compare with other learners."
    >
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">
          {error}
          <button onClick={fetchLeaderboard} className="ml-4 underline">
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[150px]">
            <label
              htmlFor="timeframe"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Timeframe
            </label>
            <select
              id="timeframe"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all-time">All Time</option>
              <option value="this-month">This Month</option>
              <option value="this-week">This Week</option>
              <option value="today">Today</option>
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="overall">Overall Points</option>
              <option value="challenges">Challenges Completed</option>
              <option value="goals">Goals Achieved</option>
              <option value="streak">Learning Streak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Current User Rank Summary */}
      {(currentUserRank > 0 || userRanking) && (
        <div className="bg-gradient-to-r from-indigo-500 to-teal-600 rounded-xl shadow-lg p-6 mb-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Your Ranking</h3>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold">
              #{currentUserRank || '-'}
            </span>
            <div>
              <p className="text-indigo-100">
                {userRanking?.percentile
                  ? `You're in the top ${
                      100 - userRanking.percentile
                    }% of learners!`
                  : leaderboardData.length > 0
                  ? `You're in the top ${Math.round(
                      (currentUserRank / leaderboardData.length) * 100
                    )}% of learners!`
                  : 'Complete challenges to start ranking!'}
              </p>
              <small className="text-indigo-200">
                {userRanking?.points
                  ? `${userRanking.points.toLocaleString()} points • Level ${
                      userRanking.level
                    }`
                  : 'Keep learning to climb higher!'}
              </small>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading leaderboard..." />
      ) : (
        <>
          {/* Top 3 Podium */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-1.17a3.001 3.001 0 01-5.66 0H4a2 2 0 110-4h1.17A3.001 3.001 0 015 5z"
                  clipRule="evenodd"
                />
              </svg>
              Top Performers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {leaderboardData.slice(0, 3).map((person, index) => (
                <div
                  key={person.id}
                  className={`p-4 rounded-lg border-2 text-center ${
                    index === 0
                      ? 'border-yellow-400 bg-yellow-50'
                      : index === 1
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-orange-300 bg-orange-50'
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-teal-600 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-white">
                      {person.initials}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900">{person.name}</h4>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">
                    {person.points.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">points</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                    Level {person.level}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Full Rankings Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Complete Rankings
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Challenges
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaderboardData.map((person) => (
                    <tr
                      key={person.id}
                      className={
                        person.isCurrentUser
                          ? 'bg-indigo-50'
                          : 'hover:bg-gray-50'
                      }
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getRankIcon(person.rank)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-teal-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {person.initials}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">
                              {person.name}
                            </span>
                            {person.isCurrentUser && (
                              <span className="ml-2 text-xs text-indigo-600 font-medium">
                                (You)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">
                          {person.points.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                          Level {person.level}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-600">
                        {person.completedChallenges}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Achievements Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-teal-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Top Achievements This Week
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-orange-50 border border-orange-200">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
                  <svg
                    className="w-6 h-6 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">
                  Challenge Master
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Completed 5 challenges in one day
                </p>
                <small className="text-gray-500">Earned by Alex Johnson</small>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-yellow-50 border border-yellow-200">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center mb-3">
                  <svg
                    className="w-6 h-6 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">Streak Legend</h4>
                <p className="text-sm text-gray-600 mt-1">
                  30-day learning streak
                </p>
                <small className="text-gray-500">Earned by Sarah Kim</small>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">Goal Crusher</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Completed 3 learning goals
                </p>
                <small className="text-gray-500">Earned by Mike Chen</small>
              </div>
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
};

export default LeaderboardPage;
