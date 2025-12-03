import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/pages.css';
import '../styles/animations.css';
import '../styles/progress-v2.css';

// Motivational quotes
const motivationalQuotes = [
  {
    quote: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
  },
  {
    quote: "Don't watch the clock; do what it does. Keep going.",
    author: 'Sam Levenson',
  },
  {
    quote: 'Success is not final, failure is not fatal.',
    author: 'Winston Churchill',
  },
  { quote: 'Learn something new every day.', author: 'Unknown' },
  { quote: "Your limitation—it's only your imagination.", author: 'Unknown' },
];

// Icons
const TrophyIcon = () => (
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
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const FlameIcon = () => (
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
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const TargetIcon = () => (
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
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const TrendUpIcon = () => (
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
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CheckCircleIcon = () => (
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
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ZapIcon = () => (
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
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeGoals: 0,
    completedChallenges: 0,
    totalPoints: 0,
    progressPercent: 0,
    currentStreak: 0,
    longestStreak: 0,
    peerReviewsGiven: 0,
    peerReviewsReceived: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [overview, setOverview] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [timeRange, setTimeRange] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [quote] = useState(
    () =>
      motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
  );

  const processActivityData = useCallback((activities, range) => {
    if (!activities || activities.length === 0) {
      return [];
    }

    const now = new Date();
    let buckets = {};
    let labels = [];

    if (range === 'daily') {
      for (let i = 23; i >= 0; i--) {
        const hour = new Date(now);
        hour.setHours(hour.getHours() - i);
        const key =
          hour.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false }) +
          ':00';
        labels.push(key);
        buckets[key] = { value: 0, activities: 0 };
      }
    } else if (range === 'weekly') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const key = days[date.getDay()];
        labels.push(key);
        if (!buckets[key]) buckets[key] = { value: 0, activities: 0 };
      }
    } else if (range === 'monthly') {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const key = date.getDate().toString();
        labels.push(key);
        buckets[key] = { value: 0, activities: 0 };
      }
    } else {
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const key = months[date.getMonth()];
        labels.push(key);
        if (!buckets[key]) buckets[key] = { value: 0, activities: 0 };
      }
    }

    activities.forEach((activity) => {
      const actDate = new Date(
        activity.timestamp_occurred || activity.created_at
      );
      let bucketKey = '';

      if (range === 'daily') {
        bucketKey =
          actDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            hour12: false,
          }) + ':00';
      } else if (range === 'weekly') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        bucketKey = days[actDate.getDay()];
      } else if (range === 'monthly') {
        bucketKey = actDate.getDate().toString();
      } else {
        const months = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        bucketKey = months[actDate.getMonth()];
      }

      if (buckets[bucketKey]) {
        buckets[bucketKey].activities += 1;
        buckets[bucketKey].value += activity.points_earned || 1;
      }
    });

    return labels.map((label) => ({
      label,
      value: buckets[label]?.value || 0,
      activities: buckets[label]?.activities || 0,
    }));
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all necessary data in parallel
        const [statsRes, overviewRes, activityRes, goalsRes] =
          await Promise.all([
            apiService.user.getStatistics().catch(() => ({ data: {} })),
            apiService.progress.getOverview().catch(() => ({ data: null })),
            apiService.progress
              .getActivity({ limit: 500 })
              .catch(() => ({ data: { activities: [] } })),
            apiService.goals.getAll().catch(() => ({ data: [] })),
          ]);

        // Extract stats data
        const statsData = statsRes.data?.data || statsRes.data || {};

        // Calculate active goals from goals list
        const goalsData = goalsRes.data?.data || goalsRes.data || [];
        const activeGoalsCount = Array.isArray(goalsData)
          ? goalsData.filter((g) => !g.is_completed).length
          : 0;

        const newStats = {
          activeGoals: activeGoalsCount,
          completedChallenges:
            statsData.challengesCompleted ||
            statsData.total_challenges_completed ||
            0,
          totalPoints: statsData.totalPoints || statsData.total_points || 0,
          progressPercent: statsData.progressPercent || 0,
          currentStreak:
            statsData.currentStreak || statsData.current_streak_days || 0,
          longestStreak:
            statsData.longestStreak || statsData.longest_streak_days || 0,
          peerReviewsGiven:
            statsData.peerReviewsGiven ||
            statsData.total_peer_reviews_given ||
            0,
          peerReviewsReceived:
            statsData.peerReviewsReceived ||
            statsData.total_peer_reviews_received ||
            0,
        };
        setStats(newStats);

        // Set overview data
        const overviewData = overviewRes.data?.data || overviewRes.data || null;
        setOverview(overviewData);

        // Process activity data
        const activities =
          activityRes.data?.data?.activities ||
          activityRes.data?.activities ||
          [];
        const processed = processActivityData(activities, timeRange);
        setActivityData(processed);

        // Format recent activity for activity list (limit to 5)
        const formattedActivity = [];
        if (Array.isArray(activities)) {
          activities.slice(0, 5).forEach((item) => {
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
  }, [processActivityData, timeRange]);

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

  const totalChallenges = Math.max(
    1,
    overview?.challenges?.total_attempted || stats.completedChallenges || 0
  );
  const totalGoals = Math.max(
    1,
    overview?.goals?.total || stats.activeGoals || 0
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AppLayout>
      <div className="progress-page-v2">
        {/* Motivational Banner */}
        <div className="motivation-banner">
          <div className="motivation-content">
            <div className="greeting">
              <h1>
                {getGreeting()}, {getUserName()}! 🚀
              </h1>
              <p className="quote">"{quote.quote}"</p>
              <p className="author">— {quote.author}</p>
            </div>
            <div className="streak-highlight">
              <div className="streak-icon">
                <FlameIcon />
              </div>
              <div className="streak-info">
                <span className="streak-count">{stats.currentStreak}</span>
                <span className="streak-label">Day Streak</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid with Insights */}
        <div className="stats-grid">
          <div className="stat-card challenges">
            <div className="stat-icon">
              <TargetIcon />
            </div>
            <div className="stat-content">
              <span className="stat-value">
                {Math.max(0, stats.completedChallenges || 0)}
              </span>
              <span className="stat-label">Challenges Completed</span>
              <span className="stat-sub">
                {totalChallenges > 0
                  ? Math.round(
                      (Math.max(0, stats.completedChallenges || 0) /
                        totalChallenges) *
                        100
                    )
                  : 0}
                % completion rate
              </span>
            </div>
          </div>

          <div className="stat-card goals">
            <div className="stat-icon">
              <CheckCircleIcon />
            </div>
            <div className="stat-content">
              <span className="stat-value">
                {Math.max(0, stats.activeGoals || 0)}
              </span>
              <span className="stat-label">Active Goals</span>
              <span className="stat-sub">
                Longest streak: {Math.max(0, stats.longestStreak || 0)} days
              </span>
            </div>
          </div>

          <div className="stat-card points">
            <div className="stat-icon">
              <TrophyIcon />
            </div>
            <div className="stat-content">
              <span className="stat-value">
                {Math.max(0, stats.totalPoints || 0)}
              </span>
              <span className="stat-label">Total Points</span>
              <span className="stat-sub">
                Avg:{' '}
                {Math.max(0, stats.completedChallenges || 0) > 0
                  ? Math.round(
                      Math.max(0, stats.totalPoints || 0) /
                        Math.max(1, stats.completedChallenges || 0)
                    )
                  : 0}
                pts per challenge
              </span>
            </div>
          </div>

          <div className="stat-card streak">
            <div className="stat-icon">
              <FlameIcon />
            </div>
            <div className="stat-content">
              <span className="stat-value">
                {Math.max(0, stats.currentStreak || 0)}
              </span>
              <span className="stat-label">Current Streak</span>
              <span className="stat-sub">
                Record: {Math.max(0, stats.longestStreak || 0)} days
              </span>
            </div>
          </div>

          <div className="stat-card reviews">
            <div className="stat-icon">
              <ZapIcon />
            </div>
            <div className="stat-content">
              <span className="stat-value">
                {Math.max(
                  0,
                  (stats.peerReviewsGiven || 0) +
                    (stats.peerReviewsReceived || 0)
                )}
              </span>
              <span className="stat-label">Community Engagements</span>
              <span className="stat-sub">
                {Math.max(0, stats.peerReviewsGiven || 0)} given,{' '}
                {Math.max(0, stats.peerReviewsReceived || 0)} received
              </span>
            </div>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="activity-section">
          <div className="section-header">
            <div className="section-title">
              <CalendarIcon />
              <h2>Activity Overview</h2>
            </div>
            <div className="time-range-selector">
              {['daily', 'weekly', 'monthly', 'yearly'].map((range) => (
                <button
                  key={range}
                  className={`range-btn ${timeRange === range ? 'active' : ''}`}
                  onClick={() => setTimeRange(range)}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="enhanced-chart">
            <svg className="chart-svg" viewBox="0 0 800 250" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-brand-primary)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={`grid-${i}`}
                  x1="0"
                  y1={50 + i * 45}
                  x2="800"
                  y2={50 + i * 45}
                  stroke="var(--color-border-primary)"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  opacity="0.5"
                />
              ))}
              
              {/* Area fill */}
              <path
                className="chart-area"
                d={(() => {
                  if (activityData.length === 0) return '';
                  const maxValue = Math.max(...activityData.map(d => d.value), 1);
                  const width = 800;
                  const height = 200;
                  const padding = 40;
                  const stepX = (width - padding * 2) / Math.max(activityData.length - 1, 1);
                  
                  let path = `M ${padding} ${height}`;
                  activityData.forEach((d, i) => {
                    const x = padding + i * stepX;
                    const y = height - ((d.value / maxValue) * (height - 50)) - 10;
                    if (i === 0) {
                      path += ` L ${x} ${y}`;
                    } else {
                      const prevX = padding + (i - 1) * stepX;
                      const prevY = height - ((activityData[i-1].value / maxValue) * (height - 50)) - 10;
                      const cpX1 = prevX + stepX / 3;
                      const cpX2 = x - stepX / 3;
                      path += ` C ${cpX1} ${prevY}, ${cpX2} ${y}, ${x} ${y}`;
                    }
                  });
                  path += ` L ${padding + (activityData.length - 1) * stepX} ${height} Z`;
                  return path;
                })()}
                fill="url(#chartGradient)"
              />
              
              {/* Line */}
              <path
                className="chart-line"
                d={(() => {
                  if (activityData.length === 0) return '';
                  const maxValue = Math.max(...activityData.map(d => d.value), 1);
                  const width = 800;
                  const height = 200;
                  const padding = 40;
                  const stepX = (width - padding * 2) / Math.max(activityData.length - 1, 1);
                  
                  let path = '';
                  activityData.forEach((d, i) => {
                    const x = padding + i * stepX;
                    const y = height - ((d.value / maxValue) * (height - 50)) - 10;
                    if (i === 0) {
                      path = `M ${x} ${y}`;
                    } else {
                      const prevX = padding + (i - 1) * stepX;
                      const prevY = height - ((activityData[i-1].value / maxValue) * (height - 50)) - 10;
                      const cpX1 = prevX + stepX / 3;
                      const cpX2 = x - stepX / 3;
                      path += ` C ${cpX1} ${prevY}, ${cpX2} ${y}, ${x} ${y}`;
                    }
                  });
                  return path;
                })()}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
              />
              
              {/* Data points */}
              {activityData.map((d, i) => {
                const maxValue = Math.max(...activityData.map(d => d.value), 1);
                const width = 800;
                const height = 200;
                const padding = 40;
                const stepX = (width - padding * 2) / Math.max(activityData.length - 1, 1);
                const x = padding + i * stepX;
                const y = height - ((d.value / maxValue) * (height - 50)) - 10;
                
                return (
                  <g key={i} className="data-point-group">
                    <circle
                      className="data-point-glow"
                      cx={x}
                      cy={y}
                      r="12"
                      fill="var(--color-brand-primary)"
                      opacity="0.15"
                    />
                    <circle
                      className="data-point"
                      cx={x}
                      cy={y}
                      r="6"
                      fill="var(--color-bg-secondary)"
                      stroke="url(#lineGradient)"
                      strokeWidth="3"
                    />
                    <text
                      className="data-label"
                      x={x}
                      y={y - 18}
                      textAnchor="middle"
                      fill="var(--color-text-primary)"
                      fontSize="12"
                      fontWeight="600"
                    >
                      {d.value}
                    </text>
                  </g>
                );
              })}
            </svg>
            
            {/* X-axis labels */}
            <div className="chart-x-labels">
              {activityData.map((d, i) => (
                <span key={i} className="x-label">{d.label}</span>
              ))}
            </div>
          </div>

          <div className="activity-summary-enhanced">
            <div className="summary-card">
              <div className="summary-icon blue">
                <TrophyIcon />
              </div>
              <div className="summary-content">
                <span className="summary-value">
                  {activityData.reduce((sum, d) => sum + d.value, 0)}
                </span>
                <span className="summary-label">Total Points</span>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon purple">
                <ZapIcon />
              </div>
              <div className="summary-content">
                <span className="summary-value">
                  {activityData.reduce((sum, d) => sum + d.activities, 0)}
                </span>
                <span className="summary-label">Activities</span>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon green">
                <TrendUpIcon />
              </div>
              <div className="summary-content">
                <span className="summary-value">
                  {activityData.length > 0
                    ? Math.round(
                        activityData.reduce((sum, d) => sum + d.value, 0) /
                          activityData.length
                      )
                    : 0}
                </span>
                <span className="summary-label">Daily Average</span>
              </div>
            </div>
          </div>
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
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
