// Dashboard overview component with stats and quick actions
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const DashboardOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard-overview">
      <div className="welcome-section">
        <h1>Welcome back, {user?.firstName || 'Student'}! 👋</h1>
        <p>Continue your learning journey with SkillWise</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Goals</h3>
            <p className="stat-number">0</p>
            <span className="stat-label">Active goals</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🚀</div>
          <div className="stat-content">
            <h3>Challenges</h3>
            <p className="stat-number">0</p>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>Streak</h3>
            <p className="stat-number">0</p>
            <span className="stat-label">Day streak</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>Points</h3>
            <p className="stat-number">0</p>
            <span className="stat-label">Total earned</span>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-btn" onClick={() => navigate('/goals')}>📝 Create New Goal</button>
            <button className="action-btn" onClick={() => navigate('/challenges')}>🎯 Browse Challenges</button>
            <button className="action-btn" onClick={() => navigate('/progress')}>📊 View Progress</button>
            <button className="action-btn" onClick={() => navigate('/peer-review')}>👥 Review Peers</button>
          </div>
        </div>

        <div className="section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <p className="empty-state">No recent activity. Start learning to see your progress here!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;