import React from 'react';

const ProgressBar = ({ progress = 0, height = 'h-2', showLabel = false, className = '' }) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  // Determine color based on progress
  const getColorClass = () => {
    if (normalizedProgress === 100) return 'bg-green-500';
    if (normalizedProgress >= 70) return 'bg-blue-500';
    if (normalizedProgress >= 40) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-semibold text-gray-900">
            {normalizedProgress}%
          </span>
        </div>
      )}
      <div className={`w-full ${height} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`${height} ${getColorClass()} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${normalizedProgress}%` }}
          role="progressbar"
          aria-valuenow={normalizedProgress}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </div>
  );
};

export default ProgressBar;
