import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/progress-v2.css';

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

const TrendDownIcon = () => (
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
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

const StarIcon = () => (
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

const CalendarIcon = () => (
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
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const motivationalQuotes = [
  { quote: 'Every expert was once a beginner.', author: 'Helen Hayes' },
  {
    quote: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
  },
  {
    quote: 'Success is the sum of small efforts repeated day in and day out.',
    author: 'Robert Collier',
  },
  {
    quote:
      'Learning is not attained by chance, it must be sought for with ardor.',
    author: 'Abigail Adams',
  },
  {
    quote:
      'The beautiful thing about learning is that no one can take it away from you.',
    author: 'B.B. King',
  },
  {
    quote: 'Progress is impossible without change.',
    author: 'George Bernard Shaw',
  },
  {
    quote:
      'Small daily improvements are the key to staggering long-term results.',
    author: 'Unknown',
  },
  {
    quote:
      'The only limit to our realization of tomorrow is our doubts of today.',
    author: 'Franklin D. Roosevelt',
  },
];

const ProgressPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('weekly');
  const [stats, setStats] = useState({
    totalPoints: 0,
    challengesCompleted: 0,
    goalsCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    experiencePoints: 0,
    peerReviewsGiven: 0,
    peerReviewsReceived: 0,
  });
  const [overview, setOverview] = useState(null);
  const [activityData, setActivityData] = useState([]);
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
      // Group by hour
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
      // Last 7 days
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const key = days[date.getDay()];
        labels.push(key);
        if (!buckets[key]) buckets[key] = { value: 0, activities: 0 };
      }
    } else if (range === 'monthly') {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const key = date.getDate().toString();
        labels.push(key);
        buckets[key] = { value: 0, activities: 0 };
      }
    } else {
      // All time - by month
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

    // Count activities in each bucket
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, overviewRes, activityRes] = await Promise.all([
        apiService.user.getStatistics().catch(() => ({ data: {} })),
        apiService.progress.getOverview().catch(() => ({ data: null })),
        apiService.progress
          .getActivity({ limit: 500 })
          .catch(() => ({ data: { activities: [] } })),
      ]);

      // Extract stats data
      const statsData = statsRes.data?.data || statsRes.data || {};
      setStats({
        totalPoints: statsData.totalPoints || statsData.total_points || 0,
        challengesCompleted:
          statsData.challengesCompleted ||
          statsData.total_challenges_completed ||
          0,
        goalsCompleted:
          statsData.goalsCompleted || statsData.total_goals_completed || 0,
        currentStreak:
          statsData.currentStreak || statsData.current_streak_days || 0,
        longestStreak:
          statsData.longestStreak || statsData.longest_streak_days || 0,
        level: statsData.level || 1,
        experiencePoints:
          statsData.experiencePoints || statsData.experience_points || 0,
        peerReviewsGiven:
          statsData.peerReviewsGiven || statsData.total_peer_reviews_given || 0,
        peerReviewsReceived:
          statsData.peerReviewsReceived ||
          statsData.total_peer_reviews_received ||
          0,
      });

      // Set overview data for goals/challenges breakdown
      const overviewData = overviewRes.data?.data || overviewRes.data || null;
      setOverview(overviewData);

      // Process activity data
      const activities =
        activityRes.data?.data?.activities ||
        activityRes.data?.activities ||
        [];
      const processed = processActivityData(activities, timeRange);
      setActivityData(processed);
    } catch (err) {
      console.error('Error fetching progress data:', err);
      setError('Failed to load progress data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [timeRange, processActivityData]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const activities = activityData;
      if (activities.length > 0) {
        const processed = processActivityData(activities, timeRange);
        setActivityData(processed);
      }
    }
  }, [timeRange]);

  // Get data from overview
  const completedChallenges = overview?.challenges?.completed || 0;
  const totalChallenges =
    overview?.challenges?.total_attempted || stats.challengesCompleted || 1;
  const completedGoals =
    overview?.goals?.completed || stats.goalsCompleted || 0;
  const totalGoals = overview?.goals?.total || 1;

  const calculateXpToNextLevel = (points) => {
    const currentLevel = stats.level || 1;
    const pointsForCurrentLevel = (currentLevel - 1) * 100;
    const pointsForNextLevel = currentLevel * 100;
    return {
      current: points - pointsForCurrentLevel,
      needed: pointsForNextLevel - pointsForCurrentLevel,
      percentage:
        ((points - pointsForCurrentLevel) /
          (pointsForNextLevel - pointsForCurrentLevel)) *
        100,
    };
  };

  const xpProgress = calculateXpToNextLevel(stats.experiencePoints);

  const getTrendInfo = () => {
    if (activityData.length < 2) return { direction: 'neutral', percentage: 0 };
    const recent =
      activityData.slice(-3).reduce((acc, d) => acc + d.value, 0) / 3;
    const earlier =
      activityData.slice(0, 3).reduce((acc, d) => acc + d.value, 0) / 3;
    const diff = earlier > 0 ? ((recent - earlier) / earlier) * 100 : 0;
    return {
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
      percentage: Math.abs(diff).toFixed(1),
    };
  };

  const trend = getTrendInfo();

  if (loading) {
    return (
      <AppLayout title="Progress" subtitle="Track your learning journey">
        <div className="progress-page-v2">
          <LoadingSpinner message="Loading your progress..." />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Progress" subtitle="Track your learning journey">
        <div className="progress-page-v2">
          <div className="error-state">
            <h3>Unable to load progress</h3>
            <p>{error}</p>
            <button onClick={fetchData} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Progress" subtitle="Track your learning journey">
      <div className="progress-page-v2">
        {/* Motivational Header */}
        <div className="motivation-banner">
          <div className="motivation-content">
            <div className="greeting">
              <h1>Keep Going, {user?.firstName || 'Learner'}! 🚀</h1>
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

        {/* Level & XP Progress */}
        <div className="level-section">
          <div className="level-card">
            <div className="level-badge">
              <StarIcon />
              <span className="level-number">Level {stats.level}</span>
            </div>
            <div className="xp-progress">
              <div className="xp-bar">
                <div
                  className="xp-fill"
                  style={{ width: `${xpProgress.percentage}%` }}
                ></div>
              </div>
              <div className="xp-text">
                <span>
                  {xpProgress.current} / {xpProgress.needed} XP to next level
                </span>
                <span className="total-points">
                  {stats.totalPoints} total points
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {/* Challenge Completion Rate */}
          <div className="stat-card challenges">
            <div className="stat-icon">
              <TargetIcon />
            </div>
            <div className="stat-content">
              <span className="stat-value">{completedChallenges}</span>
              <span className="stat-label">Challenges Completed</span>
              <span className="stat-sub">
                {totalChallenges > 0
                  ? Math.round((completedChallenges / totalChallenges) * 100)
                  : 0}
                % completion rate
              </span>
            </div>
          </div>

          {/* Goal Achievement */}
          <div className="stat-card goals">
            <div className="stat-icon">
              <CheckCircleIcon />
            </div>
            <div className="stat-content">
              <span className="stat-value">{completedGoals}</span>
              <span className="stat-label">Goals Achieved</span>
              <span className="stat-sub">
                {totalGoals - completedGoals} in progress
              </span>
            </div>
          </div>

          {/* Points Earned */}
          <div className="stat-card points">
            <div className="stat-icon">
              <TrophyIcon />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalPoints}</span>
              <span className="stat-label">Total Points</span>
              <span className="stat-sub">
                Avg:{' '}
                {completedChallenges > 0
                  ? Math.round(stats.totalPoints / completedChallenges)
                  : 0}
                pts per challenge
              </span>
            </div>
          </div>

          {/* Streak Achievement */}
          <div className="stat-card streak">
            <div className="stat-icon">
              <FlameIcon />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.currentStreak}</span>
              <span className="stat-label">Current Streak</span>
              <span className="stat-sub">
                Record: {stats.longestStreak} days
              </span>
            </div>
          </div>

          {/* Peer Reviews Impact */}
          <div className="stat-card reviews">
            <div className="stat-icon">
              <ZapIcon />
            </div>
            <div className="stat-content">
              <span className="stat-value">
                {stats.peerReviewsGiven + stats.peerReviewsReceived}
              </span>
              <span className="stat-label">Community Engagements</span>
              <span className="stat-sub">
                {stats.peerReviewsGiven} given, {stats.peerReviewsReceived}{' '}
                received
              </span>
            </div>
          </div>

          {/* Activity Momentum */}
          <div className="stat-card trend">
            <div className={`stat-icon ${trend.direction}`}>
              {trend.direction === 'up' ? (
                <TrendUpIcon />
              ) : trend.direction === 'down' ? (
                <TrendDownIcon />
              ) : (
                <TrendUpIcon />
              )}
            </div>
            <div className="stat-content">
              <span className="stat-value">{trend.percentage}%</span>
              <span className="stat-label">Momentum</span>
              <span className={`stat-sub trend-${trend.direction}`}>
                {trend.direction === 'up'
                  ? '↗ Accelerating'
                  : trend.direction === 'down'
                  ? '↘ Slowing'
                  : '→ Steady'}
              </span>
            </div>
          </div>
        </div>

        {/* Activity Chart Section */}
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

          <div className="activity-chart">
            <div className="chart-bars">
              {activityData.map((item, index) => (
                <div key={index} className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{ height: `${item.value}%` }}
                    title={`${item.label}: ${item.value}% activity`}
                  >
                    <span className="bar-value">{item.value}</span>
                  </div>
                  <span className="bar-label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="activity-summary">
            <div className="summary-item">
              <span className="summary-value">
                {activityData.reduce((acc, d) => acc + d.challenges, 0)}
              </span>
              <span className="summary-label">
                Challenges this {timeRange.replace('ly', '')}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-value">
                {activityData.reduce((acc, d) => acc + d.points, 0)}
              </span>
              <span className="summary-label">Points earned</span>
            </div>
            <div className="summary-item">
              <span className="summary-value">
                {Math.round(
                  activityData.reduce((acc, d) => acc + d.value, 0) /
                    activityData.length
                )}
                %
              </span>
              <span className="summary-label">Average activity</span>
            </div>
          </div>
        </div>

        {/* Progress Breakdown */}
        <div className="breakdown-section">
          <div className="breakdown-card">
            <h3>Challenge Breakdown</h3>
            <div className="breakdown-chart">
              <div className="donut-chart">
                <svg viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeDasharray={`${
                      (completedChallenges / Math.max(totalChallenges, 1)) * 100
                    } 100`}
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="3"
                    strokeDasharray={`${
                      ((totalChallenges - completedChallenges) /
                        Math.max(totalChallenges, 1)) *
                      100
                    } 100`}
                    strokeDashoffset={`${-(
                      (completedChallenges / Math.max(totalChallenges, 1)) *
                      100
                    )}`}
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  />
                </svg>
                <div className="donut-center">
                  <span className="donut-value">{totalChallenges}</span>
                  <span className="donut-label">Total</span>
                </div>
              </div>
              <div className="breakdown-legend">
                <div className="legend-item">
                  <span className="legend-dot completed"></span>
                  <span className="legend-text">
                    Completed ({completedChallenges})
                  </span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot in-progress"></span>
                  <span className="legend-text">
                    Attempted ({totalChallenges - completedChallenges})
                  </span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot not-started"></span>
                  <span className="legend-text">
                    Success Rate (
                    {totalChallenges > 0
                      ? Math.round(
                          (completedChallenges / totalChallenges) * 100
                        )
                      : 0}
                    %)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="breakdown-card">
            <h3>Goals Progress</h3>
            <div className="goals-list">
              {totalGoals > 0 ? (
                <div>
                  <div className="goal-item">
                    <div className="goal-info">
                      <span className="goal-title">Goals Completed</span>
                      <span className="goal-progress">
                        {Math.round((completedGoals / totalGoals) * 100)}%
                      </span>
                    </div>
                    <div className="goal-bar">
                      <div
                        className="goal-fill"
                        style={{
                          width: `${(completedGoals / totalGoals) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: '1.5rem',
                      paddingTop: '1.5rem',
                      borderTop: '1px solid #e2e8f0',
                    }}
                  >
                    <div
                      className="legend-item"
                      style={{ marginBottom: '0.5rem' }}
                    >
                      <span className="legend-text">
                        <strong>{completedGoals}</strong> completed goals
                      </span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-text">
                        <strong>{totalGoals - completedGoals}</strong> goals in
                        progress
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-goals">
                  <p>No goals yet. Set some goals to track your progress!</p>
                  <a href="/goals" className="btn btn-secondary">
                    Create Goals
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Achievements Preview */}
        <div className="achievements-section">
          <div className="section-header">
            <h2>Recent Achievements</h2>
            <a href="/leaderboard" className="view-all">
              View All →
            </a>
          </div>
          <div className="achievements-grid">
            {completedChallenges > 0 && (
              <div className="achievement-card unlocked">
                <div className="achievement-icon">🎯</div>
                <div className="achievement-info">
                  <span className="achievement-name">First Challenge</span>
                  <span className="achievement-desc">
                    Completed your first challenge
                  </span>
                </div>
              </div>
            )}
            {stats.currentStreak >= 3 && (
              <div className="achievement-card unlocked">
                <div className="achievement-icon">🔥</div>
                <div className="achievement-info">
                  <span className="achievement-name">On Fire!</span>
                  <span className="achievement-desc">
                    3-day learning streak
                  </span>
                </div>
              </div>
            )}
            {stats.peerReviewsGiven > 0 && (
              <div className="achievement-card unlocked">
                <div className="achievement-icon">🤝</div>
                <div className="achievement-info">
                  <span className="achievement-name">Helpful Peer</span>
                  <span className="achievement-desc">
                    Gave your first peer review
                  </span>
                </div>
              </div>
            )}
            {stats.currentStreak >= 7 && (
              <div className="achievement-card unlocked">
                <div className="achievement-icon">⭐</div>
                <div className="achievement-info">
                  <span className="achievement-name">Week Warrior</span>
                  <span className="achievement-desc">
                    7-day learning streak
                  </span>
                </div>
              </div>
            )}
            {completedChallenges < 1 && (
              <div className="achievement-card locked">
                <div className="achievement-icon">🔒</div>
                <div className="achievement-info">
                  <span className="achievement-name">First Steps</span>
                  <span className="achievement-desc">
                    Complete your first challenge
                  </span>
                </div>
              </div>
            )}
            {stats.currentStreak < 7 && (
              <div className="achievement-card locked">
                <div className="achievement-icon">🔒</div>
                <div className="achievement-info">
                  <span className="achievement-name">Week Warrior</span>
                  <span className="achievement-desc">
                    Maintain a 7-day streak
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="cta-section">
          <div className="cta-card">
            <div className="cta-content">
              <h3>Ready for your next challenge?</h3>
              <p>
                Keep the momentum going! Every challenge you complete brings you
                closer to your goals.
              </p>
            </div>
            <a href="/challenges" className="btn btn-primary btn-lg">
              Browse Challenges
            </a>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProgressPage;
