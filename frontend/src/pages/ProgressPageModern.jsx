import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';

// UI Components
import { Alert, Badge, Button, Card, Loading } from '../components/ui';

const ProgressPageModern = () => {
  const { user } = useAuth();
  
  // State management
  const [progressData, setProgressData] = useState(null);
  const [skillsData, setSkillsData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeFrame, setTimeFrame] = useState('month'); // 'week', 'month', 'year'

  // Fetch progress data
  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch all progress-related data in parallel
        const [overviewResponse, skillsResponse, activityResponse] = await Promise.allSettled([
          apiService.progress.getOverview(),
          apiService.progress.getSkills(),
          apiService.progress.getActivity({ timeFrame }),
        ]);

        // Handle overview data
        if (overviewResponse.status === 'fulfilled') {
          setProgressData(overviewResponse.value.data?.data || overviewResponse.value.data || {});
        }

        // Handle skills data
        if (skillsResponse.status === 'fulfilled') {
          const skills = skillsResponse.value.data?.data || skillsResponse.value.data || [];
          setSkillsData(Array.isArray(skills) ? skills : []);
        }

        // Handle activity data
        if (activityResponse.status === 'fulfilled') {
          const activity = activityResponse.value.data?.data || activityResponse.value.data || [];
          setActivityData(Array.isArray(activity) ? activity : []);
        }

      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load progress data';
        setError(errorMessage);
        console.error('Failed to fetch progress data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [timeFrame]);

  const getProgressPercentage = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getSkillLevel = (points) => {
    if (points >= 1000) return { level: 'Expert', color: 'success' };
    if (points >= 500) return { level: 'Advanced', color: 'warning' };
    if (points >= 100) return { level: 'Intermediate', color: 'info' };
    return { level: 'Beginner', color: 'secondary' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="page">
        <Loading size="large" text="Loading your progress..." />
      </div>
    );
  }

  // Default progress data if API returns empty
  const defaultProgress = {
    total_points: 0,
    goals_completed: 0,
    challenges_completed: 0,
    current_streak: 0,
    total_goals: 0,
    total_challenges_attempted: 0,
    learning_time_minutes: 0,
    ...progressData
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Your Learning Progress</h1>
          <p className="page-subtitle">
            Welcome back, {user?.firstName || user?.first_name || 'learner'}! 
            Here's your learning journey at a glance.
          </p>
        </div>
        <div className="header-actions">
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            className="filter-select"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Progress Overview */}
      <div className="stats-grid">
        <Card className="stat-card">
          <Card.Content>
            <div className="stat-header">
              <div className="stat-icon">🎯</div>
              <div className="stat-number">{defaultProgress.total_points}</div>
            </div>
            <div className="stat-label">Total Points</div>
            <div className="stat-change">
              +{Math.round(defaultProgress.total_points * 0.1)} this {timeFrame}
            </div>
          </Card.Content>
        </Card>

        <Card className="stat-card">
          <Card.Content>
            <div className="stat-header">
              <div className="stat-icon">✅</div>
              <div className="stat-number">{defaultProgress.goals_completed}</div>
            </div>
            <div className="stat-label">Goals Completed</div>
            <div className="stat-meta">
              {defaultProgress.total_goals > 0 && 
                `${getProgressPercentage(defaultProgress.goals_completed, defaultProgress.total_goals)}% of ${defaultProgress.total_goals}`
              }
            </div>
          </Card.Content>
        </Card>

        <Card className="stat-card">
          <Card.Content>
            <div className="stat-header">
              <div className="stat-icon">🏆</div>
              <div className="stat-number">{defaultProgress.challenges_completed}</div>
            </div>
            <div className="stat-label">Challenges Completed</div>
            <div className="stat-meta">
              {defaultProgress.total_challenges_attempted > 0 && 
                `${getProgressPercentage(defaultProgress.challenges_completed, defaultProgress.total_challenges_attempted)}% success rate`
              }
            </div>
          </Card.Content>
        </Card>

        <Card className="stat-card">
          <Card.Content>
            <div className="stat-header">
              <div className="stat-icon">🔥</div>
              <div className="stat-number">{defaultProgress.current_streak}</div>
            </div>
            <div className="stat-label">Day Streak</div>
            <div className="stat-meta">
              {Math.round((defaultProgress.learning_time_minutes || 0) / 60)} hours total
            </div>
          </Card.Content>
        </Card>
      </div>

      <div className="content-grid">
        {/* Skills Progress */}
        <Card className="progress-card">
          <Card.Header>
            <h3>Skills Overview</h3>
          </Card.Header>
          <Card.Content>
            {skillsData.length > 0 ? (
              <div className="skills-list">
                {skillsData.map((skill) => {
                  const skillInfo = getSkillLevel(skill.points || 0);
                  return (
                    <div key={skill.skill_name || skill.name} className="skill-item">
                      <div className="skill-header">
                        <span className="skill-name">{skill.skill_name || skill.name}</span>
                        <Badge variant={skillInfo.color} size="small">
                          {skillInfo.level}
                        </Badge>
                      </div>
                      <div className="skill-stats">
                        <span className="skill-points">{skill.points || 0} points</span>
                        <span className="skill-challenges">
                          {skill.challenges_completed || 0} challenges
                        </span>
                      </div>
                      <div className="skill-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${Math.min((skill.points || 0) / 10, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-section">
                <div className="empty-icon">📈</div>
                <p>No skills data available yet.</p>
                <p className="text-sm text-gray-500">
                  Complete challenges to build your skill profile!
                </p>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Recent Activity */}
        <Card className="progress-card">
          <Card.Header>
            <h3>Recent Activity</h3>
          </Card.Header>
          <Card.Content>
            {activityData.length > 0 ? (
              <div className="activity-list">
                {activityData.slice(0, 10).map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      {activity.type === 'goal_completed' ? '🎯' :
                       activity.type === 'challenge_completed' ? '🏆' :
                       activity.type === 'skill_gained' ? '📈' : '✨'}
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">
                        {activity.title || activity.description || 'Activity'}
                      </div>
                      <div className="activity-meta">
                        {activity.points && `+${activity.points} points`}
                        {activity.created_at && ` • ${formatDate(activity.created_at)}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-section">
                <div className="empty-icon">📝</div>
                <p>No recent activity to show.</p>
                <p className="text-sm text-gray-500">
                  Start learning to see your progress here!
                </p>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Learning Goals Progress */}
        <Card className="progress-card full-width">
          <Card.Header>
            <h3>Learning Goals Progress</h3>
            <Button variant="outline" size="small">
              View All Goals
            </Button>
          </Card.Header>
          <Card.Content>
            <div className="goals-progress-grid">
              {/* This would be populated with actual goals data */}
              <div className="goal-progress-item">
                <div className="goal-info">
                  <span className="goal-title">Master React Fundamentals</span>
                  <Badge variant="warning">In Progress</Badge>
                </div>
                <div className="goal-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '75%' }} />
                  </div>
                  <span className="progress-text">75% complete</span>
                </div>
              </div>
              
              <div className="goal-progress-item">
                <div className="goal-info">
                  <span className="goal-title">Learn JavaScript ES6+</span>
                  <Badge variant="success">Completed</Badge>
                </div>
                <div className="goal-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '100%' }} />
                  </div>
                  <span className="progress-text">100% complete</span>
                </div>
              </div>
              
              <div className="goal-progress-item">
                <div className="goal-info">
                  <span className="goal-title">Algorithm Challenges</span>
                  <Badge variant="info">Started</Badge>
                </div>
                <div className="goal-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '25%' }} />
                  </div>
                  <span className="progress-text">25% complete</span>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="action-cards">
        <Card className="action-card">
          <Card.Content>
            <h4>Continue Learning</h4>
            <p>You have 3 active challenges waiting to be completed.</p>
            <Button>View Challenges</Button>
          </Card.Content>
        </Card>

        <Card className="action-card">
          <Card.Content>
            <h4>Set New Goals</h4>
            <p>Planning helps you stay focused and motivated.</p>
            <Button variant="outline">Create Goal</Button>
          </Card.Content>
        </Card>

        <Card className="action-card">
          <Card.Content>
            <h4>Get AI Feedback</h4>
            <p>Improve your skills with personalized AI recommendations.</p>
            <Button variant="outline">Get Feedback</Button>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default ProgressPageModern;