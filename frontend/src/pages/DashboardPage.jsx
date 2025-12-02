import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import '../styles/pages.css';
import '../styles/animations.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeGoals: 0,
    completedChallenges: 0,
    totalPoints: 0,
    progressPercent: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch goals, challenges, user stats, and activity in parallel
        const [goalsRes, challengesRes, statsRes, activityRes] =
          await Promise.all([
            apiService.goals.getAll(),
            apiService.challenges.getAll(),
            apiService.progress.getStats().catch(() => null),
            apiService.progress.getActivity({ limit: 5 }).catch(() => null),
          ]);

        const goals = goalsRes.data?.data || goalsRes.data || [];
        const challenges = challengesRes.data?.data || challengesRes.data || [];
        const userStats = statsRes?.data?.data || {};
        const activity = activityRes?.data?.data || activityRes?.data || [];

        const activeGoals = goals.filter((g) => !g.is_completed).length;
        const completedChallenges = challenges.filter(
          (c) => c.is_completed
        ).length;

        setStats({
          activeGoals,
          completedChallenges:
            userStats.challengesCompleted || completedChallenges,
          totalPoints: userStats.totalPoints || completedChallenges * 10,
          progressPercent:
            goals.length > 0
              ? Math.round(
                  (goals.filter((g) => g.is_completed).length / goals.length) *
                    100
                )
              : 0,
        });

        // Format recent activity from various sources
        const formattedActivity = [];

        // Add goals as activity
        goals.slice(0, 3).forEach((goal) => {
          formattedActivity.push({
            id: `goal-${goal.id}`,
            type: 'goal',
            title: goal.is_completed ? 'Goal Completed' : 'Goal Created',
            description: goal.title,
            timestamp: goal.updated_at || goal.created_at,
            icon: 'target',
          });
        });

        // Add challenge completions
        challenges
          .filter((c) => c.is_completed)
          .slice(0, 2)
          .forEach((challenge) => {
            formattedActivity.push({
              id: `challenge-${challenge.id}`,
              type: 'challenge',
              title: 'Challenge Completed',
              description: challenge.title,
              timestamp: challenge.completed_at || challenge.updated_at,
              icon: 'zap',
            });
          });

        // Add activity from API if available
        if (Array.isArray(activity)) {
          activity.forEach((item) => {
            formattedActivity.push({
              id: `event-${item.id}`,
              type: item.event_type || 'event',
              title: formatEventType(item.event_type),
              description:
                item.challenge_title ||
                item.goal_title ||
                item.description ||
                'Activity recorded',
              timestamp: item.timestamp_occurred || item.created_at,
              icon: getEventIcon(item.event_type),
            });
          });
        }

        // Sort by timestamp and take top 5
        formattedActivity.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setRecentActivity(formattedActivity.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatEventType = (type) => {
    const types = {
      challenge_started: 'Started a Challenge',
      challenge_completed: 'Completed a Challenge',
      goal_created: 'Created a Goal',
      goal_completed: 'Achieved a Goal',
      review_submitted: 'Submitted a Review',
      points_earned: 'Earned Points',
      streak_milestone: 'Streak Milestone',
    };
    return types[type] || 'Activity';
  };

  const getEventIcon = (type) => {
    const icons = {
      challenge_started: 'zap',
      challenge_completed: 'check-circle',
      goal_created: 'target',
      goal_completed: 'award',
      review_submitted: 'users',
      points_earned: 'star',
      streak_milestone: 'flame',
    };
    return icons[type] || 'activity';
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getUserName = () => {
    if (user?.firstName) return user.firstName;
    if (user?.first_name) return user.first_name;
    if (user?.name) return user.name.split(' ')[0];
    if (user?.email) return user.email.split('@')[0];
    return 'there';
  };

  const statCards = [
    {
      label: 'Active Goals',
      value: stats.activeGoals,
      iconClass: 'icon-bg-blue',
      link: '/goals',
      icon: (
        <>
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2"></circle>
        </>
      ),
    },
    {
      label: 'Challenges Done',
      value: stats.completedChallenges,
      iconClass: 'icon-bg-purple',
      link: '/challenges',
      icon: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>,
    },
    {
      label: 'Points Earned',
      value: stats.totalPoints,
      iconClass: 'icon-bg-yellow',
      link: '/leaderboard',
      icon: (
        <>
          <circle cx="12" cy="8" r="7"></circle>
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
        </>
      ),
    },
    {
      label: 'Progress',
      value: `${stats.progressPercent}%`,
      iconClass: 'icon-bg-green',
      link: '/progress',
      icon: (
        <>
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
          <polyline points="17 6 23 6 23 12"></polyline>
        </>
      ),
    },
  ];

  const quickActions = [
    {
      title: 'AI Tutor',
      description: 'Get instant feedback on your work',
      link: '/ai-tutor',
      iconClass: 'icon-bg-indigo',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
          <rect x="9" y="9" width="6" height="6"></rect>
          <line x1="9" y1="1" x2="9" y2="4"></line>
          <line x1="15" y1="1" x2="15" y2="4"></line>
          <line x1="9" y1="20" x2="9" y2="23"></line>
          <line x1="15" y1="20" x2="15" y2="23"></line>
          <line x1="20" y1="9" x2="23" y2="9"></line>
          <line x1="20" y1="14" x2="23" y2="14"></line>
          <line x1="1" y1="9" x2="4" y2="9"></line>
          <line x1="1" y1="14" x2="4" y2="14"></line>
        </svg>
      ),
    },
    {
      title: 'Create Goal',
      description: 'Set new learning objectives',
      link: '/goals',
      iconClass: 'icon-bg-blue',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      ),
    },
    {
      title: 'Start Challenge',
      description: 'Practice and improve your skills',
      link: '/challenges',
      iconClass: 'icon-bg-purple',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      ),
    },
    {
      title: 'Peer Review',
      description: 'Review and learn from others',
      link: '/peer-review',
      iconClass: 'icon-bg-pink',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
    {
      title: 'Leaderboard',
      description: 'See how you rank',
      link: '/leaderboard',
      iconClass: 'icon-bg-yellow',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
          <path d="M4 22h16"></path>
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
        </svg>
      ),
    },
  ];

  const getActivityIcon = (iconName) => {
    const icons = {
      target: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2"></circle>
        </svg>
      ),
      zap: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      ),
      'check-circle': (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      ),
      award: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="8" r="7"></circle>
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
        </svg>
      ),
      users: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      star: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      ),
      flame: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
        </svg>
      ),
      activity: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      ),
    };
    return icons[iconName] || icons.activity;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AppLayout>
      {/* Welcome Section */}
      <div className="dashboard-welcome animate-fade-in-up">
        <h1 className="dashboard-greeting">
          {getGreeting()}, {getUserName()}!
        </h1>
        <p className="dashboard-subtitle">
          Continue your learning journey and track your progress.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats-grid animate-stagger-container">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className={`dashboard-stat-card hover-lift animate-fade-in-up`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`dashboard-stat-icon ${stat.iconClass}`}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {stat.icon}
              </svg>
            </div>
            <div className="dashboard-stat-value">
              {loading ? (
                <span
                  className="skeleton"
                  style={{
                    width: '40px',
                    height: '28px',
                    display: 'inline-block',
                  }}
                ></span>
              ) : (
                stat.value
              )}
            </div>
            <div className="dashboard-stat-label">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div
        className="dashboard-activity-section animate-fade-in-up"
        style={{ animationDelay: '0.4s' }}
      >
        <h2 className="dashboard-section-title">Quick Actions</h2>
        <div className="dashboard-actions-grid animate-stagger-container">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="dashboard-action-card hover-lift"
            >
              <div
                className={`dashboard-action-icon icon-animated ${action.iconClass}`}
              >
                {action.icon}
              </div>
              <h3 className="dashboard-action-title">{action.title}</h3>
              <p className="dashboard-action-description">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
        <h2 className="dashboard-section-title">Recent Activity</h2>
        {loading ? (
          <div className="dashboard-activity-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="dashboard-activity-item">
                <div
                  className="skeleton"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                  }}
                ></div>
                <div style={{ flex: 1 }}>
                  <div
                    className="skeleton"
                    style={{
                      width: '60%',
                      height: '16px',
                      marginBottom: '8px',
                    }}
                  ></div>
                  <div
                    className="skeleton"
                    style={{ width: '40%', height: '14px' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentActivity.length > 0 ? (
          <div className="dashboard-activity-list">
            {recentActivity.map((activity, index) => (
              <div
                key={activity.id}
                className="dashboard-activity-item animate-fade-in-left"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`dashboard-activity-item-icon ${
                    activity.type === 'challenge'
                      ? 'icon-bg-purple'
                      : activity.type === 'goal'
                      ? 'icon-bg-blue'
                      : 'icon-bg-green'
                  }`}
                >
                  {getActivityIcon(activity.icon)}
                </div>
                <div className="dashboard-activity-item-content">
                  <div className="dashboard-activity-item-title">
                    {activity.title}
                  </div>
                  <div className="dashboard-activity-item-description">
                    {activity.description}
                  </div>
                </div>
                <div className="dashboard-activity-item-time">
                  {formatTimeAgo(activity.timestamp)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-activity-empty">
            <div className="dashboard-activity-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3 className="dashboard-activity-title">No recent activity</h3>
            <p className="dashboard-activity-text">
              Complete challenges and set goals to see your activity here.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
