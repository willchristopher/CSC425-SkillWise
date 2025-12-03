import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';
import ProgressBar from './ProgressBar';
import CircularProgress from './CircularProgress';
import LinearProgress from './LinearProgress';
import MultiProgress from './MultiProgress';
import '../../styles/progress-v2.css';
import '../../styles/dashboard.css';

const ProgressDashboard = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState({
    overall: { completed: 0, total: 0 },
    challenges: { completed: 0, total: 0 },
    goals: { completed: 0, total: 0 },
    byDifficulty: [],
    byCategory: [],
    recent: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgressData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user progress statistics with error handling
      const [challengesResponse, goalsResponse] = await Promise.all([
        apiService.challenges.getAll().catch((err) => {
          console.error('Failed to fetch challenges:', err);
          return { data: [] };
        }),
        apiService.goals.getAll().catch((err) => {
          console.error('Failed to fetch goals:', err);
          return { data: [] };
        }),
      ]);

      // Handle both response.data and response.data.data structures
      const challengesData =
        challengesResponse.data?.data || challengesResponse.data || [];
      const goalsData = goalsResponse.data?.data || goalsResponse.data || [];

      const challenges = Array.isArray(challengesData) ? challengesData : [];
      const goals = Array.isArray(goalsData) ? goalsData : [];

      // Calculate progress metrics
      const completedChallenges = challenges.filter(
        (c) => c.status === 'completed' || c.is_completed
      ).length;
      const completedGoals = goals.filter(
        (g) => g.status === 'completed' || g.is_completed
      ).length;

      // Group challenges by difficulty
      const difficultyStats = challenges.reduce((acc, challenge) => {
        const difficulty =
          challenge.difficulty_level || challenge.difficulty || 'medium';
        if (!acc[difficulty]) {
          acc[difficulty] = { total: 0, completed: 0 };
        }
        acc[difficulty].total++;
        if (challenge.status === 'completed' || challenge.is_completed) {
          acc[difficulty].completed++;
        }
        return acc;
      }, {});

      // Group challenges by category/tags
      const categoryStats = challenges.reduce((acc, challenge) => {
        const tags = challenge.tags || [challenge.category] || ['General'];
        const tagArray = Array.isArray(tags) ? tags : [tags];
        tagArray.forEach((tag) => {
          if (!acc[tag]) {
            acc[tag] = { total: 0, completed: 0 };
          }
          acc[tag].total++;
          if (challenge.status === 'completed' || challenge.is_completed) {
            acc[tag].completed++;
          }
        });
        return acc;
      }, {});

      // Format data for components
      const byDifficulty = Object.entries(difficultyStats).map(
        ([difficulty, data]) => ({
          id: difficulty,
          label: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
          completed: data.completed,
          total: data.total,
          icon: getDifficultyIcon(difficulty),
          color: getDifficultyColor(difficulty),
        })
      );

      const byCategory = Object.entries(categoryStats)
        .sort(([, a], [, b]) => b.total - a.total)
        .slice(0, 5) // Top 5 categories
        .map(([category, data], index) => ({
          id: category,
          label: category,
          completed: data.completed,
          total: data.total,
          icon: '📚',
          color: getCategoryColor(index),
        }));

      setProgressData({
        overall: {
          completed: completedChallenges + completedGoals,
          total: challenges.length + goals.length,
        },
        challenges: {
          completed: completedChallenges,
          total: challenges.length,
        },
        goals: {
          completed: completedGoals,
          total: goals.length,
        },
        byDifficulty,
        byCategory,
        recent: challenges
          .filter((c) => c.status === 'completed')
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 5),
      });
    } catch (err) {
      console.error('Error fetching progress data:', err);
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      easy: '🟢',
      medium: '🟡',
      hard: '🔴',
    };
    return icons[difficulty] || '⚪';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: '#38a169',
      medium: '#ed8936',
      hard: '#e53e3e',
    };
    return colors[difficulty] || '#3182ce';
  };

  const getCategoryColor = (index) => {
    const colors = ['#3182ce', '#38a169', '#ed8936', '#e53e3e', '#805ad5'];
    return colors[index % colors.length];
  };

  const calculatePercentage = (completed, total) => {
    if (
      !total ||
      total === 0 ||
      !Number.isFinite(completed) ||
      !Number.isFinite(total)
    ) {
      return 0;
    }
    const percentage = (completed / total) * 100;
    return Math.min(100, Math.max(0, Math.round(percentage)));
  };

  if (loading) {
    return (
      <div className="progress-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p className="loading-message">Loading progress data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-dashboard error">
        <div className="error-message">
          <h3>Error Loading Progress</h3>
          <p>{error}</p>
          <button onClick={fetchProgressData} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-dashboard">
      <div className="dashboard-header">
        <h2>Learning Progress</h2>
        <p>Track your journey and achievements</p>
      </div>

      <div className="dashboard-grid">
        {/* Overall Progress */}
        <div className="dashboard-section overall-progress">
          <h3>Overall Progress</h3>
          {progressData.overall.total === 0 ? (
            <div className="progress-placeholder">
              <CircularProgress
                percentage={0}
                size={150}
                label="Get Started"
                details="Create goals and challenges to begin"
                animated={false}
              />
              <p className="placeholder-hint">
                Start your learning journey today!
              </p>
            </div>
          ) : (
            <CircularProgress
              percentage={calculatePercentage(
                progressData.overall.completed,
                progressData.overall.total
              )}
              size={150}
              label="Complete"
              details={`${progressData.overall.completed} of ${progressData.overall.total} items completed`}
              animated={true}
            />
          )}
        </div>

        {/* Challenges Progress */}
        <div className="dashboard-section challenges-progress">
          <LinearProgress
            percentage={calculatePercentage(
              progressData.challenges.completed,
              progressData.challenges.total
            )}
            title="Challenges"
            details={{
              completed: progressData.challenges.completed,
              total: progressData.challenges.total,
            }}
            color="#3182ce"
            showStripes={progressData.challenges.completed > 0}
            animated={true}
          />
        </div>

        {/* Goals Progress */}
        <div className="dashboard-section goals-progress">
          <LinearProgress
            percentage={calculatePercentage(
              progressData.goals.completed,
              progressData.goals.total
            )}
            title="Goals"
            details={{
              completed: progressData.goals.completed,
              total: progressData.goals.total,
            }}
            color="#38a169"
            animated={true}
          />
        </div>

        {/* Progress by Difficulty */}
        {progressData.byDifficulty.length > 0 && (
          <div className="dashboard-section difficulty-progress">
            <MultiProgress
              title="Progress by Difficulty"
              subtitle="Challenge completion by difficulty level"
              items={progressData.byDifficulty}
              animated={true}
            />
          </div>
        )}

        {/* Progress by Category */}
        {progressData.byCategory.length > 0 && (
          <div className="dashboard-section category-progress">
            <MultiProgress
              title="Progress by Category"
              subtitle="Top learning categories"
              items={progressData.byCategory}
              animated={true}
            />
          </div>
        )}

        {/* Recent Completions */}
        {progressData.recent.length > 0 && (
          <div className="dashboard-section recent-completions">
            <h3>Recent Completions</h3>
            <div className="recent-list">
              {progressData.recent.map((item, index) => (
                <div key={item.id} className="recent-item">
                  <div className="recent-icon">🏆</div>
                  <div className="recent-content">
                    <h4>{item.title}</h4>
                    <p>
                      {item.points} points • {item.difficulty}
                    </p>
                  </div>
                  <div className="recent-date">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Progress Chart */}
        <div className="dashboard-section weekly-progress">
          <h3>Weekly Activity</h3>
          <ProgressBar
            data={[
              { name: 'Mon', completed: 75, remaining: 25 },
              { name: 'Tue', completed: 60, remaining: 40 },
              { name: 'Wed', completed: 90, remaining: 10 },
              { name: 'Thu', completed: 45, remaining: 55 },
              { name: 'Fri', completed: 80, remaining: 20 },
              { name: 'Sat', completed: 30, remaining: 70 },
              { name: 'Sun', completed: 95, remaining: 5 },
            ]}
            type="vertical"
            height={200}
            showLabels={false}
            showLegend={true}
            colors={['#3182ce', '#e2e8f0']}
            animate={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
