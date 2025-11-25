import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

const DashboardOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    goalsCompleted: 0,
    challengesCompleted: 0,
    currentStreak: 0,
    totalPoints: 0,
    rank: null
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Fetch user statistics and recent activity
    fetchUserStats();
    fetchRecentActivity();
  }, []);

  const fetchUserStats = async () => {
    try {
      // Mock data for now - replace with actual API call
      setStats({
        goalsCompleted: 5,
        challengesCompleted: 12,
        currentStreak: 7,
        totalPoints: 1250,
        rank: 42
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Mock data for now - replace with actual API call
      setRecentActivity([
        { id: 1, type: 'challenge', title: 'JavaScript Arrays', date: '2 hours ago', points: 50 },
        { id: 2, type: 'goal', title: 'Master React Basics', date: '1 day ago', points: 100 },
        { id: 3, type: 'peer_review', title: 'Reviewed: Login Component', date: '2 days ago', points: 25 }
      ]);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.username || 'Learner'}!
            </h1>
            <p className="text-gray-600">Continue your learning journey with SkillWise</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Goals Completed</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.goalsCompleted}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Challenges Completed</p>
                  <p className="text-3xl font-bold text-green-600">{stats.challengesCompleted}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Streak</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.currentStreak} days</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🔥</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Points</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalPoints}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-3 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium">
                  🎯 Create New Goal
                </button>
                <button className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg p-3 hover:from-green-600 hover:to-teal-700 transition-all duration-200 font-medium">
                  ⚡ Browse Challenges
                </button>
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg p-3 hover:from-purple-600 hover:to-pink-700 transition-all duration-200 font-medium">
                  🤖 Get AI Tutoring
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {activity.type === 'challenge' ? '⚡' : activity.type === 'goal' ? '🎯' : '👥'}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-600">{activity.date}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-green-600">+{activity.points} pts</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Weekly Progress</span>
                  <span className="text-sm text-gray-500">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Monthly Goals</span>
                  <span className="text-sm text-gray-500">60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-teal-600 h-2 rounded-full" style={{width: '60%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;