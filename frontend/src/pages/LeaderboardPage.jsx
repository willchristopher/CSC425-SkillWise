import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import '../styles/pages.css';

// SVG Icons
const TrophyIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const UserIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const RocketIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const FlameIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const TargetIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRanking, setUserRanking] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('all-time');
  const [category, setCategory] = useState('overall');
  const { user } = useAuth();

  // Fetch leaderboard data from API
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Map timeframe to API format
        const timeframeMap = {
          'all-time': 'all-time',
          'this-month': 'monthly',
          'this-week': 'weekly',
          today: 'daily',
        };

        const apiTimeframe = timeframeMap[timeframe] || 'all-time';

        // Fetch leaderboard data
        const [leaderboardRes, rankingRes, achievementsRes] = await Promise.all(
          [
            apiService.leaderboard.getGlobal({
              timeframe: apiTimeframe,
              limit: 50,
            }),
            apiService.leaderboard.getUserRank(),
            apiService.leaderboard.getGlobal({
              timeframe: apiTimeframe,
              limit: 3,
            }),
          ]
        ).catch((errs) => {
          console.error('Error fetching leaderboard:', errs);
          return [null, null, null];
        });

        if (leaderboardRes?.data?.success) {
          const leaderboard =
            leaderboardRes.data.data.rankings || leaderboardRes.data.data || [];

          // Format leaderboard data
          const formattedData = leaderboard.map((entry, index) => ({
            id: entry.user_id || entry.id,
            rank: parseInt(entry.rank_position) || entry.rank || index + 1,
            name:
              entry.name ||
              `${entry.first_name || ''} ${entry.last_name || ''}`.trim() ||
              'Unknown User',
            initials: getInitials(
              entry.name || `${entry.first_name || ''} ${entry.last_name || ''}`
            ),
            points: parseInt(entry.total_points) || parseInt(entry.points) || 0,
            level: parseInt(entry.level) || 1,
            completedChallenges:
              parseInt(entry.total_challenges_completed) ||
              parseInt(entry.challenges_completed) ||
              0,
            isCurrentUser: entry.user_id === user?.id || entry.id === user?.id,
          }));

          setLeaderboardData(formattedData);
        }

        if (rankingRes?.data?.success) {
          setUserRanking(rankingRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard data. Please try again.');
        // Set empty data on error
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [timeframe, category, user?.id]);

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
    }
    return (name[0] || '?').toUpperCase();
  };

  const getRankDisplay = (rank) => {
    switch (rank) {
      case 1:
        return <span className="rank-gold">1st</span>;
      case 2:
        return <span className="rank-silver">2nd</span>;
      case 3:
        return <span className="rank-bronze">3rd</span>;
      default:
        return `#${rank}`;
    }
  };

  // Extract user's rank from ranking response or from leaderboard data
  const currentUserRank =
    userRanking?.rank_position ||
    userRanking?.rank ||
    leaderboardData.find((u) => u.isCurrentUser)?.rank ||
    0;

  // Function to retry loading
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeframe('all-time'); // Trigger re-fetch via useEffect
  };

  return (
    <AppLayout
      title="Leaderboard"
      subtitle="See how you compare with other learners"
    >
      {loading ? (
        <LoadingSpinner message="Loading leaderboard..." />
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={handleRetry} className="btn btn-primary">
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="leaderboard-filters">
            <div className="filter-group">
              <label className="filter-label" htmlFor="timeframe">
                Timeframe
              </label>
              <select
                id="timeframe"
                className="filter-select"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="all-time">All Time</option>
                <option value="this-month">This Month</option>
                <option value="this-week">This Week</option>
                <option value="today">Today</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                className="filter-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="overall">Overall Points</option>
                <option value="challenges">Challenges Completed</option>
                <option value="goals">Goals Achieved</option>
                <option value="streak">Learning Streak</option>
              </select>
            </div>
          </div>

          {currentUserRank > 0 && (
            <div className="rank-summary">
              <h3>Your Ranking</h3>
              <div className="rank-info">
                <span className="rank-number">#{currentUserRank}</span>
                <div>
                  <p>
                    You're in the top{' '}
                    {Math.round(
                      (currentUserRank / leaderboardData.length) * 100
                    )}
                    % of learners!
                  </p>
                  <small>Keep learning to climb higher!</small>
                </div>
              </div>
            </div>
          )}

          <div className="podium-section">
            <h2 className="profile-section-title">Top Performers</h2>
            <div className="podium">
              {leaderboardData.slice(0, 3).map((u) => (
                <div key={u.id} className="podium-position">
                  <div className="avatar">{u.initials}</div>
                  <h4 className="podium-name">{u.name}</h4>
                  <p className="podium-points">{u.points} points</p>
                  <span className="level-badge">Level {u.level}</span>
                  <div style={{ marginTop: '0.75rem' }}>
                    {getRankDisplay(u.rank)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="profile-section-title">Complete Rankings</h2>
            <div className="leaderboard-table">
              <div className="table-header">
                <div>Rank</div>
                <div>User</div>
                <div>Points</div>
                <div>Level</div>
                <div>Challenges</div>
              </div>

              {leaderboardData.map((u) => (
                <div
                  key={u.id}
                  className={`table-row ${
                    u.isCurrentUser ? 'current-user' : ''
                  }`}
                >
                  <div>{getRankDisplay(u.rank)}</div>
                  <div className="user-info">
                    <span className="avatar avatar-sm">{u.initials}</span>
                    <span>
                      {u.name}
                      {u.isCurrentUser && <small> (You)</small>}
                    </span>
                  </div>
                  <div>
                    <strong>{u.points.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="level-badge">Level {u.level}</span>
                  </div>
                  <div>{u.completedChallenges}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="profile-section-title">
              Top Achievements This Week
            </h2>
            <div className="achievements-grid">
              <div className="achievement-card">
                <div className="achievement-icon">
                  <RocketIcon />
                </div>
                <h4 className="achievement-title">Challenge Master</h4>
                <p className="achievement-description">
                  Completed 5 challenges in one day
                </p>
                <small className="achievement-earned">
                  Earned by Alex Johnson
                </small>
              </div>

              <div className="achievement-card">
                <div className="achievement-icon">
                  <FlameIcon />
                </div>
                <h4 className="achievement-title">Streak Legend</h4>
                <p className="achievement-description">
                  30-day learning streak
                </p>
                <small className="achievement-earned">
                  Earned by Sarah Kim
                </small>
              </div>

              <div className="achievement-card">
                <div className="achievement-icon">
                  <TargetIcon />
                </div>
                <h4 className="achievement-title">Goal Crusher</h4>
                <p className="achievement-description">
                  Completed 3 learning goals
                </p>
                <small className="achievement-earned">
                  Earned by Mike Chen
                </small>
              </div>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default LeaderboardPage;
