// Dashboard overview component
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';

const DashboardOverview = () => {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState({
    goals_completed: 0,
    challenges_completed: 0,
    current_streak: 0,
    total_points: 0,
    badges_earned: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserStatistics();
  }, []);

  const fetchUserStatistics = async () => {
    try {
      const response = await apiService.user.getStatistics();
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to fetch user statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-overview">
        <div className="loading">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-overview">
      <div className="welcome-section">
        <h1>Welcome back, {user?.first_name || 'Student'}!</h1>
        <p>Ready to continue your learning journey?</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Goals Completed</h3>
            <p className="stat-number">{statistics.goals_completed}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🚀</div>
          <div className="stat-content">
            <h3>Challenges Completed</h3>
            <p className="stat-number">{statistics.challenges_completed}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>Current Streak</h3>
            <p className="stat-number">{statistics.current_streak} days</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Total Points</h3>
            <p className="stat-number">{statistics.total_points}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/goals" className="action-btn primary">
              <span className="btn-icon">🎯</span>
              Set New Goal
            </Link>
            <Link to="/challenges" className="action-btn secondary">
              <span className="btn-icon">🚀</span>
              Take Challenge
            </Link>
            <Link to="/progress" className="action-btn secondary">
              <span className="btn-icon">📈</span>
              View Progress
            </Link>
          </div>
        </div>

        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-placeholder">
            <p>Your recent learning activities will appear here.</p>
            <p>Complete your first goal or challenge to get started!</p>
          </div>
        </div>

        <div className="achievements">
          <h2>Achievements</h2>
          <div className="achievements-placeholder">
            <p>Badges: {statistics.badges_earned}</p>
            <p>Unlock achievements by completing goals and challenges!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;