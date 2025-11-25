import React, { useState } from 'react';

const ProgressPage = () => {
  const [timeRange, setTimeRange] = useState('week');
  
  const progressData = {
    week: {
      challengesSolved: 8,
      studyTime: 12,
      pointsEarned: 180,
      streakDays: 5,
      activities: [
        { date: '2024-01-20', challenges: 2, time: 3, points: 45 },
        { date: '2024-01-21', challenges: 1, time: 2, points: 25 },
        { date: '2024-01-22', challenges: 3, time: 4, points: 60 },
        { date: '2024-01-23', challenges: 1, time: 1, points: 15 },
        { date: '2024-01-24', challenges: 1, time: 2, points: 35 }
      ]
    },
    month: {
      challengesSolved: 35,
      studyTime: 48,
      pointsEarned: 720,
      streakDays: 12,
      activities: []
    }
  };

  const skillProgress = [
    { skill: 'JavaScript', progress: 85, level: 'Advanced' },
    { skill: 'React', progress: 70, level: 'Intermediate' },
    { skill: 'Algorithms', progress: 45, level: 'Beginner' },
    { skill: 'Node.js', progress: 60, level: 'Intermediate' },
    { skill: 'Database Design', progress: 35, level: 'Beginner' }
  ];

  const achievements = [
    { id: 1, title: '🔥 Week Warrior', description: 'Solved challenges for 7 days straight', earned: true },
    { id: 2, title: '🚀 Speed Demon', description: 'Solved 10 challenges in one day', earned: true },
    { id: 3, title: '🧠 Problem Solver', description: 'Completed 50 total challenges', earned: false },
    { id: 4, title: '💎 Point Master', description: 'Earned 1000 total points', earned: false }
  ];

  const currentData = progressData[timeRange];

  const getSkillColor = (progress) => {
    if (progress >= 80) return '#10b981';
    if (progress >= 60) return '#3b82f6';
    if (progress >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Advanced': return { bg: '#dcfce7', color: '#166534' };
      case 'Intermediate': return { bg: '#dbeafe', color: '#1d4ed8' };
      case 'Beginner': return { bg: '#fef3c7', color: '#d97706' };
      default: return { bg: '#f3f4f6', color: '#374151' };
    }
  };

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
            📊 Learning Progress
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '1.1rem'
          }}>
            Track your coding journey and skill development
          </p>
        </div>

        {/* Time Range Selector */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '0.5rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            {['week', 'month'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  padding: '0.75rem 2rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: timeRange === range ? '#3b82f6' : 'transparent',
                  color: timeRange === range ? 'white' : '#6b7280',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textTransform: 'capitalize'
                }}
              >
                This {range}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
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
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem'
            }}>
              ⚡
            </div>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              {currentData.challengesSolved}
            </h3>
            <p style={{ color: '#6b7280', margin: 0 }}>Challenges Solved</p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem'
            }}>
              ⏰
            </div>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              {currentData.studyTime}h
            </h3>
            <p style={{ color: '#6b7280', margin: 0 }}>Study Time</p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#f59e0b',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem'
            }}>
              💎
            </div>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              {currentData.pointsEarned}
            </h3>
            <p style={{ color: '#6b7280', margin: 0 }}>Points Earned</p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem'
            }}>
              🔥
            </div>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              {currentData.streakDays}
            </h3>
            <p style={{ color: '#6b7280', margin: 0 }}>Day Streak</p>
          </div>
        </div>

        {/* Skills Progress */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '3rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ marginRight: '0.5rem' }}>🎯</span>
            Skill Progress
          </h2>

          <div style={{
            display: 'grid',
            gap: '1.5rem'
          }}>
            {skillProgress.map((skill, index) => (
              <div key={index} style={{
                padding: '1.5rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      margin: 0
                    }}>
                      {skill.skill}
                    </h3>
                    <span style={{
                      backgroundColor: getLevelColor(skill.level).bg,
                      color: getLevelColor(skill.level).color,
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {skill.level}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: getSkillColor(skill.progress)
                  }}>
                    {skill.progress}%
                  </span>
                </div>

                <div style={{
                  width: '100%',
                  height: '12px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${skill.progress}%`,
                    height: '100%',
                    backgroundColor: getSkillColor(skill.progress),
                    borderRadius: '6px',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '3rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ marginRight: '0.5rem' }}>🏆</span>
            Achievements
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {achievements.map(achievement => (
              <div key={achievement.id} style={{
                padding: '1.5rem',
                backgroundColor: achievement.earned ? '#f0fdf4' : '#f9fafb',
                borderRadius: '8px',
                border: `2px solid ${achievement.earned ? '#10b981' : '#e5e7eb'}`,
                opacity: achievement.earned ? 1 : 0.6
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: achievement.earned ? '#065f46' : '#6b7280',
                    margin: 0,
                    flex: 1
                  }}>
                    {achievement.title}
                  </h3>
                  {achievement.earned && (
                    <span style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      EARNED
                    </span>
                  )}
                </div>
                <p style={{
                  color: achievement.earned ? '#047857' : '#6b7280',
                  margin: 0,
                  fontSize: '0.95rem'
                }}>
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Timeline (Weekly view only) */}
        {timeRange === 'week' && currentData.activities.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '0.5rem' }}>📅</span>
              Daily Activity
            </h2>

            <div style={{
              display: 'grid',
              gap: '1rem'
            }}>
              {currentData.activities.map((activity, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    minWidth: '120px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    {new Date(activity.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>

                  <div style={{
                    flex: 1,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>⚡</span>
                      <span style={{ color: '#6b7280' }}>
                        {activity.challenges} challenges
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>⏰</span>
                      <span style={{ color: '#6b7280' }}>
                        {activity.time}h study time
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>💎</span>
                      <span style={{ 
                        color: '#10b981',
                        fontWeight: '600'
                      }}>
                        +{activity.points} points
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressPage;