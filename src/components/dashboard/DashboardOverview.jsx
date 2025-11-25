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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #eef2ff, #faf5ff)' }}>
      <div style={{ padding: '1.5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          {/* Welcome Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
              Welcome back, {user?.username || 'Learner'}!
            </h1>
            <p style={{ color: '#4b5563' }}>Continue your learning journey with SkillWise</p>
          </div>

          {/* Statistics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', gap: '1.5rem', marginBottom: '2rem' }} className="md:grid-cols-2 lg:grid-cols-4">
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(4px)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #c3dafe', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)'; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}>
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4b5563' }}>Goals Completed</p>
                  <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#2563eb' }}>{stats.goalsCompleted}</p>
                </div>
                <div style={{ width: '3rem', height: '3rem', backgroundColor: '#dbeafe', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.5rem' }}>🎯</span>
                </div>
              </div>
            </div>

            <div 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.7)', 
                backdropFilter: 'blur(4px)', 
                borderRadius: '0.75rem', 
                padding: '1.5rem', 
                border: '1px solid #bbf7d0', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
                transition: 'all 0.3s' 
              }} 
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)'; }} 
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4b5563' }}>Challenges Completed</p>
                  <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#059669' }}>{stats.challengesCompleted}</p>
                </div>
                <div style={{ width: '3rem', height: '3rem', backgroundColor: '#dcfce7', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.5rem' }}>⚡</span>
                </div>
              </div>
            </div>

            <div 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.7)', 
                backdropFilter: 'blur(4px)', 
                borderRadius: '0.75rem', 
                padding: '1.5rem', 
                border: '1px solid #fed7aa', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
                transition: 'all 0.3s' 
              }} 
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)'; }} 
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4b5563' }}>Current Streak</p>
                  <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#ea580c' }}>{stats.currentStreak} days</p>
                </div>
                <div style={{ width: '3rem', height: '3rem', backgroundColor: '#fed7aa', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.5rem' }}>🔥</span>
                </div>
              </div>
            </div>

            <div 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.7)', 
                backdropFilter: 'blur(4px)', 
                borderRadius: '0.75rem', 
                padding: '1.5rem', 
                border: '1px solid #e9d5ff', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
                transition: 'all 0.3s' 
              }} 
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)'; }} 
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4b5563' }}>Total Points</p>
                  <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#9333ea' }}>{stats.totalPoints}</p>
                </div>
                <div style={{ width: '3rem', height: '3rem', backgroundColor: '#e9d5ff', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.5rem' }}>🏆</span>
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