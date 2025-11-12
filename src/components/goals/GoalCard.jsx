import React from 'react';
import ProgressBar from '../common/ProgressBar';

const GoalCard = ({ goal, onEdit, onDelete, onViewDetails }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = () => {
    const progress = goal?.progress_percentage || 0;
    if (progress === 100) return 'text-green-600';
    if (progress >= 50) return 'text-blue-600';
    if (progress > 0) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getTypeColor = (type) => {
    const colors = {
      personal: 'bg-purple-100 text-purple-700',
      professional: 'bg-blue-100 text-blue-700',
      academic: 'bg-green-100 text-green-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {goal?.title || 'Untitled Goal'}
          </h3>
          <div className="flex gap-2">
            {goal?.type && (
              <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(goal.type)}`}>
                {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)}
              </span>
            )}
            {goal?.category && (
              <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">
                {goal.category}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {goal?.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {goal.description}
        </p>
      )}

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className={`text-sm font-semibold ${getStatusColor()}`}>
            {goal?.progress_percentage || 0}%
          </span>
        </div>
        <ProgressBar progress={goal?.progress_percentage || 0} />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(goal?.target_completion_date)}
        </div>
        
        <div className="flex gap-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(goal)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(goal)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalCard;