import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all-time');
  const [category, setCategory] = useState('overall');
  const { user } = useAuth();

  // Mock data
  useEffect(() => {
    const mockLeaderboardData = [
      {
        id: 1,
        rank: 1,
        name: 'Alex Johnson',
        avatar: '👨‍💻',
        points: 2450,
        level: 8,
        completedChallenges: 45,
        isCurrentUser: false,
        streak: 15,
        goalsAchieved: 12
      },
      {
        id: 2,
        rank: 2,
        name: 'Sarah Kim',
        avatar: '👩‍🎨',
        points: 2380,
        level: 8,
        completedChallenges: 42,
        isCurrentUser: false,
        streak: 12,
        goalsAchieved: 10
      },
      {
        id: 3,
        rank: 3,
        name: 'Mike Chen',
        avatar: '👨‍🔬',
        points: 2290,
        level: 7,
        completedChallenges: 38,
        isCurrentUser: false,
        streak: 8,
        goalsAchieved: 9
      },
      {
        id: 4,
        rank: 4,
        name: 'Emma Rodriguez',
        avatar: '👩‍💼',
        points: 2150,
        level: 7,
        completedChallenges: 35,
        isCurrentUser: false,
        streak: 6,
        goalsAchieved: 7
      },
      {
        id: 5,
        rank: 5,
        name: user?.firstName + ' ' + user?.lastName || 'You',
        avatar: '👤',
        points: 1850,
        level: 6,
        completedChallenges: 28,
        isCurrentUser: true,
        streak: 12,
        goalsAchieved: 5
      },
      {
        id: 6,
        rank: 6,
        name: 'David Park',
        avatar: '👨‍🎓',
        points: 1720,
        level: 6,
        completedChallenges: 25,
        isCurrentUser: false,
        streak: 4,
        goalsAchieved: 6
      },
      {
        id: 7,
        rank: 7,
        name: 'Lisa Zhang',
        avatar: '👩‍🔧',
        points: 1650,
        level: 5,
        completedChallenges: 23,
        isCurrentUser: false,
        streak: 3,
        goalsAchieved: 4
      }
    ];

    setTimeout(() => {
      setLeaderboardData(mockLeaderboardData);
      setLoading(false);
    }, 1000);
  }, [timeframe, category, user]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-orange-400';
      case 2: return 'from-gray-300 to-gray-400';
      case 3: return 'from-orange-300 to-orange-500';
      default: return 'from-blue-500 to-purple-500';
    }
  };

  const currentUserRank = leaderboardData.find(user => user.isCurrentUser)?.rank || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center">
        <LoadingSpinner message="Loading leaderboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-lg text-gray-600">See how you compare with other learners</p>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all-time">All Time</option>
                <option value="this-month">This Month</option>
                <option value="this-week">This Week</option>
                <option value="today">Today</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
              >
                <option value="overall">Overall Points</option>
                <option value="challenges">Challenges Completed</option>
                <option value="goals">Goals Achieved</option>
                <option value="streak">Learning Streak</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Rank Summary */}
        {currentUserRank > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Your Ranking</h3>
                <p className="opacity-90">You're in the top {Math.round((currentUserRank / leaderboardData.length) * 100)}% of learners!</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">#{currentUserRank}</div>
                <p className="opacity-90">Keep learning to climb higher!</p>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Podium */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">🏆 Top Performers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leaderboardData.slice(0, 3).map((user, index) => (
              <div key={user.id} className={`text-center ${index === 0 ? 'md:order-2' : index === 1 ? 'md:order-1' : 'md:order-3'}`}>
                <div className={`bg-gradient-to-r ${getRankColor(user.rank)} rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300`}>
                  <div className="text-4xl mb-3">{user.avatar}</div>
                  <div className="text-2xl mb-2">{getRankIcon(user.rank)}</div>
                  <h3 className="font-bold text-lg mb-2">{user.name}</h3>
                  <div className="text-2xl font-bold mb-1">{user.points.toLocaleString()}</div>
                  <div className="text-sm opacity-90">Level {user.level}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full Rankings Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Complete Rankings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Challenges</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaderboardData.map((user) => (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-gray-50 transition-colors duration-200 ${user.isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-2xl">{getRankIcon(user.rank)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{user.avatar}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                            {user.isCurrentUser && <span className="ml-2 text-blue-600 font-semibold">(You)</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-semibold text-gray-900">{user.points.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Level {user.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.completedChallenges}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center text-sm text-gray-900">
                        🔥 {user.streak}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🎉 Recent Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🚀</div>
              <h4 className="font-semibold text-gray-900 mb-2">Challenge Master</h4>
              <p className="text-sm text-gray-600 mb-2">Completed 5 challenges in one day</p>
              <div className="text-xs text-gray-500">Earned by Alex Johnson</div>
            </div>
            <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🔥</div>
              <h4 className="font-semibold text-gray-900 mb-2">Streak Legend</h4>
              <p className="text-sm text-gray-600 mb-2">30-day learning streak</p>
              <div className="text-xs text-gray-500">Earned by Sarah Kim</div>
            </div>
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="font-semibold text-gray-900 mb-2">Goal Crusher</h4>
              <p className="text-sm text-gray-600 mb-2">Completed 3 learning goals</p>
              <div className="text-xs text-gray-500">Earned by Mike Chen</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;