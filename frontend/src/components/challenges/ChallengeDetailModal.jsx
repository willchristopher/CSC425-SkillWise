import React, { useState } from 'react';

const ChallengeDetailModal = ({
  isOpen,
  onClose,
  challenge,
  onStart,
  onSubmit,
  userSubmission = null,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [submissionContent, setSubmissionContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !challenge) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleStartChallenge = async () => {
    if (onStart) {
      await onStart(challenge);
    }
    setActiveTab('submit');
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!submissionContent.trim()) {
      setError('Please enter your submission');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (onSubmit) {
        await onSubmit(challenge.id, { content: submissionContent });
      }
      setSubmissionContent('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatTime = (minutes) => {
    if (!minutes) return 'No estimate';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const getStatus = () => {
    if (!userSubmission) return 'not-started';
    return userSubmission.status || 'in-progress';
  };

  const status = getStatus();
  const canStart = status === 'not-started' || status === 'failed';
  const canSubmit = status === 'in-progress' || canStart;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="challenge-detail-title"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2
                id="challenge-detail-title"
                className="text-2xl font-bold mb-2"
              >
                {challenge.title}
              </h2>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                    challenge.difficulty_level
                  )}`}
                >
                  {challenge.difficulty_level || 'Medium'}
                </span>
                <span className="text-emerald-100">{challenge.category}</span>
                <span className="text-emerald-100">
                  ⏱ {formatTime(challenge.estimated_time)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white hover:text-emerald-200 text-2xl leading-none"
              aria-label="Close modal"
              disabled={isLoading}
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'details'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'submit'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('submit')}
            >
              Submit Work
            </button>
            {userSubmission && (
              <button
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'status'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('status')}
              >
                My Submission
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div
          className="p-6 overflow-y-auto"
          style={{ maxHeight: 'calc(90vh - 200px)' }}
        >
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {challenge.description}
                </p>
              </div>

              {/* Requirements */}
              {challenge.requirements && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Requirements
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {(typeof challenge.requirements === 'string'
                      ? challenge.requirements
                          .split('\n')
                          .filter((r) => r.trim())
                      : challenge.requirements
                    ).map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Points */}
              <div className="flex items-center gap-6 p-4 bg-emerald-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {challenge.points || 100}
                  </div>
                  <div className="text-sm text-gray-600">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {challenge.max_attempts || 3}
                  </div>
                  <div className="text-sm text-gray-600">Max Attempts</div>
                </div>
                {challenge.deadline && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {new Date(challenge.deadline).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">Deadline</div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {challenge.tags && challenge.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {challenge.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Start Button */}
              {canStart && (
                <div className="pt-4">
                  <button
                    onClick={handleStartChallenge}
                    disabled={isLoading}
                    className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-medium"
                  >
                    {isLoading ? 'Loading...' : 'Start Challenge'}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'submit' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Submit Your Work
              </h3>
              <p className="text-gray-600">
                Complete the challenge and paste your work below for AI
                feedback.
              </p>

              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmitWork}>
                <div className="mb-4">
                  <label
                    htmlFor="submission-content"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Your Submission
                  </label>
                  <textarea
                    id="submission-content"
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
                    placeholder="Paste your code or write your solution here..."
                    disabled={isSubmitting}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !submissionContent.trim()}
                  className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-medium"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit for AI Feedback'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'status' && userSubmission && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Your Submission
              </h3>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Status</span>
                    <div
                      className={`font-medium ${
                        userSubmission.status === 'completed'
                          ? 'text-green-600'
                          : userSubmission.status === 'failed'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {userSubmission.status?.replace('-', ' ')}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Attempts</span>
                    <div className="font-medium">
                      {userSubmission.attempts_count || 0} /{' '}
                      {challenge.max_attempts || 3}
                    </div>
                  </div>
                  {userSubmission.score && (
                    <div>
                      <span className="text-sm text-gray-500">Score</span>
                      <div className="font-medium text-emerald-600">
                        {userSubmission.score}%
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-500">Submitted</span>
                    <div className="font-medium">
                      {userSubmission.submitted_at
                        ? new Date(
                            userSubmission.submitted_at
                          ).toLocaleDateString()
                        : 'Not yet'}
                    </div>
                  </div>
                </div>
              </div>

              {userSubmission.content && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Your Work
                  </h4>
                  <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm">
                    {userSubmission.content}
                  </pre>
                </div>
              )}

              {userSubmission.feedback && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    AI Feedback
                  </h4>
                  <div className="p-4 bg-blue-50 text-blue-900 rounded-lg whitespace-pre-wrap">
                    {userSubmission.feedback}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetailModal;
