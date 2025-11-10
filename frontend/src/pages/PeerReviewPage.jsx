import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const PeerReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('give');

  useEffect(() => {
    fetchReviews();
  }, [activeTab]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = activeTab === 'give' 
        ? await apiService.reviews.getPending()
        : await apiService.reviews.getReceived();
      setReviews(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (submissionId) => {
    alert(`Review functionality coming soon for submission #${submissionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Peer Reviews</h1>
          <p className="text-lg text-gray-600">Help others learn and get feedback on your work</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-lg mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('give')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'give'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Give Reviews
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'received'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              My Reviews
            </button>
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{review.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {activeTab === 'give' ? `By ${review.authorName}` : `Reviewed by ${review.reviewerName || 'Pending'}`}
                    </p>
                  </div>
                  {review.rating && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold">{review.rating}/5</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 mb-4">{review.description}</p>

                {review.feedback && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Feedback:</p>
                    <p className="text-gray-600">{review.feedback}</p>
                  </div>
                )}

                {activeTab === 'give' && !review.reviewed && (
                  <button
                    onClick={() => handleReview(review.id)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    Review Submission
                  </button>
                )}

                <p className="text-xs text-gray-500 mt-4">
                  {new Date(review.createdAt || review.submittedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">👥</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {activeTab === 'give' ? 'No submissions to review' : 'No reviews received yet'}
            </h2>
            <p className="text-gray-600">
              {activeTab === 'give' 
                ? 'Check back later for submissions that need your feedback!'
                : 'Complete challenges to receive peer reviews!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PeerReviewPage;
