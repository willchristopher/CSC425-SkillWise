import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const ProgressPage = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const [statsRes, activitiesRes] = await Promise.all([
        apiService.progress.getStats(),
        apiService.progress.getActivities()
      ]);
      setStats(statsRes.data.data || statsRes.data);
      setActivities(activitiesRes.data.data || activitiesRes.data || []);
    } catch (err) {
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Learning Progress</h1>
          <p className="text-lg text-gray-600">Track your journey and celebrate achievements</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-3xl font-bold">{stats.totalGoals || 0}</div>
              <div className="text-indigo-100">Learning Goals</div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-4xl mb-2">✅</div>
              <div className="text-3xl font-bold">{stats.completedGoals || 0}</div>
              <div className="text-purple-100">Completed</div>
            </div>

            <div className="bg-gradient-to-r from-pink-600 to-red-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-4xl mb-2">🔥</div>
              <div className="text-3xl font-bold">{stats.currentStreak || 0}</div>
              <div className="text-pink-100">Day Streak</div>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-4xl mb-2">🏆</div>
              <div className="text-3xl font-bold">{stats.totalPoints || 0}</div>
              <div className="text-green-100">Total Points</div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{activity.type === 'goal' ? '🎯' : '🤖'}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
