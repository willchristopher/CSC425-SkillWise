import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalGoals: 5,
    completedGoals: 2,
    challengesSolved: 12,
    currentStreak: 3,
    totalPoints: 850,
    rank: 15
  });

  const [recentActivity] = useState([
    { id: 1, type: 'challenge', title: 'Two Sum Problem', time: '2 hours ago', points: 10 },
    { id: 2, type: 'goal', title: 'Master React Hooks', time: '1 day ago', points: 50 },
    { id: 3, type: 'challenge', title: 'Binary Tree Traversal', time: '2 days ago', points: 25 },
  ]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            Welcome back! 👋
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
            Here's your learning progress overview
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#3b82f6',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>🎯</span>
              </div>
              <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  {stats.completedGoals}/{stats.totalGoals}
                </h3>
                <p style={{ color: '#6b7280', margin: 0 }}>Goals Completed</p>
              </div>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px'
            }}>
              <div style={{
                width: `${(stats.completedGoals / stats.totalGoals) * 100}%`,
                height: '100%',
                backgroundColor: '#3b82f6',
                borderRadius: '4px'
              }}></div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#10b981',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>⚡</span>
              </div>
              <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  {stats.challengesSolved}
                </h3>
                <p style={{ color: '#6b7280', margin: 0 }}>Challenges Solved</p>
              </div>
            </div>
            <p style={{ color: '#10b981', fontSize: '0.875rem', margin: 0 }}>
              🔥 {stats.currentStreak} day streak!
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#f59e0b',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>💎</span>
              </div>
              <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  {stats.totalPoints}
                </h3>
                <p style={{ color: '#6b7280', margin: 0 }}>Total Points</p>
              </div>
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
              Rank #{stats.rank} globally
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>
            Quick Actions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <Link
              to="/ai-tutor"
              style={{
                display: 'block',
                padding: '1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                textAlign: 'center',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤖</div>
              <div style={{ fontWeight: '600' }}>Get AI Help</div>
            </Link>

            <Link
              to="/challenges"
              style={{
                display: 'block',
                padding: '1.5rem',
                backgroundColor: '#10b981',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                textAlign: 'center',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
              <div style={{ fontWeight: '600' }}>Solve Challenges</div>
            </Link>

            <Link
              to="/goals"
              style={{
                display: 'block',
                padding: '1.5rem',
                backgroundColor: '#8b5cf6',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                textAlign: 'center',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
              <div style={{ fontWeight: '600' }}>Set Goals</div>
            </Link>

            <Link
              to="/leaderboard"
              style={{
                display: 'block',
                padding: '1.5rem',
                backgroundColor: '#f59e0b',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                textAlign: 'center',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
              <div style={{ fontWeight: '600' }}>View Rankings</div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>
            Recent Activity
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentActivity.map(activity => (
              <div key={activity.id} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: activity.type === 'challenge' ? '#3b82f6' : '#10b981',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem'
                }}>
                  <span style={{ color: 'white' }}>
                    {activity.type === 'challenge' ? '⚡' : '🎯'}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#1f2937' }}>
                    {activity.title}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {activity.time}
                  </div>
                </div>
                <div style={{
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  +{activity.points} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;