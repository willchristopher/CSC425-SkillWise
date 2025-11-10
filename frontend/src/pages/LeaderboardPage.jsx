import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all-time');

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await apiService.leaderboard.get(timeframe);
      setLeaderboard(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-lg text-gray-600">See how you rank against other learners</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">
          <div className="flex gap-2">
            {['all-time', 'monthly', 'weekly'].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  timeframe === tf
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {leaderboard.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id || index}
                className={`flex items-center gap-4 p-6 border-b border-gray-100 last:border-b-0 ${
                  entry.userId === user?.id ? 'bg-indigo-50' : ''
                }`}
              >
                <div className="text-2xl font-bold w-12 text-center">
                  {getRankIcon(index + 1)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">
                    {entry.userName || `User ${entry.userId}`}
                    {entry.userId === user?.id && <span className="text-indigo-600 ml-2">(You)</span>}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {entry.completedGoals || 0} goals • {entry.totalSubmissions || 0} submissions
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">{entry.totalPoints || 0}</div>
                  <div className="text-sm text-gray-500">points</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🏆</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No rankings yet</h2>
            <p className="text-gray-600">Complete goals and challenges to appear on the leaderboard!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
