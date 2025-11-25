import React, { useState } from 'react';

const LeaderboardPage = () => {
  const [timeframe, setTimeframe] = useState('all-time');
  const [category, setCategory] = useState('overall');

  const leaderboardData = {
    'all-time': {
      overall: [
        { rank: 1, name: 'Alex Chen', avatar: '👨‍💻', points: 2450, challenges: 89, streak: 23 },
        { rank: 2, name: 'Sarah Kim', avatar: '👩‍💻', points: 2180, challenges: 78, streak: 15 },
        { rank: 3, name: 'Mike Johnson', avatar: '🧑‍💻', points: 1950, challenges: 71, streak: 12 },
        { rank: 4, name: 'Emma Wilson', avatar: '👩‍💻', points: 1820, challenges: 65, streak: 18 },
        { rank: 5, name: 'David Lee', avatar: '👨‍💻', points: 1650, challenges: 58, streak: 8 },
        { rank: 6, name: 'Lisa Zhang', avatar: '👩‍💻', points: 1480, challenges: 52, streak: 11 },
        { rank: 7, name: 'James Brown', avatar: '🧑‍💻', points: 1320, challenges: 47, streak: 6 },
        { rank: 8, name: 'Anna Davis', avatar: '👩‍💻', points: 1150, challenges: 41, streak: 9 },
        { rank: 9, name: 'Chris Taylor', avatar: '👨‍💻', points: 980, challenges: 36, streak: 4 },
        { rank: 10, name: 'You', avatar: '🚀', points: 850, challenges: 28, streak: 3 }
      ]
    },
    'this-month': {
      overall: [
        { rank: 1, name: 'Sarah Kim', avatar: '👩‍💻', points: 420, challenges: 18, streak: 15 },
        { rank: 2, name: 'Alex Chen', avatar: '👨‍💻', points: 380, challenges: 16, streak: 23 },
        { rank: 3, name: 'Emma Wilson', avatar: '👩‍💻', points: 350, challenges: 15, streak: 18 },
        { rank: 4, name: 'You', avatar: '🚀', points: 180, challenges: 8, streak: 3 },
        { rank: 5, name: 'Mike Johnson', avatar: '🧑‍💻', points: 160, challenges: 7, streak: 12 }
      ]
    }
  };

  const achievements = [
    { title: '🏆 Champion', description: 'Rank #1 overall', requirement: 'First place' },
    { title: '🥈 Runner Up', description: 'Rank #2-3 overall', requirement: 'Top 3' },
    { title: '🥉 Podium Finish', description: 'Rank #4-10 overall', requirement: 'Top 10' },
    { title: '🔥 Streak Master', description: '30+ day streak', requirement: '30 days' },
    { title: '⚡ Speed Demon', description: '100+ challenges solved', requirement: '100 challenges' },
    { title: '💎 Point Collector', description: '2000+ total points', requirement: '2000 points' }
  ];

  const currentData = leaderboardData[timeframe]?.[category] || [];
  const userEntry = currentData.find(entry => entry.name === 'You');

  const getRankColor = (rank) => {
    if (rank === 1) return '#f59e0b'; // Gold
    if (rank === 2) return '#6b7280'; // Silver
    if (rank === 3) return '#92400e'; // Bronze
    return '#3b82f6'; // Default blue
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            🏆 Leaderboard
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '1.1rem'
          }}>
            See how you rank against other learners
          </p>
        </div>

        {/* Your Current Rank Card */}
        {userEntry && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '2px solid #3b82f6'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0
              }}>
                Your Current Rank
              </h2>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  color: getRankColor(userEntry.rank),
                  marginBottom: '0.5rem'
                }}>
                  {getRankIcon(userEntry.rank)}
                </div>
                <p style={{ color: '#6b7280', margin: 0 }}>Rank</p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  {userEntry.points}
                </div>
                <p style={{ color: '#6b7280', margin: 0 }}>Points</p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  {userEntry.challenges}
                </div>
                <p style={{ color: '#6b7280', margin: 0 }}>Challenges</p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#ef4444',
                  marginBottom: '0.5rem'
                }}>
                  {userEntry.streak} 🔥
                </div>
                <p style={{ color: '#6b7280', margin: 0 }}>Day Streak</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="all-time">All Time</option>
                <option value="this-month">This Month</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="overall">Overall</option>
                <option value="algorithms">Algorithms</option>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '3rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            Top Performers - {timeframe.charAt(0).toUpperCase() + timeframe.slice(1).replace('-', ' ')}
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {/* Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr auto auto auto',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              fontWeight: '600',
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              <div>RANK</div>
              <div>USER</div>
              <div style={{ textAlign: 'center' }}>POINTS</div>
              <div style={{ textAlign: 'center' }}>CHALLENGES</div>
              <div style={{ textAlign: 'center' }}>STREAK</div>
            </div>

            {/* Leaderboard Entries */}
            {currentData.map((entry, index) => (
              <div
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr auto auto auto',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: entry.name === 'You' ? '#eff6ff' : '#ffffff',
                  border: entry.name === 'You' ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (entry.name !== 'You') {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }
                }}
                onMouseOut={(e) => {
                  if (entry.name !== 'You') {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: getRankColor(entry.rank)
                }}>
                  {getRankIcon(entry.rank)}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: entry.name === 'You' ? '#3b82f6' : '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    {entry.avatar}
                  </div>
                  <div>
                    <div style={{
                      fontWeight: 'bold',
                      color: '#1f2937',
                      fontSize: '1.1rem'
                    }}>
                      {entry.name}
                      {entry.name === 'You' && (
                        <span style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          marginLeft: '0.5rem'
                        }}>
                          YOU
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  fontSize: '1.1rem'
                }}>
                  {entry.points.toLocaleString()}
                </div>

                <div style={{
                  textAlign: 'center',
                  fontWeight: '600',
                  color: '#6b7280'
                }}>
                  {entry.challenges}
                </div>

                <div style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#ef4444'
                }}>
                  {entry.streak} 🔥
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Gallery */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            🏅 Leaderboard Achievements
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {achievements.map((achievement, index) => (
              <div
                key={index}
                style={{
                  padding: '1.5rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem'
                }}>
                  {achievement.title.split(' ')[0]}
                </div>

                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  {achievement.title.substring(2)}
                </h3>

                <p style={{
                  color: '#6b7280',
                  marginBottom: '1rem',
                  fontSize: '0.95rem'
                }}>
                  {achievement.description}
                </p>

                <div style={{
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  padding: '0.5rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  {achievement.requirement}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;