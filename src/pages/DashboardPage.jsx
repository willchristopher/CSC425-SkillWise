// Dashboard page with real data from backend API
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import ProgressBar from '../components/common/ProgressBar';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [stats, setStats] = useState({
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    totalChallenges: 0,
    completedChallenges: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch goals and challenges in parallel
      const [goalsResponse, challengesResponse] = await Promise.all([
        apiService.goals.getAll().catch(err => ({ data: { data: [] } })),
        apiService.challenges.getAll().catch(err => ({ data: { data: [] } }))
      ]);
      
      const goalsData = goalsResponse.data.data || [];
      const challengesData = challengesResponse.data.data || [];
      
      setGoals(goalsData.slice(0, 3)); // Show top 3 goals
      setChallenges(challengesData.slice(0, 3)); // Show top 3 challenges
      
      // Calculate stats
      setStats({
        totalGoals: goalsData.length,
        activeGoals: goalsData.filter(g => !g.is_completed).length,
        completedGoals: goalsData.filter(g => g.is_completed).length,
        totalChallenges: challengesData.length,
        completedChallenges: 0 // TODO: Track user's completed challenges
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear local storage and redirect
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navigationItems = [
    { path: '/dashboard', label: 'Overview', icon: '📊' },
    { path: '/goals', label: 'Goals', icon: '🎯' },
    { path: '/challenges', label: 'Challenges', icon: '🚀' },
    { path: '/progress', label: 'Progress', icon: '📈' },
    { path: '/peer-review', label: 'Peer Review', icon: '👥' },
    { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-2xl font-bold text-blue-600">
                SkillWise
              </Link>
            </div>
            
            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 text-sm">
                Welcome, {user.first_name}!
              </span>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.first_name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Continue your learning journey and track your progress.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Goals Section with Real Data */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">🎯</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Your Goals</h3>
                  <p className="text-sm text-gray-500">{stats.activeGoals} active of {stats.totalGoals} total</p>
                </div>
              </div>
              <div className="mt-4">
                {goals.length > 0 ? (
                  <div className="space-y-3">
                    {goals.map(goal => (
                      <div key={goal.id} className="bg-gray-50 rounded-md p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{goal.title}</h4>
                          <span className="text-xs text-gray-600">{goal.progress_percentage || 0}%</span>
                        </div>
                        <ProgressBar progress={goal.progress_percentage || 0} height="h-1" />
                      </div>
                    ))}
                    <Link 
                      to="/goals" 
                      className="mt-2 inline-flex text-blue-600 hover:text-blue-500 text-sm font-medium"
                    >
                      View all goals →
                    </Link>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-md p-4">
                    <p className="text-gray-600 text-sm">No goals set yet</p>
                    <Link 
                      to="/goals" 
                      className="mt-2 inline-flex text-blue-600 hover:text-blue-500 text-sm font-medium"
                    >
                      Create your first goal →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Challenges Section with Real Data */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">🚀</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Challenges</h3>
                  <p className="text-sm text-gray-500">{stats.totalChallenges} available</p>
                </div>
              </div>
              <div className="mt-4">
                {challenges.length > 0 ? (
                  <div className="space-y-3">
                    {challenges.map(challenge => (
                      <div key={challenge.id} className="bg-gray-50 rounded-md p-3 hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{challenge.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded ${
                            challenge.difficulty_level === 'easy' ? 'bg-green-100 text-green-700' :
                            challenge.difficulty_level === 'hard' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {challenge.difficulty_level}
                          </span>
                        </div>
                      </div>
                    ))}
                    <Link 
                      to="/challenges" 
                      className="mt-2 inline-flex text-blue-600 hover:text-blue-500 text-sm font-medium"
                    >
                      Browse all challenges →
                    </Link>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-md p-4">
                    <p className="text-gray-600 text-sm">No challenges available</p>
                    <Link 
                      to="/challenges" 
                      className="mt-2 inline-flex text-blue-600 hover:text-blue-500 text-sm font-medium"
                    >
                      Explore challenges →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">📈</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Your Stats</h3>
                  <p className="text-sm text-gray-500">Overview of your progress</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="bg-green-50 rounded-md p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-900">Completed Goals</span>
                    <span className="text-lg font-bold text-green-700">{stats.completedGoals}</span>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-md p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-900">Active Goals</span>
                    <span className="text-lg font-bold text-blue-700">{stats.activeGoals}</span>
                  </div>
                </div>
                <Link 
                  to="/progress" 
                  className="mt-2 inline-flex text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  View detailed progress →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/goals"
                className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center transition-colors"
              >
                <span className="text-2xl block mb-2">🎯</span>
                <span className="text-sm font-medium text-blue-900">Create Goal</span>
              </Link>
              <Link
                to="/challenges"
                className="bg-green-50 hover:bg-green-100 p-4 rounded-lg text-center transition-colors"
              >
                <span className="text-2xl block mb-2">🚀</span>
                <span className="text-sm font-medium text-green-900">Start Challenge</span>
              </Link>
              <Link
                to="/peer-review"
                className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center transition-colors"
              >
                <span className="text-2xl block mb-2">👥</span>
                <span className="text-sm font-medium text-purple-900">Peer Review</span>
              </Link>
              <Link
                to="/leaderboard"
                className="bg-yellow-50 hover:bg-yellow-100 p-4 rounded-lg text-center transition-colors"
              >
                <span className="text-2xl block mb-2">🏆</span>
                <span className="text-sm font-medium text-yellow-900">Leaderboard</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            <div className="text-center py-8">
              <span className="text-4xl block mb-4">📝</span>
              <p className="text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-400 mt-2">
                Complete challenges and set goals to see your activity here
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;