// Dashboard shell page with navigation, goals and challenges sections
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
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

  const stats = [
    {
      icon: '🎯',
      value: '0',
      label: 'Active Goals',
      color: '#f093fb',
      link: '/goals',
    },
    {
      icon: '🚀',
      value: '0',
      label: 'Challenges',
      color: '#4facfe',
      link: '/challenges',
    },
    {
      icon: '🏆',
      value: '0',
      label: 'Points Earned',
      color: '#fee140',
      link: '/leaderboard',
    },
    {
      icon: '📈',
      value: '0%',
      label: 'Progress',
      color: '#43e97b',
      link: '/progress',
    },
  ];

  const quickActions = [
    {
      icon: '🤖',
      label: 'AI Tutor',
      path: '/ai-tutor',
      color: '#667eea',
      description: 'Get instant feedback',
    },
    {
      icon: '🎯',
      label: 'Create Goal',
      path: '/goals',
      color: '#f093fb',
      description: 'Set new objectives',
    },
    {
      icon: '🚀',
      label: 'Start Challenge',
      path: '/challenges',
      color: '#4facfe',
      description: 'Practice coding',
    },
    {
      icon: '👥',
      label: 'Peer Review',
      path: '/peer-review',
      color: '#fa709a',
      description: 'Review code',
    },
    {
      icon: '🏆',
      label: 'Leaderboard',
      path: '/leaderboard',
      color: '#fee140',
      description: 'View rankings',
    },
  ];

  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-modern">
      {/* Navigation Bar */}
      <nav className="dashboard-nav">
        <div className="nav-container">
          <div className="nav-content">
            <Link to="/dashboard" className="nav-logo">
              <span className="logo-text">SkillWise</span>
            </Link>

            <div className="nav-items">
              {navigationItems.map((item) => (
                <Link key={item.path} to={item.path} className="nav-item">
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="nav-user">
              <span className="user-greeting">
                {user?.firstName || user?.first_name || 'User'}
              </span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Dashboard */}
      <main className="dashboard-main">
        <div className="dashboard-background">
          <div className="bg-gradient"></div>
          <div className="bg-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-badge">
              <span>✨</span>
              <span>Dashboard</span>
            </div>
            <h1 className="welcome-title">
              Welcome back,{' '}
              <span className="gradient-text">
                {user?.firstName || user?.first_name || 'User'}
              </span>
              !
            </h1>
            <p className="welcome-subtitle">
              Continue your learning journey and track your progress
            </p>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <Link
                key={index}
                to={stat.link}
                className="stat-card"
                style={{ '--stat-color': stat.color }}
              >
                <div className="stat-icon-wrapper">
                  <span className="stat-icon">{stat.icon}</span>
                </div>
                <div className="stat-details">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
                <div className="stat-hover-effect"></div>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h2 className="section-heading">Quick Actions</h2>
            <div className="quick-actions-grid">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.path}
                  className="action-card"
                  style={{ '--action-color': action.color }}
                >
                  <div className="action-icon-wrapper">
                    <span className="action-icon">{action.icon}</span>
                  </div>
                  <h3 className="action-label">{action.label}</h3>
                  <p className="action-description">{action.description}</p>
                  <div className="action-hover-effect"></div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity-section">
            <h2 className="section-heading">Recent Activity</h2>
            <div className="activity-card">
              <div className="activity-empty">
                <span className="empty-icon">📝</span>
                <p className="empty-title">No recent activity</p>
                <p className="empty-subtitle">
                  Complete challenges and set goals to see your activity here
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
