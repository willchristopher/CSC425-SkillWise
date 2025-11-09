import React from 'react';

const ChallengeCard = ({ challenge, onStart, onView, status = 'not_started' }) => {
  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-700 border-green-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      hard: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[difficulty?.toLowerCase()] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      not_started: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
    };
    return colors[status] || colors.not_started;
  };

  const getStatusLabel = (status) => {
    const labels = {
      not_started: 'Not Started',
      in_progress: 'In Progress',
      completed: 'Completed',
    };
    return labels[status] || 'Not Started';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-800 flex-1 pr-4">
            {challenge?.title || 'Untitled Challenge'}
          </h3>
          <div className="flex flex-col gap-2 items-end">
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getDifficultyColor(challenge?.difficulty_level)}`}>
              {challenge?.difficulty_level?.toUpperCase() || 'MEDIUM'}
            </span>
            <span className={`px-3 py-1 text-xs font-medium rounded ${getStatusColor(status)}`}>
              {getStatusLabel(status)}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {challenge?.description || 'No description available'}
        </p>

        {/* Tags */}
        {challenge?.tags && challenge.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {challenge.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {challenge.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                +{challenge.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Meta Information */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center gap-4">
            {challenge?.estimated_time_minutes && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{challenge.estimated_time_minutes} min</span>
              </div>
            )}
            {challenge?.category && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>{challenge.category}</span>
              </div>
            )}
          </div>
          
          {challenge?.points_reward && (
            <div className="flex items-center gap-1 font-semibold text-yellow-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>+{challenge.points_reward} pts</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer with Action Buttons */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-2">
        {onView && (
          <button
            onClick={() => onView(challenge)}
            className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors font-medium text-sm"
          >
            View Details
          </button>
        )}
        {onStart && status !== 'completed' && (
          <button
            onClick={() => onStart(challenge)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            {status === 'in_progress' ? 'Continue' : 'Start Challenge'}
          </button>
        )}
        {status === 'completed' && (
          <button
            disabled
            className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-md font-medium text-sm cursor-not-allowed"
          >
            ✓ Completed
          </button>
        )}
      </div>
    </div>
  );
};

export default ChallengeCard;