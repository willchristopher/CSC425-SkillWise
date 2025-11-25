import React, { useState } from 'react';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    username: 'alexjohnson',
    bio: 'Full-stack developer passionate about clean code and continuous learning. Currently focusing on algorithms and system design.',
    location: 'San Francisco, CA',
    website: 'https://alexjohnson.dev',
    github: 'alexjohnson',
    linkedin: 'alexjohnson',
    joinDate: 'January 2024',
    avatar: '🚀'
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    peerReviewAlerts: true,
    challengeReminders: false,
    theme: 'light',
    language: 'en',
    timezone: 'PST'
  });

  const stats = {
    totalPoints: 2850,
    challengesSolved: 87,
    currentStreak: 15,
    longestStreak: 23,
    reviewsGiven: 34,
    reviewsReceived: 28,
    averageRating: 4.6,
    rank: 12,
    totalUsers: 1247
  };

  const achievements = [
    { id: 1, title: 'First Steps', description: 'Completed first challenge', icon: '🎯', earned: true, date: 'Jan 15, 2024' },
    { id: 2, title: 'Code Reviewer', description: 'Provided 10 peer reviews', icon: '👥', earned: true, date: 'Feb 3, 2024' },
    { id: 3, title: 'Streak Master', description: '15+ day streak', icon: '🔥', earned: true, date: 'Mar 1, 2024' },
    { id: 4, title: 'Algorithm Expert', description: 'Solved 50+ algorithm challenges', icon: '🧮', earned: true, date: 'Mar 8, 2024' },
    { id: 5, title: 'Speed Demon', description: 'Solved challenge in under 5 minutes', icon: '⚡', earned: true, date: 'Mar 12, 2024' },
    { id: 6, title: 'Helpful Reviewer', description: 'Received 25+ helpful votes', icon: '⭐', earned: false, date: null },
    { id: 7, title: 'Century Club', description: 'Solved 100+ challenges', icon: '💯', earned: false, date: null },
    { id: 8, title: 'Mentor', description: 'Help 50+ learners through reviews', icon: '🎓', earned: false, date: null }
  ];

  const recentActivity = [
    { type: 'challenge', title: 'Solved "Binary Search Tree Validation"', points: 15, time: '2 hours ago' },
    { type: 'review', title: 'Reviewed Sarah\'s "Merge Sort" solution', points: 5, time: '4 hours ago' },
    { type: 'achievement', title: 'Earned "Algorithm Expert" achievement', points: 50, time: '1 day ago' },
    { type: 'challenge', title: 'Solved "Dynamic Programming - Coin Change"', points: 20, time: '1 day ago' },
    { type: 'review', title: 'Received review on "Graph Traversal" solution', points: 0, time: '2 days ago' }
  ];

  const skillProgress = [
    { skill: 'Algorithms & Data Structures', level: 7, progress: 75, totalChallenges: 45 },
    { skill: 'Frontend Development', level: 5, progress: 60, totalChallenges: 28 },
    { skill: 'Backend Development', level: 6, progress: 45, totalChallenges: 22 },
    { skill: 'Database Design', level: 4, progress: 30, totalChallenges: 15 },
    { skill: 'System Design', level: 3, progress: 20, totalChallenges: 8 }
  ];

  const handleProfileUpdate = () => {
    setIsEditing(false);
    // In real app, would make API call to update profile
    console.log('Profile updated:', profileData);
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    // In real app, would make API call to update preferences
    console.log('Preference updated:', key, value);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'challenge': return '🎯';
      case 'review': return '👥';
      case 'achievement': return '🏆';
      default: return '📝';
    }
  };

  const renderProfileTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Profile Header */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem',
            flexShrink: 0
          }}>
            {profileData.avatar}
          </div>

          <div style={{ flex: 1, minWidth: '300px' }}>
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    padding: '0.5rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  style={{
                    fontSize: '1rem',
                    padding: '0.5rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  style={{
                    fontSize: '1rem',
                    padding: '0.5rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            ) : (
              <>
                <h1 style={{
                  fontSize: '2.25rem',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  {profileData.name}
                </h1>
                <p style={{
                  color: '#6b7280',
                  fontSize: '1.1rem',
                  marginBottom: '1rem'
                }}>
                  @{profileData.username} • {profileData.email}
                </p>
                <p style={{
                  color: '#374151',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  marginBottom: '1rem'
                }}>
                  {profileData.bio}
                </p>
                <div style={{
                  display: 'flex',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                  color: '#6b7280',
                  fontSize: '0.9rem'
                }}>
                  <span>📍 {profileData.location}</span>
                  <span>🌐 {profileData.website}</span>
                  <span>📅 Joined {profileData.joinDate}</span>
                </div>
              </>
            )}

            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1.5rem'
            }}>
              {isEditing ? (
                <>
                  <button
                    onClick={handleProfileUpdate}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem'
      }}>
        {[
          { label: 'Total Points', value: stats.totalPoints.toLocaleString(), icon: '🎖️' },
          { label: 'Challenges Solved', value: stats.challengesSolved, icon: '🎯' },
          { label: 'Current Streak', value: `${stats.currentStreak} days`, icon: '🔥' },
          { label: 'Reviews Given', value: stats.reviewsGiven, icon: '👥' },
          { label: 'Average Rating', value: `${stats.averageRating}/5`, icon: '⭐' },
          { label: 'Global Rank', value: `#${stats.rank}`, icon: '🏆' }
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              {stat.icon}
            </div>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '0.25rem'
            }}>
              {stat.value}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAchievementsTab = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem'
    }}>
      {achievements.map(achievement => (
        <div
          key={achievement.id}
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            opacity: achievement.earned ? 1 : 0.6,
            border: achievement.earned ? '2px solid #10b981' : '2px solid #e5e7eb'
          }}
        >
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            filter: achievement.earned ? 'none' : 'grayscale(1)'
          }}>
            {achievement.icon}
          </div>

          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: 'bold',
            color: achievement.earned ? '#1f2937' : '#9ca3af',
            marginBottom: '0.5rem'
          }}>
            {achievement.title}
          </h3>

          <p style={{
            color: achievement.earned ? '#6b7280' : '#9ca3af',
            marginBottom: '1rem',
            fontSize: '0.95rem'
          }}>
            {achievement.description}
          </p>

          {achievement.earned ? (
            <div style={{
              backgroundColor: '#d1fae5',
              color: '#065f46',
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              Earned {achievement.date}
            </div>
          ) : (
            <div style={{
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              fontSize: '0.875rem'
            }}>
              Not earned yet
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderActivityTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {recentActivity.map((activity, index) => (
        <div
          key={index}
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            flexShrink: 0
          }}>
            {getActivityIcon(activity.type)}
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '0.25rem'
            }}>
              {activity.title}
            </h3>
            <p style={{
              color: '#6b7280',
              fontSize: '0.875rem',
              margin: 0
            }}>
              {activity.time}
            </p>
          </div>

          {activity.points > 0 && (
            <div style={{
              backgroundColor: '#fef3c7',
              color: '#92400e',
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              +{activity.points} pts
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderSettingsTab = () => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '2rem'
      }}>
        Preferences & Settings
      </h2>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        {/* Notifications */}
        <div>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            Notifications
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {[
              { key: 'emailNotifications', label: 'Email notifications' },
              { key: 'pushNotifications', label: 'Push notifications' },
              { key: 'weeklyDigest', label: 'Weekly progress digest' },
              { key: 'peerReviewAlerts', label: 'Peer review alerts' },
              { key: 'challengeReminders', label: 'Daily challenge reminders' }
            ].map(setting => (
              <label
                key={setting.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={preferences[setting.key]}
                  onChange={(e) => handlePreferenceChange(setting.key, e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{
                  fontSize: '1rem',
                  color: '#374151'
                }}>
                  {setting.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* App Preferences */}
        <div>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            App Preferences
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Theme
              </label>
              <select
                value={preferences.theme}
                onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Language
              </label>
              <select
                value={preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Timezone
              </label>
              <select
                value={preferences.timezone}
                onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="PST">Pacific (PST)</option>
                <option value="EST">Eastern (EST)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
            👤 My Profile
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '1.1rem'
          }}>
            Manage your profile, track achievements, and customize preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {[
              { id: 'profile', label: '👤 Profile', icon: '👤' },
              { id: 'achievements', label: '🏆 Achievements', icon: '🏆' },
              { id: 'activity', label: '📈 Activity', icon: '📈' },
              { id: 'settings', label: '⚙️ Settings', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: activeTab === tab.id ? '#3b82f6' : '#f3f4f6',
                  color: activeTab === tab.id ? 'white' : '#374151'
                }}
                onMouseOver={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.backgroundColor = '#e5e7eb';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'achievements' && renderAchievementsTab()}
        {activeTab === 'activity' && renderActivityTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
  );
};

export default ProfilePage;