import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChallengeCard = ({ challenge, onStart, onViewDetails, onLinkToGoal }) => {
  const navigate = useNavigate();

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'hard': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getDifficultyStars = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '⭐';
      case 'medium': return '⭐⭐';
      case 'hard': return '⭐⭐⭐';
      default: return '⭐⭐';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'todo': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleStartChallenge = () => {
    if (onStart) {
      onStart(challenge);
    } else {
      // Default navigation to challenge details
      navigate(`/challenges/${challenge.id}`);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(challenge);
    } else {
      navigate(`/challenges/${challenge.id}`);
    }
  };

  const handleLinkToGoal = () => {
    if (onLinkToGoal) {
      onLinkToGoal(challenge);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {challenge?.title || 'Challenge Title'}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(challenge?.difficulty)}`}>
              {getDifficultyStars(challenge?.difficulty)} {challenge?.difficulty || 'Medium'}
            </span>
            {challenge?.status && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(challenge?.status)}`}>
                {challenge.status === 'in_progress' ? 'In Progress' : challenge.status === 'todo' ? 'Not Started' : 'Completed'}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-indigo-600">
            +{challenge?.points || 10}
          </div>
          <div className="text-xs text-gray-500">points</div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-600 text-sm line-clamp-3 mb-3">
          {challenge?.description || 'Challenge description goes here...'}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          {challenge?.estimated_time && (
            <div className="flex items-center gap-1">
              <span>⏱️</span>
              <span>{challenge.estimated_time} min</span>
            </div>
          )}
          {challenge?.category && (
            <div className="flex items-center gap-1">
              <span>📁</span>
              <span>{challenge.category}</span>
            </div>
          )}
        </div>
        
        {challenge?.tags && challenge.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {challenge.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-200"
              >
                {tag}
              </span>
            ))}
            {challenge.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded-md text-xs">
                +{challenge.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex gap-2">
        {challenge?.status !== 'completed' && (
          <button
            onClick={handleStartChallenge}
            className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg py-2 px-4 font-medium hover:from-green-600 hover:to-teal-700 transition-all duration-200 text-sm"
          >
            {challenge?.status === 'in_progress' ? 'Continue' : 'Start Challenge'}
          </button>
        )}
        
        <button
          onClick={handleViewDetails}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
        >
          Details
        </button>
        
        {onLinkToGoal && (
          <button
            onClick={handleLinkToGoal}
            className="px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
            title="Link to Goal"
          >
            🎯
          </button>
        )}
      </div>

      {/* Progress bar for in-progress challenges */}
      {challenge?.status === 'in_progress' && challenge?.progress_percentage !== undefined && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Progress</span>
            <span className="text-xs text-gray-600">{challenge.progress_percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${challenge.progress_percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeCard;