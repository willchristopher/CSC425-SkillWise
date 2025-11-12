// TODO: Implement progress tracking and analytics page
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProgressBar from '../components/common/ProgressBar';
import './ProgressPage.css';

const ProgressPage = () => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');

  // Mock data - TODO: Replace with API call
  useEffect(() => {
    const mockProgressData = {
      overall: {
        totalPoints: 450,
        level: 5,
        experiencePoints: 1250,
        nextLevelXP: 1500,
        completedGoals: 8,
        totalGoals: 12,
        completedChallenges: 15,
        totalChallenges: 20,
        currentStreak: 7,
        longestStreak: 12
      },
      skills: [
        { name: 'JavaScript', progress: 85, level: 4 },
        { name: 'React', progress: 72, level: 3 },
        { name: 'CSS/Styling', progress: 90, level: 5 },
        { name: 'Node.js', progress: 45, level: 2 },
        { name: 'Database', progress: 60, level: 3 }
      ],
      activeGoals: [
        { id: 1, title: 'Master Frontend Development', progress: 75, dueDate: '2025-12-31' },
        { id: 2, title: 'Learn Backend APIs', progress: 40, dueDate: '2025-11-30' },
        { id: 3, title: 'Build Full-Stack Project', progress: 25, dueDate: '2025-12-15' }
      ]
    };

    setTimeout(() => {
      setProgressData(mockProgressData);
      setLoading(false);
    }, 800);
  }, [timeframe]);

  if (loading) {
    return <LoadingSpinner message="Loading your progress..." />;
  }

  return (
    <div className="progress-page">
      <div className="page-header">
        <Link to="/dashboard" className="back-button">
          ← Back to Dashboard
        </Link>
        <h1>Your Learning Progress</h1>
        <p>Track your journey and celebrate your achievements</p>
      </div>

      {/* Main Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card primary">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h2>Level {progressData.overall.level}</h2>
            <p>Current Level</p>
            <ProgressBar 
              progress={(progressData.overall.experiencePoints / progressData.overall.nextLevelXP) * 100}
              color="purple"
              height="16px"
              animated={true}
            />
            <small className="xp-text">{progressData.overall.experiencePoints} / {progressData.overall.nextLevelXP} XP</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>{progressData.overall.totalPoints}</h3>
            <p>Total Points Earned</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>{progressData.overall.currentStreak} Days</h3>
            <p>Current Streak</p>
            <small>Best: {progressData.overall.longestStreak} days</small>
          </div>
        </div>
      </div>

      {/* Goals Progress Section */}
      <div className="progress-section">
        <div className="section-header">
          <h2>📊 Goals Progress</h2>
          <span className="completion-badge">
            {progressData.overall.completedGoals} / {progressData.overall.totalGoals} Completed
          </span>
        </div>
        
        <div className="overall-progress">
          <ProgressBar 
            progress={(progressData.overall.completedGoals / progressData.overall.totalGoals) * 100}
            label="Overall Goal Completion"
            color="green"
            height="20px"
            animated={true}
          />
        </div>

        <div className="active-goals">
          <h3>Active Goals</h3>
          {progressData.activeGoals.map(goal => (
            <div key={goal.id} className="goal-progress-item">
              <div className="goal-header">
                <span className="goal-title">{goal.title}</span>
                <span className="goal-due">Due: {new Date(goal.dueDate).toLocaleDateString()}</span>
              </div>
              <ProgressBar 
                progress={goal.progress}
                color={goal.progress >= 75 ? 'green' : goal.progress >= 50 ? 'blue' : 'orange'}
                height="14px"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Challenges Progress Section */}
      <div className="progress-section">
        <div className="section-header">
          <h2>🚀 Challenges Completed</h2>
          <span className="completion-badge">
            {progressData.overall.completedChallenges} / {progressData.overall.totalChallenges} Done
          </span>
        </div>
        
        <ProgressBar 
          progress={(progressData.overall.completedChallenges / progressData.overall.totalChallenges) * 100}
          label="Challenge Completion Rate"
          color="blue"
          height="20px"
          animated={true}
        />
      </div>

      {/* Skills Section */}
      <div className="progress-section">
        <div className="section-header">
          <h2>💡 Skill Development</h2>
        </div>
        
        <div className="skills-list">
          {progressData.skills.map((skill, index) => (
            <div key={index} className="skill-item">
              <div className="skill-header">
                <span className="skill-name">{skill.name}</span>
                <span className="skill-level">Level {skill.level}</span>
              </div>
              <ProgressBar 
                progress={skill.progress}
                color={skill.progress >= 80 ? 'green' : skill.progress >= 60 ? 'blue' : 'yellow'}
                height="14px"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;