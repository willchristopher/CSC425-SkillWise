import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    goalsCompleted: 0,
    goalsActive: 0,
    challengesCompleted: 0,
    totalPoints: 0,
  });
  const [recentGoals, setRecentGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch real goal statistics
      const statsResponse = await apiService.goals.getStats();
      setStats({
        goalsCompleted: statsResponse.data.goalsCompleted,
        goalsActive: statsResponse.data.goalsActive,
        challengesCompleted: 0, // TODO: Implement challenges
        totalPoints: 0, // TODO: Implement points system
      });

      // Fetch recent goals
      const goalsResponse = await apiService.goals.getAll();
      setRecentGoals(goalsResponse.data.slice(0, 3)); // Show only 3 most recent

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
      // Set empty state on error
      setStats({
        goalsCompleted: 0,
        goalsActive: 0,
        challengesCompleted: 0,
        totalPoints: 0,
      });
      setRecentGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: 'text-green-600 bg-green-100',
      Medium: 'text-yellow-600 bg-yellow-100',
      Hard: 'text-red-600 bg-red-100',
    };
    return colors[difficulty] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'Student'}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Here's your learning progress overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
              <span className="text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                +2 this week
              </span>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Goals Completed</p>
            <p className="text-3xl font-bold text-gray-900">{stats.goalsCompleted}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Active Goals</p>
            <p className="text-3xl font-bold text-gray-900">{stats.goalsActive}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                +5 today
              </span>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Challenges Done</p>
            <p className="text-3xl font-bold text-gray-900">{stats.challengesCompleted}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Total Points</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalPoints.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Goals */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Goals</h2>
              <Link
                to="/goals"
                className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center"
              >
                View All
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="space-y-4">
              {recentGoals.length > 0 ? (
                recentGoals.map(goal => (
                  <div key={goal.id} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                      <span className="text-sm font-semibold text-indigo-600">{goal.currentProgress || 0}%</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${goal.currentProgress || 0}%` }}
                      ></div>
                    </div>

                    {goal.description && (
                      <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                    )}

                    {goal.targetCompletionDate && (
                      <p className="text-sm text-gray-500">
                        Due: {new Date(goal.targetCompletionDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No goals yet</h3>
                  <p className="text-gray-600 mb-4">Start your learning journey by creating your first goal!</p>
                </div>
              )}

              <Link
                to="/goals"
                className="block w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-center text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-all font-medium"
              >
                + Create New Goal
              </Link>
            </div>
          </div>

          {/* AI Learning Assistant */}
          <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-8 shadow-lg text-white">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mr-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h2 className="text-2xl font-bold">AI Learning Assistant</h2>
            </div>
            <p className="text-white/90 mb-6">
              Get personalized practice questions and study plans powered by Gemini AI
            </p>
            <Link
              to="/goals"
              className="inline-block bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Get Started with AI
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

