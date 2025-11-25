import React from 'react';
import { useNavigate } from 'react-router-dom';

const GoalCard = ({ goal, onEdit, onDelete, onToggleComplete, onViewProgress }) => {
  const navigate = useNavigate();

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'hard': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'programming': 'bg-blue-100 text-blue-800',
      'design': 'bg-purple-100 text-purple-800',
      'data': 'bg-green-100 text-green-800',
      'security': 'bg-red-100 text-red-800',
      'mobile': 'bg-orange-100 text-orange-800',
      'web': 'bg-cyan-100 text-cyan-800'
    };
    return colors[category?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'from-green-500 to-emerald-600';
    if (progress >= 50) return 'from-blue-500 to-indigo-600';
    if (progress >= 25) return 'from-yellow-500 to-orange-600';
    return 'from-gray-400 to-gray-500';
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days left`;
  };

  const handleViewGoal = () => {
    navigate(`/goals/${goal.id}`);
  };

  const progress = goal?.progress_percentage || 0;
  const isCompleted = goal?.is_completed || progress === 100;

  return (
    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s', transform: 'scale(1)' }} onMouseEnter={(e) => { e.target.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)'; e.target.style.transform = 'scale(1.05)'; }} onMouseLeave={(e) => { e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; e.target.style.transform = 'scale(1)'; }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ flex: '1' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {goal?.title || 'Goal Title'}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem', paddingTop: '0.25rem', paddingBottom: '0.25rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500', backgroundColor: getCategoryColor(goal?.category).includes('blue') ? '#dbeafe' : getCategoryColor(goal?.category).includes('purple') ? '#e9d5ff' : getCategoryColor(goal?.category).includes('green') ? '#dcfce7' : getCategoryColor(goal?.category).includes('red') ? '#fee2e2' : getCategoryColor(goal?.category).includes('orange') ? '#fed7aa' : getCategoryColor(goal?.category).includes('cyan') ? '#cffafe' : '#f3f4f6', color: getCategoryColor(goal?.category).includes('blue') ? '#1e40af' : getCategoryColor(goal?.category).includes('purple') ? '#7c3aed' : getCategoryColor(goal?.category).includes('green') ? '#166534' : getCategoryColor(goal?.category).includes('red') ? '#dc2626' : getCategoryColor(goal?.category).includes('orange') ? '#ea580c' : getCategoryColor(goal?.category).includes('cyan') ? '#0e7490' : '#374151' }}>
              {goal?.category || 'General'}
            </span>
            <span style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem', paddingTop: '0.25rem', paddingBottom: '0.25rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500', border: '1px solid', backgroundColor: getDifficultyColor(goal?.difficulty).includes('green') ? '#dcfce7' : getDifficultyColor(goal?.difficulty).includes('yellow') ? '#fef3c7' : getDifficultyColor(goal?.difficulty).includes('red') ? '#fee2e2' : '#f3f4f6', color: getDifficultyColor(goal?.difficulty).includes('green') ? '#166534' : getDifficultyColor(goal?.difficulty).includes('yellow') ? '#d97706' : getDifficultyColor(goal?.difficulty).includes('red') ? '#dc2626' : '#374151', borderColor: getDifficultyColor(goal?.difficulty).includes('green') ? '#bbf7d0' : getDifficultyColor(goal?.difficulty).includes('yellow') ? '#fde68a' : getDifficultyColor(goal?.difficulty).includes('red') ? '#fecaca' : '#d1d5db' }}>
              {goal?.difficulty || 'Medium'}
            </span>
            {isCompleted && (
              <span style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem', paddingTop: '0.25rem', paddingBottom: '0.25rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500', backgroundColor: '#dcfce7', color: '#166534' }}>
                ✅ Completed
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#4f46e5' }}>
            +{goal?.points_reward || 50}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>points</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ color: '#4b5563', fontSize: '0.875rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', marginBottom: '1rem' }}>
          {goal?.description || 'Goal description goes here...'}
        </p>

        {/* Progress Bar */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Progress</span>
            <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>{progress}%</span>
          </div>
          <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '0.75rem' }}>
            <div 
              style={{ 
                height: '0.75rem', 
                borderRadius: '9999px', 
                background: progress >= 75 ? 'linear-gradient(to right, #10b981, #059669)' : progress >= 50 ? 'linear-gradient(to right, #3b82f6, #4f46e5)' : progress >= 25 ? 'linear-gradient(to right, #f59e0b, #ea580c)' : 'linear-gradient(to right, #9ca3af, #6b7280)', 
                transition: 'all 0.5s',
                width: `${progress}%`
              }}
            />
          </div>
        </div>

        {/* Target Date */}
        {goal?.target_completion_date && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <span>📅</span>
            <span style={{ color: formatDate(goal.target_completion_date)?.includes('Overdue') ? '#dc2626' : '#4b5563', fontWeight: formatDate(goal.target_completion_date)?.includes('Overdue') ? '500' : 'normal' }}>
              {formatDate(goal.target_completion_date)}
            </span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handleViewGoal}
          style={{ flex: '1', background: 'linear-gradient(to right, #3b82f6, #4f46e5)', color: 'white', borderRadius: '0.5rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1rem', paddingRight: '1rem', fontWeight: '500', fontSize: '0.875rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.target.style.background = 'linear-gradient(to right, #2563eb, #4338ca)'; }} onMouseLeave={(e) => { e.target.style.background = 'linear-gradient(to right, #3b82f6, #4f46e5)'; }}
        >
          View Goal
        </button>
        
        {!isCompleted && (
          <button
            onClick={() => onToggleComplete && onToggleComplete(goal)}
            style={{ paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '500', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseEnter={(e) => { e.target.style.backgroundColor = '#bbf7d0'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = '#dcfce7'; }}
            title="Mark as Complete"
          >
            ✓
          </button>
        )}
        
        {onEdit && (
          <button
            onClick={() => onEdit(goal)}
            style={{ paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', border: '1px solid #d1d5db', color: '#374151', borderRadius: '0.5rem', fontSize: '0.875rem', backgroundColor: 'transparent', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseEnter={(e) => { e.target.style.backgroundColor = '#f9fafb'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}
            title="Edit Goal"
          >
            ✏️
          </button>
        )}

        {onViewProgress && (
          <button
            onClick={() => onViewProgress(goal)}
            style={{ paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', color: '#4f46e5', borderRadius: '0.5rem', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseEnter={(e) => { e.target.style.backgroundColor = '#eef2ff'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}
            title="View Progress"
          >
            📊
          </button>
        )}
      </div>

      {/* Completion Celebration */}
      {isCompleted && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'linear-gradient(to right, #f0fdf4, #ecfdf5)', border: '1px solid #bbf7d0', borderRadius: '0.5rem', textAlign: 'center' }}>
          <span style={{ color: '#15803d', fontWeight: '500' }}>🎉 Congratulations! Goal completed!</span>
        </div>
      )}
    </div>
  );
};

export default GoalCard;