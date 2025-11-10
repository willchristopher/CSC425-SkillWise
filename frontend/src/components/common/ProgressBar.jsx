import React from 'react';
import PropTypes from 'prop-types';

const ProgressBar = ({ challenges, showPercentage = true, showStats = true, height = 'h-4' }) => {
  // Calculate progress
  const totalChallenges = challenges?.length || 0;
  const completedChallenges = challenges?.filter(c => c.is_completed)?.length || 0;
  const percentage = totalChallenges > 0 
    ? Math.round((completedChallenges / totalChallenges) * 100) 
    : 0;

  // Determine color based on progress
  const getProgressColor = (percent) => {
    if (percent === 100) return 'bg-green-600';
    if (percent >= 75) return 'bg-blue-600';
    if (percent >= 50) return 'bg-yellow-500';
    if (percent >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const progressColor = getProgressColor(percentage);

  return (
    <div className="w-full">
      {/* Stats Row */}
      {showStats && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progress: {completedChallenges} / {totalChallenges} challenges completed
          </span>
          {showPercentage && (
            <span className={`text-sm font-bold ${percentage === 100 ? 'text-green-600' : 'text-gray-700'}`}>
              {percentage}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className={`w-full ${height} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`${height} ${progressColor} rounded-full transition-all duration-500 ease-out flex items-center justify-end`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          {percentage > 10 && showPercentage && !showStats && (
            <span className="text-xs font-bold text-white pr-2">
              {percentage}%
            </span>
          )}
        </div>
      </div>

      {/* Completion Message */}
      {percentage === 100 && (
        <div className="mt-2 flex items-center gap-2 text-green-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium">All challenges completed! 🎉</span>
        </div>
      )}
    </div>
  );
};

ProgressBar.propTypes = {
  challenges: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      is_completed: PropTypes.bool,
    })
  ).isRequired,
  showPercentage: PropTypes.bool,
  showStats: PropTypes.bool,
  height: PropTypes.string,
};

ProgressBar.defaultProps = {
  showPercentage: true,
  showStats: true,
  height: 'h-4',
};

export default ProgressBar;
