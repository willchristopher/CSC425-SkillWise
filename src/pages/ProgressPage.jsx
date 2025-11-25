import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProgressPage = () => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');

  // Mock data - TODO: Replace with API call
  useEffect(() => {
    const mockProgressData = {
      overall: {
        totalPoints: 450,
        level: 5,
        experiencePoints: 1250,
        nextLevelXP: 1500,
        completedGoals: 8,
        completedChallenges: 15,
        currentStreak: 7,
        longestStreak: 12
      },
      recentActivity: [
        {
          id: 1,
          type: 'challenge_completed',
          title: 'Build a React Component',
          points: 50,
          timestamp: '2025-10-02T10:30:00Z'
        },
        {
          id: 2,
          type: 'goal_progress',
          title: 'Master Frontend Development',
          progress: 75,
          timestamp: '2025-10-02T09:15:00Z'
        },
        {
          id: 3,
          type: 'achievement_earned',
          title: 'First Week Streak',
          points: 25,
          timestamp: '2025-10-01T16:45:00Z'
        }
      ],
      weeklyProgress: [
        { day: 'Mon', points: 30, timeSpent: 45 },
        { day: 'Tue', points: 50, timeSpent: 60 },
        { day: 'Wed', points: 0, timeSpent: 0 },
        { day: 'Thu', points: 75, timeSpent: 90 },
        { day: 'Fri', points: 40, timeSpent: 55 },
        { day: 'Sat', points: 60, timeSpent: 75 },
        { day: 'Sun', points: 35, timeSpent: 40 }
      ],
      skillBreakdown: [
        { skill: 'JavaScript', level: 4, progress: 80 },
        { skill: 'React', level: 3, progress: 65 },
        { skill: 'CSS', level: 5, progress: 90 },
        { skill: 'Node.js', level: 2, progress: 40 },
        { skill: 'Database', level: 3, progress: 55 }
      ]
    };

    setTimeout(() => {
      setProgressData(mockProgressData);
      setLoading(false);
    }, 1000);
  }, [timeframe]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <LoadingSpinner message="Loading your progress..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Learning Progress</h1>
          <p className="text-lg text-gray-600">Track your journey and celebrate your achievements</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🎯</div>
              <div>
                <div className="text-2xl font-bold">{progressData.overall.totalPoints}</div>
                <div className="text-sm opacity-90">Total Points</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center">
              <div className="text-3xl mr-4">⭐</div>
              <div>
                <div className="text-2xl font-bold">Level {progressData.overall.level}</div>
                <div className="text-sm opacity-90">Current Level</div>
                <div className="w-full bg-white/30 rounded-full h-2 mt-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-300"
                    style={{ 
                      width: `${(progressData.overall.experiencePoints / progressData.overall.nextLevelXP) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="text-xs opacity-90 mt-1">
                  {progressData.overall.experiencePoints}/{progressData.overall.nextLevelXP} XP
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center">
              <div className="text-3xl mr-4">✅</div>
              <div>
                <div className="text-2xl font-bold">{progressData.overall.completedGoals}</div>
                <div className="text-sm opacity-90">Goals Completed</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🚀</div>
              <div>
                <div className="text-2xl font-bold">{progressData.overall.completedChallenges}</div>
                <div className="text-sm opacity-90">Challenges Done</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🔥</div>
              <div>
                <div className="text-2xl font-bold">{progressData.overall.currentStreak}</div>
                <div className="text-sm opacity-90">Day Streak</div>
                <div className="text-xs opacity-75 mt-1">
                  Longest: {progressData.overall.longestStreak} days
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Activity Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Weekly Activity</h2>
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <div className="flex items-end justify-between h-48 bg-gradient-to-t from-gray-50 to-transparent rounded-lg p-4">
              {progressData.weeklyProgress.map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t w-8 transition-all duration-300 hover:from-indigo-600 hover:to-purple-600"
                    style={{ height: `${Math.max((day.points / 75) * 120, 8)}px` }}
                    title={`${day.points} points, ${day.timeSpent} minutes`}
                  ></div>
                  <div className="text-xs text-gray-600 mt-2">{day.day}</div>
                  <div className="text-sm font-semibold text-gray-900">{day.points}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {progressData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="text-2xl mr-4">
                    {activity.type === 'challenge_completed' && '🚀'}
                    {activity.type === 'goal_progress' && '🎯'}
                    {activity.type === 'achievement_earned' && '🏆'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600">
                      {activity.points && `+${activity.points} points`}
                      {activity.progress && `${activity.progress}% complete`}
                    </p>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills Breakdown */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Skill Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {progressData.skillBreakdown.map((skill, index) => (
              <div key={index} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{skill.skill}</h4>
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded-full">
                    Level {skill.level}
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${skill.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-sm font-medium text-gray-700 mt-2">{skill.progress}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;