import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { ProfileIcons, PROFILE_ICON_OPTIONS } from './ProfilePage';
import '../styles/leaderboard.css';

// SVG Icons
const TrophyIcon = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2C13.1 2 14 2.9 14 4V5H17C18.1 5 19 5.9 19 7V8C19 10.21 17.21 12 15 12C14.39 12 13.81 11.85 13.3 11.59C12.85 12.7 11.96 13.56 10.85 13.85L11 20H13V22H7V20H9L9.15 13.85C7.8 13.5 6.71 12.4 6.35 11H6C3.79 11 2 9.21 2 7V6C2 4.9 2.9 4 4 4H6V3C6 2.45 6.45 2 7 2H12ZM4 6V7C4 8.1 4.9 9 6 9H6.09C6.03 8.67 6 8.34 6 8V6H4ZM18 7V6H16V8C16 8.34 15.97 8.67 15.91 9H16C17.1 9 18 8.1 18 7Z"/>
  </svg>
);

const CrownIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.55 18.55 20 18 20H6C5.45 20 5 19.55 5 19V18H19V19Z"/>
  </svg>
);

const MedalIcon = ({ place }) => {
  const colors = {
    1: { primary: '#FFD700', secondary: '#FFA000', accent: '#FFEB3B' },
    2: { primary: '#C0C0C0', secondary: '#9E9E9E', accent: '#E0E0E0' },
    3: { primary: '#CD7F32', secondary: '#A0522D', accent: '#DEB887' }
  };
  const c = colors[place] || colors[3];
  
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="14" r="7" fill={c.primary} stroke={c.secondary} strokeWidth="1.5"/>
      <circle cx="12" cy="14" r="4" fill={c.accent} opacity="0.5"/>
      <path d="M8 2L12 8L16 2" stroke={c.secondary} strokeWidth="2" fill={c.primary}/>
      <text x="12" y="17" textAnchor="middle" fill={c.secondary} fontSize="8" fontWeight="bold">{place}</text>
    </svg>
  );
};

const FireIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

const RocketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
);

const TargetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
  </svg>
);

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRanking, setUserRanking] = useState(null);
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
            profileIcon: entry.profile_image || entry.profileIcon || 'astronaut',
            points: parseInt(entry.total_points) || parseInt(entry.points) || 0,
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

  // Get the icon component for a given icon ID
  const getProfileIcon = (iconId) => {
    const IconComponent = ProfileIcons[iconId];
    return IconComponent ? <IconComponent /> : null;
  };

  // Get icon color for a given icon ID
  const getIconColor = (iconId) => {
    const option = PROFILE_ICON_OPTIONS.find(opt => opt.id === iconId);
    return option?.color || '#6366f1';
  };

  // Top 3 for podium (arranged as 2nd, 1st, 3rd)
  const topThree = leaderboardData.slice(0, 3);
  const podiumOrder = topThree.length >= 3 
    ? [topThree[1], topThree[0], topThree[2]] 
    : topThree;

  // Rest of leaderboard (4th onwards)
  const restOfLeaderboard = leaderboardData.slice(3);

  // Extract user's rank
  const currentUserRank =
    userRanking?.rank_position ||
    userRanking?.rank ||
    leaderboardData.find((u) => u.isCurrentUser)?.rank ||
    0;

  const currentUserData = leaderboardData.find((u) => u.isCurrentUser);

  // Function to retry loading
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeframe('all-time');
  };

  return (
    <AppLayout title="Leaderboard" subtitle="See how you compare with other learners">
      {loading ? (
        <LoadingSpinner message="Loading leaderboard..." />
      ) : error ? (
        <div className="lb-error">
          <p>{error}</p>
          <button onClick={handleRetry} className="btn btn-primary">Retry</button>
        </div>
      ) : (
        <div className="lb-container">
          {/* Filters Section */}
          <div className="lb-filters">
            <div className="lb-filter-group">
              <label htmlFor="timeframe">Timeframe</label>
              <select
                id="timeframe"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="all-time">All Time</option>
                <option value="this-month">This Month</option>
                <option value="this-week">This Week</option>
                <option value="today">Today</option>
              </select>
            </div>
            <div className="lb-filter-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="overall">Overall Points</option>
                <option value="challenges">Challenges</option>
                <option value="goals">Goals</option>
                <option value="streak">Streak</option>
              </select>
            </div>
          </div>

          {/* Your Rank Card */}
          {currentUserRank > 0 && currentUserData && (
            <div className="lb-your-rank">
              <div className="lb-your-rank-left">
                <div 
                  className="lb-your-rank-avatar"
                  style={{ 
                    '--icon-color': getIconColor(currentUserData.profileIcon),
                    backgroundColor: `${getIconColor(currentUserData.profileIcon)}20`
                  }}
                >
                  {getProfileIcon(currentUserData.profileIcon)}
                </div>
                <div className="lb-your-rank-info">
                  <span className="lb-your-rank-label">Your Ranking</span>
                  <span className="lb-your-rank-name">{currentUserData.name}</span>
                </div>
              </div>
              <div className="lb-your-rank-right">
                <div className="lb-your-rank-position">#{currentUserRank}</div>
                <div className="lb-your-rank-stats">
                  <span>{currentUserData.points.toLocaleString()} pts</span>
                  <span className="lb-your-rank-divider">•</span>
                  <span>Top {Math.max(1, Math.round((currentUserRank / leaderboardData.length) * 100))}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Podium Section */}
          <div className="lb-podium-section">
            <div className="lb-section-header">
              <TrophyIcon size={24} />
              <h2>Top Performers</h2>
            </div>
            
            <div className="lb-podium">
              {podiumOrder.map((u, idx) => {
                const actualRank = u.rank;
                const podiumHeight = actualRank === 1 ? 'first' : actualRank === 2 ? 'second' : 'third';
                
                return (
                  <div 
                    key={u.id} 
                    className={`lb-podium-card lb-podium-${podiumHeight}`}
                  >
                    {actualRank === 1 && (
                      <div className="lb-crown">
                        <CrownIcon size={28} />
                      </div>
                    )}
                    <div className="lb-podium-medal">
                      <MedalIcon place={actualRank} />
                    </div>
                    <div 
                      className="lb-podium-avatar"
                      style={{ 
                        '--icon-color': getIconColor(u.profileIcon),
                        backgroundColor: `${getIconColor(u.profileIcon)}15`,
                        borderColor: getIconColor(u.profileIcon)
                      }}
                    >
                      {getProfileIcon(u.profileIcon)}
                    </div>
                    <h3 className="lb-podium-name">{u.name}</h3>
                    <div className="lb-podium-points">
                      <StarIcon />
                      <span>{u.points.toLocaleString()}</span>
                    </div>
                    <div className="lb-podium-challenges">
                      {u.completedChallenges} challenges
                    </div>
                    <div className={`lb-podium-base lb-base-${podiumHeight}`}>
                      <span className="lb-base-rank">{actualRank}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rankings Table */}
          {restOfLeaderboard.length > 0 && (
            <div className="lb-rankings-section">
              <div className="lb-section-header">
                <h2>Complete Rankings</h2>
              </div>
              
              <div className="lb-rankings-grid">
                {restOfLeaderboard.map((u) => (
                  <div 
                    key={u.id} 
                    className={`lb-rank-card ${u.isCurrentUser ? 'lb-rank-you' : ''}`}
                  >
                    <div className="lb-rank-position">
                      <span className="lb-rank-number">#{u.rank}</span>
                    </div>
                    <div 
                      className="lb-rank-avatar"
                      style={{ 
                        '--icon-color': getIconColor(u.profileIcon),
                        backgroundColor: `${getIconColor(u.profileIcon)}15`
                      }}
                    >
                      {getProfileIcon(u.profileIcon)}
                    </div>
                    <div className="lb-rank-info">
                      <span className="lb-rank-name">
                        {u.name}
                        {u.isCurrentUser && <span className="lb-you-badge">You</span>}
                      </span>
                      <span className="lb-rank-meta">
                        {u.completedChallenges} challenges completed
                      </span>
                    </div>
                    <div className="lb-rank-points">
                      <span className="lb-points-value">{u.points.toLocaleString()}</span>
                      <span className="lb-points-label">points</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Achievements */}
          <div className="lb-achievements-section">
            <div className="lb-section-header">
              <h2>Weekly Achievements</h2>
            </div>
            
            <div className="lb-achievements-grid">
              <div className="lb-achievement-card">
                <div className="lb-achievement-icon lb-achievement-rocket">
                  <RocketIcon />
                </div>
                <div className="lb-achievement-content">
                  <h4>Challenge Master</h4>
                  <p>Completed 5 challenges in one day</p>
                  <span className="lb-achievement-earner">Alex Johnson</span>
                </div>
              </div>
              
              <div className="lb-achievement-card">
                <div className="lb-achievement-icon lb-achievement-fire">
                  <FireIcon />
                </div>
                <div className="lb-achievement-content">
                  <h4>Streak Legend</h4>
                  <p>30-day learning streak</p>
                  <span className="lb-achievement-earner">Sarah Kim</span>
                </div>
              </div>
              
              <div className="lb-achievement-card">
                <div className="lb-achievement-icon lb-achievement-target">
                  <TargetIcon />
                </div>
                <div className="lb-achievement-content">
                  <h4>Goal Crusher</h4>
                  <p>Completed 3 learning goals</p>
                  <span className="lb-achievement-earner">Mike Chen</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default LeaderboardPage;
